import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import NewVocabTable from "../components/NewVocabtable";

export default function NewVocabTableFunction() {

    return (
        <>
            <SessionProvider>
                <Navbar />
                <NewVocabTable />
            </SessionProvider>
        </>
    )
}