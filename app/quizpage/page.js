'use client'
import React from "react"
import Navbar from "../components/Navbar";
import Quiz from "../components/Quiz";
import { SessionProvider } from "next-auth/react";
import UserProvider from "../context/UserSession";

export default function QuizMaster() {

    return (
        <>
            <SessionProvider>
                <UserProvider>
                    <Navbar />
                    <Quiz />
                </UserProvider>
            </SessionProvider>
        </>
    )
}