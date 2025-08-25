import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { auth } from "../../auth"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {

    const session = await auth()

    const resp = await request.json()

    const uid = session?.user?.userId

    const initial = Object.values(resp.initial) 
    const changes = Object.values(resp.changes)

    // preventing api misuse
    if (initial.length > 25 || changes.length > 25) {
        return NextResponse.json({ message: 'Error - Batch contains invalid number of word IDs' })
    }

    const wordIds = resp.ids

    // preventing api misuse
    if (wordIds.some(x => !Number.isInteger(x) || Number(x) > 9999 || Number(x) < 0)) {
         return NextResponse.json({ message: 'Error - Batch contains invalid entries' })
    }

    const toDelete = []
    const toAppend = []

    initial.forEach((x, index) => {
        if (x === true && changes[index] === false) {
            toDelete.push(wordIds[index])
        }
        if (x === false && changes[index] === true) {
            toAppend.push(wordIds[index])
        }
    })

    const toInsert = toAppend.map(x => (
        { user_id: uid, word_id: x }
    ))

    const errorMsg = { append: '', delete: '' }

    if (toAppend.length != 0) {
        const { error } = await supabase
            .from('user_vocab')
            .insert(toInsert)
        if (error) {
            errorMsg.append = error
        }
    }

    if (toDelete.length != 0) {
        const { error } = await supabase
            .from('user_vocab')
            .delete()
            .eq('user_id', uid)
            .in('word_id', toDelete)
        if (error) {
            errorMsg.delete = error
        }
    }

    if (errorMsg.append === '' && errorMsg.delete === '') {
        return NextResponse.json({ message: 'No errors' })
    }

    if (errorMsg.append != '' || errorMsg.delete != '') {
        return NextResponse.json({ message: 'Errors' })
    }

}