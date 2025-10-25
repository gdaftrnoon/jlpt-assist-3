import { Container, ToggleButton, ToggleButtonGroup, Box, useTheme, useMediaQuery, Typography, Button, Alert, Collapse, Paper, TableContainer, Table, TableRow, TableCell, TableHead, TableBody, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText, DialogContent, Card, CardContent, Slider, Divider, FormControlLabel, Switch, TextField, DialogActions, Input, Grid } from "@mui/material";
import LooksOne from "@mui/icons-material/LooksOne";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { ArrowLeftOutlined, ArrowRightOutlined, CancelOutlined, Check, Clear, DoneOutline, Looks3, Looks4, Looks5, LooksTwo, Quiz, Start, VisibilityOff } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export default function Test() {

    const { data: session, status } = useSession()
    const userid = session?.user?.userId

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up('md'))

    const flagA = useRef(false)
    const flagB = useRef(false)

    const [vocab, setVocab] = useState()
    const [userKnownWordIds, setUserKnownWordIds] = useState([])

    const [level, setLevel] = useState('n1')
    const [type, setType] = useState('all')
    const [random, setRadnom] = useState(false)
    const [cardCount, setCardCount] = useState(20)

    const [levelDia, openLevelDia] = useState(false)
    const [settingsDia, openSettingsDia] = useState(false)

    const [testCards, setTestCards] = useState()
    const [cardNumber, setCardNumber] = useState(0)
    const [showCard, toggleShowCard] = useState(false)
    const [testOn, setTestOn] = useState(false)

    // fetch all jlpt vocab data once on mount
    useEffect(() => {
        if (!flagA.current) {
            fetch('/api/FetchJlpt')
                .then(response => response.json())
                .then(data => {
                    setVocab(data.message)
                    console.log('all vocab data', data.message)
                })
                .finally(
                    flagA.current = true
                )
        }
    }, [])

    // fetch user known word ids once status is verified
    useEffect(() => {
        if (status === 'authenticated' && !flagB.current) {
            fetch('/api/GetUserVocab')
                .then(response => response.json())
                .then(data => {
                    setUserKnownWordIds(data.message.map(x => x.word_id))
                    console.log('all user known word ids', data.message.map(x => x.word_id))
                })
                .finally(
                    flagB.current = true
                )
        }
    }, [status])

    // force card count to be > 1 and < 100 and not a word
    useEffect(() => {
        if ((cardCount < 1 || isNaN(cardCount)) && cardCount != '') {
            setCardCount(1)
        }
        if (cardCount > 100) {
            setCardCount(100)
        }
    }, [cardCount])

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

    const startTest = (level, type, random, cardCount) => {
        const testCards = vocab[level]
        if (random) {
            shuffle(testCards)
        }

        if (type === 'all') {
            const slicedCards = testCards.slice(0, cardCount)
            setTestCards(slicedCards)
            setTestOn(true)
        }
    }

    return (
        <Container>

            {/* level dialog */}
            {(vocab && userKnownWordIds.length > 0) &&
                <Dialog open={levelDia} onClose={() => openLevelDia(false)}>
                    <DialogTitle sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                        Please choose an N-level
                    </DialogTitle>
                    <List sx={{ pt: 0 }}>
                        {Object.keys(vocab).map((x, index) => (
                            <ListItem key={index}>
                                <ListItemButton onClick={() => {
                                    if (level != x) {
                                        setLevel(x)
                                        openLevelDia(false)
                                        setPage(1)
                                        setOpen([])
                                        localStorage.setItem('level', x)
                                        localStorage.setItem('page', 1)
                                    }
                                    else {
                                        openLevelDia(false)
                                    }
                                }}>
                                    <ListItemText sx={{ textAlign: 'center', fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                                        {x.toUpperCase()}
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Dialog>
            }

            {/* quiz settings */}
            <Dialog sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={settingsDia}>
                <DialogContent sx={{ pb: 0.5 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 0 }}>

                            <ToggleButtonGroup
                                color='error'
                                exclusive
                                onChange={
                                    (event, newN) => (newN) != null ? (setLevel(newN)) : null}
                                value={level}
                                size={matches ? 'medium' : 'small'}
                                sx={{ mt: 2 }
                                }>
                                <ToggleButton value='n1'>N1</ToggleButton>
                                <ToggleButton value='n2'>N2</ToggleButton>
                                <ToggleButton value='n3'>N3</ToggleButton>
                                <ToggleButton value='n4'>N4</ToggleButton>
                                <ToggleButton value='n5'>N5</ToggleButton>
                            </ToggleButtonGroup>

                            <ToggleButtonGroup
                                onChange={(event, newType) => newType != null ? setType(newType) : null}
                                color='error'
                                exclusive
                                value={type}
                                size={matches ? 'medium' : 'small'}
                                sx={{ mt: 2 }}>
                                <ToggleButton value='all'>All Cards</ToggleButton>
                                <ToggleButton value='known'>Known</ToggleButton>
                                <ToggleButton value='unknown'>Unknown</ToggleButton>
                            </ToggleButtonGroup>

                            <Divider sx={{ mt: 2, width: '80%' }} />

                            <Box sx={{ pl: 2, mt: 2, mb: 1 }}>
                                <FormControlLabel
                                    control={<Switch checked={random} size={matches ? 'medium' : 'small'} color='error' />}
                                    label="Randomise card order"
                                    onChange={() => setRadnom(prev => !prev)}
                                />
                            </Box>

                            <Box sx={{ minWidth: '100%', mt: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    sx={{ minWidth: '100%' }}
                                    size={matches ? 'medium' : 'small'}
                                    variant="outlined"
                                    value={cardCount}
                                    label="Number of Cards"
                                    onChange={(e) => setCardCount(e.target.value)}
                                />
                            </Box>

                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}>
                    <Button
                        onClick={() => {
                            if (cardCount === '') {
                                setCardCount(20)
                                openSettingsDia(false)
                            }
                            else {
                                openSettingsDia(false)
                            }
                        }}
                        size={matches ? 'medium' : 'small'}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Paper sx={{ mt: 5, borderRadius: '16px', py: 1.5, px: 2, mb: 10 }}>
                <Box sx={{ textAlign: 'center' }}>

                    {/* toolbar */}
                    <Box sx={{ pt: 1 }}>
                        <ToggleButtonGroup size={matches ? 'medium' : 'medium'}>

                            <ToggleButton onClick={() => openLevelDia(true)} sx={{ borderColor: '#d32f2f' }}>
                                {
                                    (level === 'n1') ? <LooksOne color='error' /> :
                                        (level === 'n2') ? <LooksTwo color='error' /> :
                                            (level === 'n3') ? <Looks3 color='error' /> :
                                                (level === 'n4') ? <Looks4 color='error' /> :
                                                    (level === 'n5') ? <Looks5 color='error' /> :
                                                        null
                                }
                            </ToggleButton>

                            <ToggleButton onClick={() => openSettingsDia(true)} size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.4, xs: 1.4 } }}>
                                <SettingsIcon fontSize={matches ? 'medium' : 'small'} color='error' />
                            </ToggleButton>

                            <ToggleButton onClick={() => startTest(level, type, random, cardCount)} variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                <PlayArrowIcon fontSize={matches ? 'medium' : 'small'} color='error' />
                            </ToggleButton>

                            <ToggleButton variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                <StopIcon fontSize={matches ? 'medium' : 'small'} color='error' />
                            </ToggleButton>

                            <ToggleButton variant='contained' size='small' sx={{ borderColor: '#d32f2f', px: { md: 1.3, xs: 1.3 } }}>
                                <SportsScoreIcon fontSize={matches ? 'medium' : 'small'} color='error' />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Collapse timeout={{ enter: 400, exit: 400 }} in={testOn}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5, pt: 1.5 }}>
                            <Button size={matches ? 'large' : 'small'} startIcon={<Quiz />} variant="outlined" color="info">
                                <Typography variant="body1">...</Typography>
                            </Button>

                            <Button size={matches ? 'large' : 'small'} startIcon={<DoneOutline />} disableRipple disableFocusRipple variant="outlined" color="success">
                                <Typography variant="body1">...</Typography>
                            </Button>

                            <Button size={matches ? 'large' : 'small'} startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant="outlined" color="error">
                                <Typography variant="body1">...</Typography>
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5 }}>
                            <Button
                                size={matches ? 'large' : 'small'}
                                variant="outlined"
                                color="primary"
                                startIcon={<ArrowLeftOutlined />}
                            >
                                Prev
                            </Button>

                            <Button
                                size={matches ? 'large' : 'small'}
                                variant="contained"
                                color="primary"
                                startIcon={<VisibilityOff />}
                                onClick={() => toggleShowCard(prev => !prev)}
                            >
                                Show
                            </Button>

                            <Button
                                size={matches ? 'large' : 'small'}
                                variant="outlined"
                                color="primary"
                                endIcon={<ArrowRightOutlined />}
                            >
                                Next
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Button
                                size={matches ? 'large' : 'small'}
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                                disabled={false}
                            >
                                Correct
                            </Button>
                            <Button
                                size={matches ? 'large' : 'small'}
                                variant="contained"
                                color="error"
                                startIcon={<Clear />}
                                disabled={false}
                            >
                                Incorrect
                            </Button>
                        </Box>
                    </Collapse>

                    <Collapse timeout={{ enter: 400, exit: 400 }} in={!testOn}>

                        <Alert icon={false} severity='info' sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: { xs: '1rem', md: '1.2rem' } }}>
                            Set the test configuration before running, a test can hold between 20 and 100 cards inclusive.
                        </Alert>

                        {(vocab && userKnownWordIds.length > 0) &&
                            <TableContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
                                <Table size={!matches && 'small'} sx={{ width: { xs: '100%', md: '35%' }, border: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            {
                                                ['Level', 'Total', 'Known', 'Completion'].map((x, index) => (
                                                    <TableCell sx={{ textAlign: 'center', padding: 1 }} key={index}>
                                                        {x}
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.keys(vocab).map((x, index) => (
                                            <TableRow selected={x === level} onClick={() => setLevel(x)} key={index}>
                                                <TableCell sx={{ textAlign: 'center', padding: 1 }}>
                                                    {x.toUpperCase()}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', padding: 1 }}>
                                                    {vocab[x].length}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', padding: 1 }}>
                                                    {vocab[x].filter(y => userKnownWordIds.includes(y.id)).length}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', padding: 1 }}>
                                                    {`${Math.floor(
                                                        (vocab[x].filter(y => userKnownWordIds.includes(y.id)).length /
                                                            vocab[x].length) * 100
                                                    )}%`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}

                    </Collapse>

                    {/* main word */}
                    <Collapse timeout={{ enter: 400, exit: 400 }} in={testOn}>
                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                {(testOn && testCards) && testCards[cardNumber].slug}
                            </Typography>
                        </Box>
                    </Collapse>

                </Box>

                <Collapse timeout={{ enter: 250, exit: 10 }} in={(showCard)}>
                    {(testCards) &&
                        <Box sx={{ py: 1 }}>

                            {[...new Set(testCards[cardNumber].japanese.map(y => y.word))].map((z, zindex) => (
                                <Typography key={zindex} sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', md: '2rem' } }}>{z}</Typography>
                            ))}

                            <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Reading</Typography>

                            {[...new Set(testCards[cardNumber].japanese.map((x => x.reading)))].map(b => (
                                <Typography key={b} sx={{ fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.2rem' } }}>{b}</Typography>
                            ))}

                            <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Meaning</Typography>

                            <Box sx={{ mb: 1 }}>

                                {testCards[cardNumber].senses.map((x, senseIndex) => (
                                    x.parts_of_speech != 'Wikipedia definition' && x.parts_of_speech != 'Place' && x.parts_of_speech != 'Full name' ?
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
                    }
                </Collapse>

            </Paper>
        </Container>
    );
}