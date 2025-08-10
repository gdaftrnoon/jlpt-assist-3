import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabaseServerside = createClient(supabaseUrl, supabaseServiceKey)

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        async session({ session }) {
            const email = session.user.email
            if (email) {
                const { data } = await supabaseServerside
                    .from('users')
                    .select('username, user_id')
                    .eq('email', email)
                    .maybeSingle()

                if (data) {
                    session.user.username = data.username;
                    session.user.userId = data.user_id
                }
            }
            return session
        }
    }
})