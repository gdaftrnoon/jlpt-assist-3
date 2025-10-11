'use client'
import React from "react"
import Navbar from "../components/Navbar";
import NewQuizMaster from "../components/NewQuiz";
import { SessionProvider } from "next-auth/react";
import UserProvider from "../context/UserContext";

export default function NewQuizMasterFunction() {

    return (
        <>
            <SessionProvider>
                <UserProvider>
                    <Navbar />
                    <NewQuizMaster />
                </UserProvider>
            </SessionProvider>
        </>
    )
}