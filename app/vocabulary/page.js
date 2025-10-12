import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import VocabTable from "../components/Vocabtable";

export default function NewVocabTableFunction() {

    return (
        <>
            <SessionProvider>
                <Navbar />
                <VocabTable />
            </SessionProvider>
        </>
    )
}