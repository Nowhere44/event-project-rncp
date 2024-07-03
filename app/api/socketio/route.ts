//app/api/socketio/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Socket.IO endpoint" });
}