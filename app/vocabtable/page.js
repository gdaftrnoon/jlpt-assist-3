import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import Vocabtable from "../components/Vocabtable";
import UserProvider from "../context/UserSession";

export default function Vtable() {

    return (
        <>
            <SessionProvider>
                <UserProvider>
                    <Navbar />
                    <Vocabtable />
                </UserProvider>
            </SessionProvider>
        </>
    )
}