'use client'
import React from "react"
import Navbar from "../components/Navbar";
import NewQuizMaster from "../components/NewQuiz";
import { SessionProvider } from "next-auth/react";

export default function NewQuizMasterFunction() {

    return (
        <>
            <SessionProvider>
                <Navbar />
                <NewQuizMaster />
            </SessionProvider>
        </>
    )
}