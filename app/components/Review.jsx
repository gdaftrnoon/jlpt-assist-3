'use client'
import { Typography, Container, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, Box, Paper, CssBaseline } from "@mui/material"
import { useEffect, useState } from "react";
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';


const ReviewComponent = () => {

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
    const fetchTestData = async (reqtype, qid, nLevel, startPage) => {

        const response = await fetch('api/GetUserQuizRecords',
            { method: 'POST', body: JSON.stringify({ RequestType: reqtype, QuizID: qid }) }
        )
        // [{ word_id: 42, is_correct: false }, ...]
        const responseMsg = await response.json()

        // pulling test data
        if (responseMsg.status === '200' && reqtype === 'data') {

            console.log('response', responseMsg.message)

            const testWordIDs = responseMsg.message.map(x => x.word_id)

            let pages;

            try {

                const jlptResponse = await fetch('api/FetchJlpt',
                    {
                        method: 'POST', body: JSON.stringify({ nLevel: nLevel, startPage: startPage })
                    }
                )
                pages = await jlptResponse.json()
            }

            catch (error) {
                console.log(error)
                return
            }

            finally {
                const flatPages = pages.message
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

            {/* metadata */}
            <TableContainer component={Paper} sx={{ mt: 6, pb: 2, pt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ textAlign: 'center' }}>Test Date</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>N-Level</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Test Type</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Random</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Correct</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Incorrect</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Score</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Start Page</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(testMeta.length > 0) ?
                            testMetaSliced.map((test, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ textAlign: 'center' }}>{`${test.created_at.slice(8, 10)}/${test.created_at.slice(5, 7)}/${test.created_at.slice(0, 4)}`}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.n_level}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.quiz_type}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.random === true ? 'True' : 'False'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.correct}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.incorrect}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{Math.round(((test.correct) / (test.correct + test.incorrect)) * 100) / 100}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{test.start_from}</TableCell>
                                    <TableCell sx={{ textAlign: 'left' }}>
                                        <Button onClick={() => fetchTestData(
                                            'data',
                                            test.quiz_id,
                                            test.n_level,
                                            test.start_from
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
                                <TableCell colSpan={9}>
                                    <Typography sx={{ textAlign: 'center' }}>No test data available</Typography>
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>

                {(testMeta.length > 0) &&
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button onClick={() => { changePage('back', page) }}>Prev</Button>
                        {<Button>{`${page + 1} | ${Math.ceil(testMeta.length / 5)}`}</Button>}
                        <Button onClick={() => { changePage('forward', page) }}>Next</Button>
                    </Box>
                }

            </TableContainer>

            {/* test data and card details */}
            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3, gap: 2 }}>

                <TableContainer component={Paper} sx={{ py: 2, px: 4, width: '40%', height: 560 }}>
                    <Box sx={{ minHeight: '90%' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: 'left' }}>Word</TableCell>
                                    <TableCell sx={{ textAlign: 'left' }}>Result</TableCell>
                                    <TableCell sx={{ textAlign: 'left' }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(testCardsSliced.length > 0) ?
                                    testCardsSliced.map((word, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ textAlign: 'left', width: '90%' }}>
                                                {word.slug}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'left', width: '5%' }}>
                                                {word.result === true ? 'Correct' : 'Incorrect'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'left', width: '5%' }}>
                                                <Button onClick={() => {
                                                    setSpotlightCard(testCardsSliced.filter(x => x.id === word.id))
                                                    console.log('spotlight', testCardsSliced.filter(x => x.id === word.id))
                                                }
                                                }
                                                    size="small"
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    :
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography sx={{ textAlign: 'center' }}>No data available</Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </Box>

                    {/* test data pagination buttons */}

                    {(testCards.length > 0) &&
                        <Box sx={{ textAlign: 'center', mt: 2, width: '100%' }}>
                            <Button onClick={() => { changeTCpage('back', tcPage) }}>Prev</Button>
                            {<Button>{`${tcPage + 1} | ${Math.ceil(testCards.length / 10)}`}</Button>}
                            <Button onClick={() => { changeTCpage('forward', tcPage) }}>Next</Button>
                        </Box>
                    }

                </TableContainer>

                {/* spotlight card */}
                <Paper sx={{ py: 2, px: 4, width: '60%' }}>

                    {(spotlightCard.length > 0) ?
                        <Box>
                            <Box>
                                <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                    {spotlightCard[0].slug}
                                </Typography>
                            </Box>
                            <Box sx={{ py: 1 }}>
                                {[...new Set(spotlightCard[0].japanese.map(y => y.word))].map((z, zindex) => (
                                    <Typography key={zindex} sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', md: '2rem' } }}>{z}</Typography>
                                ))}

                                <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Reading</Typography>

                                {[...new Set(spotlightCard[0].japanese.map((x => x.reading)))].map(b => (
                                    <Typography key={b} sx={{ fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.2rem' } }}>{b}</Typography>
                                ))}

                                <Typography gutterBottom sx={{ color: 'orange', mt: 1, fontWeight: '700', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Meaning</Typography>

                                <Box sx={{ mb: 1 }}>
                                    {spotlightCard[0].senses.map((x, senseIndex) => (
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
                        </Box> :
                        null
                    }
                </Paper>
            </Box>
        </Container>


    )
}
export default ReviewComponent