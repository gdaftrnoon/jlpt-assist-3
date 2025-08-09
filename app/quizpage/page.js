    import React from "react"
    import Navbar from "../components/Navbar";
    import Quiz from "../components/Quiz";
    import fs from 'fs'
    import path from 'path'
    import { auth } from "../auth";
    import { SessionProvider } from "next-auth/react";

    export default async function QuizMaster() {

        const session = await auth()

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