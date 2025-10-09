import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const session = await auth()
    const userID = session.user.userId

    if (userID) {
        const body = await request.json()
        const qid = body.quiz_id

        if (!qid) {
            return Response.json({ message: 'Request must include a body', status: 400 }) 
        }

        const { data, error } = await supabase
            .from('quiz_sessions')
            .select('user_id')
            .eq('quiz_id', qid)

        if (error) {
            return Response.json({ message: error, status: 400 })
        }

        // making sure the current user is the owner of the quiz record
        if (userID === data[0].user_id) {
            const { error: deleteError } = await supabase
                .from('quiz_sessions')
                .delete()
                .eq('quiz_id', qid)

            if (deleteError) {
                return Response.json({ message: deleteError, status: 400 })
            }
            else {
                return Response.json({ message: 'Record deleted.', status: 200 })
            }
        }

        else Response.json({ message: 'Unauthorised request.', status: 401 })

    }

    else {
        return Response.json({ message: 'You need to be logged in to do this.' })
    }

}