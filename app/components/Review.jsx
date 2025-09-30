'use client'
import { Typography, Container, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, Box, Paper, useTheme, useMediaQuery, Grid, Card } from "@mui/material"
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAnimate, useAnimateBar, useDrawingArea } from '@mui/x-charts/hooks';
import { PiecewiseColorLegend } from '@mui/x-charts/ChartsLegend';
import { useSession } from "next-auth/react";


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

        // pulling metadata
        if (responseMsg.status === '200' && reqtype === 'meta') {
            setTestMeta(responseMsg.message)
            setTestMetaSliced(responseMsg.message.slice(page, 5))
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

            const allPages = []

            try {
                for (let index = 1; index <= fileCount[nLevel]; index++) {
                    const data = await (await fetch(`vocab/${nLevel}/${nLevel}_page${index}_v1.json`)).json()
                    allPages.push(data)
                }
            }

            catch (error) {
                console.log(error)
            }

            finally {
                const flatPages = allPages.flatMap(x => x)
                const testCards = flatPages.filter(x => testWordIDs.includes(x.id))
                console.log('testcards', testCards)
                const newTestCards = testCards.map(card => ({ ...card, result: responseMsg.message.filter(x => x.word_id === card.id)[0].is_correct }))
                console.log('newtestcards', newTestCards)
                setTestCards(newTestCards)
                setTestCardsSliced(newTestCards.slice(0, 10))
            }
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
        if (direction === 'forward' && page < Math.floor(testMeta.length / 5)) {
            setPage(page + 1)
        }
    }

    // page change for data table
    const changeTCpage = (direction, tcPage) => {
        if (direction === 'back' && tcPage > 0) {
            setTCpage(tcPage - 1)
        }
        if (direction === 'forward' && tcPage < Math.floor(testCards.length / 10)) {
            setTCpage(tcPage + 1)
        }
    }

    // pulling test metadata on mount
    useEffect(() => {
        fetchUserQuizRecords('meta', null)
    }, [])

    // adjusting test metadata table on page change
    useEffect(() => {
        if (testMeta.length > 0) {
            setTestMetaSliced(
                testMeta.slice(page * 5, (page * 5) + 5)
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

    return (

        <Container sx={{}}>
            <Grid container spacing={2} sx={{ mt: 6 }}>
                <Grid size={12}>
                    <Paper sx={{ textAlign: 'center' }}>
                        <Button onClick={() => getUserVocab()}>!</Button>
                        <BarChart
                            height={250}
                            dataset={progData}
                            series={[
                                {
                                    id: 'completion',
                                    dataKey: 'completion',
                                    stack: 'user completion',
                                    valueFormatter: (value) => `${value}%`,
                                }
                            ]}
                            layout="horizontal"
                            xAxis={[
                                {
                                    id: 'color',
                                    min: 0,
                                    max: 100,
                                    colorMap: {
                                        type: 'piecewise',
                                        thresholds: [50, 85],
                                        colors: ['#d32f2f', '#78909c', '#1976d2'],
                                    },
                                    valueFormatter: (value) => `${value}%`
                                }
                            ]}
                            barLabel={(v) => `${v.value}%`}
                            yAxis={[
                                {
                                    scaleType: 'band',
                                    dataKey: 'level',
                                    width: 140,
                                },
                            ]}
                        >
                        </BarChart>
                    </Paper>
                </Grid>
            </Grid>

        </Container>


    )
}
export default ReviewComponent