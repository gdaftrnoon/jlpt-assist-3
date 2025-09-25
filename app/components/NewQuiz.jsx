"use client"
import { Alert, Box, Button, Card, CardActions, CardContent, CardHeader, Checkbox, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Cancel, CancelOutlined, Check, CheckCircle, CheckCircleOutline, Clear, Done, DoneOutline, InfoOutline, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Quiz, Visibility } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import Link from '@mui/material/Link';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { redirect } from 'next/navigation'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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

const NewQuizMaster = () => {

    const MobileLayout = () => {

        const thema = useTheme();
        const matches = useMediaQuery(thema.breakpoints.up('md'));

        // getting user session if it exists
        const { data: session, status } = useSession()
        const userid = session?.user?.userId

        // paused quiz metadata
        const [dbQuizMeta, setDbQuizMeta] = useState({})

        const fileCount = {
            'n1': 172,
            'n2': 91,
            'n3': 89,
            'n4': 29,
            'n5': 33,
        }

        const slugCount = {
            'n1': 3440,
            'n2': 1802,
            'n3': 1778,
            'n4': 577,
            'n5': 40,
        }

        const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']

        const quizMin = 20
        const quizMax = 100

        ///////////////////////////////////////// STATES ///////////////////////////////////////////////

        const [nLevel, setNLevel] = useState('n1')
        const [quizType, setQuizType] = useState('all')
        const [randomQuiz, setRandomQuiz] = useState(false)
        const [customCardCount, setCustomCardCount] = useState('20')

        // state to toggle quiz on/off
        const [quizOn, toggleQuizOn] = useState(false)

        // state for loading
        const [loading, setLoading] = useState(false)
        const [saveLoading, setSaveLoading] = useState(false)
        const [saveComplete, setSaveComplete] = useState(false)

        // states for dialogs
        const [nLevelSelect, openNLevelSelect] = useState(false)
        const [pauseSelect, openPauseSelect] = useState(false)
        const [stopSelect, openStopSelect] = useState(false)
        const [introDialog, toggleIntroDialog] = useState(false)
        const [settingsDialog, toggleSettingsDialog] = useState(false)
        const [quizProgressDialog, toggleQuizProgressDialog] = useState(false)
        const [quizEndDialog, toggleQuizEndDialog] = useState(false)

        // states to control card, custom field collapse
        const [showCard, toggleShowCard] = useState(false)

        // state to hold quiz data
        const [quizData, setQuizData] = useState([])

        // state to manage card number
        const [cardNumber, setCardNumber] = useState(0)

        // don't show again intro checkbox
        const [introCheckbox, setIntroCheckbox] = useState(false)

        // state to hold user's known word ids
        const [userKnownWordIds, setUserKnownWordIds] = useState([])

        // true if the custom input is an error
        const inputError = (
            customCardCount === '' ||
            isNaN(Number(customCardCount)) || // not a number
            (Number(customCardCount) < quizMin) || // under min
            (Number(customCardCount) > quizMax) || // over max 
            (customCardCount.length > 0 && customCardCount.trim() === '') // whitespaces
        )

        // orignal pre slice
        const [orgProgData, setOrgProgData] = useState({
            blank: [],
            correct: [],
            incorrect: [],
            toBeChecked: [],
            toBeUnchecked: []
        })

        // post slice
        const [progData, setProgData] = useState({
            blank: [],
            correct: [],
            incorrect: [],
            toBeChecked: [],
            toBeUnchecked: []
        })

        // page control for progress table
        const [page, setPage] = useState(0)

        // active button in progress table toggle button group
        const [progTableButton, setProgTableButton] = useState('blank')

        // just an array holding each slug in the quiz
        const [slugArray, setSlugArray] = useState([])

        // state to hold the quiz unique id
        const [quizID, setQuizID] = useState('')

        // states for post quiz options
        const [saveToVT, toggleSaveToVT] = useState(true)
        const [saveToDB, toggleSaveToDB] = useState(true)

        // flagging end of quiz
        const [quizOver, setQuizOver] = useState(false)

        // page slider
        const [value, setValue] = React.useState([1])
        const [sliderCollapse, setSliderCollapse] = useState(true)

        // snackbar for when we add filler cards
        const [snackOpen, setSnackOpen] = useState(false)
        const [snackMsg, setSnackMsg] = useState('')

        ///////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////

        function shuffle(array) {
            let currentIndex = array.length;

            // While there remain elements to shuffle...
            while (currentIndex != 0) {

                // Pick a remaining element...
                let randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }
        }


        // function to fetch and return ALL cards for a selected N level, and set quiz data
        const runQuiz = async (nLevel, quizType, randomQuiz, customCardCount, value) => {

            setProgTableButton('blank')

            const allPages = []

            // if it's "all", the start from the value of the slider, else start from 1
            for (let index = (quizType === 'all' ? value : 1); index <= fileCount[nLevel]; index++) {
                const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}_v1.json`)).json()
                allPages.push(data)
            }
            const flatPages = allPages.flatMap(x => x)

            if (randomQuiz) {
                shuffle(flatPages)
            }

            if (quizType === 'all') {

                try {

                    const slicedQuizData = flatPages.slice(0, customCardCount)

                    // in the case that the user chose a page 99 for example, and there were only 10 words left, but they wanted 100 cards
                    if (slicedQuizData.length < customCardCount) {

                        // get the slugs for all words on page 99 and 100 for example
                        const quizSlugs = slicedQuizData.map(x => x.slug)

                        // run the page pulling loop again to get data for all cards in the n level, because it was sliced originally according to "value"
                        const allPagesReal = []
                        for (let i = 1; i <= fileCount[nLevel]; i++) {
                            const vData = await (await fetch(`vocab/${nLevel}/${nLevel}_page${i}_v1.json`)).json()
                            allPagesReal.push(vData)
                        }
                        const flatData = allPagesReal.flatMap(x => x)
                        shuffle(flatData)

                        // from the new loop, we want cards that are NOT in pages 99 and 100 for example
                        const fillerCards = flatData.filter(x => !quizSlugs.includes(x.slug))

                        // slice the filler so it fits with the number of cards the user wants
                        const fillerCardsSliced = fillerCards.slice(0, customCardCount - slicedQuizData.length)

                        // combine page 99 + 100 words for example, in addition to the filler words from other pages in the n level
                        const fullQuizData = slicedQuizData.concat(fillerCardsSliced)
                        setQuizData(fullQuizData)
                        setSlugArray(fullQuizData.map(x => x.slug))
                        setSnackMsg(`Insufficient words to fill ${customCardCount} cards, test partially filled with ${fillerCardsSliced.length} random cards`)
                        setSnackOpen(true)
                    }

                    // in the case that there are enough cards left to cover the number of cards the user wants
                    else {
                        setQuizData(slicedQuizData)
                        setSlugArray(slicedQuizData.map(x => x.slug))
                    }
                }

                catch (err) { console.log(err) }

                finally {
                    setQuizID(uuidv4())
                    setLoading(false)
                    toggleQuizOn(true)
                }
            }

            if (quizType === 'unknown') {
                try {

                    const unknownQuizData = flatPages.filter(x => !userKnownWordIds.includes(x.id))

                    // if the number of cards we DON'T KNOW is less than the custom card count, add x number of cards to the quiz
                    if (unknownQuizData.length < customCardCount) {
                        const fillerCardCount = customCardCount - unknownQuizData.length
                        shuffle(flatPages) // shuffle the cards
                        const unknownSlugs = unknownQuizData.map(x => x.slug)
                        const fillerCards = [... new Set(flatPages.filter(x => !unknownSlugs.includes(x => x.slug)).slice(0, fillerCardCount))]
                        const safeQuizData = unknownQuizData.concat(fillerCards)
                        const uniq = [...new Set(safeQuizData)];
                        setQuizData(uniq)
                        setSlugArray(uniq.map(x => x.slug))
                        setSnackMsg(`Insufficient unknown words to fill ${customCardCount} cards, test partially filled with ${fillerCardsSliced.length} random known cards`)
                        setSnackOpen(true)
                    }

                    // if the number of words we DON'T KNOW is more than the custom card count, there is no need to add any filler cards
                    else {
                        const slicedUnknownQuizData = unknownQuizData.slice(0, customCardCount)
                        setQuizData(slicedUnknownQuizData)
                        setSlugArray(slicedUnknownQuizData.map(x => x.slug))
                    }
                }

                catch (err) { console.log(err) }
                finally {
                    setQuizID(uuidv4())
                    setLoading(false)
                    toggleQuizOn(true)
                }
            }

            if (quizType === 'known') {

                // get the cards that the user knows
                const knownCards = flatPages.filter(x => userKnownWordIds.includes(x.id))

                try {

                    // if for example, user knows 5 cards but chose a quiz of 20, fill the quiz in with 15 unknown cards
                    if (knownCards.length < customCardCount) {
                        shuffle(flatPages)

                        // calculate the number of filler cards we need
                        const fillerCardCount = customCardCount - knownCards.length

                        // make, for example, 15 filler cards, first removing any cards that the user already knows, and slicing
                        const filler = flatPages.filter(x => !userKnownWordIds.includes(x.id)).slice(0, fillerCardCount)

                        // known cards + filler
                        const quizData = knownCards.concat(filler)

                        setQuizData(quizData)
                        setSlugArray(quizData.map(x => x.slug))
                        setSnackMsg(`Insufficient known words to fill ${customCardCount} cards, test partially filled with ${fillerCardCount} random unknown cards`)
                        setSnackOpen(true)
                    }

                    // if there are ENOUGH known cards to fill the users custom request
                    else {
                        const quizData = flatPages.filter(x => userKnownWordIds.includes(x.id)).slice(0, customCardCount)
                        setQuizData(quizData)
                        setSlugArray(quizData.map(x => x.slug))
                    }
                }

                catch (error) {
                    console.log(error)
                }

                finally {
                    setQuizID(uuidv4())
                    setLoading(false)
                    toggleQuizOn(true)
                }
            }
        }

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

        // function to end quiz, resetting quiz states
        const endQuiz = () => {
            toggleSaveToDB(true)
            toggleSaveToVT(true)
            setCardNumber(0)
            toggleQuizOn(false)
            openStopSelect(false)
            toggleShowCard(false)
            setSaveLoading(false)
            setSaveComplete(false)
            setQuizOver(false)
        }

        const detCardResult = (cardNumber, outcome) => {
            const newEntry = { ...quizData[cardNumber], result: outcome }
            const newQuizData = quizData.map((item, i) => i === cardNumber ? newEntry : item)
            setQuizData(newQuizData)
            changeCard('forward')
        }

        // checkbox don't show again
        const changeCheckbox = (introCheckbox) => {
            if (introCheckbox === false) {
                setIntroCheckbox(true)
                localStorage.setItem('qintroCheckbox', true)
            }
            else {
                setIntroCheckbox(false)
                localStorage.setItem('qintroCheckbox', false)
            }
        }

        // function to retrieve all word ids within user's vocab db AND users paused quiz if exists
        const getUserVocab = async () => {

            if (session) {

                // getting user vocab
                const response = await fetch('/api/GetUserVocab', {
                    method: 'GET',
                })

                const data = await response.json()

                // if error, show error message
                if (!response.ok) {
                    alert(data.message)
                    setTimeout(() => {
                        redirect('/')
                    }, 2000)
                }

                if (response.ok && data) {
                    const knownWordIds = data.message.map(a => Number(a.word_id))
                    setUserKnownWordIds(knownWordIds)
                }

                // getting paused quiz metadata
                const paused = await fetch('/api/GetPausedQuiz', {
                    method: 'GET',
                })

                const pausedData = await paused.json()

                if (paused.ok) {
                    const pMeta = pausedData.message[0]
                    setDbQuizMeta(
                        {
                            quiz_id: pMeta.quiz_id,
                            n_level: pMeta.n_level,
                            quiz_type: pMeta.quiz_type,
                            random: pMeta.random,
                            created_at: pMeta.created_at
                        }
                    )
                }
            }
        }

        // change prog table page function
        const changePage = (progTableButton, direction) => {
            const maxPages = Math.ceil(orgProgData[progTableButton].length / 5)

            if (direction === 'back') {
                if (page > 0) {
                    setPage(prev => prev - 1)
                }
            }
            if (direction === 'forward') {
                if (page < maxPages - 1) {
                    setPage(prev => prev + 1)
                }
            }
        }

        // handle prog table toggle button group value change
        const handleProgButtonChange = (event, newButton) => {
            if (newButton !== null) {
                setProgTableButton(newButton)
                setPage(0)
            }
        }

        // clicking a link in the post quiz table
        const handleLinkClick = (button) => {
            toggleQuizEndDialog(false)
            setPage(0)
            setProgTableButton(button)
            toggleQuizProgressDialog(true)
        }

        // saving quiz results + new vocab data to db
        const updateDb = async () => {

            if (saveToVT || saveToDB) {
                setSaveLoading(true)


                try {

                    if (saveToVT) {

                        const initial = {}

                        orgProgData['toBeChecked'].forEach(x => initial[x.slug] = false)
                        orgProgData['toBeUnchecked'].forEach(x => initial[x.slug] = true)

                        const change = {}

                        orgProgData['toBeChecked'].forEach(x => change[x.slug] = true)
                        orgProgData['toBeUnchecked'].forEach(x => change[x.slug] = false)

                        const toBeCorrectWordIds = orgProgData['toBeChecked'].map(x => x.id)
                        const toBeIncorrectWordIds = orgProgData['toBeUnchecked'].map(x => x.id)
                        const wordIds = toBeCorrectWordIds.concat(toBeIncorrectWordIds)

                        const resp = await fetch('/api/SubmitVocabData',
                            {
                                method: 'POST',
                                body: JSON.stringify({ initial: initial, changes: change, ids: wordIds, overrideLengthBar: true })
                            })
                        const result = await resp.json()
                        console.log(result.message)
                        if (result.message === 'No errors') {
                            localStorage.setItem('pullFromDb', "true")
                            const updatedUKWI = userKnownWordIds.filter(x => !toBeIncorrectWordIds.includes(x)).concat(toBeCorrectWordIds)
                            setUserKnownWordIds(updatedUKWI)
                        }
                    }

                    if (saveToDB) {

                        const correctCount = orgProgData['correct'].length
                        const incorrectCount = orgProgData['incorrect'].length

                        const quizSession = {
                            quizID: quizID,
                            nLevel: nLevel,
                            quizType: quizType,
                            random: randomQuiz,
                            correct: correctCount,
                            incorrect: incorrectCount,
                            startFrom: value
                        }

                        const apiResponse = await fetch('/api/SubmitQuizSession',
                            {
                                method: 'POST',
                                body: JSON.stringify(quizSession)
                            })

                        const apiResult = await apiResponse.json()
                        console.log(apiResult.message)

                        const results = quizData.map(x => (
                            { quizID: quizID, wordID: x.id, result: x.result }
                        ))

                        const quizResult = {
                            quizResults: results
                        }

                        const submitQuizResultResponse = await fetch('/api/SubmitQuizResult',
                            {
                                method: 'POST',
                                body: JSON.stringify(quizResult)
                            })

                        const submitQuizResultResult = await submitQuizResultResponse.json()
                        console.log(submitQuizResultResult.message)

                    }
                }

                catch (error) {
                    console.log(error)
                }

                finally {
                    setSaveLoading(false)
                    setSaveComplete(true)
                }
            }
            else {
                endQuiz()
            }
        }

        // send paused quiz data to db
        const pauseQuiz = async () => {

            try {

                // sending paused quiz metadata
                const pausedQuizMetadata = {
                    quizID: quizID,
                    nLevel: nLevel,
                    quizType: quizType,
                    random: randomQuiz,
                }

                const apiResponse = await fetch('/api/PauseQuizMetadata',
                    {
                        method: 'POST',
                        body: JSON.stringify(pausedQuizMetadata)
                    })

                const apiResult = await apiResponse.json()
                console.log(apiResult.message)

                // sending paused quiz word data
                const pausedQuizData = quizData.map(x => (
                    { quizID: quizID, wordID: x.id, result: x.result }
                ))

                const pausedQuizDataPackage = {
                    pausedQuizData: pausedQuizData
                }

                const submitPausedQuizData = await fetch('/api/PauseQuizData',
                    {
                        method: 'POST',
                        body: JSON.stringify(pausedQuizDataPackage)
                    })

                const submitPausedQuizDataResult = await submitPausedQuizData.json()
                console.log(submitPausedQuizDataResult.message)
            }

            catch (error) {
                console.log(error)
            }

            finally {
                endQuiz()
                openPauseSelect(false)
            }
        }

        ///////////////////////////////////////// EFFECTS ///////////////////////////////////////////////


        useEffect(() => {

            const handler = async (event) => {
                if (event.key === 'pullFromDb' && event.newValue === 'true') {
                    await getUserVocab()
                    localStorage.setItem('pullFromDb', "false")
                }
            }
            window.addEventListener("storage", handler)
            return () => window.removeEventListener("storage", handler)
        }, [])

        // use effect for testing
        useEffect(() => {
        }, [quizData, cardNumber])

        // for don't show again
        useEffect(() => {
            if (localStorage.getItem('qintroCheckbox')) { // if ls item exists
                const stored = JSON.parse(localStorage.getItem('qintroCheckbox'))
                setIntroCheckbox(stored) // set check to value 
                toggleIntroDialog(!stored) // if checked -> don't show, if not checked -> show 
            }
            else {
                toggleIntroDialog(true)
            }
        }, [])

        // getting initial vocab ids
        useEffect(() => {

            if (status === 'authenticated') {
                getUserVocab()
            }

        }, [status])

        // altering progdata when quizdata changes
        useEffect(() => {
            const correctCards = quizData.filter(x => x.result === true)
            const incorrectCards = quizData.filter(x => x.result === false)
            const blankCards = quizData.filter(x => x.result === null)

            const toBeChecked = correctCards.filter(x => !userKnownWordIds.includes(x.id))
            const toBeUnchecked = incorrectCards.filter(x => userKnownWordIds.includes(x.id))

            setOrgProgData({
                blank: blankCards,
                correct: correctCards,
                incorrect: incorrectCards,
                toBeChecked: toBeChecked,
                toBeUnchecked, toBeUnchecked
            })

            const blankSliced = blankCards.slice(page * 5, 5 + (page * 5))
            const correctSliced = correctCards.slice(page * 5, 5 + (page * 5))
            const incorrectSliced = incorrectCards.slice(page * 5, 5 + (page * 5))

            const toBeCheckedSliced = correctCards.filter(x => !userKnownWordIds.includes(x.id)).slice(page * 5, 5 + (page * 5))
            const toBeUncheckedSliced = incorrectCards.filter(x => userKnownWordIds.includes(x.id)).slice(page * 5, 5 + (page * 5))

            setProgData({
                blank: blankSliced,
                correct: correctSliced,
                incorrect: incorrectSliced,
                toBeChecked: toBeCheckedSliced,
                toBeUnchecked: toBeUncheckedSliced
            })

        }, [quizData, page])

        // waiting for when quiz is complete, 
        useEffect(() => {
            const results = quizData.map(x => x.result)
            if (!results.some(x => x === null) && quizOn) {
                toggleQuizEndDialog(true)
                setQuizOver(true)
            }
        }, [quizData])

        // ensuring custom card count is between card max and min
        useEffect(() => {
            if (customCardCount > quizMax) {
                setCustomCardCount(quizMax)
            }
        }, [customCardCount])

        // for the slider collapse
        useEffect(() => {
            if (quizType === 'all') {
                setSliderCollapse(true)
            }
            else {
                setSliderCollapse(false)
                setValue(null)
            }
        }, [quizType])


        ///////////////////////////////////////// DIALOGS ///////////////////////////////////////////////


        const NLevelDialog = () => (
            <Dialog open={nLevelSelect} onClose={() => openNLevelSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    Please choose an N-level
                </DialogTitle>
                <List sx={{ pt: 0 }}>
                    {nLevelArray.map(x => (
                        <ListItem key={x}>
                            <ListItemButton onClick={() => {
                                if (nLevel != x) {
                                    setNLevel(x)
                                    setValue(1)
                                    openNLevelSelect(false)
                                }
                                else {
                                    openNLevelSelect(false)
                                }
                            }}>
                                <ListItemText sx={{ textAlign: 'center' }}>
                                    {x.toUpperCase()}
                                </ListItemText>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
        )

        const PauseDialog = () => (
            <Dialog open={pauseSelect} onClose={() => openPauseSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    Would like to pause the quiz?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Pause feature in development.
                        {/* Your progress will be saved. You will be able to resume at anytime, from any device. */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openPauseSelect(false)}>Cancel</Button>
                    <Button disabled onClick={() => pauseQuiz()}>Save Progress</Button>
                </DialogActions>
            </Dialog>
        )

        const StopDialog = () => (
            <Dialog open={stopSelect} onClose={() => openStopSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    Would like to end the quiz?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your progress will be not saved.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openStopSelect(false)}>Go Back</Button>
                    <Button onClick={() => endQuiz()}>End Quiz</Button>
                </DialogActions>
            </Dialog>
        )

        return (

            <Container maxWidth='xl' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

                <NLevelDialog />
                <PauseDialog />
                <StopDialog />

                {/* quiz settings */}
                <Dialog sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={settingsDialog} onClose={() => toggleSettingsDialog(false)}>
                    <DialogContent sx={{ maxWidth: 340 }}>
                        <Card sx={{ minHeight: 370, minWidth: 285 }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 0 }}>

                                <ToggleButtonGroup
                                    disabled={quizOn}
                                    color='error'
                                    exclusive
                                    onChange={
                                        (someEvent, newN) => (newN) != null ? (setNLevel(newN), setValue(1)) : null}
                                    value={nLevel}
                                    size={matches ? 'medium' : 'small'}
                                    sx={{ mt: 2 }}
                                >
                                    <ToggleButton value='n1'>N1</ToggleButton>
                                    <ToggleButton value='n2'>N2</ToggleButton>
                                    <ToggleButton value='n3'>N3</ToggleButton>
                                    <ToggleButton value='n4'>N4</ToggleButton>
                                    <ToggleButton value='n5'>N5</ToggleButton>
                                </ToggleButtonGroup>

                                <ToggleButtonGroup disabled={quizOn} color='error' onChange={(event, newA) => (newA) != null ? setQuizType(newA) : null} exclusive value={quizType} size={matches ? 'medium' : 'small'} sx={{ mt: 2 }}>
                                    <ToggleButton value='all'>All</ToggleButton>
                                    <ToggleButton disabled={!session} value='known'>Known</ToggleButton>
                                    <ToggleButton disabled={!session} value='unknown'>Unknown</ToggleButton>
                                </ToggleButtonGroup>

                                <Collapse sx={{}} in={sliderCollapse}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80%', mt: { md: 6, xs: 4 }, mb: { md: 2, xs: 1 } }}>
                                            <Slider
                                                disabled={quizOn}
                                                size={matches ? 'medium' : 'small'}
                                                value={value}
                                                onChange={(e, newValue) => setValue(newValue)}
                                                valueLabelDisplay="on"
                                                min={1}
                                                max={fileCount[nLevel]}
                                            ></Slider>
                                        </Box>

                                        <Alert sx={{ fontSize: { md: '1rem', xs: '0.85rem' }, textAlign:'center' }} severity='info' icon={false}>
                                            Each page contains about 20 cards. Use the slider to select which page the flashcards should start from.
                                        </Alert>

                                    </Box>

                                </Collapse>

                                <Divider sx={{ mt: 2, width: '80%' }} />

                                <Box sx={{ pl: 2, mt: 2 }}>
                                    <FormControlLabel
                                        control={<Switch disabled={quizOn} checked={randomQuiz} size={matches ? 'medium' : 'small'} color='error' onChange={() => setRandomQuiz(prev => !prev)} />}
                                        label="Randomise card order" />
                                </Box>

                                <Box sx={{ minWidth: '100%', mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <TextField
                                        sx={{ minWidth: '100%' }}
                                        autoFocus
                                        error={
                                            isNaN(Number(customCardCount)) ||
                                            (Number(customCardCount) < quizMin)
                                        }
                                        label="Number of Cards"
                                        disabled={quizOn}
                                        size={matches ? 'medium' : 'small'}
                                        variant="outlined"
                                        value={customCardCount}
                                        onChange={(e) => setCustomCardCount(e.target.value)}
                                        helperText={
                                            isNaN(Number(customCardCount)) ? "Please enter a valid number." :
                                                (customCardCount === '') ? "Please enter a valid number." :
                                                    customCardCount.length > 0 && customCardCount.trim() === '' ? "Please enter a valid number." :
                                                        (Number(customCardCount) < Number(quizMin)) && `A quiz must hold at least ${quizMin} cards.`
                                        }
                                    />
                                </Box>

                                {
                                    (quizType) === 'all' && (randomQuiz) ?
                                        <Alert
                                            color='error'
                                            variant='filled'
                                            sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                            severity='info'
                                            icon={false}>
                                            Quiz on {nLevel.toUpperCase()} cards, from page {value} onwards, arranged randomly.
                                        </Alert>
                                        :
                                        (quizType) === 'all' && (!randomQuiz) ?
                                            <Alert
                                                color='error'
                                                variant='filled'
                                                sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                                severity='info'
                                                icon={false}>
                                                {nLevel.toUpperCase()} cards, from page {value} onwards, arranged in default order.
                                            </Alert>
                                            :
                                            (quizType) === 'unknown' && (randomQuiz) ?
                                                <Alert
                                                    color='error'
                                                    variant='filled'
                                                    sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                                    severity='info'
                                                    icon={false}>
                                                    {nLevel.toUpperCase()} cards that are unmarked in your vocabulary table, arranged randomly.
                                                </Alert>
                                                :
                                                (quizType) === 'unknown' && (!randomQuiz) ?
                                                    <Alert
                                                        color='error'
                                                        variant='filled'
                                                        sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                                        severity='info'
                                                        icon={false}>
                                                        {nLevel.toUpperCase()} cards that are unmarked in your vocabulary table, arranged in default order.
                                                    </Alert>
                                                    :
                                                    (quizType) === 'known' && (!randomQuiz) ?
                                                        <Alert
                                                            color='error'
                                                            variant='filled'
                                                            sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                                            severity='info'
                                                            icon={false}>
                                                            {nLevel.toUpperCase()} cards that are marked in your vocabulary table, arranged in default order.
                                                        </Alert>
                                                        :
                                                        <Alert
                                                            color='error'
                                                            variant='filled'
                                                            sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.85rem', md: '1rem' } }}
                                                            severity='info'
                                                            icon={false}>
                                                            {nLevel.toUpperCase()} cards that are marked in your vocabulary table, arranged in random order.
                                                        </Alert>
                                }
                            </CardContent>
                        </Card>
                    </DialogContent>
                    <DialogActions>
                        <Button size={matches ? 'medium' : 'small'} onClick={() => { (!inputError) && toggleSettingsDialog(false) }}>Save Changes</Button>
                    </DialogActions>
                </Dialog>

                {/* intro dialog */}
                <Dialog open={introDialog} sx={{}}>
                    <DialogTitle sx={{ fontSize: '1.25rem', textAlign: 'center' }}>
                        Vocabulary Test
                    </DialogTitle>
                    <DialogContent sx={{}}>
                        <Box>
                            <Box>
                                <Alert icon={false} severity='info' sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '1rem', md: '1.2rem' } }}>
                                    Set the test configuration before running, a test can hold between 20 and 100 cards. Unauthenticated users have limited access to test functions.
                                </Alert>
                            </Box>
                            <Box>
                                <Card>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <LooksOne /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>N-level selection</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>Test configuration</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <PlayArrowIcon /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>Start test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <StopIcon /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>End test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <PauseIcon /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>Pause test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SportsScoreIcon /><Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>Post-test options</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Checkbox onClick={() => changeCheckbox(introCheckbox)} checked={introCheckbox} />
                            <Typography variant='subtitle1'>Don't show on startup</Typography>
                        </Box>
                        <Button
                            onClick={() => { toggleIntroDialog(false) }}
                            sx={{ fontWeight: 'bold' }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* quiz progres dialog */}
                {(quizOn) &&
                    <Dialog sx={{}} open={quizProgressDialog}>
                        <DialogTitle sx={{ textAlign: 'center' }}>
                            {
                                (progTableButton === 'blank' ? 'Remaining Cards' :
                                    progTableButton === 'correct' ? 'Correct Cards' :
                                        progTableButton === 'incorrect' ? 'Incorrect Cards' :
                                            progTableButton === 'toBeChecked' ? 'Correct Unknown Cards' :
                                                progTableButton === 'toBeUnchecked' ? 'Incorrect Known Cards' :
                                                    null
                                )
                            }
                        </DialogTitle>
                        <DialogContent sx={{ minWidth: 300, minHeight: 440 }}>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ToggleButtonGroup exclusive onChange={handleProgButtonChange} value={progTableButton} sx={{ pb: 2 }} size='small'>
                                    <ToggleButton value='blank'><Quiz /></ToggleButton>
                                    <ToggleButton value='correct'><Check /></ToggleButton>
                                    <ToggleButton value='incorrect'><Cancel /></ToggleButton>
                                    <ToggleButton value='toBeChecked'><AddIcon /></ToggleButton>
                                    <ToggleButton value='toBeUnchecked'><RemoveIcon /></ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            {progData[progTableButton].length === 0 ? <Typography sx={{ textAlign: 'center', mt: 2 }}>No data available</Typography> :
                                <TableContainer sx={{}}>
                                    <Table sx={{}}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: '50%', textAlign: 'center' }}>Card Number</TableCell>
                                                <TableCell sx={{ width: '50%', textAlign: 'center' }}>Word</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {progData[progTableButton]
                                                .map((x, index) => (
                                                    <TableRow sx={{}} key={index}>
                                                        <TableCell sx={{ textAlign: 'center', py: 1.3 }}>
                                                            <Button disableRipple onClick={() => {
                                                                setCardNumber(slugArray.indexOf(x.slug))
                                                                toggleQuizProgressDialog(false)
                                                            }}
                                                                size='small'>
                                                                {slugArray.indexOf(x.slug) + 1}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center', py: 1.3 }}>{x.slug}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                        <TableFooter sx={{ padding: 0 }}>
                                            <TableRow sx={{ padding: 0 }}>
                                                {progData[progTableButton].length < 1 ? null :
                                                    <>
                                                        <TableCell sx={{ padding: 0, textAlign: 'center' }}>
                                                            {`Page ${page + 1}`}
                                                        </TableCell><TableCell sx={{ padding: 0, textAlign: 'center' }}>
                                                            <IconButton onClick={() => changePage(progTableButton, 'back')}><ArrowLeft fontSize='small' /></IconButton>
                                                            <IconButton onClick={() => changePage(progTableButton, 'forward')}><ArrowRight fontSize='small' /></IconButton>
                                                        </TableCell>
                                                    </>
                                                }
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => toggleQuizProgressDialog(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>}

                {/* post quiz dialog */}
                {(quizOn) &&
                    <Dialog open={quizEndDialog} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <DialogContent sx={{ minWidth: 300, pb: 0.3 }}>
                            {(session) ? <Card>
                                <Typography variant='h6' sx={{ textAlign: 'center', mt: 1.5 }}>
                                    Quiz Complete
                                </Typography>
                                {
                                    (saveLoading) ?
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                            <CircularProgress size="30px" sx={{ mb: 1.5 }} />
                                            {(saveToVT) && <Typography variant='subtitle1'>Saving changes</Typography>}
                                            {(saveToDB) && <Typography variant='subtitle1'>Saving results</Typography>}
                                        </CardContent>
                                        :
                                        (saveComplete) ?
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                                                {(saveToVT) &&
                                                    <Button disableRipple disableFocusRipple disableTouchRipple size={matches ? 'medium' : 'small'} variant='text' startIcon={<Done color='success' />}>
                                                        Changes saved
                                                    </Button>
                                                }
                                                {(saveToDB) &&
                                                    <React.Fragment>
                                                        <Button disableRipple disableFocusRipple disableTouchRipple size={matches ? 'medium' : 'small'} variant='text' startIcon={<Done color='success' />}>
                                                            Results saved
                                                        </Button>
                                                        <Typography sx={{ textAlign: 'center' }} variant='subtitle1'>
                                                            <Link disabled sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => redirect('/')}>
                                                                Review feature coming soon
                                                            </Link>
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            </CardContent>
                                            :
                                            <CardContent>

                                                {(progData.toBeChecked.length === 1) &&
                                                    <Alert sx={{ mb: 1 }} icon={false} severity='success'>
                                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }} >
                                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeChecked')}>
                                                                {progData.toBeChecked.length} card
                                                            </Link>
                                                            {''} was marked as correct, but not marked as known within your vocabulary table.
                                                        </Typography>
                                                    </Alert>
                                                }
                                                {(progData.toBeChecked.length > 1) &&
                                                    <Alert sx={{ mb: 1 }} icon={false} severity='success'>
                                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }} >
                                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeChecked')}>
                                                                {progData.toBeChecked.length} cards
                                                            </Link>
                                                            {''} were marked as correct, but not marked as known within your vocabulary table.
                                                        </Typography>
                                                    </Alert>
                                                }

                                                {(progData.toBeUnchecked.length === 1) &&
                                                    <Alert sx={{ mb: 1 }} icon={false} severity='error'>
                                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }} >
                                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeUnchecked')}>
                                                                {progData.toBeUnchecked.length} card
                                                            </Link>
                                                            {''} was marked as incorrect, yet marked as known within your vocabulary table.
                                                        </Typography>
                                                    </Alert>
                                                }
                                                {(progData.toBeUnchecked.length > 1) &&
                                                    <Alert sx={{ mb: 1 }} icon={false} severity='error'>
                                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }} >
                                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeUnchecked')}>{progData.toBeUnchecked.length} cards</Link>
                                                            {''} were marked as incorrect, yet marked as known within your vocabulary table.
                                                        </Typography>
                                                    </Alert>
                                                }

                                                {(progData.toBeChecked.length != 0 || progData.toBeUnchecked.length != 0) &&
                                                    <React.Fragment>
                                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }}>
                                                            Would you like the quiz results to be reflected in your vocabulary table?
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                                            <Chip size={matches ? 'medium' : 'small'} component={Button} label="Yes" color="success" onClick={() => toggleSaveToVT(true)} variant={saveToVT === true ? 'filled' : 'outlined'} />
                                                            <Chip size={matches ? 'medium' : 'small'} component={Button} label="No" color="error" onClick={() => toggleSaveToVT(false)} variant={saveToVT === false ? 'filled' : 'outlined'} />
                                                        </Stack>
                                                    </React.Fragment>
                                                }
                                                <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', mt: 2, fontSize: { md: '1rem' } }}>
                                                    Would you like to save your quiz result?
                                                </Typography>
                                                <Stack direction="row" spacing={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                                    <Chip size={matches ? 'medium' : 'small'} component={Button} label="Yes" color="success" onClick={() => toggleSaveToDB(true)} variant={saveToDB === true ? 'filled' : 'outlined'} />
                                                    <Chip size={matches ? 'medium' : 'small'} component={Button} label="No" color="error" onClick={() => toggleSaveToDB(false)} variant={saveToDB === false ? 'filled' : 'outlined'} />
                                                </Stack>
                                            </CardContent>
                                }
                            </Card> :
                                <Card>
                                    <Typography variant='h6' sx={{ textAlign: 'center', mt: 1.5 }}>
                                        Quiz Complete
                                    </Typography>
                                    <CardContent>
                                        <Alert sx={{ mb: 1 }} icon={false} severity='error'>
                                            <Typography variant='subtitle2' sx={{ textAlign: 'center', fontSize: { md: '1rem' } }} >
                                                Please register or log in to save your quiz results.
                                            </Typography>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button
                                size={matches ? 'large' : 'small'}
                                disabled={saveLoading}
                                onClick={() => {
                                    toggleQuizEndDialog(false);
                                    if (saveComplete) endQuiz();
                                }}>
                                {(saveComplete) ? 'Close & End Quiz' : 'Close'}
                            </Button>

                            {(session) ?
                                <Button
                                    size={matches ? 'large' : 'small'}
                                    disabled={saveLoading || saveComplete}
                                    onClick={() => {
                                        if (session) {
                                            updateDb()
                                        }
                                        else {
                                            endQuiz()
                                        }
                                    }}>
                                    Confirm
                                </Button>
                                :
                                <Button
                                    size={matches ? 'large' : 'small'}
                                    disabled={saveLoading || saveComplete}
                                    onClick={() => {
                                        redirect('/login')
                                    }}>
                                    Login
                                </Button>
                            }

                        </DialogActions>
                    </Dialog>
                }

                {/* quiz body */}
                <Card sx={{ mt: { xs: 3, md: 6 }, mb: 3, width: { xs: '100%', md: '50%' } }}>

                    {/* for quiz controls */}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <Box sx={{ pt: 1 }}>

                            <ToggleButtonGroup size={matches ? 'medium' : 'medium'}>

                                <ToggleButton onClick={() => toggleIntroDialog(true)} sx={{ borderColor: '#d32f2f' }}>
                                    <InfoOutline fontSize={matches ? 'medium' : 'small'} color='error' />
                                </ToggleButton>

                                <ToggleButton onClick={() => openNLevelSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                                    {
                                        (nLevel) === 'n1' ? <LooksOne fontSize={matches ? 'medium' : 'small'} color={(!quizOn) ? 'error' : ''} /> :
                                            (nLevel) === 'n2' ? <LooksTwo fontSize={matches ? 'medium' : 'small'} color={(!quizOn) ? 'error' : ''} /> :
                                                (nLevel) === 'n3' ? <Looks3 fontSize={matches ? 'medium' : 'small'} color={(!quizOn) ? 'error' : ''} /> :
                                                    (nLevel) === 'n4' ? <Looks4 fontSize={matches ? 'medium' : 'small'} color={(!quizOn) ? 'error' : ''} /> :
                                                        (nLevel) === 'n5' ? <Looks5 fontSize={matches ? 'medium' : 'small'} color={(!quizOn) ? 'error' : ''} /> :
                                                            null

                                    }
                                </ToggleButton>

                                <ToggleButton onClick={() => toggleSettingsDialog(true)} size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.4, xs: 1.4 } }}>
                                    <SettingsIcon fontSize={matches ? 'medium' : 'small'} color={'error'} />
                                </ToggleButton>


                                <ToggleButton onClick={() => {
                                    if (quizOver) {
                                        null
                                    }
                                    if (quizOn && !quizOver) {
                                        openPauseSelect(true)
                                    } else {
                                        if (!inputError && !quizOn) {
                                            setLoading(true)
                                            runQuiz(nLevel, quizType, randomQuiz, customCardCount, value)
                                        }

                                    }
                                }} variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                    {(quizOn) ? <PauseIcon
                                        fontSize={matches ? 'medium' : 'small'} color={(quizOver) ? '' : 'error'} /> :
                                        <PlayArrowIcon fontSize={matches ? 'medium' : 'small'} color={(quizOver) ? '' : 'error'} />}
                                </ToggleButton>

                                <ToggleButton onClick={(quizOn) ? () => openStopSelect(true) : null} variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                    <StopIcon fontSize={matches ? 'medium' : 'small'} color={(quizOn) ? 'error' : ''} />
                                </ToggleButton>

                                {progData['blank'].length === 0 && quizOn ?
                                    <ToggleButton onClick={() => toggleQuizEndDialog(true)} variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                        <SportsScoreIcon fontSize={matches ? 'medium' : 'small'} color='error' />
                                    </ToggleButton>
                                    : null
                                }

                            </ToggleButtonGroup>
                        </Box>

                        {/* {
                            (dbQuizMeta.quiz_id) &&
                            <Card sx={{ mt: 3 }}>
                                <CardContent>
                                    <Typography gutterBottom>
                                        Resume Quiz?
                                    </Typography>
                                    <Typography>
                                        You paused a {dbQuizMeta.n_level} quiz on {dbQuizMeta.created_at}, would you like to resume the quiz?
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button>
                                        Resume
                                    </Button>
                                </CardActions>
                            </Card>
                        } */}

                        <Collapse sx={{ mt: (inputError) ? 2 : 0 }} in={inputError}>
                            <Alert sx={{ fontSize: { md: '1.2rem' } }} severity='error'>Error in quiz settings</Alert>
                        </Collapse>

                        <Collapse in={quizOn}>
                            {(quizOn && quizData) &&
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5, pt: 1.5 }}>

                                    <Button onClick={() => toggleQuizProgressDialog(true)} size={matches ? 'large' : 'small'} startIcon={<Quiz />} variant="outlined" color="info">
                                        <Typography variant="body1">{`${cardNumber + 1} / ${quizData.length}`}</Typography>
                                    </Button>

                                    <Button size={matches ? 'large' : 'small'} startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={quizData[cardNumber].result === true ? 'contained' : 'outlined'} color="success">
                                        <Typography variant="body1">{quizData.filter(x => x.result === true).length}</Typography>
                                    </Button>

                                    <Button size={matches ? 'large' : 'small'} startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={quizData[cardNumber].result === false ? 'contained' : 'outlined'} color="error">
                                        <Typography variant="body1">{quizData.filter(x => x.result === false).length}</Typography>
                                    </Button>
                                </Box>
                            }



                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5 }}>

                                <Button
                                    size={matches ? 'large' : 'small'}
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<ArrowLeft />}
                                    onClick={() => changeCard('back')}

                                >
                                    Prev
                                </Button>

                                <Button startIcon={<Visibility />} disabled={showCard} size={matches ? 'large' : 'small'} onClick={() => toggleShowCard(true)} variant="contained" color="primary">
                                    Show
                                </Button>

                                <Button
                                    size={matches ? 'large' : 'small'}
                                    variant="outlined"
                                    color="primary"
                                    endIcon={<ArrowRight />}
                                    onClick={() => changeCard('forward')}

                                >
                                    Next
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Button
                                    onClick={() => detCardResult(cardNumber, true)}
                                    disabled={!showCard}
                                    size={matches ? 'large' : 'small'}
                                    variant="contained"
                                    color="success"
                                    startIcon={<Check />}
                                >
                                    Correct
                                </Button>
                                <Button
                                    onClick={() => detCardResult(cardNumber, false)}
                                    disabled={!showCard}
                                    size={matches ? 'large' : 'small'}
                                    variant="contained"
                                    color="error"
                                    startIcon={<Clear />}
                                >
                                    Incorrect
                                </Button>
                            </Box>
                        </Collapse>

                        {(loading) ?
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 2.5 }}>
                                <CircularProgress />
                            </Box> : null}

                    </CardContent>

                    {(quizOn) &&
                        <CardContent sx={{ paddingTop: 0 }}>

                            <Box>
                                <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                    {quizData[cardNumber].slug}
                                </Typography>
                            </Box>

                            <Collapse timeout={{ enter: 250, exit: 10 }} in={(showCard)}>

                                <Box sx={{ py: 1 }}>

                                    {[...new Set(quizData[cardNumber].japanese.map(y => y.word))].map((z, zindex) => (
                                        <Typography key={zindex} sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', md: '2rem' } }}>{z}</Typography>
                                    ))}

                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Reading</Typography>

                                    {[...new Set(quizData[cardNumber].japanese.map((x => x.reading)))].map(b => (
                                        <Typography key={b} sx={{ fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.2rem' } }}>{b}</Typography>
                                    ))}

                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Meaning</Typography>

                                    <Box sx={{ mb: 1 }}>

                                        {quizData[cardNumber].senses.map((x, senseIndex) => (
                                            x.parts_of_speech != 'Wikipedia definition' && x.parts_of_speech != 'Place' ?
                                                <Box key={senseIndex}>

                                                    {x.parts_of_speech.map((f, posIndex) => (
                                                        <Typography key={posIndex} sx={{ color: 'grey', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                                            {f}
                                                        </Typography>
                                                    ))}

                                                    {x.tags.map((g, tagIndex) => (
                                                        <Typography key={tagIndex} sx={{ color: 'grey', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                                            {g}
                                                        </Typography>
                                                    ))}

                                                    <Typography sx={{ mb: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                                        {x.english_definitions.join(', ')}
                                                    </Typography>
                                                </Box>
                                                : null
                                        ))}
                                    </Box>
                                </Box>
                            </Collapse>
                        </CardContent>
                    }
                </Card>

                {/* quiz info card */}

                {(!quizOn) &&
                    <Card sx={{ width: { xs: '100%', md: '50%' } }}>
                        <Box>
                            <Box>
                                <Alert icon={false} severity='info' sx={{ mb: 0, textAlign: 'center', fontSize: { md: '1.2rem', xs: '1rem' } }}>
                                    Set the test configuration before running, a test can hold between 20 and 100 cards. Unauthenticated users have limited access to test functions.
                                </Alert>
                            </Box>
                            <Box>
                                <Card>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <LooksOne /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>N-level selection</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>Test configuration</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <PlayArrowIcon /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>Start test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <StopIcon /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>End test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <PauseIcon /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>Pause test</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SportsScoreIcon /><Typography sx={{ fontSize: { md: '1.2rem', xs: '1rem' } }}>Post-test options</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </Card>}

                <Snackbar
                    open={snackOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackOpen(false)}
                    message={snackMsg}
                    sx={{ width: '80%' }}
                />
            </Container >
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <MobileLayout />
        </ThemeProvider>
    )

}


export default NewQuizMaster