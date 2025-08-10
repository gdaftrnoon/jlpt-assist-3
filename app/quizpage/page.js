    'use client'
    import React from "react"
    import Navbar from "../components/Navbar";
    import Quiz from "../components/Quiz";
    import { SessionProvider } from "next-auth/react";

    export default function QuizMaster() {

        return (
            <>
                <SessionProvider>
                    <Navbar />
                    <Quiz/>
                </SessionProvider>
            </>
        )
    }