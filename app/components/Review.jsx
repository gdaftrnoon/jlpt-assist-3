'use client'
import { Typography, Container, CardContent, Card, Button, TableContainer, TableHead, TableRow, TableCell, TableBody, Table, TableFooter, TablePagination, Box, Paper } from "@mui/material"
import BuildIcon from '@mui/icons-material/Build';
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from '@mui/material/styles';
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

    const [testMeta, setTestMeta] = useState({})
    const [page, setPage] = useState(0)
    const [testMetaSliced, setTestMetaSliced] = useState()

    const fetchUserQuizRecords = async (reqtype) => {
        const response = await fetch('api/GetUserQuizRecords',
            { method: 'POST', body: JSON.stringify({ RequestType: reqtype }) }
        )

        const responseMsg = await response.json()

        if (responseMsg.status === '200') {
            setTestMeta(responseMsg.message)
            setTestMetaSliced(responseMsg.message.slice(page, 5))
        }
    }

    const changePage = (direction, page) => {
        if (direction === 'back' && page > 0) {
            setPage(page - 1)
        }
        if (direction === 'forward' && page < Math.floor(testMeta.length / 5)) {
            setPage(page + 1)
        }
    }

    useEffect(() => {
        fetchUserQuizRecords('meta')
    }, [])

    useEffect(() => {
        if (testMeta.length > 0) {
            setTestMetaSliced(
                testMeta.slice(page * 5, (page * 5) + 5)
            )
        }
    }, [page])

    return (
        <ThemeProvider theme={theme}>
            <Container>

                <TableContainer component={Paper} sx={{ mt: 5, mb: 2, py: 2, px:4 }}>
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
                                        <TableCell sx={{width:'1%'}}>
                                            <Button size="small">View</Button>
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

            </Container>
        </ThemeProvider>
    )

}

export default ReviewComponent