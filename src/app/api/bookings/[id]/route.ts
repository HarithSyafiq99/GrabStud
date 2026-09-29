import { NextResponse } from "next/server";
import { ensureSchema, getDb, nowIso, writeAudit } from "@/lib/db";
import { getSession, requireApproved, requireRole } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureSchema();
    const user = requireApproved(requireRole(await getSession(), ["driver"]));
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action ?? "");
    if (action !== "accept" && action !== "reject") {
      return jsonError("Action must be accept or reject.");
    }

    const db = getDb();
    const bookingRes = await db.execute({
      sql: `SELECT b.*, r.driver_id, r.seats_available, r.status as ride_status
            FROM bookings b
            JOIN rides r ON r.id = b.ride_id
            WHERE b.id = ?`,
      args: [id],
    });
    const booking = bookingRes.rows[0];
    if (!booking) return jsonError("Booking not found.", 404);
    if (String(booking.driver_id) !== user.id) return jsonError("Forbidden", 403);
    if (String(booking.status) !== "pending") {
      return jsonError("This booking was already processed.");
    }

    const now = nowIso();

    if (action === "reject") {
      await db.execute({
        sql: "UPDATE bookings SET status = 'rejected', updated_at = ? WHERE id = ?",
        args: [now, id],
      });
      await writeAudit(user.id, "REJECT_BOOKING", `Booking ${id} rejected`);
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    const seats = Number(booking.seats_available);
    if (seats <= 0 || String(booking.ride_status) !== "open") {
      return jsonError("No seats remaining for this ride.");
    }

    const nextSeats = seats - 1;
    const rideStatus = nextSeats === 0 ? "full" : "open";
    await db.execute({
      sql: "UPDATE rides SET seats_available = ?, status = ? WHERE id = ?",
      args: [nextSeats, rideStatus, String(booking.ride_id)],
    });
    await db.execute({
      sql: "UPDATE bookings SET status = 'accepted', updated_at = ? WHERE id = ?",
      args: [now, id],
    });
    await writeAudit(
      user.id,
      "ACCEPT_BOOKING",
      `Booking ${id} accepted; remaining seats ${nextSeats}`,
    );
    return NextResponse.json({
      ok: true,
      status: "accepted",
      seats_available: nextSeats,
    });
  } catch (error) {
    return handleError(error);
  }
}
