'use client'

import React, { useState, useContext, useEffect } from 'react'
import { AppBar, IconButton, Toolbar, Typography, Button, Box, Popper, Paper, MenuList, MenuItem, ClickAwayListener, Zoom, Container, Avatar, CircularProgress } from '@mui/material'
import Link from 'next/link'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { signOut } from 'next-auth/react';
import SunnySnowingIcon from '@mui/icons-material/SunnySnowing';
import { UserContext } from '../context/UserSession';
import Slide from '@mui/material/Slide';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { redirect } from 'next/navigation';

const theme = createTheme({
    typography: {
        fontFamily: [
            "Quicksand"
        ].join(','),
        button: {
            textTransform: 'none'
        }
    }
})

const Navbar = () => {

    const { user, status } = useContext(UserContext)

    const username = user?.username

    async function signOutHelper() {
        await signOut({ redirectTo: '/' })
    }

    useEffect(() => {
        if (!localStorage.getItem("pullFromDb")) {
            localStorage.setItem('pullFromDb', 'false')
        }
    }, [])

    const MobileNavbar = () => {
        const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
        const [avatarAnchorEl, setAvatarAnchorEl] = useState(null)
        return (
            <AppBar color='error' position="sticky">
                <Container
                    sx={{ width: { md: '100%', xs: '100%' } }}>
                    <Toolbar>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                            {/* LEFT */}
                            <Box sx={{ display: 'flex', flex:1 }}>

                                <IconButton sx={{ display: { md: 'none' } }} onClick={(event) => setMobileAnchorEl(event.currentTarget)}>
                                    <MenuIcon sx={{ color: 'white' }} />
                                </IconButton>

                                <Box sx={{ display: { xs: 'none', md:'flex', gap: 5 }}}>
                                    <Button onClick={() => redirect('/vocab')} variant='text' sx={{color:'white', fontWeight:'600'}}>Vocabulary</Button>
                                    <Button onClick={() => redirect('/quiz')} variant='text' sx={{color:'white', fontWeight:'600'}}>Quiz</Button>
                                    <Button onClick={() => redirect('/review')} variant='text' sx={{color:'white', fontWeight:'600'}}>Review</Button>
                                </Box>

                            </Box>

                            {/* CENTER */}
                            <Box component={Link} href='/' sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, textDecoration: 'none', flex:{xs:2, md:1}}}>
                                <SunnySnowingIcon sx={{ color: 'white' }} />
                                <Typography sx={{ color: 'white', fontWeight: '700' }}>
                                    JLPT ASSIST
                                </Typography>
                            </Box>

                            {/* RIGHT */}
                            <Box sx={{ display: 'flex', minWidth: 64, minHeight: 37, justifyContent: 'right', flex:1 }}>
                                {(status) === 'loading' ? null :
                                    (status === 'authenticated' && (username)) ?
                                        <>
                                            <Avatar
                                                disableFocusRipple
                                                disableRipple
                                                component={IconButton}
                                                onClick={(event) => { setAvatarAnchorEl(event.currentTarget) }}
                                                sx={{ bgcolor: 'white', color: 'red' }}
                                            >
                                                {username[0].toUpperCase()}
                                            </Avatar>
                                            <Menu anchorEl={avatarAnchorEl} open={Boolean(avatarAnchorEl)} onClose={() => setAvatarAnchorEl(null)}>
                                                <MenuItem onClick={() => signOut()}>Logout</MenuItem>
                                                <MenuItem>Settings</MenuItem>
                                            </Menu>
                                        </>
                                        :
                                        <Button
                                            component={Link}
                                            sx={{ color: 'white', fontWeight:'700' }}
                                            href='/login'
                                        >
                                            Login
                                        </Button>
                                }
                                <Menu
                                    sx={{ display: { md: 'none' } }}
                                    color='black'
                                    anchorEl={mobileAnchorEl}
                                    open={Boolean(mobileAnchorEl)}
                                    onClose={() => setMobileAnchorEl(null)}
                                >
                                    <MenuItem component={Link} href='/vocab' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Vocabulary</MenuItem>
                                    <MenuItem component={Link} href='/quiz' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Quiz</MenuItem>
                                    <MenuItem component={Link} href='/review' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Review</MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <MobileNavbar />
        </ThemeProvider>
    )
}

export default Navbar