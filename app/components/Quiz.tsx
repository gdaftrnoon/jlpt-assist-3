'use client'

import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Quiz, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, CircularProgress, Collapse, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

type Props = {
    fileCount: object
}

const MyComponent: React.FC<Props> = ({ fileCount }) => {

    const [nAlignment, setNAlignment] = useState('n1')

    const handleNChange = (
        event: React.MouseEvent<HTMLElement>,
        newNAlignment: string,
    ) => {
        if (newNAlignment !== null) {
            setNAlignment(newNAlignment);
        }
    }

    const [tAlignment, setTalignment] = useState('All')
    const handleTChange = (
        event: React.MouseEvent<HTMLElement>,
        newTAlignment: string
    ) => {
        if (newTAlignment !== null) {
            setTalignment(newTAlignment)
        }
    }

    const [quizOn, setQuizOn] = useState(false)
    const [quizData, setQuizData] = useState<any[]>([])

    const [cardLoading, setCardLoading] = useState(false)

    async function startQuiz(nAlignment: string, tAlignment: string) {
        setQuizOn(false)
        setCardLoading(true)
        if (tAlignment === 'All') {
            const allPages = []
            for (let index = 1; index < fileCount[nAlignment]; index++) {
                const response = await fetch(`vocab/${nAlignment}/${nAlignment}_page${index}.json`)
                const responseJson = await response.json()
                const vocabData = responseJson.data
                allPages.push(vocabData)
            }
            const flatPages = allPages.flatMap(x => x)
            setSlugCount(allPages.length)
            setQuizData(flatPages)
            setCardLoading(false)
            setQuizOn(true)
            createSkeleton(allPages.length)
            setCardNumber(0)
        }
    }

    const [cardNumber, setCardNumber] = useState<number>(0)
    const [slugCount, setSlugCount] = useState<number>(0)

    const prevCard = (cardNumber: number) => {
        if (cardNumber > 0) (
            setCardNumber(prev => prev - 1)
        )
        showCardDetails(false)
    }

    const nextCard = (cardNumber: number) => {
        if (cardNumber < slugCount) (
            setCardNumber(prev => prev + 1)
        )
        showCardDetails(false)
    }

    const [skeleton, updateSkeleton] = useState<Record<number, string>>({})

    function createSkeleton(n: number) {
        const body = {}
        for (let index = 0; index < n; index++) {
            body[index] = ''
        }
        updateSkeleton(body)
    }

    const [correctCount, updateCorrectCount] = useState<number>(0)
    const [incorrectCount, updateIncorrectCount] = useState<number>(0)

    function updateOutcome(cardNumber: number, outcome: string) {

        if (outcome === 'correct') {
            updateSkeleton(prev => ({
                ...prev,
                [cardNumber]: 'correct'
            }))

            nextCard(cardNumber)
        }
        else if (outcome === 'incorrect') {
            updateSkeleton(prev => ({
                ...prev,
                [cardNumber]: 'incorrect'
            }))
            nextCard(cardNumber)
        }
    }

    useEffect(() => {
        const outcomes = Object.values(skeleton)
        const newCorrect = outcomes.filter(x => x === 'correct').length
        const newIncorrect = outcomes.filter(x => x === 'incorrect').length
        updateCorrectCount(newCorrect)
        updateIncorrectCount(newIncorrect)
    }, [skeleton])

    useEffect(() => {
        if (quizOn) {
            console.log('quiz data', quizData)
            console.log('card1', quizData[cardNumber])
            console.log('quiz data slug', quizData[cardNumber].japanese.map(x => x.reading))
            console.log('card num', cardNumber)
            console.log('num of slugs', slugCount)
            console.log(skeleton)
        }
    }, [quizData, skeleton])

    const [cardDetails, showCardDetails] = useState(false)

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>

                <Box sx={{ display: 'flex', width: '20%', height: '100%' }}></Box>

                <Box sx={{ display: 'flex', width: '60%', height: '100%', flexDirection: 'column' }}>

                    <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '20px', width: '100%', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>

                        <Collapse in={quizOn}>

                            <Box>
                                <Button startIcon={<Quiz />} disableRipple disableFocusRipple variant="outlined" color="info">
                                    <Typography variant="body1"> カード {cardNumber + 1} / {slugCount + 1} </Typography>
                                </Button>
                            </Box>

                        </Collapse>

                        <Box>
                            <ToggleButtonGroup
                                color="primary"
                                value={nAlignment}
                                exclusive
                                onChange={handleNChange}>
                                <ToggleButton value='n1'>N1</ToggleButton>
                                <ToggleButton value='n2'>N2</ToggleButton>
                                <ToggleButton value='n3'>N3</ToggleButton>
                                <ToggleButton value='n4'>N4</ToggleButton>
                                <ToggleButton value='n5'>N5</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        <Box>
                            <ToggleButtonGroup
                                color="secondary"
                                value={tAlignment}
                                exclusive
                                onChange={handleTChange}>
                                <ToggleButton value='All'>全て</ToggleButton>
                                <ToggleButton value='AllUnknown'>知らない全て</ToggleButton>
                                <ToggleButton value='Custom'>カスタム</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button onClick={() => startQuiz(nAlignment, tAlignment)} variant="contained">スタート</Button>
                        </Box>

                        <Collapse in={quizOn}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                <Box>
                                    <Button startIcon={<DoneOutline />} disableRipple disableFocusRipple variant="outlined" color="success">
                                        <Typography variant="body1"> {correctCount} </Typography>
                                    </Button>
                                </Box>
                                <Box>
                                    <Button startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant="outlined" color="error">
                                        <Typography variant="body1"> {incorrectCount} </Typography>
                                    </Button>
                                </Box>
                            </Box>
                        </Collapse>

                    </Box>

                    <Box sx={{ marginTop: '20px' }}>
                        {
                            quizOn ?
                                <Card sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <CardContent sx={{ width: '60%' }}>
                                        <Box>
                                            <Typography variant='h4' sx={{ paddingBottom: '10px' }}>
                                                {quizData[cardNumber].slug}
                                            </Typography>

                                            <Collapse in={cardDetails} timeout={{ enter: 250, exit: 10 }}>
                                                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Readings</Typography>
                                                {[...new Set(quizData[cardNumber].japanese.map((x => x.reading)))].map((y, index) => (
                                                    <Typography key={`reading-${index}`}>
                                                        {y as string}
                                                    </Typography>
                                                ))}

                                                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Meaning</Typography>
                                                {quizData[cardNumber].senses.map((y, index) => (
                                                    (y.parts_of_speech != 'Place' && y.parts_of_speech != 'Wikipedia definition') && (
                                                        <>
                                                            {y.parts_of_speech.map((part, index) => (
                                                                <Typography key={`part-${index}`}>{part}</Typography>
                                                            ))}

                                                            <Typography key={`engdef-${index}`}>
                                                                {y.english_definitions.join(", ")}
                                                            </Typography>
                                                        </>
                                                    )))}
                                            </Collapse>
                                        </Box>
                                    </CardContent>
                                    <CardContent sx={{ width: '40%', display: 'flex', justifyContent: 'right', height: '80px' }}>
                                        <Box sx={{ display: 'flex', gap: '10px' }}>

                                            <Button variant="outlined" color="primary" startIcon={<ArrowLeft />} onClick={() => prevCard(cardNumber)}>
                                                前
                                            </Button>

                                            <Button variant="outlined" color="primary" endIcon={<ArrowRight />} onClick={() => nextCard(cardNumber)}>
                                                次
                                            </Button>

                                            <Button disabled={cardDetails} variant="contained" color="primary" onClick={() => showCardDetails(!cardDetails)}>
                                                <Typography><Visibility /> 表示</Typography>
                                            </Button>

                                            <Button disabled={!cardDetails} variant="contained" color="success" startIcon={<Check />} onClick={() => updateOutcome(cardNumber, 'correct')}>
                                                正解
                                            </Button>
                                            <Button disabled={!cardDetails} variant="contained" color="error" startIcon={<Clear />} onClick={() => updateOutcome(cardNumber, 'incorrect')}>
                                                不正解
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                                :
                                <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CardContent>
                                        {
                                            cardLoading ?
                                                <CircularProgress /> :
                                                <Typography>Press Start!</Typography>
                                        }
                                    </CardContent>
                                </Card>
                        }
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', width: '20%', height: '100%' }}></Box>
            </Box>
        </>
    )
}

export default MyComponent