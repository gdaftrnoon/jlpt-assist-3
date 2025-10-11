import { SessionProvider } from "next-auth/react";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import UserProvider from "./context/UserContext";

export default function Home() {
  return (
    <>
      <SessionProvider>
        <UserProvider>
          <Navbar />
          <Banner />
        </UserProvider>
      </SessionProvider>
    </>
  );
}
