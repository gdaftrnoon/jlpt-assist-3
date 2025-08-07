import { redirect } from "next/navigation"
import { auth } from "../auth"
 
export default async function Page() {
  const session = await auth()
  if (!session) return redirect('/profile')
 
  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}