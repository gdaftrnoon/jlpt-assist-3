"use client"
import { Box, Button, Card, CardContent, Container, Divider, Grid, IconButton, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, CloudUploadOutlined, DoneOutline, InfoOutlineSharp, InsertChartOutlinedOutlined, KeyboardArrowUp, MyLocationOutlined, PersonAddAlt1, Quiz, QuizOutlined, SchoolOutlined, Visibility } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import Checkbox from "@mui/material/Checkbox";
import { redirect } from 'next/navigation';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRef } from "react";
import { useSession } from 'next-auth/react';

const Banner = () => {

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

    const MobileHomepage = () => {

        // getting user session if it exists
        const { data: session, status } = useSession()
        const userid = session?.user?.userId

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
        const [tableExpand2, toggleTableExpand2] = useState(true)

        // quiz type state management
        const [quizType, setQuizType] = useState('all')

        // card state management
        const [cardNumber, setCardNumber] = useState(0)
        const [cardCollapse, toggleCardCollapse] = useState(true)

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

        // for the more info button
        const moreInfo = useRef(null);

        return (

            <>
                <Container
                    sx={{
                        display: { md: 'flex' },
                        flexDirection: { md: 'column' },
                        alignItems: { md: 'center' },
                        justifyContent: { md: 'flex-start' }
                    }}>

                    <Box sx={{
                        width: { xs: '100%', md: '50%' }
                    }}>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mt: 6,
                            mb: 3
                        }}>

                            <Typography gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, minWidth: { md: 416 } }}>
                                「日本語能力試験アシスト」
                            </Typography>

                            <Typography sx={{ textAlign: 'center' }}>
                                Master Japanese vocabulary through targeted practice and spaced repetition.
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 6 }}>

                            {(userid) ?
                                <Button
                                    onClick={() => redirect('/vocab')}
                                    variant="contained"
                                    size="small"
                                    startIcon={<SchoolOutlined />}
                                    color='error'
                                    sx={{
                                        fontSize: '0.95rem',
                                        borderRadius: '12px',
                                        px: 2,
                                        py: 1
                                    }}
                                >
                                    Start Learning
                                </Button> :
                                <Button
                                    onClick={() => redirect('/login')}
                                    variant="contained"
                                    size="small"
                                    startIcon={<PersonAddAlt1 />}
                                    color='error'
                                    sx={{
                                        fontSize: '0.95rem',
                                        borderRadius: '12px',
                                        px: 2,
                                        py: 1
                                    }}
                                >
                                    Register
                                </Button>
                            }

                            <Button
                                onClick={() =>
                                    window.scrollTo({
                                        top: moreInfo.current.offsetTop,
                                        behavior: "smooth"
                                    })
                                }
                                variant="outlined"
                                size="small"
                                startIcon={<InfoOutlineSharp />}
                                color='error'
                                sx={{
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    px: 2,
                                    py: 1
                                }}
                            >
                                Learn More
                            </Button>

                        </Box>


                        {/* card explaining the vocab table */}
                        <Card sx={{ display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>

                            <CardContent sx={{ paddingBottom: 0 }}>
                                <Button
                                    onClick={() => redirect('/vocab')}
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
                                    Vocabulary Tables
                                </Button>
                            </CardContent>

                            <CardContent sx={{ paddingBottom: 2 }}>
                                <Typography sx={{ color: 'grey.600' }}>
                                    Begin by identifying known vocabulary, split by N-Level.
                                </Typography>
                            </CardContent>

                            <Divider />

                            <CardContent>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                                <IconButton onClick={() => toggleTableExpand(prev => !prev)}>
                                                    {tableExpand ?
                                                        <KeyboardArrowUp /> :
                                                        <KeyboardArrowDownIcon />}
                                                </IconButton>
                                            </TableCell>

                                            <TableCell sx={{ width: '1%', padding: 0 }}>
                                                <Checkbox defaultChecked />
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
                                                        <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Reading</Typography>
                                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>りょこう</Typography>
                                                        <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Meaning</Typography>
                                                        <Typography sx={{ color: 'grey', fontSize: '1rem' }}>Noun, Suru verb, Intransitive verb</Typography>
                                                        <Typography sx={{ fontSize: '1rem' }}>travel, trip, journey, excursion, tour</Typography>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>

                                            <TableCell sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                                <IconButton onClick={() => toggleTableExpand2(prev => !prev)}>
                                                    {tableExpand2 ?
                                                        <KeyboardArrowUp /> :
                                                        <KeyboardArrowDownIcon />}
                                                </IconButton>
                                            </TableCell>

                                            <TableCell sx={{ width: '1%', padding: 0 }}>
                                                <Checkbox />
                                            </TableCell>

                                            <TableCell sx={{ width: '98%', textAlign: 'center', pr: 9, fontSize: '1rem', fontWeight: 'bold' }}>
                                                英語
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                <Collapse in={tableExpand2}>
                                                    <Box sx={{ paddingY: 2 }}>
                                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>英語</Typography>
                                                        <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Reading</Typography>
                                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>えいご</Typography>
                                                        <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Meaning</Typography>
                                                        <Typography sx={{ color: 'grey', fontSize: '1rem' }}>Noun</Typography>
                                                        <Typography sx={{ fontSize: '1rem' }}>English (language)</Typography>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>

                        </Card>

                        {/* card explaining the quiz table */}
                        <Box sx={{ minHeight: { md: 636, xs: 684 } }}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', mt: 3, borderRadius: '16px' }}>

                                <CardContent sx={{ paddingBottom: 0 }}>
                                    <Button
                                        onClick={() => redirect('/quiz')}
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
                                        Flashcards
                                    </Button>
                                </CardContent>

                                <CardContent sx={{ paddingBottom: 2 }}>
                                    <Typography sx={{ color: 'grey.600' }}>
                                        Run flashcard style tests on all, known or unknown vocabulary words.
                                    </Typography>
                                </CardContent>

                                <Divider />

                                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', pt: 3 }}>

                                    {/* card numbers, right and wrong counters */}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <Button size='small' disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
                                            <Typography variant="body1"> Card {cardNumber + 1} / {exampleWords.length} </Typography>
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
                                            Prev
                                        </Button>

                                        <Button
                                            startIcon={<Visibility />}
                                            disabled={(cardCollapse === true)}
                                            onClick={() => toggleCardCollapse(true)}
                                            size='small'
                                            variant="contained"
                                            color="primary">
                                            <Typography>Show</Typography>
                                        </Button>

                                        <Button
                                            size='small'
                                            variant="outlined"
                                            color="primary"
                                            endIcon={<ArrowRight />}
                                            onClick={() => changeCard('forward')}
                                        >
                                            Next
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
                                            Correct
                                        </Button>
                                        <Button
                                            disabled={cardCollapse === true ? false : true}
                                            onClick={() => evaluateCard('incorrect')}
                                            size='small'
                                            variant="contained"
                                            color="error"
                                            startIcon={<Clear />}
                                        >
                                            Incorrect
                                        </Button>

                                    </Box>

                                </CardContent>

                                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                                    <Typography sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {exampleWords[cardNumber].slug}
                                    </Typography>
                                </CardContent>

                                {/* content holder for card details */}
                                <Collapse in={cardCollapse} timeout={{ enter: 400, exit: 10 }}>
                                    <CardContent sx={{ pt: 0 }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}> {exampleWords[cardNumber].slug}</Typography>

                                            <Typography sx={{ color: 'orange', mt: 1, fontWeight: 'bold' }}>Reading</Typography>

                                            {exampleWords[cardNumber].reading.map((x, index) => (
                                                <Typography sx={{ fontWeight: 'bold' }} key={`reading ${index}`}>{x}</Typography>
                                            ))}

                                            <Typography sx={{ color: 'orange', mt: 1, fontWeight: 'bold' }}>Meaning</Typography>

                                            {exampleWords[cardNumber].definitions.map((y, index) => (
                                                <Box sx={{ mb: 1 }} key={`meaning ${index}`}>
                                                    <Typography sx={{ color: 'grey', fontSize: '1rem' }}>{y.type}</Typography>
                                                    <Typography sx={{ fontSize: '1rem' }}>{y.meaning}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Collapse>

                            </Card>
                        </Box>
                    </Box>
                </Container>

                <Box
                    ref={moreInfo}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        width: '100%',
                        backgroundColor: '#ffebee',
                        mt: 5,
                        pt: 10,
                        pb: 15
                    }}>
                    <Box sx={{ mb: 5, width: '100%', textAlign: 'center' }}>
                        <Typography gutterBottom sx={{ fontSize: '2rem' }}>Core Features</Typography>
                        <Typography gutterBottom sx={{ fontSize: '1.2rem', color: 'grey' }}>Modern features, simple design philosophy</Typography>
                    </Box>

                    <Box sx={{ width: { xs: '90%', md: '35%' } }}>

                        <Grid container spacing={2} sx={{}}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 1, padding: 1 }}>
                                        <MyLocationOutlined color='error' fontSize='small' sx={{ border: 1, borderRadius: '16px', px: 0.5, py: 0.2 }} />
                                        <Typography sx={{ fontWeight: '600' }} variant='subtitle1'>Targeted Study</Typography>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography sx={{ color: 'grey' }} variant='subtitle2'>Tailor your learning to specific N-Levels, building a solid foundation for the next exam.</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 1, padding: 1 }}>
                                        <QuizOutlined color='error' fontSize='small' sx={{ border: 1, borderRadius: '16px', px: 0.5, py: 0.2 }} />
                                        <Typography sx={{ fontWeight: '600' }} variant='subtitle1'>Customisable Tests</Typography>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography sx={{ color: 'grey' }} variant='subtitle2'>Quiz yourself on all words, those you know, those you don't, or the ones you keep missing.</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 1, padding: 1 }}>
                                        <CloudUploadOutlined color='error' fontSize='small' sx={{ border: 1, borderRadius: '16px', px: 0.5, py: 0.2 }} />
                                        <Typography sx={{ fontWeight: '600' }} variant='subtitle1'>Sync Across Devices</Typography>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography sx={{ color: 'grey' }} variant='subtitle2'>Quiz sessions can paused and saved securely to the cloud, allowing you to pick up where you left off on any device.</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 1, padding: 1 }}>
                                        <InsertChartOutlinedOutlined color='error' fontSize='small' sx={{ border: 1, borderRadius: '16px', px: 0.5, py: 0.2 }} />
                                        <Typography sx={{ fontWeight: '600' }} variant='subtitle1'>Results Tracking & Analysis</Typography>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography sx={{ color: 'grey' }} variant='subtitle2'>Review quiz results, view progression statistics and pinpoint difficult vocabulary items.</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                        </Grid>
                    </Box>
                </Box>
            </>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <MobileHomepage />
        </ThemeProvider>
    )
}

export default Banner