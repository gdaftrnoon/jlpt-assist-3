import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import Vocabtable from "../components/Vocabtable";
import fs from 'fs'
import path from 'path'

export default function Vtable() {

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
                <Vocabtable fileCount={nFileCounts} />
            </SessionProvider>
        </>
    )
}