import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/services/ingestion";

export const maxDuration = 60; // Allow up to 60 seconds for scraping cycle

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    // Optional secret check if set
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await runIngestion();
    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST(new Request("http://localhost"));
}
