'use client'

import { ArticleOutlined, CheckBoxOutlineBlankRounded, DeleteForever, DeleteForeverOutlined, DoneAll, Expand, InfoOutline, KeyboardArrowDown, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, Looks3, Looks4, Looks5, LooksOne, LooksTwo, ManageSearchOutlined, UnfoldLess, X } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Collapse, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemText, Pagination, Skeleton, Table, TableBody, TableCell, TableContainer, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react"

export default function VocabTable() {

    const { data: session, status } = useSession()
    const userid = session?.user?.userId

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const [vocab, setVocab] = useState()

    const flagA = useRef(false)
    const flagB = useRef(false)

    const [level, setLevel] = useState('n1')
    const [page, setPage] = useState(1)

    const [levelDia, openLevelDia] = useState(false)
    const [introDialog, toggleIntroDialog] = useState(false)
    const [open, setOpen] = useState([])

    const [userKnownWordIds, setUserKnownWordIds] = useState([])

    const [initialPackage, setInitialPackage] = useState()
    const [adjustedPackage, setAdjustedPackage] = useState()

    const [loading, setLoading] = useState(false)

    const [introCheckbox, setIntroCheckbox] = useState(false)

    const [searchSelect, openSearchSelect] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [untickAllSelect, openUntickAllSelect] = useState(false)

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

    // show/hide intro dialog based on ls
    useEffect(() => {
        if (localStorage.getItem('ShowVocabIntro')) {
            const choice = JSON.parse(localStorage.getItem('ShowVocabIntro'))
            if (choice) {
                toggleIntroDialog(true)
            }
            else {
                setIntroCheckbox(true)
            }
        }
        else {
            localStorage.setItem('ShowVocabIntro', 'true')
            toggleIntroDialog(true)
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

    // creating a package to send to db for each page
    useEffect(() => {
        if (vocab) {
            const initial = {}
            vocab[level].slice((page - 1) * 10, ((page - 1) * 10) + 10).map(x => (
                initial[x.id] = (userKnownWordIds.includes(x.id))
            ))
            console.log('initial', initial)
            setInitialPackage(initial)
            setAdjustedPackage(initial)
            setLoading(false)
        }
    }, [page, userKnownWordIds, level, vocab])

    // on mount, set default level and page ls items if they do not exist
    useEffect(() => {
        if (!localStorage.getItem('page')) {
            localStorage.setItem('page', '1')
        }
        else {
            const savedPage = JSON.parse(localStorage.getItem('page'))
            setPage(savedPage)
        }
        if (!localStorage.getItem('level')) {
            localStorage.setItem('level', 'n1')
        }
        else {
            const savedLevel = localStorage.getItem('level')
            setLevel(savedLevel)
        }
    }, [])


    // save changes to db
    const saveChanges = async (initialPackage, adjustedPackage) => {

        if (session) {

            setLoading(true)
            const response = await fetch('api/SubmitVocabChange',
                {
                    method: 'POST',
                    body: JSON.stringify({ initial: initialPackage, adjusted: adjustedPackage })
                })
            const responseMsg = await response.json()
            console.log(responseMsg)
            if (responseMsg.status === 200) {
                const toDelete = []
                const toAppend = []
                Object.keys(initialPackage).map(x => {
                    if (initialPackage[x] === true && adjustedPackage[x] === false) {
                        toDelete.push(Number(x))
                    }
                    else if (initialPackage[x] === false && adjustedPackage[x] === true) {
                        toAppend.push(Number(x))
                    }
                })
                const newUserKnownWordIDs = userKnownWordIds.filter(x => !toDelete.includes(x)).concat(toAppend)
                console.log('newuserknownwordids', newUserKnownWordIDs)
                setUserKnownWordIds(newUserKnownWordIDs)
            }
        }
    }

    // function for word/page number search
    const tableQuery = (searchQuery) => {

        // if it is a number...
        if (!isNaN(searchQuery)) {

            if (
                searchQuery < 0 || searchQuery > Math.ceil(vocab[level].length / 10)
            ) {
                openSearchSelect(false)
                setSearchQuery('')
            }

            else if (
                Number.isInteger(Number(searchQuery)) &&
                Number(searchQuery) > 0 &&
                Number(searchQuery) <= Math.ceil(vocab[level].length / 10)
            ) {
                setPage(Number(searchQuery))
                setOpen([])
                setSearchQuery('')
            }
        }

        else if (searchQuery != '') {
            const searchIndex = vocab[level].map(x => x.slug).indexOf(String(searchQuery)) + 1
            const searchQueryPage = Math.ceil(Number(searchIndex) / 10)
            if (searchQueryPage) {
                setPage(Number(searchQueryPage))
                setOpen([])
                setSearchQuery('')
            }
            else {
                openSearchSelect(false)
                setSearchQuery('')
            }
        }
    }

    // function to remove all data for a certain level
    const removeAll = () => {

        if (session) {
            const toRemove = vocab[level].filter(x => userKnownWordIds.includes(x.id)).map(x => x.id)
            if (toRemove.length > 0) {
                const removeAllInitial = {}
                toRemove.forEach(x => removeAllInitial[x] = true)
                const removeAllAdjusted = {}
                toRemove.forEach(x => removeAllAdjusted[x] = false)
                saveChanges(removeAllInitial, removeAllAdjusted)
                openUntickAllSelect(false)
            }
            else {
                openUntickAllSelect(false)
            }
        }
    }

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* level dialog */}
            {(vocab) &&
                <Dialog open={levelDia} onClose={() => openLevelDia(false)}>
                    <DialogTitle sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                        Please choose an N-level
                    </DialogTitle>
                    <List sx={{ pt: 0 }}>
                        {Object.keys(vocab).map(x => (
                            <ListItem key={x}>
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

            {/* intro dialog */}
            <Dialog open={introDialog}>
                <DialogTitle sx={{ fontSize: '1.25rem', textAlign: 'center', mb: 0 }}>
                    Vocabulary Table
                </DialogTitle>
                <DialogContent sx={{}}>

                    <Box>
                        <Alert icon={false} severity='info' sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '1rem', md: '1.2rem' } }}>
                            Tick words you're familiar with, you must be logged in to use the vocabulary table.
                        </Alert>

                        <Card>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <LooksOne /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>N-level selection</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <Expand /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Expand all</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <UnfoldLess /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Collapse all</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <DoneAll /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Tick all on page</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <CheckBoxOutlineBlankRounded /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Untick all on page</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <ManageSearchOutlined /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Search word/page number</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                    <DeleteForeverOutlined /><Typography sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>Remove all data for level</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Checkbox
                            checked={introCheckbox}
                            onChange={() => {
                                setIntroCheckbox(prev => !prev)
                                localStorage.setItem('ShowVocabIntro', introCheckbox)
                            }}
                        />
                        <Typography variant='subtitle1'>Don't show on startup</Typography>
                    </Box>
                    <Button
                        onClick={() => { toggleIntroDialog(false) }}
                        sx={{ fontWeight: 'bold' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* search dialog */}
            <Dialog open={searchSelect} onClose={() => openSearchSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    Please enter a page number or word
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="query"
                        label="Page/Japanese word"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openSearchSelect(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            tableQuery(searchQuery)
                            openSearchSelect(false)
                        }}>
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            {/* delete all dialog */}
            <Dialog open={untickAllSelect} onClose={() => openUntickAllSelect(false)}>
                <DialogTitle sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                    Would you like to remove all checks for the {level.toUpperCase()} level?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: { xs: '0.9rem', md: '1.2rem' } }}>
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openUntickAllSelect(false)}>Return</Button>
                    <Button onClick={() => removeAll()}>Remove all</Button>
                </DialogActions>
            </Dialog>

            {/* toolbar */}
            <Box sx={{ pt: 5, textAlign: 'center' }}>
                <ToggleButtonGroup disabled={!vocab && !adjustedPackage} size={matches ? 'large' : 'medium'}>

                    <ToggleButton onClick={() => toggleIntroDialog(true)} sx={{ borderColor: '#d32f2f' }}>
                        <InfoOutline color='error' />
                    </ToggleButton>

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

                    <ToggleButton
                        onClick={() => {
                            if ((initialPackage) && (open.length != Object.values(initialPackage).length)) {
                                const holdIndex = []
                                for (let index = 0; index < Object.values(initialPackage).length; index++) {
                                    holdIndex.push(index)
                                }
                                setOpen(holdIndex)
                            }
                            else {
                                setOpen([])
                            }
                        }}
                        sx={{ borderColor: '#d32f2f' }}>
                        {(initialPackage) && (open.length === Object.values(initialPackage).length) ?
                            <UnfoldLess color="error" /> :
                            <Expand color='error' />
                        }
                    </ToggleButton>

                    <ToggleButton
                        onClick={() => {
                            if (session) {
                                if (adjustedPackage && Object.values(adjustedPackage).filter(x => x === false).length === 0) {
                                    const newPackage = {}
                                    Object.keys(adjustedPackage).forEach(x => newPackage[x] = false)
                                    setAdjustedPackage(newPackage)
                                }
                                else {
                                    const newPackage = {}
                                    Object.keys(adjustedPackage).forEach(x => newPackage[x] = true)
                                    setAdjustedPackage(newPackage)
                                }
                            }
                        }}
                        sx={{ borderColor: '#d32f2f' }}>
                        {
                            (adjustedPackage && Object.values(adjustedPackage).filter(x => x === false).length === 0) ?
                                <CheckBoxOutlineBlankRounded color={session ? 'error' : 'grey'} /> :
                                <DoneAll color={session ? 'error' : 'grey'} />
                        }
                    </ToggleButton>

                    <ToggleButton onClick={() => openSearchSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                        <ManageSearchOutlined color='error' />
                    </ToggleButton>

                    <ToggleButton onClick={() => session && openUntickAllSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                        <DeleteForever color={session ? 'error' : 'grey'} />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 2 }}>
                {
                    (adjustedPackage) ?
                        <Button
                            variant="outlined"
                            color={Object.values(adjustedPackage).filter(x => x === true).length === Object.values(adjustedPackage).length ? 'success' : 'error'}
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                minWidth: 111,
                                minHeight: 43
                            }}
                        >
                            {`${Object.values(adjustedPackage).filter(x => x === true).length} / ${Object.values(adjustedPackage).length}`}
                        </Button> :
                        <Button
                            variant="outlined"
                            color='error'
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                minWidth: 111,
                                minHeight: 43
                            }}
                        >
                            Loading...
                        </Button>
                }

                <Button
                    disabled={(JSON.stringify(initialPackage) === JSON.stringify(adjustedPackage)) || (!session)}
                    variant="contained"
                    color="error"
                    size={matches ? 'large' : 'medium'}
                    onClick={() => saveChanges(initialPackage, adjustedPackage)}
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        borderRadius: '12px',
                        px: 2,
                        py: 1,
                        minWidth: 135,
                        minHeight: 43
                    }}
                >
                    {(loading) ? <CircularProgress sx={{ color: 'white' }} size='25px' /> : `Save Changes`}
                </Button>
            </Box>

            <Box sx={{ pt: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Pagination
                    size={matches ? 'large' : 'medium'}
                    color="error"
                    siblingCount={matches ? 2 : 0}
                    page={page}
                    count={(vocab) && Math.ceil(vocab[level].length / 10)}
                    disabled={!vocab}
                    onChange={(event, value) => { setPage(value); setOpen([]); localStorage.setItem('page', value) }}
                >
                </Pagination>
            </Box>

            {
                (vocab && adjustedPackage) ?
                    <Card
                        sx={{
                            width: { xs: '100%', md: '50%' },
                            mt: 4,
                            borderRadius: '16px',
                            mb: 15
                        }}>
                        <Table>
                            <TableBody>
                                {vocab[level].slice((page - 1) * 10, ((page - 1) * 10) + 10).map((x, index) => (
                                    <React.Fragment key={x.slug}>
                                        <TableRow>
                                            <TableCell sx={{ width: '1%', p: 0, pl: 1 }}>
                                                <IconButton onClick={() => open.includes(index) ? setOpen(prev => prev.filter(x => x != index)) : setOpen([...open, index])}>
                                                    {open.includes(index) ?
                                                        <KeyboardArrowUpOutlined /> :
                                                        <KeyboardArrowDownOutlined />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell sx={{ width: '1%', p: 0 }}>
                                                <Checkbox
                                                    disabled={!session}
                                                    checked={adjustedPackage[x.id] ? true : false}
                                                    color={userKnownWordIds.includes(x.id) ? 'success' : 'primary'}
                                                    onClick={() => setAdjustedPackage(prev => ({ ...prev, [x.id]: !prev[x.id] }))}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: { md: '98%', xs: '96%' },
                                                    textAlign: 'center',
                                                    pr: { md: 12, xs: 1 },
                                                    fontWeight: '700',
                                                    fontSize: { xs: '1.4rem', md: '2rem' },
                                                }}>
                                                {x.slug}
                                            </TableCell>
                                            {(!matches) &&
                                                <>
                                                    <TableCell sx={{ width: '1%', p: 0 }}>
                                                        <Checkbox
                                                            disabled={!session}
                                                            checked={adjustedPackage[x.id] ? true : false}
                                                            onClick={() => setAdjustedPackage(prev => ({ ...prev, [x.id]: !prev[x.id] }))}
                                                            color={userKnownWordIds.includes(x.id) ? 'success' : 'primary'}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ width: '1%', p: 0, pr: 1 }}>
                                                        <IconButton onClick={() => open.includes(index) ? setOpen(prev => prev.filter(x => x != index)) : setOpen([...open, index])}>
                                                            {open.includes(index) ?
                                                                <KeyboardArrowUpOutlined /> :
                                                                <KeyboardArrowDownOutlined />}
                                                        </IconButton>
                                                    </TableCell>
                                                </>}
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={matches ? 3 : 5}>
                                                <Collapse timeout={{ enter: 500, exit: 500 }} in={open.includes(index) ? true : false}>
                                                    <Box sx={{ paddingY: 2 }}>
                                                        {[...new Set(x.japanese.map(y => y.word))].map((z, zindex) => (
                                                            <Typography key={zindex}
                                                                sx={{
                                                                    fontWeight: '700',
                                                                    fontSize: { xs: '1.4rem', md: '2rem' },
                                                                }}>{z}</Typography>
                                                        ))}
                                                        <Typography
                                                            sx={{
                                                                color: 'orange',
                                                                fontSize: { xs: '1rem', md: '1.5rem' },
                                                                mt: 1,
                                                                fontWeight: '700',
                                                            }}>
                                                            Reading
                                                        </Typography>
                                                        {[...new Set(x.japanese.map(y => y.reading))].map((a, aindex) => (
                                                            <Typography key={aindex}
                                                                sx={{
                                                                    fontWeight: '700',
                                                                    fontSize: { xs: '1rem', md: '1.5rem' },
                                                                }}>
                                                                {a}
                                                            </Typography>
                                                        ))}
                                                        <Typography
                                                            sx={{
                                                                color: 'orange',
                                                                fontSize: { xs: '1rem', md: '1.5rem' },
                                                                mt: 1,
                                                                fontWeight: '700',
                                                            }}>
                                                            Meaning
                                                        </Typography>
                                                        {x.senses.filter(c => !c.parts_of_speech?.includes('Place') && !c.parts_of_speech?.includes('Wikipedia definition') && c.parts_of_speech != 'Full name')
                                                            .map((c, cindex) => (
                                                                <Box key={cindex}>
                                                                    <Typography key={`pos-${cindex}`}
                                                                        sx={{
                                                                            color: 'grey',
                                                                            fontSize: { xs: '1rem', md: '1.5rem' },
                                                                        }}
                                                                    >{c.parts_of_speech.join(", ")}
                                                                    </Typography>
                                                                    <Typography key={`ed-${cindex}`}
                                                                        sx={{
                                                                            fontSize: { xs: '1rem', md: '1.5rem' },
                                                                        }}>
                                                                        {c.english_definitions.join(", ")}</Typography>
                                                                </Box>
                                                            ))}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                    :
                    <>
                        <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6, borderRadius: '16px', mb: 6, width: { xs: '100%', md: '50%' } }}>
                            <Table>
                                <TableBody>

                                    {[...Array(10).keys()].map((x, index) => (

                                        <TableRow key={index}>
                                            <TableCell key={`C-${x}-${index}`} sx={{ width: '100%', textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                                <Skeleton animation="wave" variant="text" />
                                            </TableCell>
                                        </TableRow>

                                    ))}

                                </TableBody>
                            </Table>
                        </Card>
                    </>
            }

        </Container>
    )
}