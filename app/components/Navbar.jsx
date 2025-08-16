'use client'

import React, { useState, useEffect, useContext } from 'react'
import { AppBar, IconButton, Stack, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, Popper, Paper, MenuList, MenuItem, ClickAwayListener, Grow, ButtonGroup, CircularProgress, Zoom } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Link from 'next/link'
import { Google } from '@mui/icons-material';
import { SessionProvider, useSession } from 'next-auth/react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { signOut } from 'next-auth/react';
import Skeleton from '@mui/material/Skeleton';
import SunnySnowingIcon from '@mui/icons-material/SunnySnowing';
import { UserContext } from '../context/UserSession';
import Slide from '@mui/material/Slide';
import SchoolIcon from '@mui/icons-material/School';
import Fade from '@mui/material/Fade';

const Navbar = () => {

    const { user, status } = useContext(UserContext)

    const username = user?.username

    const [popperStatus, setPopperStatus] = useState(false)
    const anchorRef = React.useRef(null);

    const [pagePopper, setPagePopper] = useState(false)
    const studyButtonAnchorRef = React.useRef(null)

    const handlePopperToggle = () => {
        setPopperStatus((prevOpen) => !prevOpen)
    }

    async function signOutHelper() {
        await signOut({ redirectTo: '/' })
    }

    return (
        <AppBar position='sticky' sx={{ backgroundColor: 'white', color: 'black', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', minwidth: '100vw' }}>
            <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', minWidth: '40%' }}>


                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'left', minWidth: 500 }}>
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
                            <Box sx={{minWidth:90, minHeight:36}}>
                                <Link href='/login'><Button variant='contained' color='error' sx={{ fontSize: '14px' }} >ログイン</Button></Link>
                            </Box>
                        </Zoom>
                    )}
            </Toolbar>
        </AppBar>
    )
}

export default Navbar