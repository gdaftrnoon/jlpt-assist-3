"use client"
import { Alert, Box, Button, Card, CardContent, FormControlLabel, FormGroup, Slide, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Info, PersonAddAlt1, Quiz, Visibility } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';

const NewQuizMaster = () => {

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 33,
    }

    // states to hold quiz control options
    const [nLevel, setNLevel] = useState('n1')
    const [quizType, setQuizType] = useState('all')
    const [customCardCount, setCustomCardCount] = useState('')
    const [randomQuiz, setRandomQuiz] = useState(false)

    // states to control card, custom field collapse
    const [showCard, toggleShowCard] = useState(false)

    // state to hold quiz data
    const [quizData, setQuizData] = useState([])

    // state to manage card number
    const [cardNumber, setCardNumber] = useState(0)

    // state to toggle quiz on/off
    const [quizOn, toggleQuizOn] = useState(false)

    // card switch function
    const changeCard = (direction) => {
        if (direction === 'back') {
            if (cardNumber > 0) {
                setCardNumber(prev => prev - 1)
                toggleShowCard(false)
            }
        }
        if (direction === 'forward') {
            if (cardNumber < quizData.length - 1) {
                setCardNumber(prev => prev + 1)
                toggleShowCard(false)
            }
        }
    }

    // function to fetch and return ALL cards for a selected N level, and set quiz data
    const getAllCards = async (nLevel) => {
        const allPages = []
        for (let index = 1; index <= fileCount[nLevel]; index++) {
            const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}.json`)).json()
            allPages.push(data)
        }
        setQuizData(allPages.flatMap(x => x))
        toggleQuizOn(true)
    }

    // function to end quiz, resetting quiz states#
    const endQuiz = () => {
        setCardNumber(0)
        toggleQuizOn(false)
    }

    // use effect for testing
    useEffect(() => {
        console.log('flat quiz data', quizData)
    }, [quizData])

    return (

        // king box
        <Box sx={{ display: 'flex', flex: 4, flexDirection: 'row', minHeight: 'calc(100vh - 60px)', minWidth: '100vw', backgroundColor: '' }}>

            {/* column left box */}
            <Box flex={1} />

            {/* column centre box */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }} flex={2}>

                {/* box containing n controls, quiz types, random switch + start/end button */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', justifyContent: 'center', maxHeight: 70, minWidth: 1167, marginTop: 10 }}>

                    <Box sx={{ display: 'flex', padding: 0, margin: 0 }}>
                        <FormControlLabel disabled={quizOn} control={<Switch onChange={() => setRandomQuiz(prev => !prev)} />} label="Random" />
                    </Box>

                    <Box>
                        <ToggleButtonGroup
                            exclusive
                            color="primary"
                            value={nLevel}
                            disabled={quizOn}
                        >
                            <ToggleButton onClick={() => setNLevel('n1')} value='n1'>N1</ToggleButton>
                            <ToggleButton onClick={() => setNLevel('n2')} value='n2'>N2</ToggleButton>
                            <ToggleButton onClick={() => setNLevel('n3')} value='n3'>N3</ToggleButton>
                            <ToggleButton onClick={() => setNLevel('n4')} value='n4'>N4</ToggleButton>
                            <ToggleButton onClick={() => setNLevel('n5')} value='n5'>N5</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box>
                        <ToggleButtonGroup
                            disabled={quizOn}
                            color="secondary"
                            value={quizType}
                            sx={{ alignItems: 'center', display: 'flex' }}
                            exclusive
                        >
                            <ToggleButton onClick={() => { setQuizType('all'); setCustomCardCount('') }} value='all'>全て</ToggleButton>
                            <ToggleButton onClick={() => { setQuizType('allUnknown'); setCustomCardCount('') }} value='allUnknown'>知らない全て</ToggleButton>
                            <ToggleButton onClick={() => setQuizType('custom')} value='custom'>カスタム</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box>
                        <Collapse orientation="horizontal" in={(quizType) === 'custom'}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'left',
                                    gap: '20px',
                                    width: '112px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <TextField
                                    disabled={quizOn}
                                    // error={customAlert}
                                    label="カードの数"
                                    size="small"
                                    sx={{ width: '100%' }}
                                    value={customCardCount}
                                    onChange={(e) => setCustomCardCount(e.target.value)} />
                            </Box>
                        </Collapse>
                    </Box>

                    {/* start/stop quiz button */}

                    {(!quizOn) ?
                        <Button onClick={() => getAllCards(nLevel)} variant="contained">Start</Button>
                        :
                        <Button onClick={() => endQuiz()} variant="contained">End</Button>
                    }

                </Box>

                {/* card number, correct + incorrect count buttons once quiz is on */}
                <Collapse sx={{ gap: '20px' }} in={quizOn} orientation='vertical'>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingTop: 4 }}>

                        <Button disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
                            <Typography variant="body1">{`カード ${cardNumber + 1} / ${quizData.length}`}</Typography>
                        </Button>


                        <Button startIcon={<DoneOutline />} disableRipple disableFocusRipple variant='outlined' color="success">
                            <Typography variant="body1">0</Typography>
                        </Button>

                        <Button startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant='outlined' color="error">
                            <Typography variant="body1">0</Typography>
                        </Button>
                    </Box>
                </Collapse>

                {/* main box for flashcard */}
                <Card sx={{ marginTop: '50px', display: 'flex', flexDirection: 'column', minWidth: 1000, padding: 0.5, marginBottom:10 }}>
                    {(!quizOn) ?
                        <Typography sx={{ textAlign: 'center' }}>poop</Typography>
                        :
                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>

                                <CardContent sx={{ width: '30%' }}>
                                    <Box>
                                        <Typography variant='h3'>
                                            {quizData[cardNumber].slug}
                                        </Typography>
                                    </Box>
                                </CardContent>

                                <CardContent sx={{ width: '70%', display: 'flex', justifyContent: 'right', maxHeight: 80 }}>
                                    <Box sx={{ display: 'flex', gap: '10px' }}>

                                        <Button
                                            size='small'
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<ArrowLeft />}
                                            onClick={() => changeCard('back')}

                                        >
                                            前
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

                                        <Button onClick={() => toggleShowCard(true)} size='small' variant="contained" color="primary">
                                            <Typography><Visibility /> 表示</Typography>
                                        </Button>

                                        <Button


                                            size='small'
                                            variant="contained"
                                            color="success"
                                            startIcon={<Check />}
                                        >
                                            正解
                                        </Button>
                                        <Button


                                            size='small'
                                            variant="contained"
                                            color="error"
                                            startIcon={<Clear />}
                                        >
                                            不正解
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Box>
                            <Collapse in={showCard} timeout={{ enter: 250, exit: 10 }}>
                                <CardContent>
                                    <Box>

                                        <Typography gutterBottom sx={{ color: 'orange' }}>Reading</Typography>

                                        {[...new Set(quizData[cardNumber].japanese.map((x => x.reading)))].map(b => (
                                            <Typography key={b} sx={{ fontWeight: 'bold' }}>{b}</Typography>
                                        ))}

                                        <Typography gutterBottom sx={{ color: 'orange', mt: 1 }}>Meaning</Typography>

                                        <Box sx={{ mb: 1 }}>

                                            {quizData[cardNumber].senses.map((x, senseIndex) => (
                                                x.parts_of_speech != 'Wikipedia definition' && x.parts_of_speech != 'Place' ?
                                                    <Box key={senseIndex}>

                                                        {x.parts_of_speech.map((f, posIndex) => (
                                                            <Typography key={posIndex} sx={{ color: 'grey' }}>
                                                                {f}
                                                            </Typography>
                                                        ))}

                                                        {x.tags.map((g, tagIndex) => (
                                                            <Typography key={tagIndex} sx={{ color: 'grey' }}>
                                                                {g}
                                                            </Typography>
                                                        ))}

                                                        <Typography sx={{ mb: 1 }}>
                                                            {x.english_definitions.join(', ')}
                                                        </Typography>
                                                    </Box>
                                                    : null
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Collapse>
                        </>
                    }
                </Card>
            </Box>
            <Box flex={1} />
        </Box >
    )
}

export default NewQuizMaster