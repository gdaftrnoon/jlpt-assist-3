import React from 'react'
import { AppBar, IconButton, Stack, Toolbar, Typography, Button, Box } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Link from 'next/link'

const Navbar = () => {
    return (
        <AppBar position='sticky' sx={{height: '60px', backgroundColor: 'black'}}>
            <Toolbar sx={{display:'flex', justifyContent:'center'}}>
                <Box sx={{display:'flex', alignItems:'center', justifyContent:'left', width:'60%'}}>
                    <IconButton size='large' color='inherit'>
                        <DarkModeIcon />
                    </IconButton>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        日本語能力試験アシスト
                    </Typography>
                    <Link href='/'><Button color='inherit'>ホーム</Button></Link>
                    <Link href='/vocabtable'><Button color='inherit'>語彙</Button></Link>
                    <Link href='/quizpage'><Button color='inherit'>クイズ</Button></Link>
                    <Link href='/'><Button color='inherit'>連絡先</Button></Link>
                    <Link href='/'><Button color='inherit'>ログイン</Button></Link>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar