"use client"
import { Alert, Badge, Box, Button, Card, CardActionArea, CardContent, CardMedia, Container, Fade, FormControlLabel, FormGroup, IconButton, Paper, Slide, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography, Zoom } from '@mui/material'
import React, { act, useEffect, useState } from 'react'
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Info, KeyboardArrowUp, PersonAddAlt1, Quiz, Visibility } from '@mui/icons-material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import Link from 'next/link';
import LaunchIcon from '@mui/icons-material/Launch';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Checkbox, { checkboxClasses } from "@mui/material/Checkbox";
import { red } from '@mui/material/colors';

const Banner = () => {


    // list containing the example words we use on the homepage
    const [exampleWords, setExampleWords] = useState([
        {
            slug: '美味しい',
            reading: ['おいしい'],
            definitions: [
                {
                    type: 'I-adjective (keiyoushi)',
                    meaning: 'good (tasting), nice, delicious, tasty'
                },
                {
                    type: 'I-adjective (keiyoushi)',
                    meaning: 'attractive (offer, opportunity, etc.), appealing, convenient, favorable, desirable, profitable'
                }
            ],
            result: null
        },
        {
            slug: '趣味',
            reading: ['しゅみ'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'hobby, pastime'
                },
                {
                    type: 'Noun',
                    meaning: 'tastes, preference, liking'
                }
            ],
            result: null
        },
        {
            slug: '夢',
            reading: ['ゆめ'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'dream'
                }
            ],
            result: null
        },
        {
            slug: '気分',
            reading: ['きぶん'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'feeling, mood'
                }
            ],
            result: null
        },
        {
            slug: '歴史',
            reading: ['れきし'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'history'
                }
            ],
            result: null
        },

    ])

    // state to manage which example is shown on the homepage (quiz/vocabtable)
    const [activeExample, setActiveExample] = useState('vocabtable')

    // table state management
    const [tableExpand, toggleTableExpand] = useState(true)
    const [tableExpand2, toggleTableExpand2] = useState(false)

    // quiz type state management
    const [quizType, setQuizType] = useState('all')

    // card state management
    const [cardNumber, setCardNumber] = useState(0)
    const [cardCollapse, toggleCardCollapse] = useState(false)

    // card correct incorrect counter state management
    const [correctCount, setCorrectCount] = useState(0)
    const [incorrectCount, setIncorrectCount] = useState(0)

    // card switch function
    const changeCard = (direction) => {
        if (direction === 'back') {
            if (cardNumber > 0) {
                setCardNumber(prev => prev - 1)
                toggleCardCollapse(false)
            }
        }
        if (direction === 'forward') {
            if (cardNumber < exampleWords.length - 1) {
                setCardNumber(prev => prev + 1)
                toggleCardCollapse(false)
            }
        }
    }

    // card correct/incorrect function
    const evaluateCard = (result) => {

        if (result === 'correct') {
            setExampleWords(prev => prev.map((x, index) => (
                (cardNumber === index) ? { ...x, result: true } : x
            )))
            changeCard('forward')
        }

        if (result === 'incorrect') {
            setExampleWords(prev => prev.map((x, index) => (
                (cardNumber === index) ? { ...x, result: false } : x
            )))
            changeCard('forward')
        }
    }

    // card updating incorrect correct counts
    useEffect(() => {

        const correct = exampleWords.filter(x => x.result === true).length
        const incorrect = exampleWords.filter(x => x.result === false).length

        setCorrectCount(correct)
        setIncorrectCount(incorrect)

    }, [exampleWords])

    const MobileHomepage = () => (
        <Container maxWidth='xl' sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'white' }}>
            <Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: 5 }}>
                    <Typography gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.3 }}>
                        「日本語能力試験アシスト」
                    </Typography>

                    <Typography sx={{ mb: 1.5, fontSize: '1.25rem', textAlign: 'center', color: 'grey.800', lineHeight: 1.4 }}>
                        JLPT合格のための基礎固め
                    </Typography>

                    <Typography sx={{ color: 'grey.600', fontSize: '1rem', textAlign: 'center', lineHeight: 1.4 }}>
                        語彙表の確認、知らない単語の記録
                    </Typography>
                    <Typography sx={{ color: 'grey.600', fontSize: '1rem', textAlign: 'center', lineHeight: 1.4, mb: 2 }}>
                        カスタムクイズで復習しよう
                    </Typography>
                </Box>

                {/* card explaining the vocab table */}
                <Card sx={{ display: 'flex', flexDirection: 'column', mt: 6, borderRadius: '16px' }}>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<AutoStoriesIcon />}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderRadius: '12px',
                                px: 2,
                                py: 1
                            }}
                        >
                            語彙管理
                        </Button>
                    </CardContent>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: 'grey.600' }}>N1〜N5のレベルから選んで、知っている単語・知らない単語を簡単にチェックする</Typography>
                    </CardContent>

                </Card>

                {/* card for vocab table */}
                <Card raised sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, borderRadius: '16px' }}>
                    <Table>
                        <TableBody>
                            <TableRow>

                                <TableCell sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                    <IconButton onClick={() => toggleTableExpand(prev => !prev)}>
                                        {tableExpand ?
                                            <KeyboardArrowUp /> :
                                            <KeyboardArrowDownIcon />
                                        }
                                    </IconButton>
                                </TableCell>

                                <TableCell sx={{ width: '1%', padding: 0 }}>
                                    <Checkbox
                                        checked
                                        sx={{
                                            [`&, &.${checkboxClasses.checked}`]: {
                                                color: '#ef5350',
                                            },
                                        }} />
                                </TableCell>

                                <TableCell sx={{ width: '98%', textAlign: 'center', pr: 9, fontSize: '1rem', fontWeight: 'bold' }}>
                                    旅行
                                </TableCell>

                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                    <Collapse in={tableExpand}>
                                        <Box sx={{ paddingY: 2 }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>旅行</Typography>
                                            <Typography sx={{ color: '#ef5350', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>読み方</Typography>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>りょこう</Typography>
                                            <Typography sx={{ color: '#ef5350', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>意味</Typography>
                                            <Typography sx={{ color: 'grey', fontSize: '1rem' }}>Noun, Suru verb, Intransitive verb</Typography>
                                            <Typography sx={{ fontSize: '1rem' }}>travel, trip, journey, excursion, tour</Typography>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>

                {/* card explaining the quiz table */}
                <Card sx={{ display: 'flex', flexDirection: 'column', mt: 6, borderRadius: '16px' }}>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<Quiz />}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderRadius: '12px',
                                px: 2,
                                py: 1
                            }}
                        >
                            単語テスト
                        </Button>
                    </CardContent>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: 'grey.600' }}>語彙テーブルによって、まだ覚えていない単語やカスタムクイズでテストしよう</Typography>
                    </CardContent>

                </Card>

                {/* card for quiz */}
                <Card raised sx={{ display: 'flex', flexDirection: 'column', mt: 3, borderRadius: '16px', flexDirection: 'column' }}>

                    <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

                        {/* card numbers, right and wrong counters */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Button size='small' disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
                                <Typography variant="body1"> カード {cardNumber + 1} / {exampleWords.length} </Typography>
                            </Button>
                            <Button size='small' startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={(exampleWords[cardNumber].result === true ? 'contained' : 'outlined')} color="success">
                                <Typography variant="body1">{correctCount}</Typography>
                            </Button>

                            <Button size='small' startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={(exampleWords[cardNumber].result === false ? 'contained' : 'outlined')} color="error">
                                <Typography variant="body1">{incorrectCount}</Typography>
                            </Button>
                        </Box>

                        {/* forward, backwards, eye icon */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, paddingTop: 2 }}>

                            <Button
                                size='small'
                                variant="outlined"
                                color="primary"
                                startIcon={<ArrowLeft />}
                                onClick={() => changeCard('back')}
                            >
                                前
                            </Button>

                            <Button disabled={(cardCollapse === true)} onClick={() => toggleCardCollapse(true)} size='small' variant="contained" color="primary">
                                <Typography><Visibility />表示</Typography>
                            </Button>

                            <Button
                                size='small'
                                variant="outlined"
                                color="primary"
                                endIcon={<ArrowRight />}
                                onClick={() => changeCard('forward')}
                            >
                                次
                            </Button>

                        </Box>

                        {/* correct, incorrect buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, paddingTop: 2 }}>

                            <Button
                                disabled={cardCollapse === true ? false : true}
                                onClick={() => evaluateCard('correct')}
                                size='small'
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                            >
                                正解
                            </Button>
                            <Button
                                disabled={cardCollapse === true ? false : true}
                                onClick={() => evaluateCard('incorrect')}
                                size='small'
                                variant="contained"
                                color="error"
                                startIcon={<Clear />}
                            >
                                不正解
                            </Button>

                        </Box>

                    </CardContent>

                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                        <Typography sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {exampleWords[cardNumber].slug}
                        </Typography>
                    </CardContent>

                    {/* content holder for card details */}
                    <Collapse in={cardCollapse} timeout={{ enter: 800, exit: 10 }}>
                        <CardContent>
                            <Box>

                                <Typography sx={{ color: '#ef5350', fontSize: '1rem', fontWeight: 'bold' }}>読み方</Typography>

                                {exampleWords[cardNumber].reading.map((x, index) => (
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }} key={`reading ${index}`}>{x}</Typography>
                                ))}

                                <Typography sx={{ color: '#ef5350', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>意味</Typography>

                                {exampleWords[cardNumber].definitions.map((y, index) => (
                                    <Box sx={{ mb: 1 }} key={`meaning ${index}`}>
                                        <Typography sx={{ color: 'grey', fontSize: '1rem' }}>{y.type}</Typography>
                                        <Typography sx={{ fontSize: '1rem' }}>{y.meaning}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Collapse>
                </Card >

                {/* card explaining benefits of signing up */}
                <Card sx={{ display: 'flex', flexDirection: 'column', mt: 6, borderRadius: '16px', mb:6, backgroundColor: '#ef5350' }}>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PersonAddAlt1 />}
                            color='inherit'
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                borderColor: 'white',
                                color: 'white' 
                            }}
                        >
                            登録
                        </Button>
                    </CardContent>

                    <CardContent sx={{ paddingBottom: 0 }}>
                        <Typography sx={{ fontSize: '0.9rem', color: 'grey.600', color:'white' }}>アカウント登録すると、学習データが保存され、クイズ結果も記録されます</Typography>
                    </CardContent>

                </Card>

            </Box >

        </Container >
    )

    return (
        <MobileHomepage />
    )
}

export default Banner