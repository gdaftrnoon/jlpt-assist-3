import { NextResponse } from "next/server";
import { readFileSync } from 'fs'

export async function POST(request) {

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 33,
    }

    const body = await request.json()
    const nLevel = body.nLevel
    const startPage = body.startPage

    const allPages = []

    for (let index = startPage; index <= fileCount[nLevel]; index++) {
        const fileContents = readFileSync(`public/vocab/${nLevel}/${nLevel}_page${index}_v1.json`, 'utf-8')
        const jsonData = JSON.parse(fileContents)
        // const data = (await fetch(`vocab/${nLevel}/${nLevel}_page${index}_v1.json`)).json()
        allPages.push(jsonData)
    }

    const flatPages = allPages.flatMap(x => x)

    console.log('-----------------------------------------------------------------------')
    console.log(flatPages[1])
    console.log('-----------------------------------------------------------------------')

    return new Response(
        JSON.stringify({ message: flatPages }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    // return NextResponse.json({ message: flatPages, status: '200' })

}