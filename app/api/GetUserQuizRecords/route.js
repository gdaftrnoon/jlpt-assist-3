import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export async function POST(request) {

    const requestMsg = await request.json()

    const sessionObj = await auth()
    const userid = sessionObj?.user?.userId

    if (requestMsg.RequestType === 'meta') {

        const { data, error } = await supabase
            .from('quiz_sessions')
            .select('n_level, quiz_type, random, correct, incorrect, start_from, created_at')
            .eq('user_id', userid)

        if (data) {
            console.log(data)
            return NextResponse.json({ message: data, status: '200' })
        }
        else {
            return NextResponse.json({ message: 'error pulling quiz data', status: '404' })
        }

    }
    else if (requestMsg.RequestType === 'data') {
        return NextResponse.json({ message: 'hello data, from GetUserQuizMeta', status: '200' })
    }

    else {
        return NextResponse.json({ message: 'not data nor meta', status: '200' })
    }
}
