import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import Vocabtable from "../components/Vocabtable";

export default function Vtable() {

    return (
        <>
            <SessionProvider>
                <Navbar />
                <Vocabtable />
            </SessionProvider>
        </>
    )
}