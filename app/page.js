import { SessionProvider } from "next-auth/react";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <SessionProvider>
          <Navbar />
          <Banner />
      </SessionProvider>
    </>
  );
}
