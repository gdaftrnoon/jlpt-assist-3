'use client'
import { Box, Button, Card, ClickAwayListener, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fade, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import Zoom from '@mui/material/Zoom';
import { CheckBoxOutlineBlank, DeleteForever, DoneAll, Expand, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Stairs, UnfoldLess } from '@mui/icons-material';

const Vocabtable = ( {fileCount} ) => {

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

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(`vocab/${nLevel}/${nLevel}_page${page}.json`)
            const vocabulary = await response.json()
            setVocabularyData(vocabulary.data)
            console.log(vocabulary.data)
            console.log()
        }

        fetchData()

    }, [page, nLevel])

    const handleChange = (e, p) => {
        setPage(p)
        setOpen([])
        setExpanded(false)
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

    return (
        <>

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>

                <Box sx={{
                    display: 'flex',
                    width: '33%',
                    height: '33%',
                    justifyContent: 'left',
                    marginTop: '20vh'
                }}>
                    <ToggleButtonGroup orientation='vertical' sx={{ position: 'fixed' }}>

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

                    <Collapse orientation='horizontal' in={nButtons} sx={{ marginLeft: '48px', position: 'fixed' }}>
                        <ToggleButtonGroup orientation='horizontal'>
                            {nLevel != 'n1' ? <ToggleButton onClick={() => nHandler('n1')}><LooksOne /></ToggleButton> : null}
                            {nLevel != 'n2' ? <ToggleButton onClick={() => nHandler('n2')}><LooksTwo /></ToggleButton> : null}
                            {nLevel != 'n3' ? <ToggleButton onClick={() => nHandler('n3')}><Looks3 /></ToggleButton> : null}
                            {nLevel != 'n4' ? <ToggleButton onClick={() => nHandler('n4')}><Looks4 /></ToggleButton> : null}
                            {nLevel != 'n5' ? <ToggleButton onClick={() => nHandler('n5')}><Looks5 /></ToggleButton> : null}
                        </ToggleButtonGroup>
                    </Collapse>

                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '34%' }}>
                    <Box sx={{ paddingTop: '30px', paddingBottom: '33px' }}>
                        <Stack spacing={2}>
                            <Pagination siblingCount={2} page={page} onChange={handleChange} count={fileCount[nLevel]} showFirstButton showLastButton></Pagination>
                        </Stack>
                    </Box>

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
                                                    onChange={() => handleKnownUpdate(x.slug, nLevel)}>
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

                </Box>
                <Box sx={{ width: '33%' }}></Box>
            </Box>
        </>
    )
}

export default Vocabtable
