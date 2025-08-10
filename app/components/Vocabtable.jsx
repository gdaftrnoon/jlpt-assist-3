'use client'
import { SvgIcon, Alert, Box, Button, Card, ClickAwayListener, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fade, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Tooltip, Typography, Skeleton, LinearProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import Zoom from '@mui/material/Zoom';
import { CheckBoxOutlineBlank, DeleteForever, DoneAll, Expand, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Stairs, UnfoldLess } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';

const Vocabtable = () => {

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 3,
    }

    const [quizStateType, setQuizStateType] = useState('')
    const [quizStateN, setQuizStateN] = useState('')

    useEffect(() => {
        const lsStorageQS = localStorage.getItem('quizState')
        if (lsStorageQS) {
            setQuizStateType(JSON.parse(lsStorageQS)[1])
            setQuizStateN(JSON.parse(localStorage.getItem('quizState'))[0])
        }
    }, [])

    const [lockTable, setLockTable] = useState(false)

    const [vocabularyData, setVocabularyData] = useState([])
    const [open, setOpen] = useState([])

    const [page, setPage] = useState(1)

    const [nLevel, setNLevel] = useState('n1')

    const nHandler = (level) => {
        setNLevel(level)
        setPage(1)
        showNbuttons(false)
    }

    const [knownWords, updateKnown] = useState({
        n1: [],
        n2: [],
        n3: [],
        n4: [],
        n5: []
    })

    useEffect(() => {
        if (quizStateType === 'AllUnknown' && quizStateN === nLevel) {
            setLockTable(true)
        }
        else {
            setLockTable(false)
        }
    }, [page, nLevel])

    useEffect(() => {
        const levels = ['n1', 'n2', 'n3', 'n4', 'n5']
        const storeAll = {}

        levels.forEach(level => {
            const store = localStorage.getItem(`knownWords${level}`)
            if (store) {
                storeAll[level] = JSON.parse(store)
            }
            else {
                storeAll[level] = []
            }
        })

        updateKnown(storeAll)

    }, [])

    // holds pages before they are sliced
    const [tableData, setTableData] = useState([])

    // only to run on page load and changing of n levels
    async function fetchAllData(nLevel, page, itemsPerPage) {

        setTableLoading(true)

        // get all pages from n level
        const allPages = []
        for (let index = 1; index <= fileCount[nLevel]; index++) {
            const response = await fetch(`vocab/${nLevel}/${nLevel}_page${index}.json`)
            const responseJson = await response.json()
            allPages.push(responseJson.data)
        }
        const flatPages = allPages.flatMap(x => x)
        setTableData(flatPages)

        // calculate max number of pages
        const slugCount = flatPages.length
        const maxPages = Math.ceil(slugCount / itemsPerPage)
        setMaxPages(maxPages)

        // slice data based on items per page and page number
        const slicedPages = flatPages.slice((page - 1) * itemsPerPage, Math.min(itemsPerPage * page, slugCount))
        setTableLoading(false)
        setVocabularyData(slicedPages)
        setPage(1)
        console.log(`page ${page}`, slicedPages)
    }

    // page change handler
    const handleChange = (e, p) => {
        setPage(p)
        setOpen([])
        setExpanded(false)
        adjustTable(p, itemsPerPage)
    }

    const handleKnownUpdate = (slug, level) => {
        const updated = knownWords[level].includes(slug) ?
            knownWords[level].filter(x => x != slug)
            : [...knownWords[level], slug]
        updateKnown(prev => ({
            ...prev,
            [level]: updated
        }))

        localStorage.setItem(`knownWords${level}`, JSON.stringify(updated))
    }

    const tickAllOnPage = (level) => {
        const slugArray = vocabularyData.map(x => x.slug)
        const uniqueSlugArray = slugArray.filter(x => !knownWords[level].includes(x))
        const updated = knownWords[level].concat(uniqueSlugArray)
        updateKnown(prev => ({
            ...prev,
            [level]: updated
        }))
        localStorage.setItem(`knownWords${level}`, JSON.stringify(updated))
    }

    const untickAllOnPage = (level) => {
        const slugArray = vocabularyData.map(x => x.slug)
        const updated = knownWords[level].filter(x => !slugArray.includes(x))
        updateKnown(prev => ({
            ...prev,
            [level]: updated
        }))
        localStorage.setItem(`knownWords${level}`, updated)
    }

    const untickAll = (level) => {
        updateKnown(prev => ({
            ...prev,
            [level]: []
        }))
        localStorage.setItem(`knownWords${level}`, [])
        setPage(1)
        handleWarningClose()
    }

    // Handling the opening/closing of all rows
    const [isExpanded, setExpanded] = useState(false)
    const expandAll = () => {
        const allIndexNumbers = Array.from({ length: vocabularyData.length }, (_, index) => index)
        setOpen(allIndexNumbers)
        setExpanded(true)
    }
    const collapseAll = () => {
        setOpen([])
        setExpanded(false)
    }

    const [openWarning, setOpenWarning] = useState(false) // For when the user clicks on untick all boxes
    const handleWarningClose = () => { setOpenWarning(false) }

    const [nButtons, showNbuttons] = useState(false)

    const [tableConfig, showTableConfig] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [maxPages, setMaxPages] = useState(172)

    const [tableLoading, setTableLoading] = useState(true)

    useEffect(() => {
        fetchAllData(nLevel, page, itemsPerPage)
    }, [nLevel])

    // adjusting table for items per page change
    async function adjustTable(page, itemsPerPage) {

        // calculate max number of pages
        const slugCount = tableData.length
        const maxPages = Math.ceil(slugCount / itemsPerPage)
        setMaxPages(maxPages)

        // slice data based on items per page and page number
        const slicedPages = tableData.slice((page - 1) * itemsPerPage, Math.min(itemsPerPage * page, slugCount))
        setTableLoading(false)
        setVocabularyData(slicedPages)
    }

    useEffect(() => {
        adjustTable(page, itemsPerPage)
        setPage(1)
    }, [itemsPerPage])

    useEffect(() => {
        setTableLoading(true)
    }, [])

    return (
        <>

            <Box sx={{ display: 'flex', height: 'calc(100vh - 60px)', marginTop: '0px' }}>

                <Box sx={{
                    display: 'flex',
                    width: '33%',
                    height: '100%',
                    justifyContent: 'left',
                    paddingTop: '300px'
                }}>
                    <ToggleButtonGroup orientation='vertical' sx={{ position: 'fixed' }}>

                        <Tooltip
                            title='Items per Page'
                            slots={{ transition: Zoom }}
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [68, -92],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            <ToggleButton
                                onChange={(e) => showTableConfig(!tableConfig)}
                            >
                                <ArticleIcon />
                            </ToggleButton>
                        </Tooltip>

                        <Tooltip
                            title='JLPT N-Level'
                            slots={{ transition: Zoom }}
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [68, -9],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            <ToggleButton
                                onChange={(e) => showNbuttons(!nButtons)}>
                                {
                                    nLevel === 'n1' ? <LooksOne /> :
                                        nLevel === 'n2' ? <LooksTwo /> :
                                            nLevel === 'n3' ? <Looks3 /> :
                                                nLevel === 'n4' ? <Looks4 /> :
                                                    nLevel === 'n5' ? <Looks5 /> :
                                                        null}
                            </ToggleButton>
                        </Tooltip>

                        {isExpanded ?
                            <Tooltip placement='right' title='Collapse All' slots={{ transition: Zoom }} arrow>
                                <ToggleButton
                                    onChange={(e) => collapseAll()}>
                                    <UnfoldLess />
                                </ToggleButton>
                            </Tooltip>

                            :
                            <Tooltip placement='right' title='Expand All' slots={{ transition: Zoom }} arrow>
                                <ToggleButton
                                    onChange={(e) => expandAll()}>
                                    <Expand />
                                </ToggleButton>
                            </Tooltip>

                        }

                        {
                            vocabularyData.every(x => knownWords[nLevel].includes(x.slug)) ?
                                <Tooltip placement='right' title='Untick All on Page' slots={{ transition: Zoom }} arrow>
                                    <ToggleButton onChange={() => untickAllOnPage(nLevel)}>
                                        <CheckBoxOutlineBlank />
                                    </ToggleButton>
                                </Tooltip> :
                                <Tooltip placement='right' title='Tick All on Page' slots={{ transition: Zoom }} arrow>
                                    <ToggleButton
                                        onChange={() => tickAllOnPage(nLevel)}>
                                        <DoneAll />
                                    </ToggleButton>
                                </Tooltip>
                        }

                        <Tooltip placement='right' title='Untick All' slots={{ transition: Zoom }} arrow>
                            <ToggleButton onClick={() => setOpenWarning(true)}>
                                <DeleteForever />
                            </ToggleButton>
                        </Tooltip>
                        <Dialog
                            open={openWarning}
                            onClose={handleWarningClose}
                        >
                            <DialogTitle>
                                {'Are you sure you want to reset every checkbox?'}
                            </DialogTitle>
                            <DialogContent>
                                Selecting this option will uncheck every checkbox across every page, there is no way to undo this process.
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleWarningClose}>Cancel</Button>
                                <Button onClick={() => untickAll(nLevel)}>Reset Checkboxes</Button>
                            </DialogActions>
                        </Dialog>

                    </ToggleButtonGroup>

                    <Collapse orientation='horizontal' in={tableConfig} sx={{ marginLeft: '48px', position: 'fixed' }}>
                        <ToggleButtonGroup orientation='horizontal'>
                            <ToggleButton onClick={() => {
                                showTableConfig(false)
                                setItemsPerPage(5)
                            }}
                            >
                                <SvgIcon>
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
                                        5
                                    </text>
                                </SvgIcon>
                            </ToggleButton>
                            <ToggleButton onClick={() => {
                                showTableConfig(false)
                                setItemsPerPage(10)
                                setPage(1)
                            }}
                            >
                                <SvgIcon>
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
                                        10
                                    </text>
                                </SvgIcon>
                            </ToggleButton>
                            <ToggleButton onClick={() => {
                                showTableConfig(false)
                                setItemsPerPage(15)
                                setPage(1)
                            }}
                            >
                                <SvgIcon>
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
                                        15
                                    </text>
                                </SvgIcon>
                            </ToggleButton>
                            <ToggleButton onClick={() => {
                                showTableConfig(false)
                                setItemsPerPage(20)
                                setPage(1)
                            }}
                            >
                                <SvgIcon>
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
                                        20
                                    </text>
                                </SvgIcon>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Collapse>


                    <Collapse orientation='horizontal' in={nButtons} sx={{ marginLeft: '48px', position: 'fixed', marginTop: '47px' }}>
                        <ToggleButtonGroup orientation='horizontal'>
                            {nLevel != 'n1' ? <ToggleButton onClick={() => nHandler('n1')}><LooksOne /></ToggleButton> : null}
                            {nLevel != 'n2' ? <ToggleButton onClick={() => nHandler('n2')}><LooksTwo /></ToggleButton> : null}
                            {nLevel != 'n3' ? <ToggleButton onClick={() => nHandler('n3')}><Looks3 /></ToggleButton> : null}
                            {nLevel != 'n4' ? <ToggleButton onClick={() => nHandler('n4')}><Looks4 /></ToggleButton> : null}
                            {nLevel != 'n5' ? <ToggleButton onClick={() => nHandler('n5')}><Looks5 /></ToggleButton> : null}
                        </ToggleButtonGroup>
                    </Collapse>

                </Box>

                <Box sx={{
                    width: '34%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}>

                    {(tableLoading) ?
                        <Box sx={{ height: '100%', width: '100%' }}>
                            <Skeleton
                                height={200}
                                sx={{ width: '100%' }}
                                animation='wave'
                            >
                            </Skeleton>
                            <LinearProgress />
                        </Box>

                        :
                        <>
                            <Box sx={{ paddingTop: '30px', paddingBottom: '33px' }}>
                                <Stack spacing={2}>
                                    <Pagination siblingCount={2} page={page} onChange={handleChange} count={maxPages} showFirstButton showLastButton></Pagination>
                                </Stack>
                            </Box>

                            {nLevel === quizStateN && quizStateType == 'AllUnknown' ?
                                <Box>
                                    <Alert severity='info'>{quizStateN.toUpperCase()}の知らない全てクイズ中だから語彙テーブルを変更できません</Alert>
                                </Box>
                                : null
                            }

                            <Box sx={{ width: '100%' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: '5%', padding: '0' }} />
                                            <TableCell sx={{ width: '5%', padding: '0' }} />
                                            <TableCell sx={{ textAlign: 'center', width: 'auto' }}>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {vocabularyData.map((x, index) => (
                                            <React.Fragment key={x.slug}>
                                                <TableRow key={x.slug}>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label='expand row'
                                                            size='small'
                                                            onClick={() => setOpen(prevOpen =>
                                                                prevOpen.includes(index) ? prevOpen.filter(x => x != index) : [...prevOpen, index]
                                                            )}>
                                                            {open.includes(index) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={knownWords[nLevel].includes(x.slug)}
                                                            onChange={() => handleKnownUpdate(x.slug, nLevel)}
                                                            disabled={lockTable}
                                                        >
                                                        </Checkbox>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {x.slug}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={3}>
                                                        <Collapse in={open.includes(index)}>
                                                            <Box>
                                                                {[...new Set(x.japanese.map(y => y.word))].map((z, index) => (
                                                                    <Typography key={index}>{z}</Typography>
                                                                ))}
                                                                <Typography>Reading</Typography>
                                                                {[...new Set(x.japanese.map(y => y.reading))].map((a, index) => (
                                                                    <Typography key={index}>{a}</Typography>
                                                                ))}
                                                                <Typography>Meaning</Typography>
                                                                {x.senses.filter(c => !c.parts_of_speech?.includes('Place') && !c.parts_of_speech?.includes('Wikipedia definition'))
                                                                    .map((c, index) => (
                                                                        <div key={index}>
                                                                            <Typography>
                                                                                {c.parts_of_speech.join(", ")}
                                                                            </Typography>
                                                                            <Typography>
                                                                                {c.english_definitions.join(", ")}
                                                                            </Typography>
                                                                        </div>
                                                                    ))}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </>
                    }
                </Box>

                <Box sx={{ width: '33%' }}></Box>
            </Box>
        </>
    )
}

export default Vocabtable
