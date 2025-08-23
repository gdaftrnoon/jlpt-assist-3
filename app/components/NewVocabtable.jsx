'use client'
import { SvgIcon, Alert, Box, Button, Card, ClickAwayListener, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fade, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Tooltip, Typography, Skeleton, LinearProgress, CardContent, CircularProgress, TextField, Container, List, ListItemButton, ListItemText, ListItem } from '@mui/material'
import React, { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import Zoom from '@mui/material/Zoom';
import { CheckBoxOutlineBlank, DeleteForever, DoneAll, Expand, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Stairs, UnfoldLess } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import { useSession } from 'next-auth/react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { convertToObject } from 'typescript';
import { checkboxClasses } from "@mui/material/Checkbox";


const NewVocabTable = () => {

    // getting user session if it exists
    const { data: session, status } = useSession()
    const userid = session?.user?.userId

    const fileCount = {
        'n1': 172,
        'n2': 91,
        'n3': 89,
        'n4': 29,
        'n5': 3,
    }

    // holds all fetched page data pre-slicing
    const [tableData, setTableData] = useState([])

    // state holding data shown in table post-slicing
    const [vocabularyData, setVocabularyData] = useState([])

    // state tracking which cards are open
    const [open, setOpen] = useState([])

    // state managing pagination
    const [page, setPage] = useState(1)

    // state managing table n level
    const [nLevel, setNLevel] = useState('n1')

    // state determining whether all cards are open/closed
    const [isExpanded, setExpanded] = useState(false)

    // state to determine whether the "untick all boxes" warning is shown
    const [openWarning, setOpenWarning] = useState(false)

    // const to hold all slugs, could be useful
    const [allSlugs, setAllSlugs] = useState([])

    // state to hold user's known word ids
    const [userKnownWordIds, setUserKnownWordIds] = useState([])

    // state to hold user's known slugs
    const [knownSlugs, setKnownSlugs] = useState([])

    // state to manage whether side n buttons are shown
    const [nButtons, showNbuttons] = useState(false)

    // state to manage whether side pagination buttons are shown
    const [tableConfig, showTableConfig] = useState(false)

    // state to manage how pages are sliced
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // state to manage max pages, initialised with max pages for n1
    const [maxPages, setMaxPages] = useState(172)

    // state to manage table loading ui display
    const [tableLoading, setTableLoading] = useState(true)

    // state to manage whether the vocab search tool is shown
    const [showSearch, toggleShowSearch] = useState(false)

    // state to hold search field text/number
    const [searchQuery, setSearchQuery] = useState('')

    const [initialPackage, setInitialPackage] = useState({})

    // state to keep track of checkbox changes for submission to db
    const [slugChanges, setSlugChanges] = useState({})

    // function handling n level change
    const nHandler = (level) => {
        setNLevel(level)
        setPage(1)
        showNbuttons(false)
        setOpen([])
    }

    // function handling page change
    const handleChange = (e, p) => {
        setPage(p)
        setOpen([])
        setExpanded(false)
        adjustTable(p, itemsPerPage)
    }

    // function for word/page number search

    const tableQuery = (searchQuery) => {
        if (
            Number.isInteger(Number(searchQuery)) &&
            Number(searchQuery) > 0 &&
            Number(searchQuery) <= maxPages
        ) {
            handleChange(null, Number(searchQuery))
        }

        else if (searchQuery != '') {
            const searchIndex = allSlugs.indexOf(String(searchQuery)) + 1
            console.log(searchIndex)
            const searchQueryPage = Math.ceil(Number(searchIndex) / Number(itemsPerPage))
            console.log(searchQueryPage)
            handleChange(null, Number(searchQueryPage))
        }
    }


    // function to retrieve all word ids within user's vocab db
    const getUserVocab = async () => {

        if (session) {
            const response = await fetch('/api/GetUserVocab', {
                method: 'POST',
                body: JSON.stringify({ message: userid })
            })

            const data = await response.json()
            const knownWordIds = data.message.map(a => Number(a.word_id))
            setUserKnownWordIds(knownWordIds)
            console.log('user known word ids', knownWordIds)

        }
    }

    // function to fetch all table data, sliced data saved into vocabData, all data saved to tableData
    async function fetchAllData(nLevel, page, itemsPerPage) {

        // get all pages from n level
        const allPages = []
        for (let index = 1; index <= fileCount[nLevel]; index++) {
            const response = await fetch(`vocab/${nLevel}/${nLevel}_page${index}.json`)
            const responseJson = await response.json()
            allPages.push(responseJson)
        }

        const flatPages = allPages.flatMap(x => x)
        setTableData(flatPages)

        console.log('table data', flatPages)

        const tableSlugs = flatPages.map(x => x.slug)
        setAllSlugs(tableSlugs)

        console.log('table slugs', tableSlugs)

        // calculate max number of pages
        const slugCount = flatPages.length
        const maxPages = Math.ceil(slugCount / itemsPerPage)
        setMaxPages(maxPages)

        // slice data based on items per page and page number
        const slicedPages = flatPages.slice((page - 1) * itemsPerPage, Math.min(itemsPerPage * page, slugCount))
        setVocabularyData(slicedPages)

        console.log('vocab data', slicedPages)

    }

    // get user known words according to known ids
    const getKnownSlugs = () => {

        const knownWords = tableData.filter((word) => (
            userKnownWordIds.includes(Number(word.id))
        ))

        const userKnownSlugs = knownWords.map(x => x.slug)
        setKnownSlugs(userKnownSlugs)

        console.log('known slugs', userKnownSlugs)

    }

    // set the initial package and comparison package
    const setComparators = () => {

        const knownWords = vocabularyData.filter((word) => (
            userKnownWordIds.includes(Number(word.id))
        ))

        const userKnownSlugs = knownWords.map(x => x.slug)

        const initialSlugObject = {}

        vocabularyData.forEach(x => (
            userKnownSlugs.includes(x.slug) ?
                initialSlugObject[x.slug] = true :
                initialSlugObject[x.slug] = false
        ))

        setInitialPackage(initialSlugObject) // an original we can compare against
        setSlugChanges(initialSlugObject) // the updated package

    }

    // function to refresh vocab table with user changes
    const fullRefresh = () => {

        setTableLoading(true)

        getUserVocab().finally(
            () => fetchAllData(nLevel, page, itemsPerPage))

        setTableLoading(false)
    }

    // adjusting table for items per page change
    async function adjustTable(page, itemsPerPage) {

        // calculate max number of pages
        const slugCount = tableData.length
        const maxPages = Math.ceil(slugCount / itemsPerPage)
        setMaxPages(maxPages)

        // slice data based on items per page and page number
        const slicedPages = tableData.slice((page - 1) * itemsPerPage, Math.min(itemsPerPage * page, slugCount))
        setVocabularyData(slicedPages)

    }

    // to update slug changes object whenever a checkbox is ticked
    const updatePackage = (boxSlug) => {
        setSlugChanges({
            ...slugChanges,
            [boxSlug]: !slugChanges[boxSlug]
        })
        console.log('this is the change', slugChanges)
    }

    // when tick all option is chosen, set all values in slugchanges to be true
    const tickAll = () => {

        const allTrueSlugChanges = {}

        Object.keys(slugChanges).forEach(slug =>
            allTrueSlugChanges[slug] = true
        )

        setSlugChanges(allTrueSlugChanges)

    }

    // UE when table data or user known words changes, recalculate the comparators
    useEffect(() => {
        getKnownSlugs()
        setComparators()
        setTableLoading(false)
    }, [tableData, userKnownWordIds, vocabularyData])

    // UE1 use effect to handle page table adjustment post slicing option change 
    useEffect(() => {
        adjustTable(page, itemsPerPage)
        setComparators() // set new inital and changed packages for user
        setPage(1)
    }, [itemsPerPage])

    // UE2 when n level changes, fetch all data and display, tabledata and vocabdata states get changed
    useEffect(() => {
        if (status === "loading") return

        if (status === 'unauthenticated') {
            fetchAllData(nLevel, page, itemsPerPage).finally(() => {
                setTableLoading(false)
            })
        }

        if (status === 'authenticated') {
            fullRefresh()
        }

    }, [nLevel, status])

    // UE3 when page changes, set new comparator, adjust table but do not set page to 1
    useEffect(() => {
        adjustTable(page, itemsPerPage)
        setComparators() // set new inital and changed packages for user
    }, [page])

    const sendChanges = async () => {

        const vocabTableIds = vocabularyData.map(x => x.id)

        const toSend = { usersid: userid, initial: initialPackage, changes: slugChanges, ids: vocabTableIds }
        console.log("tosend", toSend)
        const resp = await fetch('/api/SubmitVocabData',
            {
                method: 'POST',
                body: JSON.stringify(toSend)
            }
        )

        const result = await resp.json()

        console.log(result)

        fullRefresh()

    }

    // logs for testing
    // useEffect(() => {
    //     console.log('vocabdata', vocabularyData)
    //     console.log('ukwid', userKnownWordIds)
    // }, [page])

    // desktop layout
    //   <>

    //     <Box sx={{ display: 'flex', marginTop: '0px' }}>

    //         <Box sx={{
    //             display: 'flex',
    //             width: '33%',
    //             height: '100%',
    //             justifyContent: 'left',
    //             paddingTop: '300px'
    //         }}>
    //             <ToggleButtonGroup orientation='vertical' sx={{ position: 'fixed' }}>

    //                 <Tooltip
    //                     title='項目数'
    //                     slots={{ transition: Zoom }}
    //                     slotProps={{
    //                         popper: {
    //                             modifiers: [
    //                                 {
    //                                     name: 'offset',
    //                                     options: {
    //                                         offset: [68, -92],
    //                                     },
    //                                 },
    //                             ],
    //                         },
    //                     }}
    //                 >
    //                     <ToggleButton
    //                         onChange={(e) => showTableConfig(!tableConfig)}
    //                     >
    //                         <ArticleIcon />
    //                     </ToggleButton>
    //                 </Tooltip>

    //                 <Tooltip
    //                     title='JLPTレベル'
    //                     slots={{ transition: Zoom }}
    //                     slotProps={{
    //                         popper: {
    //                             modifiers: [
    //                                 {
    //                                     name: 'offset',
    //                                     options: {
    //                                         offset: [68, -9],
    //                                     },
    //                                 },
    //                             ],
    //                         },
    //                     }}
    //                 >
    //                     <ToggleButton
    //                         onChange={(e) => showNbuttons(!nButtons)}>
    //                         {
    //                             nLevel === 'n1' ? <LooksOne /> :
    //                                 nLevel === 'n2' ? <LooksTwo /> :
    //                                     nLevel === 'n3' ? <Looks3 /> :
    //                                         nLevel === 'n4' ? <Looks4 /> :
    //                                             nLevel === 'n5' ? <Looks5 /> :
    //                                                 null}
    //                     </ToggleButton>
    //                 </Tooltip>

    //                 {isExpanded ?
    //                     <Tooltip placement='right' title='すべて非表示' slots={{ transition: Zoom }} arrow>
    //                         <ToggleButton
    //                             onChange={(e) => collapseAll()}>
    //                             <UnfoldLess />
    //                         </ToggleButton>
    //                     </Tooltip>

    //                     :
    //                     <Tooltip placement='right' title='すべて表示' slots={{ transition: Zoom }} arrow>
    //                         <ToggleButton
    //                             onChange={(e) => expandAll()}>
    //                             <Expand />
    //                         </ToggleButton>
    //                     </Tooltip>

    //                 }

    //                 <Tooltip placement='right' title='すべて選択' slots={{ transition: Zoom }} arrow>
    //                     <ToggleButton>
    //                         <CheckBoxOutlineBlank />
    //                     </ToggleButton>
    //                 </Tooltip>

    //                 <Tooltip placement='right' title='すべてのチェックを外す' slots={{ transition: Zoom }} arrow>
    //                     <ToggleButton onClick={() => setOpenWarning(true)}>
    //                         <DeleteForever />
    //                     </ToggleButton>
    //                 </Tooltip>
    //                 <Dialog
    //                     open={openWarning}
    //                     onClose={() => setOpenWarning(false)}
    //                 >
    //                     <DialogTitle>
    //                         {'Are you sure you want to reset every checkbox?'}
    //                     </DialogTitle>
    //                     <DialogContent>
    //                         Selecting this option will uncheck every checkbox across every page, there is no way to undo this process.
    //                     </DialogContent>
    //                     <DialogActions>
    //                         <Button onClick={() => setOpenWarning(false)}>Cancel</Button>
    //                         <Button onClick={() => untickAll(nLevel)}>Reset Checkboxes</Button>
    //                     </DialogActions>
    //                 </Dialog>

    //                 <Tooltip
    //                     title='検索'
    //                     slots={{ transition: Zoom }}
    //                     slotProps={{
    //                         popper: {
    //                             modifiers: [
    //                                 {
    //                                     name: 'offset',
    //                                     options: {
    //                                         offset: [50, -92],
    //                                     },
    //                                 },
    //                             ],
    //                         },
    //                     }}
    //                 >
    //                     <ToggleButton onClick={() => toggleShowSearch(prev => !prev)}>
    //                         <ManageSearchIcon />
    //                     </ToggleButton>
    //                 </Tooltip>

    //             </ToggleButtonGroup>

    //             <Collapse orientation='horizontal' in={tableConfig} sx={{ marginLeft: '48px', position: 'fixed' }}>
    //                 <ToggleButtonGroup orientation='horizontal'>
    //                     <ToggleButton onClick={() => {
    //                         showTableConfig(false)
    //                         setItemsPerPage(5)
    //                     }}
    //                     >
    //                         <SvgIcon>
    //                             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
    //                                 5
    //                             </text>
    //                         </SvgIcon>
    //                     </ToggleButton>
    //                     <ToggleButton onClick={() => {
    //                         showTableConfig(false)
    //                         setItemsPerPage(10)
    //                         setPage(1)
    //                     }}
    //                     >
    //                         <SvgIcon>
    //                             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
    //                                 10
    //                             </text>
    //                         </SvgIcon>
    //                     </ToggleButton>
    //                     <ToggleButton onClick={() => {
    //                         showTableConfig(false)
    //                         setItemsPerPage(15)
    //                         setPage(1)
    //                     }}
    //                     >
    //                         <SvgIcon>
    //                             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
    //                                 15
    //                             </text>
    //                         </SvgIcon>
    //                     </ToggleButton>
    //                     <ToggleButton onClick={() => {
    //                         showTableConfig(false)
    //                         setItemsPerPage(20)
    //                         setPage(1)
    //                     }}
    //                     >
    //                         <SvgIcon>
    //                             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16">
    //                                 20
    //                             </text>
    //                         </SvgIcon>
    //                     </ToggleButton>
    //                 </ToggleButtonGroup>
    //             </Collapse>


    //             <Collapse orientation='horizontal' in={nButtons} sx={{ marginLeft: '48px', position: 'fixed', marginTop: '47px' }}>
    //                 <ToggleButtonGroup orientation='horizontal'>
    //                     {nLevel != 'n1' ? <ToggleButton onClick={() => nHandler('n1')}><LooksOne /></ToggleButton> : null}
    //                     {nLevel != 'n2' ? <ToggleButton onClick={() => nHandler('n2')}><LooksTwo /></ToggleButton> : null}
    //                     {nLevel != 'n3' ? <ToggleButton onClick={() => nHandler('n3')}><Looks3 /></ToggleButton> : null}
    //                     {nLevel != 'n4' ? <ToggleButton onClick={() => nHandler('n4')}><Looks4 /></ToggleButton> : null}
    //                     {nLevel != 'n5' ? <ToggleButton onClick={() => nHandler('n5')}><Looks5 /></ToggleButton> : null}
    //                 </ToggleButtonGroup>
    //             </Collapse>

    //             <Collapse orientation='horizontal' in={showSearch} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '55px', position: 'fixed', marginTop: '227px' }}>

    //                 <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', width: 300, height: 65 }}>
    //                     <TextField
    //                         label="単語 / ページ番号"
    //                         size="small"
    //                         sx={{ width: '155px' }}
    //                         value={searchQuery}
    //                         onChange={(e) => setSearchQuery(e.target.value)}
    //                     />

    //                     <IconButton onClick={() => tableQuery(searchQuery)} color='success' sx={{ marginTop: '5px', marginLeft: '7px', border: 1 }} size="small">
    //                         <CheckIcon fontSize="inherit" />
    //                     </IconButton>

    //                     <IconButton onClick={() => setSearchQuery('')} color='error' sx={{ marginTop: '5px', marginLeft: '7px', border: 1 }} size="small">
    //                         <ClearIcon fontSize="inherit" />
    //                     </IconButton>
    //                 </Box>

    //             </Collapse>

    //         </Box>

    //         <Box sx={{
    //             width: '34%',
    //             height: '100%',
    //             display: 'flex',
    //             flexDirection: 'column',
    //             alignItems: 'center',
    //             justifyContent: 'flex-start',
    //             paddingTop: 6,
    //             marginBottom: 10
    //         }}>

    //             {(tableLoading) ?

    //                 <Card sx={{ marginTop: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //                     <CardContent sx={{ display: 'flex', gap: '20px', flexDirection: 'row' }}>
    //                         <Typography variant='h5'>データを読み込み中…</Typography>
    //                     </CardContent>
    //                 </Card>

    //                 :
    //                 <>
    //                     <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px', paddingTop: '30px', paddingBottom: '33px', alignItems: 'center', justifyContent: 'center' }}>
    //                         <Pagination color="error" siblingCount={2} page={page} onChange={handleChange} count={maxPages} showFirstButton showLastButton></Pagination>
    //                         <Button variant='contained' color='error'>変更を保存</Button>
    //                     </Box>

    //                     <Box sx={{ width: '100%' }}>
    //                         <Table>
    //                             <TableHead>
    //                                 <TableRow>
    //                                     <TableCell sx={{ width: '5%', padding: '0' }} />
    //                                     <TableCell sx={{ width: '5%', padding: '0' }} />
    //                                     <TableCell sx={{ textAlign: 'center', width: 'auto' }}>
    //                                     </TableCell>
    //                                 </TableRow>
    //                             </TableHead>
    //                             <TableBody>
    //                                 {vocabularyData.map((x, index) => (
    //                                     <React.Fragment key={x.slug}>
    //                                         <TableRow key={x.slug}>
    //                                             <TableCell>
    //                                                 <IconButton
    //                                                     aria-label='expand row'
    //                                                     size='small'
    //                                                     onClick={() => setOpen(prevOpen =>
    //                                                         prevOpen.includes(index) ? prevOpen.filter(x => x != index) : [...prevOpen, index]
    //                                                     )}>
    //                                                     {open.includes(index) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
    //                                                 </IconButton>
    //                                             </TableCell>
    //                                             <TableCell>
    //                                                 <Checkbox
    //                                                     defaultChecked={knownSlugs.includes(x.slug)}
    //                                                     color={(knownSlugs.includes(x.slug)) ? 'success' : 'primary'}
    //                                                 >
    //                                                 </Checkbox>
    //                                             </TableCell>
    //                                             <TableCell sx={{ textAlign: 'center', fontWeight: searchQuery === x.slug ? 'bold' : 'normal' }}>
    //                                                 {x.slug}
    //                                             </TableCell>
    //                                         </TableRow>
    //                                         <TableRow>
    //                                             <TableCell colSpan={3}>
    //                                                 <Collapse in={open.includes(index)}>
    //                                                     <Box>
    //                                                         {[...new Set(x.japanese.map(y => y.word))].map((z, index) => (
    //                                                             <Typography key={index}>{z}</Typography>
    //                                                         ))}
    //                                                         <Typography>Reading</Typography>
    //                                                         {[...new Set(x.japanese.map(y => y.reading))].map((a, index) => (
    //                                                             <Typography key={index}>{a}</Typography>
    //                                                         ))}
    //                                                         <Typography>Meaning</Typography>
    //                                                         {x.senses.filter(c => !c.parts_of_speech?.includes('Place') && !c.parts_of_speech?.includes('Wikipedia definition'))
    //                                                             .map((c, index) => (
    //                                                                 <div key={index}>
    //                                                                     <Typography>
    //                                                                         {c.parts_of_speech.join(", ")}
    //                                                                     </Typography>
    //                                                                     <Typography>
    //                                                                         {c.english_definitions.join(", ")}
    //                                                                     </Typography>
    //                                                                 </div>
    //                                                             ))}
    //                                                     </Box>
    //                                                 </Collapse>
    //                                             </TableCell>
    //                                         </TableRow>
    //                                     </React.Fragment>
    //                                 ))}
    //                             </TableBody>
    //                         </Table>
    //                     </Box>
    //                 </>
    //             }
    //         </Box>

    //         <Box sx={{ width: '33%' }}></Box>
    //     </Box>
    // </>

    const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']
    const sliceArray = [5, 10, 15, 20, 25]

    // states for table option dialogs
    const [nLevelSelect, openNLevelSelect] = useState(false)
    const [sliceSelect, openSliceSelect] = useState(false)
    const [searchSelect, openSearchSelect] = useState(false)

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const query = formJson.query;
        tableQuery(query)
        openSearchSelect(false)
    }

    const NLevelDialog = () => (
        <Dialog open={nLevelSelect} onClose={() => openNLevelSelect(false)}>
            <DialogTitle variant='subtitle1'>
                JLPTレベルを選んでください
            </DialogTitle>
            <List sx={{ pt: 0 }}>
                {nLevelArray.map(x => (
                    <ListItem key={x}>
                        <ListItemButton onClick={() => {
                            nHandler(x)
                            openNLevelSelect(false)
                        }}>
                            <ListItemText sx={{ textAlign: 'center' }}>
                                {x.toUpperCase()}
                            </ListItemText>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    )

    const SliceDialog = () => (
        <Dialog open={sliceSelect} onClose={() => openSliceSelect(false)}>
            <DialogTitle variant='subtitle1'>
                カード何数を表示すればいい？
            </DialogTitle>
            <List sx={{ pt: 0 }}>
                {sliceArray.map(x => (
                    <ListItem key={x}>
                        <ListItemButton onClick={() => {
                            setItemsPerPage(x)
                            openSliceSelect(false)
                        }}>
                            <ListItemText sx={{ textAlign: 'center' }}>
                                {x}
                            </ListItemText>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    )

    const SearchDialog = () => (

        <Dialog open={searchSelect} onClose={() => openSearchSelect(false)}>
            <DialogTitle variant='subtitle1'>
                ページ番号や探索したい単語を入力してください
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSearchSubmit} id="search-form">
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="query"
                        label="ページ / 単語"
                        fullWidth
                        variant="standard"
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => openSearchSelect(false)}>Cancel</Button>
                <Button type="submit" form="search-form">
                    Search
                </Button>
            </DialogActions>
        </Dialog>
    )

    const InProgress = () => (
        <Container maxWidth='xl' sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Container>

    )

    const MobileLayout = () => (
        <Container maxWidth='xl' sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                <NLevelDialog />
                <SliceDialog />
                <SearchDialog />

                <Box sx={{ pt: 5 }}>
                    <ToggleButtonGroup>


                        <ToggleButton onClick={() => openNLevelSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                            <Stairs color='error' />
                        </ToggleButton>

                        <ToggleButton onClick={(() => openSliceSelect(true))} sx={{ borderColor: '#d32f2f' }}>
                            <ArticleIcon color='error' />
                        </ToggleButton>
                        <ToggleButton onClick={() => {
                            if (!isExpanded) {
                                const indexArray = vocabularyData.map((x, index) => index)
                                setOpen(indexArray)
                                setExpanded(true)
                            }
                            else {
                                setOpen([])
                                setExpanded(false)
                            }
                        }}
                            sx={{ borderColor: '#d32f2f' }}>
                            {isExpanded ?
                                <UnfoldLess color='error' /> :
                                <Expand color='error' />
                            }
                        </ToggleButton>

                        <ToggleButton onClick={() => tickAll()} sx={{ borderColor: '#d32f2f' }}>
                            <DoneAll color='error' />
                        </ToggleButton>

                        <ToggleButton onClick={() => openSearchSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                            <ManageSearchIcon color='error' />
                        </ToggleButton>

                        <ToggleButton sx={{ borderColor: '#d32f2f' }}>
                            <DeleteForever color='error' />
                        </ToggleButton>

                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button
                        onClick={() => sendChanges()}
                        disabled={JSON.stringify(initialPackage) === JSON.stringify(slugChanges)}
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            borderRadius: '12px',
                            px: 2,
                            py: 1
                        }}

                    >
                        変更を保存
                    </Button>
                </Box>

                <Box sx={{ pt: 3 }}>
                    <Pagination color="error" siblingCount={0} page={page} onChange={handleChange} count={maxPages}></Pagination>
                </Box>



                <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6, borderRadius: '16px', mb: 6 }}>
                    <Table>
                        <TableBody>
                            {vocabularyData.map((x, index) => (
                                <React.Fragment key={x.slug}>
                                    <TableRow key={`toprow-${x.slug}`}>

                                        <TableCell sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                            <IconButton onClick={() => open.includes(index) ? setOpen(prev => prev.filter(x => x != index)) : setOpen([...open, index])}>
                                                {open.includes(index) ?
                                                    <KeyboardArrowUpIcon /> :
                                                    <KeyboardArrowDownIcon />
                                                }
                                            </IconButton>
                                        </TableCell>

                                        <TableCell sx={{ width: '1%', padding: 0 }}>
                                            <Checkbox
                                                color={(knownSlugs.includes(x.slug)) ? 'success' : 'primary'}
                                                onClick={() => updatePackage(x.slug)}
                                                checked={slugChanges[x.slug] === true}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ width: '98%', textAlign: 'center', pr: 9, fontSize: '1rem', fontWeight: 'bold' }}>
                                            {x.slug}
                                        </TableCell>

                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                            <Collapse in={open.includes(index) ? true : false}>
                                                <Box sx={{ paddingY: 2 }}>
                                                    {[...new Set(x.japanese.map(y => y.word))].map((z, zindex) => (
                                                        <Typography key={zindex} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{z}</Typography>
                                                    ))}
                                                    <Typography sx={{ color: '#ef5350', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>読み方</Typography>
                                                    {[...new Set(x.japanese.map(y => y.reading))].map((a, aindex) => (
                                                        <Typography key={aindex} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{a}</Typography>
                                                    ))}
                                                    <Typography sx={{ color: '#ef5350', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>意味</Typography>
                                                    {x.senses.filter(c => !c.parts_of_speech?.includes('Place') && !c.parts_of_speech?.includes('Wikipedia definition'))
                                                        .map((c, cindex) => (
                                                            <Box key={cindex}>
                                                                <Typography key={`pos-${cindex}`} sx={{ color: 'grey', fontSize: '1rem' }}>{c.parts_of_speech.join(", ")}</Typography>
                                                                <Typography key={`ed-${cindex}`} sx={{ fontSize: '1rem' }}>{c.english_definitions.join(", ")}</Typography>
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

            </Box>
        </Container>
    )


    return (
        tableLoading === true ? <InProgress /> :
            <MobileLayout />
    )
}

export default NewVocabTable
