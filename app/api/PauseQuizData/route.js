import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const session = await auth()
    const userID = session.user.userId

    const body = await request.json()
    const pausedQuizData = body.pausedQuizData

    const bulkInsert = pausedQuizData.map(x => (
        { quiz_id: x.quizID, user_id: userID, word_id: x.wordID, word_result: x.result }
    ))

    const { error } = await supabase
        .from("paused_quiz_data")
        .insert(bulkInsert)

    if (error) {
        return NextResponse.json({message: error})
    }
    else {
        return NextResponse.json({ message: 'Paused quiz data saved!' }, { status: 200 })
    }

}
