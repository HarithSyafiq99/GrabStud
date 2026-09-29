import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown) {
  const status = (error as { status?: number }).status ?? 500;
  const message = error instanceof Error ? error.message : "Server error";
  return jsonError(message, status);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
