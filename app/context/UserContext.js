'use client'
import React, { createContext, useEffect, useState } from 'react';

export const UserContext = createContext()

export default function Provider({ children }) {

    const [data, setData] = useState()

    useEffect(() => {

        console.log('CONTEXT TRIGGERED')
        fetch('api/FetchJlpt')
            .then(resp => resp.json())
            .then(vocab => {
                setData(vocab)
            })

    }, [])

    return (
        <UserContext.Provider value={{ data }}>
            {children}
        </UserContext.Provider>
    )

}