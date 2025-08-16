import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const body = await request.json()
    const userid = body.message

    const { data, error } = await supabase
        .from('user_vocab')
        .select('word_id')
        .eq('user_id', userid)

    return NextResponse.json({ message: data }, { status: 200 })

}