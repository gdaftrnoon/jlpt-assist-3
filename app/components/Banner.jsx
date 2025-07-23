import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'
import React from 'react'

const Banner = () => {
    return (
        <Box sx={{
            width: '100%',
            height:'100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop:'20px',
        }}>
            <Card sx={{width:'60%'}}>
                <CardActionArea>
                    <CardMedia
                        component='img'
                        image='images\Screenshot_20250629_193019_Gallery.jpg'
                        sx={{height:'500px'}}
                    />
                    <CardContent>
                        <Typography gutterBottom variant='h5' component='div'>
                            語彙を暗記する
                        </Typography>
                        <Typography variant='body2' sx={{ color:'text.secondary'}}>
                            知らない語彙を特定して、クイズ通じて記憶に刻む！
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    )
}

export default Banner