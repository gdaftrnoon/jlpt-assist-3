import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth";
import { redirect } from 'next/navigation'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
    
}