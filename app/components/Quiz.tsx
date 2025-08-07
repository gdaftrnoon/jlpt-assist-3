'use client'

import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Quiz, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Paper, Stack, tabClasses, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, ToggleButton, ToggleButtonGroup, Typography, useForkRef } from "@mui/material";
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

    const [cardNumber, setCardNumber] = useState<number>(0)
    const [slugCount, setSlugCount] = useState<number>(0)

    const prevCard = (cardNumber: number) => {
        if (cardNumber > 0) {
            setCardNumber(prev => prev - 1)
        }
        showCardDetails(false)
    }

    const nextCard = (cardNumber: number) => {
        if (cardNumber < slugCount - 1) {
            setCardNumber(prev => prev + 1)
        }
        showCardDetails(false)
    }

    const [skeleton, updateSkeleton] = useState<Record<number, string>>({})

    const [correctCount, updateCorrectCount] = useState<number>(0)
    const [incorrectCount, updateIncorrectCount] = useState<number>(0)
    const [incompleteCount, updateIncompleteCount] = useState<number>(0)

    const [cardDetails, showCardDetails] = useState(false)

    const [quizStopDialogue, setQuizStopDialogue] = useState(false)

    const handleQuizEnd = () => {
        localStorage.removeItem('localSkeleton')
        localStorage.removeItem('quizState')
        setPrevN('')
        setPrevT('')
        setPrevCN(0)
        setPrevSkeleton({})
        setQuizOn(false)
        setQuizStopDialogue(false)
    }

    const [quizResultDialog, setQuizResultDialog] = useState(false)

    const saveQuizResult = () => {
        setQuizResultDialog(false)
    }

    const doNotSaveQuizResult = () => {
        setQuizResultDialog(false)
    }

    const [quizProgress, showQuizProgress] = useState(false)

    const [progAlignment, setProgAlignment] = useState('Correct')

    const handleProgAlignment = (e, newProgAlignment) => {
        setProgAlignment(newProgAlignment)
    }

    const [correctCards, updateCorrectCards] = useState<number[]>([])
    const [incorrectCards, updateIncorrectCards] = useState<number[]>([])
    const [incompleteCards, updateIncompleteCards] = useState<number[]>([])

    const [progTablePage, setProgTablePage] = useState(0)
    const handleProgTablePageChange = (e, newProgPage) => {
        setProgTablePage(newProgPage)
    }

    const handleProgButtonClick = (cardNum: number) => {
        showQuizProgress(false)
        setCardNumber(cardNum)
    }

    const progressTable = (progAlignment) => {
        return (
            <Box>
                <TableContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Card Number</TableCell>
                                <TableCell>Word</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                progAlignment === 'Correct' ? (
                                    correctCards.slice(progTablePage * 5, progTablePage * 5 + 5).map(x =>
                                        <TableRow key={x}>
                                            <TableCell><Button onClick={() => handleProgButtonClick(x)}>{x + 1}</Button></TableCell>
                                            <TableCell>{quizData[x].slug}</TableCell>
                                        </TableRow>
                                    )) :
                                    progAlignment === 'Incorrect' ? (
                                        incorrectCards.slice(progTablePage * 5, progTablePage * 5 + 5).map(x =>
                                            <TableRow key={x}>
                                                <TableCell><Button onClick={() => handleProgButtonClick(x)}>{x + 1}</Button></TableCell>
                                                <TableCell>{quizData[x].slug}</TableCell>
                                            </TableRow>
                                        )) :
                                        progAlignment === 'Unmarked' ? (
                                            incompleteCards.slice(progTablePage * 5, progTablePage * 5 + 5).map(x =>
                                                <TableRow key={x}>
                                                    <TableCell><Button onClick={() => handleProgButtonClick(x)}>{x + 1}</Button></TableCell>
                                                    <TableCell>{quizData[x].slug}</TableCell>
                                                </TableRow>
                                            )) : null}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    count={progAlignment === 'Correct' ? correctCards.length : progAlignment === 'Incorrect' ? incorrectCards.length : progAlignment === 'Unmarked' ? incompleteCards.length : null}
                    page={progTablePage}
                    onPageChange={handleProgTablePageChange}
                    rowsPerPageOptions={[]}
                    rowsPerPage={5}
                />
            </Box>
        )
    }

    async function startQuiz(nAlignment: string, tAlignment: string) {
        if (tAlignment === 'All') {
            localStorage.removeItem('localSkeleton')
            localStorage.removeItem('quizState')
            showCardDetails(false)
            setQuizOn(false)
            setCardLoading(true)
            const allPages = []
            for (let index = 1; index <= fileCount[nAlignment]; index++) {
                const response = await fetch(`vocab/${nAlignment}/${nAlignment}_page${index}.json`)
                const responseJson = await response.json()
                const vocabData = responseJson.data
                allPages.push(vocabData)
            }
            const flatPages = allPages.flatMap(x => x)
            setSlugCount(flatPages.length)
            setQuizData(flatPages)
            setCardLoading(false)
            createSkeleton(flatPages.length)
            setCardNumber(0)
            setQuizOn(true)
        }

        if (tAlignment === 'AllUnknown') {
            localStorage.removeItem('localSkeleton')
            localStorage.removeItem('quizState')
            showCardDetails(false)
            setQuizOn(false)
            setCardLoading(true)
            const allPages = []
            for (let index = 1; index <= fileCount[nAlignment]; index++) {
                const response = await fetch(`vocab/${nAlignment}/${nAlignment}_page${index}.json`)
                const responseJson = await response.json()
                const vocabData = responseJson.data
                allPages.push(vocabData)
            }

            const flatPages = allPages.flatMap(x => x)
            if (localStorage.getItem(`knownWords${nAlignment}`)) {
                const lsKnownWords = JSON.parse(localStorage.getItem(`knownWords${nAlignment}`))
                console.log(lsKnownWords)
                const allUnknownQuizData = []
                flatPages.forEach((entry) => {
                    if (!lsKnownWords.includes(entry.slug)) {
                        allUnknownQuizData.push(entry)
                    }
                })
                setSlugCount(allUnknownQuizData.length)
                setQuizData(allUnknownQuizData)
                setCardLoading(false)
                createSkeleton(allUnknownQuizData.length)
                setCardNumber(0)
                setQuizOn(true)
            }
        }
    }

    function createSkeleton(n: number) {
        const body = {}
        for (let index = 0; index < n; index++) {
            body[index] = 'incomplete'
        }
        updateSkeleton(body)
    }

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

    function getKeysFromValues(object, value) {
        const keysArray = []
        for (let prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (object[prop] === value) {
                    keysArray.push(Number(prop))
                }
            }
        }
        return keysArray
    }

    function objectToArray(object) {
        const newArray = Object.keys(object).map((key) => [Number(key), object[key]])
        return newArray
    }

    useEffect(() => {

        const outcomes = Object.values(skeleton)
        const newCorrect = getKeysFromValues(skeleton, 'correct')
        const newIncorrect = getKeysFromValues(skeleton, 'incorrect')
        const newIncomplete = getKeysFromValues(skeleton, 'incomplete')

        const newCorrectCount = outcomes.filter(x => x === 'correct').length
        const newIncorrectCount = outcomes.filter(x => x === 'incorrect').length
        const newIncompleteCount = outcomes.filter(x => x === 'incomplete').length

        updateCorrectCards(newCorrect)
        updateIncorrectCards(newIncorrect)
        updateIncompleteCards(newIncomplete)

        updateCorrectCount(newCorrectCount)
        updateIncorrectCount(newIncorrectCount)
        updateIncompleteCount(newIncompleteCount)

        if (quizOn && newIncompleteCount === 0) {
            setQuizResultDialog(true)
        }

    }, [skeleton])


    useEffect(() => {

        if (quizOn) {
            const localSkeleton = objectToArray(skeleton)
            localStorage.setItem('localSkeleton', JSON.stringify(localSkeleton))
            const quizState = [nAlignment, tAlignment, cardNumber]
            localStorage.setItem('quizState', JSON.stringify(quizState))
        }

    }, [skeleton, cardNumber])

    useEffect(() => {
        if (quizOn) {
            console.log('quiz data', quizData)
            console.log('card1', quizData[cardNumber])
            console.log('quiz data slug', quizData[cardNumber].japanese.map(x => x.reading))
            console.log('card num', cardNumber)
            console.log('num of slugs', slugCount)
            console.log(skeleton)
            console.log('correct cards', correctCards)
            console.log('incorrect cards', incorrectCards)
            console.log('incomplete cards', incompleteCards)
        }
    }, [quizData, skeleton])

    const [prevSkeleton, setPrevSkeleton] = useState({})
    const [prevN, setPrevN] = useState('')
    const [prevT, setPrevT] = useState('')
    const [prevCN, setPrevCN] = useState(0)

    async function startContinuedQuiz(nAlignment: string, tAlignment: string) {
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
        }
    }

    async function continueQuiz() {
        setNAlignment(prevN)
        setTalignment(prevT)
        await startQuiz(String(prevN), String(prevT))
        setCardNumber(Number(prevCN))
        updateSkeleton(prevSkeleton)
    }

    useEffect(() => {
        if (localStorage.getItem('localSkeleton')) {
            setPrevSkeleton(Object.fromEntries(JSON.parse(localStorage.getItem('localSkeleton'))))
            setPrevN(JSON.parse(localStorage.getItem('quizState'))[0])
            setPrevT(JSON.parse(localStorage.getItem('quizState'))[1])
            setPrevCN(JSON.parse(localStorage.getItem('quizState'))[2])
        }
    }, [])

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>

                <Box sx={{ display: 'flex', width: '20%', height: '100%' }}></Box>

                <Box sx={{ display: 'flex', width: '60%', height: '100%', flexDirection: 'column' }}>

                    <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '20px', width: '100%', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>

                        <Collapse in={quizOn}>

                            <Box>
                                <Button startIcon={<Quiz />} onClick={() => showQuizProgress(true)} variant="outlined" color="info">
                                    <Typography variant="body1"> カード {cardNumber + 1} / {slugCount} </Typography>
                                </Button>
                                <Dialog
                                    open={quizProgress}
                                    onClose={() => showQuizProgress(false)}
                                >
                                    <DialogTitle>
                                        Quiz Progress
                                    </DialogTitle>
                                    <DialogContent>
                                        <Box>
                                            <Box>
                                                <ToggleButtonGroup
                                                    color="primary"
                                                    value={progAlignment}
                                                    exclusive
                                                    onChange={handleProgAlignment}>
                                                    <ToggleButton value='Correct'>Correct</ToggleButton>
                                                    <ToggleButton value='Incorrect'>Incorrect</ToggleButton>
                                                    <ToggleButton value='Unmarked'>Unmarked</ToggleButton>
                                                </ToggleButtonGroup>
                                            </Box>
                                            {progressTable(progAlignment)}
                                        </Box>
                                    </DialogContent>
                                </Dialog>

                            </Box>

                        </Collapse>

                        <Box>
                            <ToggleButtonGroup
                                disabled={quizOn}
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
                                disabled={quizOn}
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
                            {quizOn ?
                                <Button onClick={() => setQuizStopDialogue(true)} color="secondary" variant="contained">中止</Button>
                                :
                                <Button onClick={() => startQuiz(nAlignment, tAlignment)} color="primary" variant="contained">スタート</Button>
                            }
                            <Dialog
                                open={quizStopDialogue}
                                onClose={() => setQuizStopDialogue(false)}>
                                <DialogTitle>
                                    Are you sure you want to end this quiz session?
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Your progress will not be saved if you choose to proceed.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setQuizStopDialogue(false)}>
                                        Go Back
                                    </Button>
                                    <Button onClick={handleQuizEnd}>
                                        End Quiz
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>

                        <Collapse in={quizOn}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                <Box>
                                    <Button startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={skeleton[cardNumber] === 'correct' ? 'contained' : 'outlined'} color="success">
                                        <Typography variant="body1"> {correctCount} </Typography>
                                    </Button>
                                </Box>
                                <Box>
                                    <Button startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={skeleton[cardNumber] === 'incorrect' ? 'contained' : 'outlined'} color="error">
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
                                                        <React.Fragment key={`sense-${index}`}>
                                                            {y.parts_of_speech.map((part, index) => (
                                                                <Typography key={`part-${index}`}>{part}</Typography>
                                                            ))}

                                                            <Typography key={`engdef-${index}`}>
                                                                {y.english_definitions.join(", ")}
                                                            </Typography>
                                                        </React.Fragment>
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

                                            <Button
                                                disabled={!cardDetails}
                                                variant="contained"
                                                color="success"
                                                startIcon={<Check />}
                                                onClick={() => updateOutcome(cardNumber, 'correct')}
                                            >
                                                正解
                                            </Button>
                                            <Button disabled={!cardDetails} variant="contained" color="error" startIcon={<Clear />} onClick={() => updateOutcome(cardNumber, 'incorrect')}>
                                                不正解
                                            </Button>
                                        </Box>
                                    </CardContent>
                                    <Dialog
                                        open={quizResultDialog}
                                        onClose={() => setQuizResultDialog(false)}
                                    >
                                        <DialogTitle>
                                            Quiz Complete!
                                        </DialogTitle>
                                        <DialogContent>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 'bold' }}>Quiz Type: {tAlignment}</Typography>
                                                    <Typography sx={{ fontWeight: 'bold' }}> JLPT Level: {nAlignment.toUpperCase()}</Typography>
                                                    <Typography sx={{ fontWeight: 'bold' }}>Score: {Math.round((correctCount / slugCount) * 100)}%</Typography>
                                                </Box>
                                                <Box sx={{ marginTop: '15px' }}>
                                                    <Typography>
                                                        Would you like to save this quiz result?
                                                    </Typography>
                                                    <Typography>
                                                        Upon save, a breakdown will be made available on your review page.
                                                    </Typography>
                                                    <Typography>
                                                        Only the last quiz you've completed will be available for review.
                                                    </Typography>
                                                    <Typography>
                                                        Users that have logged in can save their quiz result statistics.
                                                    </Typography>
                                                </Box>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => doNotSaveQuizResult()}>
                                                Go Back
                                            </Button>
                                            <Button onClick={() => saveQuizResult()}>
                                                Save Result
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Card>
                                :
                                <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CardContent>
                                        {
                                            cardLoading ?
                                                <CircularProgress /> :
                                                prevN !== '' ?
                                                    <Box>
                                                        <Stack spacing={2} direction='row'>
                                                            <Button sx={{fontWeight: 'bold'}} variant="contained" onClick={() => continueQuiz()}>クイズ続く</Button>
                                                            <Button sx={{fontWeight: 'bold'}}  variant="contained" color="secondary" onClick={() => setQuizStopDialogue(true)}>クイズ停止する</Button>
                                                        </Stack>
                                                    </Box>
                                                    :
                                                    <Typography>Press Start!</Typography>
                                        }
                                    </CardContent>
                                </Card>
                        }
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', width: '20%', height: '100%' }}></Box>
            </Box >
        </>
    )
}

export default MyComponent