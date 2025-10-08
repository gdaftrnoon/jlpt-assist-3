'use client'
import { Typography, Container, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, Box, Paper, useTheme, useMediaQuery, Grid, IconButton, Collapse, Dialog, DialogTitle, DialogContent, CardContent, Card } from "@mui/material"
import { useEffect, useState } from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, CancelOutlined, DoneOutline, InfoOutline, Quiz, Visibility } from "@mui/icons-material";
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

    // holds the actual cards of the test the user is viewing
    const [testCards, setTestCards] = useState({})
    const [tcPage, setTCpage] = useState(0)
    const [testCardsSliced, setTestCardsSliced] = useState({})

    // holds the card in spotlight
    const [spotlightCard, setSpotlightCard] = useState({})

    const [knownWordIDs, setKnownWordIDs] = useState([])

    const [progData, setProgData] = useState([])

    const [metaTableMsg, setMetaTableMsg] = useState('Loading test data')
    const [detailTableMsg, setDetailTableMsg] = useState('No data available')

    const [testDetailDialog, toggleTestDetailDialog] = useState(false)
    const [testDetail, setTestDetail] = useState()

    const [allVocab, setAllVocab] = useState({})

    const [reviewCard, setReviewCard] = useState([])
    const [reviewCardNumber, serReviewCardNumber] = useState(0)

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

            const testCardsWithResult = testCards.map(x => ({...x, result: responseMsg.message.filter(y => y.word_id === x.id)[0].is_correct}))
            console.log('test cards with result', testCardsWithResult)
            setReviewCard(testCardsWithResult)
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
        if (direction === 'forward' && page < Math.floor(testMeta.length / 4)) {
            setPage(page + 1)
        }
    }

    const dialogHelper = (index) => {
        setTestDetail(testMetaSliced[index])
    }

    ///////////////////////////////////////// USE EFFECTS ///////////////////////////////////////////////

    // pulling test metadata on mount
    useEffect(() => {
        if (status === 'loading' || status == 'unauthenticated') {
            setMetaTableMsg('You must be logged in to use the review page')
            return
        }
        else
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

    // adjusting test data table on tcpage change
    useEffect(() => {
        if (testCards.length > 0) {
            setTestCardsSliced(
                testCards.slice(tcPage * 10, (tcPage * 10) + 10)
            )
        }
    }, [tcPage])

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
                                    {(testMeta.length > 0) ?
                                        testMetaSliced.map((test, index) => (

                                            <TableRow key={test.quiz_id}>
                                                <TableCell sx={{ width: '1%', px: 1, mx: 0 }} >
                                                    <IconButton>
                                                        <InfoOutline color="info" fontSize="small" onClick={() => { dialogHelper(index); toggleTestDetailDialog(true) }} />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>{`${test.created_at.slice(8, 10)}/${test.created_at.slice(5, 7)}/${test.created_at.slice(0, 4)}`}</TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>{test.n_level.toUpperCase()}</TableCell>
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}> {Math.round(((test.correct) / (test.correct + test.incorrect)) * 100) / 100}</TableCell >
                                                <TableCell sx={{ px: 0, mx: 0, textAlign: 'center' }}>
                                                    <Button onClick={() => fetchTestData(
                                                        'data',
                                                        test.quiz_id,
                                                        test.n_level
                                                    )}
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
            <Card sx={{ mt: 3 }}>

                <CardContent>
                    {/* number of cards, correct and incorrect counts */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5, pt: 1.5 }}>

                        <Button size={matches ? 'large' : 'small'} startIcon={<Quiz />} variant="outlined" color="info">
                            <Typography variant="body1">{reviewCardNumber + 1} / {reviewCard.length}</Typography>
                        </Button>

                        <Button size={matches ? 'large' : 'small'} startIcon={<DoneOutline />} disableRipple disableFocusRipple variant="outlined" color="success">
                            <Typography variant="body1">10</Typography>
                        </Button>

                        <Button size={matches ? 'large' : 'small'} startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant="outlined" color="error">
                            <Typography variant="body1">10</Typography>
                        </Button>
                    </Box>

                    {/* prev show and next */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, pb: 1.5 }}>

                        <Button
                            size={matches ? 'large' : 'small'}
                            variant="outlined"
                            color="primary"
                            startIcon={<ArrowLeft />}
                            onClick={() => console.log('prev')}
                        >
                            Prev
                        </Button>

                        <Button startIcon={<Visibility />} size={matches ? 'large' : 'small'} onClick={() => console.log('show')} variant="contained" color="primary">
                            Show
                        </Button>

                        <Button
                            size={matches ? 'large' : 'small'}
                            variant="outlined"
                            color="primary"
                            endIcon={<ArrowRight />}
                            onClick={() => console.log('next')}

                        >
                            Next
                        </Button>
                    </Box>

                    {/* start of card, slug */}
                    <Box>
                        <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                            Slug
                        </Typography>
                    </Box>

                    <Box sx={{ py: 1 }}>

                        <Typography sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', md: '2rem' } }}>Japanese</Typography>

                        <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Reading</Typography>


                        <Typography sx={{ fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.2rem' } }}>Readings...</Typography>


                        <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Meaning</Typography>

                        <Box sx={{ mb: 1 }}>
                            <Box>
                                <Typography sx={{ color: 'grey', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                    parts of speech, Noun
                                </Typography>

                                <Typography sx={{ color: 'grey', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                    tags, Usually written using kana alone
                                </Typography>

                                <Typography sx={{ mb: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                                    English definitions... trump card
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>


            <Dialog open={testDetailDialog} onClose={() => toggleTestDetailDialog(false)}>
                <DialogTitle textAlign="center">Test Details</DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableBody>
                            {(testDetail) ?
                                <>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Test Type</TableCell>
                                        <TableCell sx={{}}>{capitalizeFirstLetter(testDetail.quiz_type)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Random</TableCell>
                                        <TableCell sx={{}}>{testDetail.random === true ? 'True' : 'False'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Correct</TableCell>
                                        <TableCell sx={{}}>{testDetail.correct}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Incorrect</TableCell>
                                        <TableCell sx={{}}>{testDetail.incorrect}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600' }}>Start Page</TableCell>
                                        <TableCell sx={{}}>{testDetail.start_from}</TableCell>
                                    </TableRow>
                                </>
                                :
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Typography sx={{ textAlign: 'center' }}>No data available</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </Container >


    )
}
export default ReviewComponent