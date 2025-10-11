'use client'
import { Typography, Container, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, Box, Paper, useTheme, useMediaQuery, Grid, IconButton, Collapse, Dialog, DialogTitle, DialogContent, CardContent, Card, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { useEffect, useState } from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, CancelOutlined, DeleteForeverOutlined, DoneOutline, InfoOutline, Quiz, Visibility, VisibilityOff } from "@mui/icons-material";
import React from 'react'

const ReviewComponent = () => {

    // getting user session if it exists
    const { data: session, status } = useSession()
    const userid = session?.user?.userId

    const thema = useTheme();
    const matches = useMediaQuery(thema.breakpoints.up('md'));

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 33,
    }

    const [testMeta, setTestMeta] = useState({})
    const [page, setPage] = useState(0)
    const [testMetaSliced, setTestMetaSliced] = useState({})

    const [knownWordIDs, setKnownWordIDs] = useState([])

    const [progData, setProgData] = useState([])

    const [metaTableMsg, setMetaTableMsg] = useState('Loading test data')

    const [testDetailDialog, toggleTestDetailDialog] = useState(false)
    const [testDetail, setTestDetail] = useState()

    const [allVocab, setAllVocab] = useState({})

    const [reviewCard, setReviewCard] = useState([])
    const [reviewCardNumber, setReviewCardNumber] = useState(0)
    const [showCard, toggleShowCard] = useState(true)
    const [testResultDialog, setTestResultDialog] = useState(false)
    const [trPage, setTrPage] = useState(0)
    const [trSetting, setTrSetting] = useState('correct')
    const [revCardColl, setRevCardColl] = useState(false)
    const [highlighted, setHighlighted] = useState()


    ///////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////

    function capitalizeFirstLetter(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    // function to retrieve all word ids, all vocab pages
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
                setKnownWordIDs(knownWordIds)

                const info = {} // contains vocab data for all n levels
                const barchartData = []

                // Fetch all levels in parallel
                await Promise.all(
                    Object.keys(fileCount).map(async (level) => {
                        const fc = fileCount[level];
                        const pagePromises = [];
                        for (let index = 1; index <= fc; index++) {
                            pagePromises.push(
                                fetch(`vocab/${level}/${level}_page${index}_v1.json`).then(res => res.json())
                            );
                        }
                        const store = await Promise.all(pagePromises);
                        info[level] = store.flatMap(x => x);
                    })
                );

                console.log('info', info)
                setAllVocab(info)

                Object.keys(info).forEach(level => {
                    const slugCount = info[level].length
                    const levelWordIDs = info[level].map(x => x.id)
                    const knownWordIDsSet = new Set(knownWordIds) // make it a set for speed
                    const knownWordsOnLevelCount = levelWordIDs.filter(x => knownWordIDsSet.has(x)).length
                    const completePerc = Math.floor((knownWordsOnLevelCount / slugCount) * 100)
                    const nData = {
                        level: level,
                        completion: completePerc
                    }
                    barchartData.push(nData)
                })
                console.log('barchartdata', barchartData)
                setProgData(barchartData)
            }
        }
    }

    // fetching test metadata only
    const fetchUserQuizRecords = async (reqtype, qid) => {

        const response = await fetch('api/GetUserQuizRecords',
            { method: 'POST', body: JSON.stringify({ RequestType: reqtype, QuizID: qid }) }
        )
        const responseMsg = await response.json()

        if (responseMsg.status === '200' && reqtype === 'meta' && responseMsg.message.length < 1) {
            setMetaTableMsg('No test records available')
            return
        }

        // pulling metadata
        if (responseMsg.status === '200' && reqtype === 'meta') {
            setTestMeta(responseMsg.message)
            console.log('test metadata', responseMsg.message)
            setTestMetaSliced(responseMsg.message.slice(page, 4))
        }
        // if error pulling metadata
        else if (responseMsg.status != '200' && reqtype === 'meta') {
            console.log(responseMsg.message)
        }
    }

    // fetching test data and vocab data from pages
    const fetchTestData = async (reqtype, qid, nLevel) => {

        setRevCardColl(false)

        const response = await fetch('api/GetUserQuizRecords',
            { method: 'POST', body: JSON.stringify({ RequestType: reqtype, QuizID: qid }) }
        )
        // [{ word_id: 42, is_correct: false }, ...]
        const responseMsg = await response.json()

        // pulling test data
        if (responseMsg.status === '200' && reqtype === 'data') {

            console.log('response', responseMsg.message)

            const testWordIDs = responseMsg.message.map(x => x.word_id)

            const testData = allVocab[nLevel]

            const testCards = testData.filter(x => testWordIDs.includes(x.id))

            const testCardsWithResult = testCards.map(x => ({ ...x, result: responseMsg.message.filter(y => y.word_id === x.id)[0].is_correct }))
            console.log('test cards with result', testCardsWithResult)
            setTrSetting('correct')
            setReviewCardNumber(0)
            setReviewCard(testCardsWithResult)
            setRevCardColl(true)
            setHighlighted(qid)
        }
        // if error pulling test data
        else if (responseMsg.status != '200' && reqtype === 'data') {
            console.log(responseMsg.message)
        }
    }

    // page change for metadata table
    const changePage = (direction, page) => {
        if (direction === 'back' && page > 0) {
            setPage(page - 1)
        }
        if (direction === 'forward' && page < Math.ceil(testMeta.length / 4) - 1) {
            setPage(page + 1)
        }
    }

    const dialogHelper = (index) => {
        setTestDetail(testMetaSliced[index])
    }

    // page change for review card
    const reviewChangePage = (direction, reviewCardNumber) => {
        if (direction === 'back' && reviewCardNumber > 0) {
            setReviewCardNumber(reviewCardNumber - 1)
        }
        if (direction === 'forward' && reviewCardNumber < reviewCard.length - 1) {
            setReviewCardNumber(reviewCardNumber + 1)
        }
    }

    const deleteRecord = async (qid) => {
        if (userid) {
            const request = await fetch('api/DeleteRecord',
                {
                    method: 'POST',
                    body: JSON.stringify({ quiz_id: qid })
                }
            )
            const response = await request.json()
            if (response.status === 200) {
                try {
                    await fetchUserQuizRecords('meta', null)
                    setReviewCard([])
                    setReviewCardNumber(0)
                    toggleShowCard(true)
                    setTrPage(0)
                    setTrSetting('correct')
                    toggleTestDetailDialog(false)
                    setPage(0)
                }
                catch (error) {
                    console.log('error')
                }
                finally {
                    console.log('record deleted.')
                }
            }
            else {
                console.log('record was not deleted')
            }
        }
    }

    ///////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////

    // pulling test metadata on mount
    useEffect(() => {
        if (status === 'loading' || status == 'unauthenticated') {
            setMetaTableMsg('You must be logged in to use the review page')
            return
        }
        else
            setMetaTableMsg('Loading test data')
        getUserVocab()
        fetchUserQuizRecords('meta', null)
    }, [status])

    // adjusting test metadata table on page change
    useEffect(() => {
        if (testMeta.length > 0) {
            setTestMetaSliced(
                testMeta.slice(page * 4, (page * 4) + 4)
            )
        }
    }, [page])
    

    ////////////////////////////////////////////////////////////////////////////////////////

    return (

        <Container sx={{}}>
            <Grid container spacing={2} sx={{ mt: 6 }}>
                {/* bar chart */}
                <Grid size={(matches) ? 7 : 12}>
                    <Paper sx={{}}>
                        <Typography fontWeight={600} pt={2} textAlign={'center'}>
                            Vocabulary Progress
                        </Typography>
                        <BarChart
                            slots={{ tooltip: Box }}
                            loading={session && progData.length < 5 ? true : false}
                            hideLegend
                            axisHighlight={{ x: 'band' }}
                            height={261}
                            barLabel={(v) => `${v.value}%`}
                            margin={{ left: 0, right: 25 }}
                            dataset={progData}
                            series={[{
                                dataKey: 'completion'
                            }]}
                            xAxis={[{
                                data: ['N1', 'N2', 'N3', 'N4', 'N5']
                            }]}
                            yAxis={[{
                                min: 0,
                                max: 100,
                                colorMap: {
                                    type: 'piecewise',
                                    thresholds: [50, 70],
                                    colors: ['#ef9a9a', '#fff176', '#66bb6a'],
                                },
                                valueFormatter: (value) => `${value}%`
                            }]}
                            sx={{
                                '& .MuiBarLabel-root': {
                                    translate: '0px -20px',
                                    fontWeight: '500'
                                },
                            }}
                        >
                        </BarChart>
                    </Paper>
                </Grid>
                {/* test metadata */}
                <Grid size={(matches) ? 5 : 12}>
                    <TableContainer component={Paper} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ flexGrow: 1, pt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '10%', px: 1, mx: 0 }} />
                                        <TableCell sx={{ width: '25%', px: 0, mx: 0, textAlign: 'center' }}>Date</TableCell>
                                        <TableCell sx={{ width: '25%', px: 0, mx: 0, textAlign: 'center' }}>Level</TableCell>
                                        <TableCell sx={{ width: '25%', px: 0, mx: 0, textAlign: 'center' }}>Score</TableCell>
                                        <TableCell sx={{ width: '15%' }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(testMeta.length > 0 && progData.length > 0) ?
                                        testMetaSliced.map((test, index) => (

                                            <TableRow key={test.quiz_id} selected={test.quiz_id === highlighted}>
                                                <TableCell sx={{ width: '1%', px: 1, mx: 0 }} >
                                                    <IconButton>
                                                        <InfoOutline color="info" fontSize="small" onClick={() => { dialogHelper(index); toggleTestDetailDialog(true) }} />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>{`${test.created_at.slice(8, 10)}/${test.created_at.slice(5, 7)}/${test.created_at.slice(0, 4)}`}</TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>{test.n_level.toUpperCase()}</TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}> {Math.round(((test.correct) / (test.correct + test.incorrect)) * 100) / 100}</TableCell >
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>
                                                    <Button onClick={() => {
                                                        // only run it if the quiz is different to whats being shown
                                                        if (test.quiz_id != highlighted) {
                                                            fetchTestData(
                                                                'data',
                                                                test.quiz_id,
                                                                test.n_level
                                                            )
                                                        }
                                                        else {
                                                            console.log('it is the same quiz chief')
                                                        }
                                                    }}
                                                        size="small"
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>

                                        ))
                                        :
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Typography sx={{ textAlign: 'center' }}>{metaTableMsg}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </Box>

                        {(testMeta.length > 0) &&
                            <Box sx={{ textAlign: 'center', py: 1 }}>
                                <Button onClick={() => { changePage('back', page) }}>Prev</Button>
                                {<Button>{`${page + 1} | ${Math.ceil(testMeta.length / 4)}`}</Button>}
                                <Button
                                    onClick={() => { changePage('forward', page) }}>Next</Button>
                            </Box>
                        }
                    </TableContainer>
                </Grid>
            </Grid>

            {/* test card */}
            <Collapse in={revCardColl} timeout={{ enter: 600, exit: 600 }}>
                {
                    (reviewCard.length > 0) &&
                    <Card sx={{ mt: 3, mb: 25 }}>

                        <CardContent>
                            {/* number of cards, correct and incorrect counts */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5, pt: 1.5 }}>

                                <Button onClick={() => setTestResultDialog(true)} size={matches ? 'large' : 'small'} startIcon={<Quiz />} variant="outlined" color="info">
                                    <Typography variant="body1">{reviewCardNumber + 1} / {reviewCard.length}</Typography>
                                </Button>

                                <Button size={matches ? 'large' : 'small'} startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={reviewCard[reviewCardNumber].result === true ? 'contained' : 'outlined'} color="success">
                                    <Typography variant="body1">{reviewCard.filter(x => x.result === true).length}</Typography>
                                </Button>

                                <Button size={matches ? 'large' : 'small'} startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={reviewCard[reviewCardNumber].result === false ? 'contained' : 'outlined'} color="error">
                                    <Typography variant="body1">{reviewCard.filter(x => x.result === false).length}</Typography>
                                </Button>
                            </Box>

                            {/* prev show and next */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5 }}>

                                <Button
                                    size={matches ? 'large' : 'small'}
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<ArrowLeft />}
                                    onClick={() => reviewChangePage('back', reviewCardNumber)}
                                >
                                    Prev
                                </Button>

                                <Button
                                    startIcon={(showCard) ? <VisibilityOff /> : <Visibility />}
                                    size={matches ? 'large' : 'small'}
                                    onClick={() => {
                                        if (showCard) {
                                            toggleShowCard(false)
                                        }
                                        else {
                                            toggleShowCard(true)
                                        }
                                    }}
                                    variant="contained" color="primary">
                                    {(showCard) ? "Hide" : "Show"}
                                </Button>

                                <Button
                                    size={matches ? 'large' : 'small'}
                                    variant="outlined"
                                    color="primary"
                                    endIcon={<ArrowRight />}
                                    onClick={() => reviewChangePage('forward', reviewCardNumber)}

                                >
                                    Next
                                </Button>
                            </Box>

                            {/* start of card, slug */}
                            <Box>
                                <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                    {reviewCard[reviewCardNumber].slug}
                                </Typography>
                            </Box>

                            <Collapse in={showCard}>
                                <Box sx={{ py: 1 }}>

                                    {[...new Set(reviewCard[reviewCardNumber].japanese.map(y => y.word))].map((z, zindex) => (
                                        <Typography key={zindex} sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', md: '2rem' } }}>{z}</Typography>
                                    ))}

                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Reading</Typography>


                                    {[...new Set(reviewCard[reviewCardNumber].japanese.map((x => x.reading)))].map(b => (
                                        <Typography key={b} sx={{ fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.2rem' } }}>{b}</Typography>
                                    ))}


                                    <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Meaning</Typography>

                                    <Box sx={{ mb: 1 }}>

                                        {reviewCard[reviewCardNumber].senses.map((x, senseIndex) => (
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
                            </Collapse>
                        </CardContent>
                    </Card>

                }
            </Collapse>

            <Dialog open={testDetailDialog} onClose={() => toggleTestDetailDialog(false)}>
                <DialogTitle textAlign="center">Test Details</DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableBody>
                            {(testDetail) ?
                                <>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: { xs: '1rem', md: '1.2rem' } }}>Test Type</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>{capitalizeFirstLetter(testDetail.quiz_type)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: { xs: '1rem', md: '1.2rem' } }}>Random</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>{testDetail.random === true ? 'True' : 'False'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: { xs: '1rem', md: '1.2rem' } }}>Correct</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>{testDetail.correct}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: { xs: '1rem', md: '1.2rem' } }}>Incorrect</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>{testDetail.incorrect}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: { xs: '1rem', md: '1.2rem' } }}>Start Page</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>{testDetail.start_from}</TableCell>
                                    </TableRow>
                                </>
                                :
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Typography sx={{ textAlign: 'center', fontSize: { xs: '1rem', md: '1.2rem' } }}>No data available</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                    <Box sx={{ pt: 2, textAlign: 'center' }}>
                        <Button onClick={() => deleteRecord(testDetail.quiz_id)} sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} color="error" size={matches ? 'medium' : 'small'} variant="contained" startIcon={<DeleteForeverOutlined />}>
                            Delete record?
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog onClose={() => setTestResultDialog(false)} open={testResultDialog}>
                <DialogTitle variant={matches ? 'h5' : 'h6'} sx={{ textAlign: 'center', fontWeight:'600' }}>{trSetting === 'correct' ? 'Correct Cards' : 'Incorrect Cards'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: {}, minWidth: { xs: '80vw', md: '15vw' } }}>

                    <Box textAlign="center" pb={1}>
                        <ToggleButtonGroup
                            value={trSetting}
                            exclusive
                            onChange={(e, x) => {
                                if (x != null) {
                                    setTrSetting(x)
                                    setTrPage(0)
                                }
                            }}
                            size={matches ? "medium" : "small"}
                        >
                            <ToggleButton value="correct" color="success">
                                Correct
                            </ToggleButton>
                            <ToggleButton value="incorrect" color="error">
                                Incorrect
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ flexGrow: 1, mt: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { sx: '1rem', md: '1.4rem' } }}>Word</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontSize: { sx: '1rem', md: '1.4rem' } }}>Reading</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reviewCard.filter(x => x.result === (trSetting === 'correct' ? true : false)).length > 0 ?
                                    reviewCard.filter(x => x.result === (trSetting === 'correct' ? true : false)).slice(trPage * 5, (trPage * 5) + 5).map((y, index) => ( // PAGINATION SETTING
                                        <TableRow key={y.slug}>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Typography
                                                    onClick={() => {
                                                        setReviewCardNumber(reviewCard.map(x => x.slug).indexOf(y.slug))
                                                        setTestResultDialog(false)
                                                    }}
                                                    component={Button}
                                                    size="small"
                                                    variant={matches ? 'h6' : 'subtitle1'}
                                                >
                                                    {y.slug}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {y.japanese.map((x => x.reading))[0] != y.slug &&
                                                    <Typography
                                                        onClick={() => {
                                                            setReviewCardNumber(reviewCard.map(x => x.slug).indexOf(y.slug))
                                                            setTestResultDialog(false)
                                                        }}
                                                        component={Button}
                                                        size="small"
                                                        variant={matches ? 'h6' : 'subtitle1'}
                                                    >
                                                        {y.japanese.map((x => x.reading))[0]}
                                                    </Typography>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )) :
                                    <TableRow>
                                        <TableCell>
                                            <Typography textAlign="center" variant={matches ? 'h6' : 'subtitle1'}>
                                                No data available
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </Box>

                    {reviewCard.filter(x => x.result === (trSetting === 'correct' ? true : false)).length > 0 &&
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <IconButton onClick={() => { if (trPage > 0) { setTrPage(prev => prev - 1) } }}>
                                <ArrowLeft fontSize={matches ? 'medium' : 'small'} />
                            </IconButton>

                            <Typography variant={matches ? 'h6' : 'subtitle1'}>Page {trPage + 1} / {Math.ceil(reviewCard.filter(x => x.result === (trSetting === 'correct' ? true : false)).length / 6)}</Typography> {/* // PAGINATION SETTING */}
                            <IconButton onClick={() => { trPage < Math.ceil(reviewCard.filter(x => x.result === (trSetting === 'correct' ? true : false)).length / 6) - 1 && setTrPage(prev => prev + 1) }}>
                                <ArrowRight fontSize={matches ? 'medium' : 'small'} />
                            </IconButton>
                        </Box>
                    }

                </DialogContent>
            </Dialog>

        </Container >

    )
}
export default ReviewComponent