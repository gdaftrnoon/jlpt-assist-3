import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth"
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "20 s"),
    timeout: 10000,
    analytics: true
});

export async function POST(request) {

    const session = await auth()
    const uid = session?.user?.userId

    if (!uid) {
        return Response.json({ message: 'Unauthorised', status: 401 })
    }

    // RATE LIMITING
    const identifier = uid;
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(identifier);

    // if rate limit has been hit
    if (!success) {
        console.log("limit", limit)
        console.log("reset", reset)
        console.log("remaining", remaining)
        return NextResponse.json({ message: 'Rate limited' }, { status: 429 })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    console.log(body)

    const initial = body.initial
    const adjusted = body.adjusted

    const toDelete = []
    const toAppend = []

    const errorMsg = { append: '', delete: '' }

    Object.keys(initial).map(x => {
        if (initial[x] === true && adjusted[x] === false) {
            toDelete.push(x)
        }
        else if (initial[x] === false && adjusted[x] === true) {
            toAppend.push(x)
        }
    })

    const toInsert = toAppend.map(x => (
        { user_id: uid, word_id: x }
    ))

    if (toAppend.length > 0) {
        const { error: appendError } = await supabase
            .from('user_vocab')
            .insert(toInsert)
        if (appendError) {
            errorMsg.append = appendError
        }
    }

    if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from('user_vocab')
            .delete()
            .eq('user_id', uid)
            .in('word_id', toDelete)
        if (deleteError) {
            errorMsg.delete = deleteError
        }
    }

    if (errorMsg.append != '' || errorMsg.delete != '') {
        return Response.json({ message: errorMsg, status: 400 })
    }

    else {
        return Response.json({ message: 'data was submitted to db', status: 200 })
    }
}