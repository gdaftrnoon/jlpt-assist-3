import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const session = await auth()
    const userID = session.user.userId

    const body = await request.json()

    const quizID = uuidv4()
    const nLevel = body.nLevel
    const quizType = body.quizType
    const random = body.random
    const correct = body.correct
    const incorrect = body.incorrect
    const quizResults = body.quizResults

    if (session) {

        const errors = { metaE: '', resultE: '' }

        // attempting to submit test session metadata
        const { error: metaError } = await supabase
            .from("quiz_sessions")
            .insert({
                quiz_id: quizID,
                user_id: userID,
                n_level: nLevel,
                quiz_type: quizType,
                random: random,
                correct: correct,
                incorrect: incorrect
            })

        if (metaError) {
            errors.metaE = metaError
        }

        // attempting to submit actual test result data
        const bulkInsert = quizResults.map(x => (
            { quiz_id: quizID, user_id: userID, word_id: x.wordID, is_correct: x.result }
        ))

        const { error: resultError } = await supabase
            .from("quiz_results")
            .insert(bulkInsert)

        if (resultError) {
            errors.resultE = resultError
        }

        if (errors.metaE === '' && errors.resultE === '') {
            return NextResponse.json({ message: 'Quiz metadata and results saved!', status: 200 })
        }

        else {
            return NextResponse.json({ message: `metadata submission error: ${errors.metaE} | result submission error: ${errors.resultE}` }, { status: 422 })
        }

    }

    else {
        return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
    }

}
