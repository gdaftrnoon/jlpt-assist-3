'use client'
import { Typography, Container, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, Box, Paper } from "@mui/material"
import { useEffect, useState } from "react";
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';


const ReviewComponent = () => {

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

    // holds word ids and results from db quiz results, and then words themselves
    const [testData, setTestData] = useState({})

    // holds the actual cards of the test the user is viewing
    const [testCards, setTestCards] = useState({})

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
    const fetchTestData = async (reqtype, qid, nLevel) => {

        const response = await fetch('api/GetUserQuizRecords',
            { method: 'POST', body: JSON.stringify({ RequestType: reqtype, QuizID: qid }) }
        )
        // [{ word_id: 42, is_correct: false }, ...]
        const responseMsg = await response.json()

        // pulling test data
        if (responseMsg.status === '200' && reqtype === 'data') {

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
                const newTestData = responseMsg.message.map(x => ({
                    word_id: x.word_id,
                    is_correct: x.is_correct,
                    word: testCards.filter(card => card.id === x.word_id)[0].slug
                }))
                setTestData(newTestData)
                setTestCards(testCards)
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

    return (
        <ThemeProvider theme={theme}>
            <Container sx={{}}>

                <TableContainer component={Paper} sx={{ mt: 5, mb: 2, py: 2, px: 4 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Test Date</TableCell>
                                <TableCell>N-Level</TableCell>
                                <TableCell>Test Type</TableCell>
                                <TableCell>Random</TableCell>
                                <TableCell>Correct</TableCell>
                                <TableCell>Incorrect</TableCell>
                                <TableCell>Start Page</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(testMeta.length > 0) ?
                                testMetaSliced.map((test, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{`${test.created_at.slice(8, 10)}/${test.created_at.slice(5, 7)}/${test.created_at.slice(0, 4)}`}</TableCell>
                                        <TableCell>{test.n_level}</TableCell>
                                        <TableCell>{test.quiz_type}</TableCell>
                                        <TableCell>{test.random === true ? 'True' : 'False'}</TableCell>
                                        <TableCell>{test.correct}</TableCell>
                                        <TableCell>{test.incorrect}</TableCell>
                                        <TableCell>{test.start_from}</TableCell>
                                        <TableCell sx={{ width: '1%' }}>
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
                                    <TableCell colSpan={7}>
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

                <Box sx={{ display: 'flex', flexDirection: 'row', mt: 3, gap: 2, minWidth: '100%' }}>

                    <TableContainer component={Paper} sx={{ py: 2, px: 4, width: '40%' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Word</TableCell>
                                    <TableCell>Result</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(testData.length > 0) ?
                                    testData.map((word, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{}}>
                                                {word.word}
                                            </TableCell>
                                            <TableCell sx={{}}>
                                                {word.is_correct === true ? 'Correct' : 'Incorrect'}
                                            </TableCell>
                                            <TableCell sx={{ width: '1%' }}>
                                                <Button onClick={() => {
                                                    setSpotlightCard(testCards.filter(x => x.id === word.word_id))
                                                    console.log('splotlight', testCards.filter(x => x.id === word.word_id))
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
                                            <Typography sx={{ textAlign: 'center' }}>No test data available</Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>

                    </TableContainer>

                    <Paper sx={{ width: '60%', py: 2, px: 4 }}>

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
                    </Paper>

                </Box>

            </Container>
        </ThemeProvider>
    )
}
export default ReviewComponent