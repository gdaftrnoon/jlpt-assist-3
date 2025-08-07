import Navbar from "../components/Navbar";
import SignUp from "../components/Signup";
import { SessionProvider } from 'next-auth/react'

export default function Home() {
  return (
    <>
      <SessionProvider>
        <SignUp />
      </SessionProvider>
    </>
  );
}
