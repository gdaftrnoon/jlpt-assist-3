'use client'
import { Box, Button, Card, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableRow, ToggleButton, ToggleButtonGroup, Typography, CircularProgress, TextField, Container, List, ListItemButton, ListItemText, ListItem, Alert, CardContent, Paper, DialogContentText, Skeleton, LinearProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import { DeleteForever, DoneAll, Expand, Info, Looks3, Looks4, Looks5, LooksOne, LooksTwo, Stairs, UnfoldLess } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import { useSession } from 'next-auth/react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { redirect } from 'next/navigation'

const NewVocabTable = () => {

    const MobileLayout = () => {


        ///////////////////////////////////////// STATES + CONSTS ///////////////////////////////////////////////


        // state for intro page
        const [introDialog, toggleIntroDialog] = useState(false)

        // getting user session if it exists
        const { data: session, status } = useSession()
        const userid = session?.user?.userId

        // for dialog selection
        const nLevelArray = ['n1', 'n2', 'n3', 'n4', 'n5']
        const sliceArray = [5, 10, 15, 20, 25]

        const fileCount = {
            'n1': 172,
            'n2': 91,
            'n3': 89,
            'n4': 29,
            'n5': 1,
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

        // const to hold all slugs, could be useful
        const [allSlugs, setAllSlugs] = useState([])

        // state to hold user's known word ids
        const [userKnownWordIds, setUserKnownWordIds] = useState([])

        // state to hold user's known slugs
        const [knownSlugs, setKnownSlugs] = useState([])

        // state to manage how pages are sliced
        const [itemsPerPage, setItemsPerPage] = useState(10)

        // state to manage max pages, initialised with max pages for n1
        const [maxPages, setMaxPages] = useState(172)

        const [initialPackage, setInitialPackage] = useState({})

        // state to keep track of checkbox changes for submission to db
        const [slugChanges, setSlugChanges] = useState({})

        // states for table option dialogs
        const [nLevelSelect, openNLevelSelect] = useState(false)
        const [sliceSelect, openSliceSelect] = useState(false)
        const [searchSelect, openSearchSelect] = useState(false)
        const [untickAllSelect, openUntickAllSelect] = useState(false)

        // state for holding api response message
        const [apiMsg, setApiMsg] = useState('')

        // state for api response shown/not show
        const [apiResp, showApiResp] = useState(false)

        // state to show table
        const [showTable, toggleShowTable] = useState(false)

        // don't show again intro checkbox
        const [introCheckbox, setIntroCheckbox] = useState(false)

        const [tableLoading, setTableLoading] = useState(true)

        const [disableSubmit, setDisableSubmit] = useState(false)

        ///////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////


        // function handling n level change
        const nHandler = (level) => {
            setTableLoading(true)
            setNLevel(level)
            setPage(1)
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
                const searchQueryPage = Math.ceil(Number(searchIndex) / Number(itemsPerPage))
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
                console.log('heres our resp', data)

                // if error, show error message
                if (!response.ok) {
                    toggleIntroDialog(false)
                    toggleShowTable(false)
                    setApiMsg(data.message)
                    showApiResp(true)
                    setTimeout(() => {
                        redirect('/')
                    }, 2000)
                }

                if (response.ok && data) {
                    const knownWordIds = data.message.map(a => Number(a.word_id))
                    setUserKnownWordIds(knownWordIds)
                }
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

            const tableSlugs = flatPages.map(x => x.slug)
            setAllSlugs(tableSlugs)

            // calculate max number of pages
            const slugCount = flatPages.length
            const maxPages = Math.ceil(slugCount / itemsPerPage)
            setMaxPages(maxPages)

            // slice data based on items per page and page number
            const slicedPages = flatPages.slice((page - 1) * itemsPerPage, Math.min(itemsPerPage * page, slugCount))
            setVocabularyData(slicedPages)
        }

        // get user known words according to known ids
        const getKnownSlugs = () => {

            if (session) {

                const knownWords = tableData.filter((word) => (
                    userKnownWordIds.includes(Number(word.id))
                ))

                const userKnownSlugs = knownWords.map(x => x.slug)
                setKnownSlugs(userKnownSlugs)
            }
        }

        // set the initial package and comparison package
        const setComparators = () => {

            if (session) {

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

        }

        // when tick all option is chosen, set all values in slugchanges to be true
        const tickAll = () => {

            const allTrueSlugChanges = {}

            Object.keys(slugChanges).forEach(slug =>
                allTrueSlugChanges[slug] = true
            )

            setSlugChanges(allTrueSlugChanges)

        }

        // untick all on PAGE option is chosen, set all values in slugchanges to be true
        const untickAllPage = () => {

            const allFalseSlugChanges = {}

            Object.keys(slugChanges).forEach(slug =>
                allFalseSlugChanges[slug] = false
            )

            setSlugChanges(allFalseSlugChanges)

        }

        // when tick all FOR ENTIRE LEVEL option is chosen, set all values in slugchanges to be true
        const untickAll = async () => {

            openUntickAllSelect(false)

            const knownSlugsSet = new Set(knownSlugs)
            const knownSlugsOnLevel = allSlugs.filter(x => knownSlugsSet.has(x))
            const knownSlugsOnLevelSet = new Set(knownSlugsOnLevel)

            const knownObjectsOnLevel = (tableData.filter(x => knownSlugsOnLevelSet.has(x.slug)))



            const allFalseSlugChanges = {}

            const allTrueSlugs = {}

            knownSlugsOnLevel.forEach(slug =>
                allFalseSlugChanges[slug] = false
            )

            knownSlugsOnLevel.forEach(slug =>
                allTrueSlugs[slug] = true
            )

            setInitialPackage(allTrueSlugs)
            setSlugChanges(allFalseSlugChanges)

            const vocabTableIds = knownObjectsOnLevel.map(x => x.id)

            const toSend = { usersid: userid, initial: allTrueSlugs, changes: allFalseSlugChanges, ids: vocabTableIds }

            const resp = await fetch('/api/SubmitVocabData',
                {
                    method: 'POST',
                    body: JSON.stringify(toSend)
                }
            )

            const result = await resp.json()

            getUserVocab().finally(
                () => fetchAllData(nLevel, page, itemsPerPage))

        }

        // sending vocab data to db
        const sendChanges = async () => {

            if (session) {

                const vocabTableIds = vocabularyData.map(x => x.id)

                const toSend = { initial: initialPackage, changes: slugChanges, ids: vocabTableIds }

                const resp = await fetch('/api/SubmitVocabData',
                    {
                        method: 'POST',
                        body: JSON.stringify(toSend)
                    }
                )

                const result = await resp.json()

                console.log(result.message)

                getUserVocab()

            }
        }

        // handling table search function
        const handleSearchSubmit = (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const query = formJson.query;
            tableQuery(query)
            openSearchSelect(false)
        }

        // checkbox don't show again
        const changeCheckbox = (introCheckbox) => {
            if (introCheckbox === false) {
                setIntroCheckbox(true)
                localStorage.setItem('vtintroCheckbox', true)
            }
            else {
                setIntroCheckbox(false)
                localStorage.setItem('vtintroCheckbox', false)
            }
        }


        ///////////////////////////////////////// EFFECTS ///////////////////////////////////////////////

        // UEA gets user vocab and fetches default table data, TRIGGERS UEB
        useEffect(() => {

            if (status === "loading") return

            if (status === 'unauthenticated') {
                fetchAllData(nLevel, page, itemsPerPage)
                console.log('status', status)
            }

            if (status === 'authenticated')

                getUserVocab().finally(
                    () => {
                        fetchAllData(nLevel, page, itemsPerPage)
                    })

        }, [status])

        // UEB when table data or user known words changes, recalculate the comparators
        useEffect(() => {
            if (status === 'authenticated') {
                getKnownSlugs() // matches word ids to word slugs
                setComparators() // sets initial and change package depending on vocab data
                setTimeout(() => setTableLoading(false), 1000)
                setDisableSubmit(false)
            }
            if (status === 'unauthenticated') {
                setTableLoading(false)
            }
        }, [tableData, userKnownWordIds, vocabularyData])

        // UEC handle table change after slice change, TRIGGERS UEB 
        useEffect(() => {
            adjustTable(page, itemsPerPage)
            setPage(1)
        }, [itemsPerPage])

        // UED fetch data upon N Level change, triggers UEB
        useEffect(() => {
            if (status === 'loading') {
                return
            }

            if (status === 'unauthenticated') {
                fetchAllData(nLevel, page, itemsPerPage).then(() =>
                    setTableLoading(false)
                )
            }
            if (status === 'authenticated') {
                setDisableSubmit(true)
                fetchAllData(nLevel, page, itemsPerPage)
            }
        }, [nLevel])

        // logs for testing
        useEffect(() => {
            console.log("slugchanges", slugChanges)

        }, [page,])

        useEffect(() => {
            if (localStorage.getItem('vtintroCheckbox')) { // if ls item exists
                const stored = JSON.parse(localStorage.getItem('vtintroCheckbox'))
                setIntroCheckbox(stored) // set check to value 
                toggleIntroDialog(!stored) // if checked -> don't show, if not checked -> show 
            }
            else {
                toggleIntroDialog(true)
            }
        }, [])


        ///////////////////////////////////////// DIALOGS ///////////////////////////////////////////////


        const NLevelDialog = () => (
            <Dialog open={nLevelSelect} onClose={() => openNLevelSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    JLPTレベルを選んでください
                </DialogTitle>
                <List sx={{ pt: 0 }}>
                    {nLevelArray.map(x => (
                        <ListItem key={x}>
                            <ListItemButton onClick={() => {
                                if (nLevel != x) {
                                    nHandler(x)
                                    openNLevelSelect(false)
                                }
                                else {
                                    openNLevelSelect(false)
                                }
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
                    ページ番号や単語を入力してください
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
                    <Button onClick={() => openSearchSelect(false)}>キャンセル</Button>
                    <Button type="submit" form="search-form">
                        探索
                    </Button>
                </DialogActions>
            </Dialog>
        )

        const UntickAllDialog = () => (
            <Dialog open={untickAllSelect} onClose={() => openUntickAllSelect(false)}>
                <DialogTitle variant='subtitle1'>
                    {nLevel.toUpperCase()}レベルの全データを削除する？
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        削除すると後戻りはできません
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openUntickAllSelect(false)}>戻る</Button>
                    <Button onClick={() => untickAll()}>削除</Button>
                </DialogActions>
            </Dialog>
        )

        const TableLoadingSkeleton = () => (
            <>
                <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6, borderRadius: '16px', mb: 6, minWidth: 343 }}>
                    <Table>
                        <TableBody>

                            {Array.from(Array(itemsPerPage).keys()).map((x, index) => (

                                <TableRow key={index}>
                                    <TableCell key={`A-${x}-${index}`} sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                        <IconButton>
                                            <KeyboardArrowDownIcon />
                                        </IconButton>
                                    </TableCell>

                                    <TableCell key={`B-${x}-${index}`} sx={{ width: '1%', padding: 0 }}>
                                        <Checkbox disabled />
                                    </TableCell>

                                    <TableCell key={`C-${x}-${index}`} sx={{ width: '98%', textAlign: 'center', pr: 9, fontSize: '1rem', fontWeight: 'bold' }}>
                                        <Skeleton animation="wave" variant="text" />
                                    </TableCell>
                                </TableRow>

                            ))}

                        </TableBody>
                    </Table>
                </Card>
            </>
        )

        return (
            <Container maxWidth='xl' sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'white' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    <Dialog open={introDialog}>
                        <DialogTitle sx={{ fontSize: '1.25rem', textAlign: 'center', mb: 1 }}>
                            文字語彙データの使い方
                        </DialogTitle>
                        <DialogContent>
                            <Box>
                                <Box>
                                    <Alert severity='error' sx={{ mb: 2 }}>
                                        ロッグインしてない方は機能を利用できません
                                    </Alert>
                                    <Alert severity='success' sx={{ mb: 2 }}>
                                        単語を知るとチェックを入力してください、ロッグインするとデータを保存できます
                                    </Alert>
                                </Box>
                                <Box>
                                    <Card>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <Stairs /><Typography sx={{ fontSize: '0.95rem' }}>Nレベルの選択</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <ArticleIcon /><Typography sx={{ fontSize: '0.95rem' }}>表示件数</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <Expand /><Typography sx={{ fontSize: '0.95rem' }}>詳細を展開</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <UnfoldLess /><Typography sx={{ fontSize: '0.95rem' }}>詳細を隠す</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <DoneAll /><Typography sx={{ fontSize: '0.95rem' }}>ページ全チェック</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <CheckBoxOutlineBlankRoundedIcon /><Typography sx={{ fontSize: '0.95rem' }}>ページ全解除</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <ManageSearchIcon /><Typography sx={{ fontSize: '0.95rem' }}>ページや単語を検索</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'left' }}>
                                                <DeleteForever /><Typography sx={{ fontSize: '0.95rem' }}>レベル全解除</Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Checkbox onClick={() => changeCheckbox(introCheckbox)} checked={introCheckbox} />
                                <Typography variant='subtitle1'>起動時に表示しない</Typography>
                            </Box>
                            <Button
                                onClick={() => { toggleIntroDialog(false) }}
                                sx={{ fontWeight: 'bold' }}>
                                閉じる
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <NLevelDialog />
                    <SliceDialog />
                    <SearchDialog />
                    <UntickAllDialog />

                    <Box sx={{ pt: 5 }}>

                        <ToggleButtonGroup>

                            <ToggleButton onClick={() => toggleIntroDialog(true)} sx={{ borderColor: '#d32f2f' }}>
                                <InfoOutlineIcon color='error' />
                            </ToggleButton>

                            <ToggleButton onClick={() => openNLevelSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                                {
                                    (nLevel) === 'n1' ? <LooksOne color='error' /> :
                                        (nLevel) === 'n2' ? <LooksTwo color='error' /> :
                                            (nLevel) === 'n3' ? <Looks3 color='error' /> :
                                                (nLevel) === 'n4' ? <Looks4 color='error' /> :
                                                    (nLevel) === 'n5' ? <Looks5 color='error' /> :
                                                        null

                                }
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

                            <ToggleButton sx={{ borderColor: '#d32f2f' }}>
                                {Object.values(slugChanges).includes(false) ?
                                    <DoneAll onClick={(session) ? () => tickAll() : null} color={(session) ? 'error' : ''} /> :
                                    <CheckBoxOutlineBlankRoundedIcon onClick={(session) ? () => untickAllPage() : null} color={(session) ? 'error' : ''} />
                                }
                            </ToggleButton>

                            <ToggleButton onClick={() => openSearchSelect(true)} sx={{ borderColor: '#d32f2f' }}>
                                <ManageSearchIcon color='error' />
                            </ToggleButton>

                            <ToggleButton onClick={(session) && (() => openUntickAllSelect(true))} sx={{ borderColor: '#d32f2f' }}>
                                <DeleteForever color={(session) ? 'error' : ''} />
                            </ToggleButton>

                        </ToggleButtonGroup>
                    </Box>

                    {(session) &&
                        <Collapse in={JSON.stringify(initialPackage) != JSON.stringify(slugChanges)}>
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    onClick={() => sendChanges()}
                                    disabled={(JSON.stringify(initialPackage) === JSON.stringify(slugChanges)) || disableSubmit}
                                    variant="contained"
                                    color="error"
                                    size="small"
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
                                    変更を保存
                                </Button>
                            </Box>
                        </Collapse>
                    }

                    {
                        (status === 'authenticated') && (apiResp) ?
                            <Box sx={{ mt: 3 }}>
                                <Alert sx={{ fontWeight: 'bold' }} severity="info">{apiMsg}</Alert>
                            </Box>
                            : null
                    }


                    {(tableLoading) ?
                        <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, px: 2, py: 1, borderRadius: '16px' }}>
                            <Typography>読み込み中...</Typography>
                        </Paper>
                        :
                        <Box sx={{ pt: 3 }}>
                            <Pagination color="error" siblingCount={0} page={page} onChange={handleChange} count={maxPages}></Pagination>
                        </Box>
                    }

                    {(tableLoading) ? <TableLoadingSkeleton /> :

                        <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6, borderRadius: '16px', mb: 6, minWidth: 343 }}>
                            <Table>
                                <TableBody>
                                    {vocabularyData.map((x, index) => (
                                        <React.Fragment key={`${index}-${x.slug}`}>
                                            <TableRow key={`toprow-${x.slug}`}>

                                                <TableCell sx={{ width: '1%', paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                                    <IconButton onClick={() => open.includes(index) ? setOpen(prev => prev.filter(x => x != index)) : setOpen([...open, index])}>
                                                        {open.includes(index) ?
                                                            <KeyboardArrowUpIcon /> :
                                                            <KeyboardArrowDownIcon />}
                                                    </IconButton>
                                                </TableCell>

                                                <TableCell sx={{ width: '1%', padding: 0 }}>
                                                    <Checkbox
                                                        color={(knownSlugs.includes(x.slug)) ? 'success' : 'primary'}
                                                        onClick={() => updatePackage(x.slug)}
                                                        checked={slugChanges[x.slug] === true}
                                                        disabled={(!session) ? true : false} />
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
                                                            <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Reading</Typography>
                                                            {[...new Set(x.japanese.map(y => y.reading))].map((a, aindex) => (
                                                                <Typography key={aindex} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{a}</Typography>
                                                            ))}
                                                            <Typography sx={{ color: 'orange', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>Meaning</Typography>
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

                    }

                </Box>
            </Container>
        )
    }

    return (
        <MobileLayout />
    )
}

export default NewVocabTable
