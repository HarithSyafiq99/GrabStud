import { NextResponse } from "next/server";
import { ensureSchema, getDb, newId, nowIso, writeAudit } from "@/lib/db";
import { getSession, requireApproved, requireRole } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureSchema();
    const user = requireApproved(requireRole(await getSession(), ["passenger"]));
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const payment_method = body.payment_method === "qr" ? "qr" : "cash";

    const db = getDb();
    const rideRes = await db.execute({
      sql: "SELECT * FROM rides WHERE id = ?",
      args: [id],
    });
    const ride = rideRes.rows[0];
    if (!ride) return jsonError("Ride not found.", 404);
    if (String(ride.driver_id) === user.id) {
      return jsonError("You cannot book your own ride.");
    }
    if (String(ride.status) !== "open") {
      return jsonError("This ride is not available for booking.");
    }
    if (Number(ride.seats_available) <= 0) {
      return jsonError("No seats remaining.");
    }
    if (new Date(String(ride.departure_at)).getTime() <= Date.now()) {
      return jsonError("This ride has already departed.");
    }

    const existing = await db.execute({
      sql: "SELECT id, status FROM bookings WHERE ride_id = ? AND passenger_id = ?",
      args: [id, user.id],
    });
    if (existing.rows.length > 0 && existing.rows[0].status !== "rejected" && existing.rows[0].status !== "cancelled") {
      return jsonError("You already have a booking for this ride.");
    }

    const bookingId = newId();
    const now = nowIso();
    await db.execute({
      sql: `INSERT INTO bookings (id, ride_id, passenger_id, status, payment_method, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
      args: [bookingId, id, user.id, payment_method, now, now],
    });
    await writeAudit(
      user.id,
      "BOOK_RIDE",
      `Passenger requested ride ${id} via ${payment_method}`,
    );
    return NextResponse.json({ ok: true, bookingId });
  } catch (error) {
    return handleError(error);
  }
}
