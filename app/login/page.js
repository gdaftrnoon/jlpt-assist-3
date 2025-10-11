import { SessionProvider } from "next-auth/react";
import LoginLogout from "../components/Login";
import Navbar from "../components/Navbar";
import UserProvider from "../context/UserContext";

export default function Home() {
  return (
    <>
      <SessionProvider>
        <UserProvider>
          <Navbar />
          <LoginLogout />
        </UserProvider>
      </SessionProvider>
    </>
  );
}
