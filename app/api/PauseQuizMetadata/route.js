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
    const quizID = body.quizID
    const nLevel = body.nLevel
    const quizType = body.quizType
    const random = body.random

    const { error } = await supabase
        .from("paused_quiz_metadata")
        .insert({
            quiz_id: quizID,
            user_id: userID,
            n_level: nLevel,
            quiz_type: quizType,
            random: random
        })

    if (error) {
        return NextResponse.json({message: error})
    }
    else {
        return NextResponse.json({ message: 'Paused quiz metadata saved!' }, { status: 200 })
    }

}
