import { SessionProvider } from "next-auth/react";
import LoginLogout from "../components/Login";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <SessionProvider>
          <Navbar />
          <LoginLogout />
      </SessionProvider>
    </>
  );
}
