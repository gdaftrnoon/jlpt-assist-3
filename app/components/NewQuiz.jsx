"use client"
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, IconButton, List, ListItem, ListItemButton, ListItemText, Slide, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Info, InfoOutline, Looks3, Looks4, Looks5, LooksOne, LooksTwo, PersonAddAlt1, Quiz, Visibility } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';

const NewQuizMaster = () => {

    const DesktopVer = () => {
        // // king box
        // <Box sx={{ display: 'flex', flex: 4, flexDirection: 'row', minHeight: 'calc(100vh - 60px)', minWidth: '100vw', backgroundColor: '' }}>

        //     {/* column left box */}
        //     <Box flex={1} />

        //     {/* column centre box */}
        //     <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }} flex={2}>

        //         {/* box containing n controls, quiz types, random switch + start/end button */}
        //         <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', justifyContent: 'center', maxHeight: 70, minWidth: 1167, marginTop: 10 }}>

        //             <Box sx={{ display: 'flex', padding: 0, margin: 0 }}>
        //                 <FormControlLabel disabled={quizOn} control={<Switch onChange={() => setRandomQuiz(prev => !prev)} />} label="Random" />
        //             </Box>

        //             <Box>
        //                 <ToggleButtonGroup
        //                     exclusive
        //                     color="primary"
        //                     value={nLevel}
        //                     disabled={quizOn}
        //                 >
        //                     <ToggleButton onClick={() => setNLevel('n1')} value='n1'>N1</ToggleButton>
        //                     <ToggleButton onClick={() => setNLevel('n2')} value='n2'>N2</ToggleButton>
        //                     <ToggleButton onClick={() => setNLevel('n3')} value='n3'>N3</ToggleButton>
        //                     <ToggleButton onClick={() => setNLevel('n4')} value='n4'>N4</ToggleButton>
        //                     <ToggleButton onClick={() => setNLevel('n5')} value='n5'>N5</ToggleButton>
        //                 </ToggleButtonGroup>
        //             </Box>

        //             <Box>
        //                 <ToggleButtonGroup
        //                     disabled={quizOn}
        //                     color="secondary"
        //                     value={quizType}
        //                     sx={{ alignItems: 'center', display: 'flex' }}
        //                     exclusive
        //                 >
        //                     <ToggleButton onClick={() => { setQuizType('all'); setCustomCardCount('') }} value='all'>全て</ToggleButton>
        //                     <ToggleButton onClick={() => { setQuizType('allUnknown'); setCustomCardCount('') }} value='allUnknown'>知らない全て</ToggleButton>
        //                     <ToggleButton onClick={() => setQuizType('custom')} value='custom'>カスタム</ToggleButton>
        //                 </ToggleButtonGroup>
        //             </Box>

        //             <Box>
        //                 <Collapse orientation="horizontal" in={(quizType) === 'custom'}>
        //                     <Box
        //                         sx={{
        //                             display: 'flex',
        //                             flexDirection: 'row',
        //                             alignItems: 'center',
        //                             justifyContent: 'left',
        //                             gap: '20px',
        //                             width: '112px',
        //                             whiteSpace: 'nowrap'
        //                         }}
        //                     >
        //                         <TextField
        //                             disabled={quizOn}
        //                             // error={customAlert}
        //                             label="カードの数"
        //                             size="small"
        //                             sx={{ width: '100%' }}
        //                             value={customCardCount}
        //                             onChange={(e) => setCustomCardCount(e.target.value)} />
        //                     </Box>
        //                 </Collapse>
        //             </Box>

        //             {/* start/stop quiz button */}

        //             {(!quizOn) ?
        //                 <Button onClick={() => getAllCards(nLevel)} variant="contained">Start</Button>
        //                 :
        //                 <Button onClick={() => endQuiz()} variant="contained">End</Button>
        //             }

        //         </Box>

        //         {/* card number, correct + incorrect count buttons once quiz is on */}
        //         <Collapse sx={{ gap: '20px' }} in={quizOn} orientation='vertical'>
        //             <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingTop: 4 }}>

        //                 <Button disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
        //                     <Typography variant="body1">{`カード ${cardNumber + 1} / ${quizData.length}`}</Typography>
        //                 </Button>


        //                 <Button startIcon={<DoneOutline />} disableRipple disableFocusRipple variant='outlined' color="success">
        //                     <Typography variant="body1">0</Typography>
        //                 </Button>

        //                 <Button startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant='outlined' color="error">
        //                     <Typography variant="body1">0</Typography>
        //                 </Button>
        //             </Box>
        //         </Collapse>

        //         {/* main box for flashcard */}
        //         <Card sx={{ marginTop: '50px', display: 'flex', flexDirection: 'column', minWidth: 1000, padding: 0.5, marginBottom:10 }}>
        //             {(!quizOn) ?
        //                 <Typography sx={{ textAlign: 'center' }}>poop</Typography>
        //                 :
        //                 <>
        //                     <Box sx={{ display: 'flex', flexDirection: 'row' }}>

        //                         <CardContent sx={{ width: '30%' }}>
        //                             <Box>
        //                                 <Typography variant='h3'>
        //                                     {quizData[cardNumber].slug}
        //                                 </Typography>
        //                             </Box>
        //                         </CardContent>

        //                         <CardContent sx={{ width: '70%', display: 'flex', justifyContent: 'right', maxHeight: 80 }}>
        //                             <Box sx={{ display: 'flex', gap: '10px' }}>

        //                                 <Button
        //                                     size='small'
        //                                     variant="outlined"
        //                                     color="primary"
        //                                     startIcon={<ArrowLeft />}
        //                                     onClick={() => changeCard('back')}

        //                                 >
        //                                     前
        //                                 </Button>

        //                                 <Button
        //                                     size='small'
        //                                     variant="outlined"
        //                                     color="primary"
        //                                     endIcon={<ArrowRight />}
        //                                     onClick={() => changeCard('forward')}

        //                                 >
        //                                     次
        //                                 </Button>

        //                                 <Button onClick={() => toggleShowCard(true)} size='small' variant="contained" color="primary">
        //                                     <Typography><Visibility /> 表示</Typography>
        //                                 </Button>

        //                                 <Button


        //                                     size='small'
        //                                     variant="contained"
        //                                     color="success"
        //                                     startIcon={<Check />}
        //                                 >
        //                                     正解
        //                                 </Button>
        //                                 <Button


        //                                     size='small'
        //                                     variant="contained"
        //                                     color="error"
        //                                     startIcon={<Clear />}
        //                                 >
        //                                     不正解
        //                                 </Button>
        //                             </Box>
        //                         </CardContent>
        //                     </Box>
        //                     <Collapse in={showCard} timeout={{ enter: 250, exit: 10 }}>
        //                         <CardContent>
        //                             <Box>

        //                                 <Typography gutterBottom sx={{ color: 'orange' }}>Reading</Typography>

        //                                 {[...new Set(quizData[cardNumber].japanese.map((x => x.reading)))].map(b => (
        //                                     <Typography key={b} sx={{ fontWeight: 'bold' }}>{b}</Typography>
        //                                 ))}

        //                                 <Typography gutterBottom sx={{ color: 'orange', mt: 1 }}>Meaning</Typography>

        //                                 <Box sx={{ mb: 1 }}>

        //                                     {quizData[cardNumber].senses.map((x, senseIndex) => (
        //                                         x.parts_of_speech != 'Wikipedia definition' && x.parts_of_speech != 'Place' ?
        //                                             <Box key={senseIndex}>

        //                                                 {x.parts_of_speech.map((f, posIndex) => (
        //                                                     <Typography key={posIndex} sx={{ color: 'grey' }}>
        //                                                         {f}
        //                                                     </Typography>
        //                                                 ))}

        //                                                 {x.tags.map((g, tagIndex) => (
        //                                                     <Typography key={tagIndex} sx={{ color: 'grey' }}>
        //                                                         {g}
        //                                                     </Typography>
        //                                                 ))}

        //                                                 <Typography sx={{ mb: 1 }}>
        //                                                     {x.english_definitions.join(', ')}
        //                                                 </Typography>
        //                                             </Box>
        //                                             : null
        //                                     ))}
        //                                 </Box>
        //                             </Box>
        //                         </CardContent>
        //                     </Collapse>
        //                 </>
        //             }
        //         </Card>
        //     </Box>
        //     <Box flex={1} />
        // </Box >
    }

    const MobileLayout = () => {

        const fileCount = {
            'n1': 172,
            'n2': 91,
            'n3': 89,
            'n4': 29,
            'n5': 1,
        }

        const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']

        ///////////////////////////////////////// STATES ///////////////////////////////////////////////


        // state to toggle quiz on/off
        const [cardToolbar, toggleCardToolbar] = useState(false)

        // state to toggle quiz on/off
        const [quizOn, toggleQuizOn] = useState(false)

        // state for loading
        const [loading, setLoading] = useState(false)

        // states to hold quiz control options
        const [nLevel, setNLevel] = useState('n1')
        const [quizType, setQuizType] = useState('all')
        const [customCardCount, setCustomCardCount] = useState('')
        const [randomQuiz, setRandomQuiz] = useState(false)

        // states for dialogs
        const [nLevelSelect, openNLevelSelect] = useState(false)
        const [pauseSelect, openPauseSelect] = useState(false)
        const [stopSelect, openStopSelect] = useState(false)

        // states to control card, custom field collapse
        const [showCard, toggleShowCard] = useState(false)

        // state to hold quiz data
        const [quizData, setQuizData] = useState([])

        // state to manage card number
        const [cardNumber, setCardNumber] = useState(0)



        ///////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////


        // function to fetch and return ALL cards for a selected N level, and set quiz data
        const getAllCards = async (nLevel) => {

            const allPages = []

            try {
                for (let index = 1; index <= fileCount[nLevel]; index++) {
                    const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}.json`)).json()
                    allPages.push(data)
                }
                setQuizData(allPages.flatMap(x => x))
            }
            catch (err) {
                console.log(err)
            }
            finally {
                setLoading(false)
                toggleQuizOn(true)
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


        ///////////////////////////////////////// EFFECTS ///////////////////////////////////////////////


        // use effect for testing
        useEffect(() => {
            console.log('flat quiz data', quizData)
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

            <Container>

                <NLevelDialog />
                <PauseDialog />
                <StopDialog />

                <Card sx={{ mt: 3, mb: 6 }}>

                    {/* for controls */}
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <Box sx={{ pt: 1 }}>

                            <ToggleButtonGroup size='small'>

                                <ToggleButton sx={{ borderColor: '#d32f2f' }}>
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

                                <ToggleButton size='small' sx={{ borderColor: '#d32f2f' }}>
                                    <SettingsIcon color={(!quizOn) ? 'error' : ''} />
                                </ToggleButton>


                                <ToggleButton onClick={() => {
                                    if (quizOn) {
                                        openPauseSelect(true)
                                    } else {
                                        toggleCardToolbar(true)
                                        setLoading(true)
                                        getAllCards(nLevel)
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