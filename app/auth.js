import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'

// nextauth config

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabaseServerside = createClient(supabaseUrl, supabaseServiceKey)

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        async jwt({ token, account, profile }) {

            if (token?.email && !token.userId) {
                const { data } = await supabaseServerside
                    .from('users')
                    .select('username, user_id')
                    .eq('email', token.email)
                    .maybeSingle()

                if (data) {
                    token.username = data.username;
                    token.userId = data.user_id
                }
            }
            return token
        },

        async session({ session, token }) {
            if (token.username) session.user.username = token.username
            if (token.userId) session.user.userId = token.userId
            return session
        }
    }
})