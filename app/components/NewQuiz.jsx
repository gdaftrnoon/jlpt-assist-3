"use client"
import { Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, FormGroup, IconButton, List, ListItem, ListItemButton, ListItemText, Slide, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { createContext, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Info, InfoOutline, Looks3, Looks4, Looks5, LooksOne, LooksTwo, PersonAddAlt1, Quiz, Visibility } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';

const NewQuizMaster = () => {

    const MobileLayout = () => {

        const fileCount = {
            'n1': 172,
            'n2': 91,
            'n3': 89,
            'n4': 29,
            'n5': 1,
        }

        const slugCount = {
            'n1': 3440,
            'n2': 1802,
            'n3': 1778,
            'n4': 577,
            'n5': 40,
        }

        const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']

        ///////////////////////////////////////// STATES ///////////////////////////////////////////////

        const [nLevel, setNLevel] = useState('n5')
        const [quizType, setQuizType] = useState('all')
        const [randomQuiz, setRandomQuiz] = useState(false)
        const [customCardCount, setCustomCardCount] = useState('')

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
        const [settingsDialog, toggleSettingsDialog] = useState(true)

        // states to control card, custom field collapse
        const [showCard, toggleShowCard] = useState(false)

        // state to hold quiz data
        const [quizData, setQuizData] = useState([])

        // state to manage card number
        const [cardNumber, setCardNumber] = useState(0)

        // don't show again intro checkbox
        const [introCheckbox, setIntroCheckbox] = useState(false)


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

            const allPages = []

            if (quizType === 'all') {

                try {
                    for (let index = 1; index <= fileCount[nLevel]; index++) {
                        const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}.json`)).json()
                        allPages.push(data)
                    }

                    const allPagesFlatMap = allPages.flatMap(x => x)

                    if (randomQuiz) {
                        shuffle(allPagesFlatMap)
                        setQuizData(allPagesFlatMap)
                    }

                    else {
                        setQuizData(allPagesFlatMap)
                    }
                }

                catch (err) {
                    console.log(err)
                }
                finally {
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


        ///////////////////////////////////////// EFFECTS ///////////////////////////////////////////////


        // use effect for testing
        useEffect(() => {
            console.log('flat quiz data', quizData)
        }, [quizData])

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

            <Container>

                <NLevelDialog />
                <PauseDialog />
                <StopDialog />

                <Dialog sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={settingsDialog} onClose={() => toggleSettingsDialog(false)}>
                    <DialogTitle sx={{ textAlign: 'center' }} variant='subtitle1'>
                        Quiz Settings
                    </DialogTitle>
                    <DialogContent>
                        <Card sx={{ minHeight: 460, minWidth: 285 }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                <ToggleButtonGroup color='error' exclusive onChange={(someEvent, newN) => (newN) != null ? setNLevel(newN) : null} value={nLevel} size='small' sx={{ mt: 2 }}>
                                    <ToggleButton value='n1'>N1</ToggleButton>
                                    <ToggleButton value='n2'>N2</ToggleButton>
                                    <ToggleButton value='n3'>N3</ToggleButton>
                                    <ToggleButton value='n4'>N4</ToggleButton>
                                    <ToggleButton value='n5'>N5</ToggleButton>
                                </ToggleButtonGroup>

                                <ToggleButtonGroup color='error' onChange={(event, newA) => (newA) != null ? setQuizType(newA) : null} exclusive value={quizType} size='small' sx={{ mt: 2 }}>
                                    <ToggleButton onClick={() => setCustomCardCount('')} value='all'>All</ToggleButton>
                                    <ToggleButton value='unknown'>Unknown</ToggleButton>
                                </ToggleButtonGroup>

                                <Divider sx={{ mt: 2, width: '80%' }} />

                                <Box sx={{ pl: 2, mt: 2 }}>
                                    <FormControlLabel control={<Switch checked={randomQuiz} size='small' color='error' onChange={() => setRandomQuiz(prev => !prev)} />} label="Randomise card order" />
                                </Box>

                                <Box sx={{ minWidth: '100%', mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <TextField
                                        sx={{ minWidth: '100%' }}
                                        error={isNaN(Number(customCardCount)) || (customCardCount != '' && Number(customCardCount) < 30) || (customCardCount != '' && Number(customCardCount) > Number(slugCount[nLevel]))}
                                        label="Number of Cards"
                                        disabled={(quizType) === 'all'}
                                        size="small"
                                        variant="outlined"
                                        value={customCardCount}
                                        onChange={(e) => setCustomCardCount(e.target.value)}
                                        helperText={
                                            isNaN(Number(customCardCount)) ? "Please enter a valid number." :
                                                (customCardCount != '' && Number(customCardCount) < 30) ? "A quiz must hold at least 30 cards." :
                                                    (customCardCount != '' && Number(customCardCount) > Number(slugCount[nLevel])) ? `Exceeds ${nLevel.toUpperCase()} max card count (${slugCount[nLevel]}).` :
                                                        null
                                        }
                                    />
                                </Box>

                                <Alert color='error' icon={false} sx={{ mt: 2, textAlign: 'center', fontSize: '0.85rem' }} severity='info'>30 card minimum. If left blank, all available cards will be tested.</Alert>

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
                        <Button size='small' onClick={() => toggleSettingsDialog(false)}>Save Changes</Button>
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
                                    <SettingsIcon color={(!quizOn) ? 'error' : ''} />
                                </ToggleButton>


                                <ToggleButton onClick={() => {
                                    if (quizOn) {
                                        openPauseSelect(true)
                                    } else {
                                        toggleCardToolbar(true)
                                        setLoading(true)
                                        runQuiz(nLevel, quizType, randomQuiz, customCardCount)
                                    }
                                }} variant='contained' size='small' sx={{ borderColor: '#d32f2f' }}>
                                    {(quizOn) ? <PauseIcon color='error' /> : <PlayArrowIcon color='error' />}
                                </ToggleButton>

                                <ToggleButton onClick={(quizOn) ? () => openStopSelect(true) : null} variant='contained' size='small' sx={{ borderColor: '#d32f2f' }}>
                                    <StopIcon color={(quizOn) ? 'error' : ''} />
                                </ToggleButton>

                            </ToggleButtonGroup>
                        </Box>

                        <Collapse in={cardToolbar} orientation='vertical'>


                            <Stack sx={{ mt: (quizOn) ? 2 : 0 }} spacing={2}>

                                <Collapse in={quizOn}>
                                    {(quizOn) &&
                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>

                                            <Button size='small' disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
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