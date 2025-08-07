'use server'
import { auth } from "../auth"
import { redirect } from "next/navigation"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabaseServerside = createClient(supabaseUrl, supabaseServiceKey)

export default async function PostSignInPage() {

    const session = await auth()

    if (session?.user?.email) {

        const userGmail = session?.user?.email

        const { data } = await supabaseServerside
            .from('users')
            .select()
            .eq('email', `${userGmail}`)
            .maybeSingle()

        if (data) {
            session.user.username = data.username
            redirect('/')
        }

        else {
            redirect('/register')
        }
    }

    redirect('/login')

}