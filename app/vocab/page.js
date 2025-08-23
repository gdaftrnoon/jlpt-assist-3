import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import NewVocabTable from "../components/NewVocabtable";
import UserProvider from "../context/UserSession";

export default function NewVocabTableFunction() {

    return (
        <>
            <SessionProvider>
                <UserProvider>
                    <Navbar />
                    <NewVocabTable />
                </UserProvider>
            </SessionProvider>
        </>
    )
}