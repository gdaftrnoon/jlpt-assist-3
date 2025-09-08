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

const Navbar = () => {

    const { user, status } = useContext(UserContext)

    const username = user?.username

    const [popperStatus, setPopperStatus] = useState(false)
    const anchorRef = React.useRef(null);

    const [pagePopper, setPagePopper] = useState(false)
    const studyButtonAnchorRef = React.useRef(null)

    async function signOutHelper() {
        await signOut({ redirectTo: '/' })
    }

    useEffect(() => {
        if (!localStorage.getItem("pullFromDb")) {
            localStorage.setItem('pullFromDb', 'false')
        }
    }, [])

    /* --- Desktop Navbar (>= md) ---------------------------------- */
    const Desktopnav = () => (

        <AppBar position='sticky' sx={{ backgroundColor: 'white', color: 'black' }}>

            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton disableRipple component={Link} href='/' size='large' color='inherit'>
                        <SunnySnowingIcon />
                    </IconButton>
                    <Typography component={Link} href='/' variant='h6'>
                        日本語能力試験アシスト
                    </Typography>
                    <Button ref={studyButtonAnchorRef} onClick={() => setPagePopper(prev => !prev)} sx={{ marginLeft: '25px', fontSize: '14px', minwidth: '100%' }} color='error' endIcon={<SchoolIcon />} variant='outlined'>勉強</Button>
                    <Popper
                        anchorEl={studyButtonAnchorRef.current}
                        open={pagePopper}
                        placement='bottom'
                        transition
                        sx={{ paddingTop: '14px' }}
                    >
                        {({ TransitionProps, placement }) => (
                            <Slide
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={() => setPagePopper(false)}>
                                        <MenuList sx={{ backgroundColor: '#ef5350', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MenuItem component={Link} href='vocabtable' sx={{ transition: 'color 0.3s ease, background-color 0.3s ease', "&:hover": { color: 'black', backgroundColor: '#ef5350' } }}>文字語彙</MenuItem>
                                            <MenuItem component={Link} href='quizpage' sx={{ transition: 'color 0.3s ease, background-color 0.3s ease', "&:hover": { color: 'black', backgroundColor: '#ef5350' } }}>クイズ</MenuItem>
                                            <MenuItem component={Link} href='/' sx={{ transition: 'color 0.3s ease, background-color 0.3s ease', "&:hover": { color: 'black', backgroundColor: '#ef5350' } }}>クイズ履歴</MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Slide>
                        )}
                    </Popper>
                </Box>
                {status === 'loading' ? (
                    <Box sx={{ backgroundColor: 'white', color: 'white' }}>.</Box>
                ) : user ? (
                    <>
                        <Slide in={true}>
                            <Button color='error' variant='contained' ref={anchorRef} endIcon={<ArrowDropDownIcon />} onClick={() => setPopperStatus(prev => !prev)}>{username}</Button>
                        </Slide>
                        <Popper
                            anchorEl={anchorRef.current}
                            open={popperStatus}
                            placement='bottom'
                            transition
                            sx={{ paddingTop: '14px' }}
                        >
                            {({ TransitionProps, placement }) => (
                                <Slide
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === 'bottom',
                                    }}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={() => setPopperStatus(false)}>
                                            <MenuList sx={{ backgroundColor: '#ef5350', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                <MenuItem sx={{ transition: 'color 0.3s ease, background-color 0.3s ease', "&:hover": { color: 'black', backgroundColor: '#ef5350' } }}>設定</MenuItem>
                                                <MenuItem onClick={() => signOutHelper()} sx={{ transition: 'color 0.3s ease, background-color 0.3s ease', "&:hover": { color: 'black', backgroundColor: '#ef5350' } }}>ログアウト</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Slide>
                            )}
                        </Popper>
                    </>
                )
                    : (
                        <Zoom in={true}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Link href='/login'><Button variant='contained' color='error' sx={{ fontSize: '14px' }} >ログイン</Button></Link>
                            </Box>
                        </Zoom>
                    )}
            </Toolbar>
        </AppBar>

    )

    const MobileNavbar = () => {
        const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
        const [avatarAnchorEl, setAvatarAnchorEl] = useState(null)
        return (
            <AppBar color='error' position="sticky">
                <Container>
                    <Toolbar>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box>
                                <IconButton onClick={(event) => setMobileAnchorEl(event.currentTarget)}>
                                    <MenuIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </Box>
                            <Box component={Link} href='/' sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <SunnySnowingIcon />
                                <Typography>
                                    JLPT ASSIST
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', minWidth: 64, minHeight: 37, justifyContent: 'right' }}>
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
                                            sx={{ color: 'white' }}
                                            href='/login'
                                        >
                                            Login
                                        </Button>
                                }
                                <Menu
                                    color='black'
                                    anchorEl={mobileAnchorEl}
                                    open={Boolean(mobileAnchorEl)}
                                    onClose={() => setMobileAnchorEl(null)}
                                >
                                    <MenuItem component={Link} href='/vocab' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>文字語彙</MenuItem>
                                    <MenuItem component={Link} href='/quiz' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>クイズ</MenuItem>
                                    <MenuItem component={Link} href='/' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>成績</MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        )
    }

    return (
        <MobileNavbar />
    )
}

export default Navbar