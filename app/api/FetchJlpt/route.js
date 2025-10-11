import { NextResponse } from "next/server";

export async function POST(request) {

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 33,
    }

    const body = await request.json()

    

    return new Response(
        JSON.stringify({ message: flatPages }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )


}