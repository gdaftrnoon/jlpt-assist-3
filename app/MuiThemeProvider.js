'use client'
import { ThemeProvider, createTheme, useColorScheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from 'react';

export default function MuiThemeProvider({ children }) {

    const [mode, setMode] = useState('light')

    const themeLight = createTheme({
        palette: {
            mode: 'light',
        },
        typography: {
            fontFamily: 'Quicksand, sans-serif',
            button: {
                textTransform: 'none',
            },
        },
    })

    const themeDark = createTheme({
        palette: {
            mode: 'dark',
        },
        typography: {
            fontFamily: 'Quicksand, sans-serif',
            button: {
                textTransform: 'none',
            },
        },
    })

    useEffect(() => {
        if (localStorage.getItem('mode')) {
            setMode(localStorage.getItem('mode'))
        }
    }, [])

    useEffect(() => {

        const handler = (event) => {
            if (event.key === 'mode' && event.newValue === 'dark') {
                setMode('dark')
            }
            else if (event.key === 'mode' && event.newValue === 'light') {
                setMode('light')
            }
        }
        window.addEventListener("storage", handler)
        return () => window.removeEventListener("storage", handler)
    }, [])

    return (
        <ThemeProvider theme={(mode === 'light') ? themeLight : themeDark}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}