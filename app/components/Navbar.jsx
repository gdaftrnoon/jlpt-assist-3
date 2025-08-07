'use client'

import React, { useState, useEffect } from 'react'
import { AppBar, IconButton, Stack, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, Popper, Paper, MenuList, MenuItem, ClickAwayListener, Grow } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Link from 'next/link'
import { Google } from '@mui/icons-material';
import { SessionProvider, useSession } from 'next-auth/react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { signOut } from 'next-auth/react';
import Skeleton from '@mui/material/Skeleton';

const Navbar = () => {

    const { data: session, status } = useSession()

    const username = session?.user?.username

    useEffect(() => {
        if (session) {
            if (!username) {
                signOutHelper()
            }
        }
    }, [session, username])

    const [popperStatus, setPopperStatus] = useState(false)
    const anchorRef = React.useRef(null);

    const handlePopperToggle = () => {
        setPopperStatus((prevOpen) => !prevOpen)
    }

    async function signOutHelper() {
        await signOut({ redirectTo: '/' })
    }

    return (
        <Box>
            <AppBar position='sticky' sx={{ height: '60px', backgroundColor: 'black', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '55%' }}>

                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '33%' }}>
                        <IconButton size='large' color='inherit'>
                            <DarkModeIcon />
                        </IconButton>
                        <Typography variant='h6' component='div'>
                            日本語能力試験アシスト
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '34%' }}>
                        <Stack direction='row' spacing={2}>
                            <Link href='/'><Button sx={{ "&:hover": { backgroundColor: '#333' } }} color='inherit' >ホーム</Button></Link>
                            <Link href='/vocabtable'><Button sx={{ "&:hover": { backgroundColor: '#333' } }} color='inherit'>語彙</Button></Link>
                            <Link href='/quizpage'>
                                <Button
                                    sx={{ "&:hover": { backgroundColor: '#333' } }}
                                    color='inherit'>
                                    クイズ
                                </Button>
                            </Link>
                            <Link href='/'><Button sx={{ "&:hover": { backgroundColor: '#333' } }} color='inherit'>連絡先</Button></Link>
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', width: '33%', justifyContent: 'center' }}>
                        {status === 'loading' ? (
                            <Skeleton
                                variant="rounded"
                                width={120}
                                height={40}
                                sx={{ bgcolor: 'grey.900' }}
                                animation="wave"
                            />
                        ) : session ? (
                            <>
                                <Button sx={{ "&:hover": { backgroundColor: '#333' } }} ref={anchorRef} endIcon={<ArrowDropDownIcon />} onClick={handlePopperToggle} color='inherit'>{username}</Button>
                                <Popper
                                    anchorEl={anchorRef.current}
                                    open={popperStatus}
                                    placement="bottom"
                                    transition
                                >
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                            {...TransitionProps}
                                            style={{
                                                transformOrigin:
                                                    placement === 'bottom',
                                            }}
                                        >
                                            <Paper>
                                                <ClickAwayListener onClickAway={() => setPopperStatus(false)}>
                                                    <MenuList sx={{ backgroundColor: 'black', color: 'white' }}>
                                                        <MenuItem sx={{ "&:hover": { backgroundColor: '#333' } }}>Review</MenuItem>
                                                        <MenuItem onClick={() => signOutHelper()} sx={{ "&:hover": { backgroundColor: '#333' } }}>Logout</MenuItem>
                                                    </MenuList>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )}
                                </Popper>
                            </>
                        )
                            : (
                                <Link href='/login'><Button sx={{ "&:hover": { backgroundColor: '#333' } }} color='inherit'>ログイン</Button></Link>
                            )}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box >
    )
}

export default Navbar