import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const session = await auth()

    const body = await request.json()

    const username = session.user.username
    const userId = session.user.userId
    const nLevel = body.nLevel
    const quizType = body.quizType
    const correctCount = body.correctCount
    const incorrectCount = body.incorrectCount
    const random = body.random

    const { error } = await supabase
        .from("user_results")
        .insert({ user_id: userId, username: username, n_level: nLevel, quiz_type: quizType, correct_count: correctCount, incorrect_count: incorrectCount, random: random });
    if (error) {
        return NextResponse.json(JSON.stringify(error))
    }
    else {
        return NextResponse.json({ message: 'Result saved!' }, { status: 200 })
    }

}