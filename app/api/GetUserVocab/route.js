import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "20 s"),
    timeout: 10000,
    analytics: true
});

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {

    const session = await auth()
    const userid = session?.user?.userId

    if (!userid) {
        return
    }

    const identifier = userid;
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(identifier);

    // if rate limit has been hit
    if (!success) {
        console.log("limit", limit)
        console.log("reset", reset)
        console.log("remaining", remaining)
        return NextResponse.json({ message: 'Rate limited - Redirecting to homepage' }, { status: 429 })
    }

    const { data, error } = await supabase
        .from('user_vocab')
        .select('word_id')
        .eq('user_id', userid)

    return NextResponse.json({ message: data }, { status: 200 })

}