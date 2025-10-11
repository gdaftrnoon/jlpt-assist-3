import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 33,
    }

    const allData = {}

    await Promise.all(
        Object.keys(fileCount).map(async n => {
            const nLength = fileCount[n]
            const pagePromises = []
            for (let index = 1; index <= nLength; index++) {
                const filePath = path.join(process.cwd(), 'public', 'vocab', `${n}`, `${n}_page${index}_v1.json`)
                const data = readFile(filePath, 'utf-8').then(res => JSON.parse(res))
                pagePromises.push(data)
            }
            const resolved = await Promise.all(pagePromises)
            const flatResolved = resolved.flatMap(x => x)
            allData[n] = flatResolved
        })
    )

    return (
        NextResponse.json({message: allData})
    )
}