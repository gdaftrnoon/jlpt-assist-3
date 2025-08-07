
import { auth, signIn, signOut } from "../auth"

export default async function SignIn() {
    const session = await auth()
    console.log(session)
    const user = session?.user

    return user ? (
        <>
            <h1>welcome {user.name}</h1>
            <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
            >
                <button type="submit">Sign Out</button>
            </form>
        </>
    ) :
        <>
            <h1>Sign In laddie!</h1>
            <form
                action={async () => {
                    "use server"
                    await signIn('google', {redirectTo: '/vocabtable'})
                }}
            >
                <button type="submit">Sign In</button>
            </form>
        </>
}
