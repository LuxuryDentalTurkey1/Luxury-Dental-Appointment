import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFreshaBlocks } from "@/lib/fresha";

export const dynamic = "force-dynamic";

// Cron: re-imports the Fresha iCal feed and mirrors future appointments into
// time_blocks so they show as occupied. Scheduled via vercel.json.
// Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
  }

  const result = await syncFreshaBlocks(supabase);
  return NextResponse.json(result);
}
