"use client"
import { Alert, Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Cancel, CancelOutlined, Check, Clear, DoneOutline, InfoOutline, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Quiz, Visibility } from '@mui/icons-material';
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

const NewQuizMaster = () => {

    const MobileLayout = () => {

        // getting user session if it exists
        const { data: session, status } = useSession()
        const userid = session?.user?.userId

        const fileCount = {
            'n1': 172,
            'n2': 91,
            'n3': 89,
            'n4': 29,
            'n5': 2,
        }

        const slugCount = {
            'n1': 3440,
            'n2': 1802,
            'n3': 1778,
            'n4': 577,
            'n5': 40,
        }

        const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']

        const quizMin = 10

        ///////////////////////////////////////// STATES ///////////////////////////////////////////////

        const [nLevel, setNLevel] = useState('n5')
        const [quizType, setQuizType] = useState('all')
        const [randomQuiz, setRandomQuiz] = useState(false)
        const [customCardCount, setCustomCardCount] = useState('10')

        // state to toggle quiz toolbar on/off
        const [cardToolbar, toggleCardToolbar] = useState(false)

        // state to toggle quiz on/off
        const [quizOn, toggleQuizOn] = useState(false)

        // state for loading
        const [loading, setLoading] = useState(false)

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
            isNaN(Number(customCardCount)) ||
            (customCardCount != '' && Number(customCardCount) < quizMin)
            || (customCardCount != '' && Number(customCardCount) > Number(slugCount[nLevel])) ||
            customCardCount.length > 0 && customCardCount.trim() === ''
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
        const [saveToVT, toggleSaveToVT] = useState()
        const [saveToDB, toggleSaveToDB] = useState()


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
        const runQuiz = async (nLevel, quizType, randomQuiz, customCardCount) => {

            setProgTableButton('blank')

            const allPages = []

            for (let index = 1; index <= fileCount[nLevel]; index++) {
                const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}_v1.json`)).json()
                allPages.push(data)
            }
            const flatPages = allPages.flatMap(x => x)
            console.log('first flat pages', flatPages)

            if (randomQuiz) {
                shuffle(flatPages)
            }

            if (quizType === 'all') {

                try {
                    if (customCardCount === '') {
                        setQuizData(flatPages)
                        setSlugArray(flatPages.map(x => x.slug))
                    }

                    else {
                        const slicedQuizData = flatPages.slice(0, customCardCount)
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

                    // if unknown is less than min and custom field blank, get enough filler cards to reach 30
                    if (unknownQuizData.length < quizMin) {
                        if (customCardCount === '') {
                            const fillerCardCount = quizMin - unknownQuizData.length
                            shuffle(flatPages) // shuffle the cards
                            const unknownSlugs = unknownQuizData.map(x => x.slug)
                            const fillerCards = flatPages.filter(x => !unknownSlugs.includes(x.slug)).slice(0, fillerCardCount)
                            const safeQuizData = unknownQuizData.concat(fillerCards)
                            setQuizData(safeQuizData)
                            setSlugArray(safeQuizData.map(x => x.slug))

                        }

                        // if unknown is less than min and custom field exists, get enough filler cards to reach custom number
                        else {
                            const fillerCardCount = customCardCount - unknownQuizData.length
                            shuffle(flatPages) // shuffle the cards
                            const unknownSlugs = unknownQuizData.map(x => x.slug)
                            const fillerCards = flatPages.filter(x => !unknownSlugs.includes(x => x.slug)).slice(0, fillerCardCount)
                            const safeQuizData = unknownQuizData.concat(fillerCards)
                            setQuizData(safeQuizData)
                            setSlugArray(safeQuizData.map(x => x.slug))
                        }
                    }

                    // if unknown is more than min and custom field exists, simply slice
                    else if (unknownQuizData.length >= quizMin && customCardCount != '') {
                        const slicedUnknownQuizData = unknownQuizData.slice(0, customCardCount)
                        setQuizData(slicedUnknownQuizData)
                        setSlugArray(slicedUnknownQuizData.map(x => x.slug))
                    }

                    // if unknown is more than min and custom field is blank, just give all unknown
                    else if (unknownQuizData.length >= quizMin && customCardCount === '') {
                        setQuizData(unknownQuizData)
                        setSlugArray(unknownQuizData.map(x => x.slug))
                    }

                }

                catch (err) { console.log(err) }
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
            setCardNumber(0)
            toggleQuizOn(false)
            toggleCardToolbar(false)
            openStopSelect(false)
            toggleShowCard(false)
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

        // function to retrieve all word ids within user's vocab db
        const getUserVocab = async () => {

            if (session) {
                const response = await fetch('/api/GetUserVocab', {
                    method: 'GET',
                })

                const data = await response.json()
                console.log('heres our resp', data)

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
                    console.log('user word ids', knownWordIds)
                    console.log('userdata pulled', knownWordIds)
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
                    console.log('setting ls pullfromdb to true...')
                    localStorage.setItem('pullFromDb', "true")
                    const updatedUKWI = userKnownWordIds.filter(x => !toBeIncorrectWordIds.includes(x)).concat(toBeCorrectWordIds)
                    console.log('updatedUKWI', updatedUKWI)
                    setUserKnownWordIds(updatedUKWI)
                }
            }

            if (saveToDB) {}
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
            }
        }, [quizData])


        ///////////////////////////////////////// DIALOGS ///////////////////////////////////////////////


        const NLevelDialog = () => (
            <Dialog open={nLevelSelect} onClose={() => openNLevelSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    JLPTレベルを選んでください
                </DialogTitle>
                <List sx={{ pt: 0 }}>
                    {nLevelArray.map(x => (
                        <ListItem key={x}>
                            <ListItemButton onClick={() => {
                                if (nLevel != x) {
                                    setNLevel(x)
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
                        Your progress will be saved. You will be able to resume at anytime, from any device.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openPauseSelect(false)}>Cancel</Button>
                    <Button>Save Progress</Button>
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

            <Container maxWidth='xl' sx={{ minHeight: 'calc(100vh - 56px)' }}>

                <NLevelDialog />
                <PauseDialog />
                <StopDialog />

                <Dialog sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={settingsDialog} onClose={() => toggleSettingsDialog(false)}>
                    <DialogTitle sx={{ textAlign: 'center', maxWidth: 340 }} variant='subtitle1'>
                        Quiz Settings
                    </DialogTitle>
                    <DialogContent sx={{ maxWidth: 340 }}>
                        <Card sx={{ minHeight: 460, minWidth: 285 }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                <ToggleButtonGroup disabled={quizOn} color='error' exclusive onChange={(someEvent, newN) => (newN) != null ? setNLevel(newN) : null} value={nLevel} size='small' sx={{ mt: 2 }}>
                                    <ToggleButton value='n1'>N1</ToggleButton>
                                    <ToggleButton value='n2'>N2</ToggleButton>
                                    <ToggleButton value='n3'>N3</ToggleButton>
                                    <ToggleButton value='n4'>N4</ToggleButton>
                                    <ToggleButton value='n5'>N5</ToggleButton>
                                </ToggleButtonGroup>

                                <ToggleButtonGroup disabled={quizOn} color='error' onChange={(event, newA) => (newA) != null ? setQuizType(newA) : null} exclusive value={quizType} size='small' sx={{ mt: 2 }}>
                                    <ToggleButton onClick={() => setCustomCardCount('')} value='all'>All</ToggleButton>
                                    <ToggleButton value='unknown'>Unknown</ToggleButton>
                                </ToggleButtonGroup>

                                <Divider sx={{ mt: 2, width: '80%' }} />

                                <Box sx={{ pl: 2, mt: 2 }}>
                                    <FormControlLabel control={<Switch disabled={quizOn} checked={randomQuiz} size='small' color='error' onChange={() => setRandomQuiz(prev => !prev)} />} label="Randomise card order" />
                                </Box>

                                <Box sx={{ minWidth: '100%', mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <TextField
                                        sx={{ minWidth: '100%' }}
                                        autoFocus
                                        error={isNaN(Number(customCardCount)) || (customCardCount != '' && Number(customCardCount) < quizMin) || (customCardCount != '' && Number(customCardCount) > Number(slugCount[nLevel]))}
                                        label="Number of Cards"
                                        disabled={quizOn}
                                        size="small"
                                        variant="outlined"
                                        value={customCardCount}
                                        onChange={(e) => setCustomCardCount(e.target.value)}
                                        helperText={
                                            isNaN(Number(customCardCount)) ? "Please enter a valid number." :
                                                customCardCount.length > 0 && customCardCount.trim() === '' ? "Please enter a valid number." :
                                                    (customCardCount.trim() != '' && Number(customCardCount) < quizMin) ? "A quiz must hold at least 30 cards." :
                                                        (customCardCount != '' && Number(customCardCount) > Number(slugCount[nLevel])) ? `Exceeds ${nLevel.toUpperCase()} max card count (${slugCount[nLevel]}).` :
                                                            null
                                        }
                                    />
                                </Box>

                                <Alert color='error' icon={false} sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }} severity='info'>{quizMin} card minimum. If left blank, all available cards will be tested.</Alert>

                                {
                                    (quizType) === 'all' && (randomQuiz) ?
                                        <Alert
                                            color='error'
                                            variant='filled'
                                            sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }}
                                            severity='info'
                                            icon={false}>
                                            Quiz on {nLevel.toUpperCase()} cards, cards arranged randomly.
                                        </Alert>
                                        :
                                        (quizType) === 'all' && (!randomQuiz) ?
                                            <Alert
                                                color='error'
                                                variant='filled'
                                                sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }}
                                                severity='info'
                                                icon={false}>
                                                Quiz on {nLevel.toUpperCase()} cards, cards arranged in default order.
                                            </Alert>
                                            :
                                            (quizType) === 'unknown' && (randomQuiz) ?
                                                <Alert
                                                    color='error'
                                                    variant='filled'
                                                    sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }}
                                                    severity='info'
                                                    icon={false}>
                                                    Quiz on {nLevel.toUpperCase()} cards that have yet to be ticked in your vocabulary table, cards arranged randomly.
                                                </Alert>
                                                :
                                                <Alert
                                                    color='error'
                                                    variant='filled'
                                                    sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }}
                                                    severity='info'
                                                    icon={false}>
                                                    Quiz on {nLevel.toUpperCase()} cards that have yet to be ticked in your vocabulary table, cards arranged in default order.
                                                </Alert>
                                }
                            </CardContent>
                        </Card>
                    </DialogContent>
                    <DialogActions>
                        <Button size='small' onClick={() => { (!inputError) && toggleSettingsDialog(false) }}>Save Changes</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={introDialog}>
                    <DialogTitle sx={{ fontSize: '1.25rem', textAlign: 'center', mb: 1 }}>
                        文字語彙データの使い方
                    </DialogTitle>
                    <DialogContent>
                        <Box>
                            <Box>
                                <Alert severity='error' sx={{ mb: 2 }}>
                                    ロッグインしてない方は機能を利用できません
                                </Alert>
                                <Alert severity='success' sx={{ mb: 2 }}>
                                    単語を知るとチェックを入力してください、ロッグインするとデータを保存できます
                                </Alert>
                            </Box>
                            <Box>
                                <Card>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>Nレベルの選択</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>表示件数</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>詳細を展開</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>詳細を隠す</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>ページ全チェック</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>ページ全解除</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>ページや単語を検索</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                            <SettingsIcon /><Typography sx={{ fontSize: '0.95rem' }}>レベル全解除</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Checkbox onClick={() => changeCheckbox(introCheckbox)} checked={introCheckbox} />
                            <Typography variant='subtitle1'>起動時に表示しない</Typography>
                        </Box>
                        <Button
                            onClick={() => { toggleIntroDialog(false) }}
                            sx={{ fontWeight: 'bold' }}>
                            閉じる
                        </Button>
                    </DialogActions>
                </Dialog>

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

                {(quizOn) &&
                    <Dialog open={quizEndDialog}>
                        <DialogTitle sx={{ textAlign: 'center' }}>
                            Quiz Complete
                        </DialogTitle>
                        <DialogContent sx={{ minWidth: 300 }}>
                            <Card>
                                <CardContent>
                                    {(progData.toBeChecked.length === 1) &&
                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center' }} >
                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeChecked')}>
                                                {progData.toBeChecked.length} card
                                            </Link>
                                            {''} was marked as correct, but not marked as known within your vocabulary table.
                                        </Typography>}
                                    {(progData.toBeChecked.length > 1) &&
                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center' }} >
                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeChecked')}>
                                                {progData.toBeChecked.length} cards
                                            </Link>
                                            {''} were marked as correct, but not marked as known within your vocabulary table.
                                        </Typography>}

                                    {(progData.toBeUnchecked.length === 1) &&
                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center' }} >
                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeUnchecked')}>
                                                {progData.toBeUnchecked.length} card
                                            </Link>
                                            {''} was marked as incorrect, yet marked as known within your vocabulary table.
                                        </Typography>}
                                    {(progData.toBeUnchecked.length > 1) &&
                                        <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center' }} >
                                            <Link sx={{ ":hover": { cursor: 'pointer' } }} onClick={() => handleLinkClick('toBeUnchecked')}>{progData.toBeUnchecked.length} cards</Link>
                                            {''} were marked as incorrect, yet marked as known within your vocabulary table.
                                        </Typography>}

                                    {(progData.toBeChecked.length != 0 || progData.toBeUnchecked.length != 0) &&
                                        <React.Fragment>
                                            <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center' }}>
                                                Would you like the quiz results to be reflected in your vocabulary table?
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                                <Chip size='small' component={Button} label="Yes" color="success" onClick={() => toggleSaveToVT(true)} variant={saveToVT === true ? 'filled' : 'outlined'} />
                                                <Chip size='small' component={Button} label="No" color="error" onClick={() => toggleSaveToVT(false)} variant={saveToVT === false ? 'filled' : 'outlined'} />
                                            </Stack>
                                        </React.Fragment>
                                    }
                                    <Typography gutterBottom variant='subtitle2' sx={{ textAlign: 'center', mt: 2 }}>
                                        Would you like to save your quiz result?
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                                        <Chip size='small' component={Button} label="Yes" color="success" onClick={() => toggleSaveToDB(true)} variant={saveToDB === true ? 'filled' : 'outlined'} />
                                        <Chip size='small' component={Button} label="No" color="error" onClick={() => toggleSaveToDB(false)} variant={saveToDB === false ? 'filled' : 'outlined'} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => toggleQuizEndDialog(false)}>Close</Button>
                            <Button onClick={() => {
                                toggleQuizEndDialog(false)
                                updateDb()
                            }}>Confirm</Button>
                        </DialogActions>
                    </Dialog>}

                <Card sx={{ mt: 3, mb: 6 }}>

                    {/* for controls */}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <Box sx={{ pt: 1 }}>

                            <ToggleButtonGroup size='small'>

                                <ToggleButton onClick={() => toggleIntroDialog(true)} sx={{ borderColor: '#d32f2f' }}>
                                    <InfoOutline color='error' />
                                </ToggleButton>

                                <ToggleButton onClick={(!quizOn) ? () => { openNLevelSelect(true) } : null} sx={{ borderColor: '#d32f2f' }}>
                                    {
                                        (nLevel) === 'n1' ? <LooksOne color={(!quizOn) ? 'error' : ''} /> :
                                            (nLevel) === 'n2' ? <LooksTwo color={(!quizOn) ? 'error' : ''} /> :
                                                (nLevel) === 'n3' ? <Looks3 color={(!quizOn) ? 'error' : ''} /> :
                                                    (nLevel) === 'n4' ? <Looks4 color={(!quizOn) ? 'error' : ''} /> :
                                                        (nLevel) === 'n5' ? <Looks5 color={(!quizOn) ? 'error' : ''} /> :
                                                            null

                                    }
                                </ToggleButton>

                                <ToggleButton onClick={() => toggleSettingsDialog(true)} size='small' sx={{ borderColor: '#d32f2f' }}>
                                    <SettingsIcon color={'error'} />
                                </ToggleButton>


                                <ToggleButton onClick={() => {
                                    if (quizOn) {
                                        openPauseSelect(true)
                                    } else {
                                        if (!inputError) {
                                            toggleCardToolbar(true)
                                            setLoading(true)
                                            runQuiz(nLevel, quizType, randomQuiz, customCardCount)
                                        }

                                    }
                                }} variant='contained' size='small' sx={{ borderColor: '#d32f2f' }}>
                                    {(quizOn) ? <PauseIcon color='error' /> : <PlayArrowIcon color='error' />}
                                </ToggleButton>

                                <ToggleButton onClick={(quizOn) ? () => openStopSelect(true) : null} variant='contained' size='small' sx={{ borderColor: '#d32f2f' }}>
                                    <StopIcon color={(quizOn) ? 'error' : ''} />
                                </ToggleButton>

                                {progData['blank'].length === 0 && quizOn ?
                                    <ToggleButton onClick={() => toggleQuizEndDialog(true)} variant='contained' size='small' sx={{ borderColor: '#d32f2f' }}>
                                        <SportsScoreIcon color='error' />
                                    </ToggleButton>
                                    : null
                                }

                            </ToggleButtonGroup>
                        </Box>

                        <Collapse sx={{ mt: 2 }} in={inputError}>
                            <Alert severity='error'>Error in quiz settings</Alert>
                        </Collapse>

                        <Collapse in={cardToolbar} orientation='vertical'>


                            <Stack sx={{ mt: (quizOn) ? 2 : 0 }} spacing={2}>

                                <Collapse in={quizOn}>
                                    {(quizOn) &&
                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>

                                            <Button onClick={() => toggleQuizProgressDialog(true)} size='small' startIcon={<Quiz />} variant="outlined" color="info">
                                                <Typography variant="body1">{`${cardNumber + 1} / ${quizData.length}`}</Typography>
                                            </Button>

                                            <Button size='small' startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={quizData[cardNumber].result === true ? 'contained' : 'outlined'} color="success">
                                                <Typography variant="body1">{quizData.filter(x => x.result === true).length}</Typography>
                                            </Button>

                                            <Button size='small' startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={quizData[cardNumber].result === false ? 'contained' : 'outlined'} color="error">
                                                <Typography variant="body1">{quizData.filter(x => x.result === false).length}</Typography>
                                            </Button>
                                        </Box>}
                                </Collapse>


                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>

                                    <Button
                                        size='small'
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<ArrowLeft />}
                                        onClick={() => changeCard('back')}

                                    >
                                        前
                                    </Button>

                                    <Button disabled={showCard} size='small' onClick={() => toggleShowCard(true)} variant="contained" color="primary">
                                        <Typography><Visibility /> 表示</Typography>
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

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Button
                                        onClick={() => detCardResult(cardNumber, true)}
                                        disabled={!showCard}
                                        size='small'
                                        variant="contained"
                                        color="success"
                                        startIcon={<Check />}
                                    >
                                        正解
                                    </Button>
                                    <Button
                                        onClick={() => detCardResult(cardNumber, false)}
                                        disabled={!showCard}
                                        size='small'
                                        variant="contained"
                                        color="error"
                                        startIcon={<Clear />}
                                    >
                                        不正解
                                    </Button>
                                </Box>

                            </Stack>

                            {(loading) ?
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 3 }}>
                                    <CircularProgress />
                                </Box> : null}



                        </Collapse>

                    </CardContent>

                    {(quizOn) &&

                        <CardContent sx={{ paddingTop: 0 }}>

                            <Box>
                                <Typography sx={{ textAlign: 'center' }} variant='h4'>
                                    {quizData[cardNumber].slug}
                                </Typography>
                            </Box>

                            <Collapse timeout={{ enter: 250, exit: 10 }} in={(showCard)}>

                                <Box sx={{ py: 1 }}>

                                    {[...new Set(quizData[cardNumber].japanese.map(y => y.word))].map((z, zindex) => (
                                        <Typography key={zindex} sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{z}</Typography>
                                    ))}

                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: 'bold' }}>Reading</Typography>

                                    {[...new Set(quizData[cardNumber].japanese.map((x => x.reading)))].map(b => (
                                        <Typography key={b} sx={{ fontWeight: 'bold' }}>{b}</Typography>
                                    ))}

                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: 'bold' }}>Meaning</Typography>

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
                            </Collapse>
                        </CardContent>
                    }
                </Card>
            </Container>
        )
    }

    return (
        <MobileLayout />


    )

}


export default NewQuizMaster