"use server"
import { auth, signIn, signOut } from "./auth"

export default async function GoogleSignIn() {
    await signIn('google', { redirectTo: '/postsignin' })
}
