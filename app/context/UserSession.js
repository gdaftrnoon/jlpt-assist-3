'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export const UserContext = createContext(null)

export default function UserProvider({ children }) {
     
    const { data: session, status } = useSession()
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (status === 'authenticated') {
            setUser(session.user);
        } else {    
            setUser(null);
        }
    }, [status, session])

    return (
        <UserContext.Provider value={{ user, status }}>
            {children}
        </UserContext.Provider>
    )

}