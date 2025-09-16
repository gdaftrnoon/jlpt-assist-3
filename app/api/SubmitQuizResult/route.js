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
    const quizResults = body.quizResults

    const bulkInsert = quizResults.map(x => (
        { quiz_id: x.quizID, user_id: userID, word_id: x.wordID, is_correct: x.result }
    ))

    const { error } = await supabase
        .from("quiz_results")
        .insert(bulkInsert)

    if (error) {
        return NextResponse.json({message: error})
    }
    else {
        return NextResponse.json({ message: 'Quiz result saved!' }, { status: 200 })
    }

}
