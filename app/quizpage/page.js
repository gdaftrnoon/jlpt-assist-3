import React from "react"
import Navbar from "../components/Navbar";
import Quiz from "../components/Quiz";
import fs from 'fs'
import path from 'path'
import { SessionProvider } from "next-auth/react";


export default function QuizMaster() {

    const nFileCounts = {}
    const nLevels = ['n1', 'n2', 'n3', 'n4', 'n5']
    nLevels.forEach(n => {
        const dir = path.join(process.cwd(), 'public', 'vocab', n)
        const files = fs.readdirSync(dir)
        nFileCounts[n] = files.length
    })

    return (
        <>
            <SessionProvider>
                <Navbar />
                <Quiz fileCount={nFileCounts} />
            </SessionProvider>
        </>
    )
}