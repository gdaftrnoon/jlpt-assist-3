'use client'
import React from "react"
import Navbar from "../components/Navbar";
import Test from "../components/Test";
import { SessionProvider } from "next-auth/react";

export default function NewTest() {

    return (
        <>
            <SessionProvider>
                <Navbar />
                <Test />
            </SessionProvider>
        </>
    )
}