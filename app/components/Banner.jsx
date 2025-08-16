"use client"
import { Alert, Badge, Box, Button, Card, CardActionArea, CardContent, CardMedia, Fade, FormControlLabel, FormGroup, IconButton, Paper, Slide, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography, Zoom } from '@mui/material'
import React, { act, useEffect, useState } from 'react'
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import { ArrowLeft, ArrowRight, CancelOutlined, Check, Clear, DoneOutline, Info, PersonAddAlt1, Quiz, Visibility } from '@mui/icons-material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Link from 'next/link';
import LaunchIcon from '@mui/icons-material/Launch';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const Banner = () => {


    // list containing the example words we use on the homepage
    const [exampleWords, setExampleWords] = useState([
        {
            slug: '美味しい',
            reading: ['おいしい'],
            definitions: [
                {
                    type: 'I-adjective (keiyoushi)',
                    meaning: 'good (tasting), nice, delicious, tasty'
                },
                {
                    type: 'I-adjective (keiyoushi)',
                    meaning: 'attractive (offer, opportunity, etc.), appealing, convenient, favorable, desirable, profitable'
                }
            ],
            result: null
        },
        {
            slug: '趣味',
            reading: ['しゅみ'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'hobby, pastime'
                },
                {
                    type: 'Noun',
                    meaning: 'tastes, preference, liking'
                }
            ],
            result: null
        },
        {
            slug: '夢',
            reading: ['ゆめ'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'dream'
                }
            ],
            result: null
        },
        {
            slug: '気分',
            reading: ['きぶん'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'feeling, mood'
                }
            ],
            result: null
        },
        {
            slug: '歴史',
            reading: ['れきし'],
            definitions: [
                {
                    type: 'Noun',
                    meaning: 'history'
                }
            ],
            result: null
        },

    ])

    // state to manage which example is shown on the homepage (quiz/vocabtable)
    const [activeExample, setActiveExample] = useState('vocabtable')

    // table state management
    const [tableExpand, toggleTableExpand] = useState(true)
    const [tableExpand2, toggleTableExpand2] = useState(false)

    // quiz type state management
    const [quizType, setQuizType] = useState('all')

    // card state management
    const [cardNumber, setCardNumber] = useState(0)
    const [cardCollapse, toggleCardCollapse] = useState(false)

    // card correct incorrect counter state management
    const [correctCount, setCorrectCount] = useState(0)
    const [incorrectCount, setIncorrectCount] = useState(0)

    // card switch function
    const changeCard = (direction) => {
        if (direction === 'back') {
            if (cardNumber > 0) {
                setCardNumber(prev => prev - 1)
                toggleCardCollapse(false)
            }
        }
        if (direction === 'forward') {
            if (cardNumber < exampleWords.length - 1) {
                setCardNumber(prev => prev + 1)
                toggleCardCollapse(false)
            }
        }
    }

    // card correct/incorrect function

    const evaluateCard = (result) => {

        if (result === 'correct') {
            setExampleWords(prev => prev.map((x, index) => (
                (cardNumber === index) ? { ...x, result: true } : x
            )))
            changeCard('forward')
        }

        if (result === 'incorrect') {
            setExampleWords(prev => prev.map((x, index) => (
                (cardNumber === index) ? { ...x, result: false } : x
            )))
            changeCard('forward')
        }
    }

    // card updating incorrect correct counts
    useEffect(() => {

        const correct = exampleWords.filter(x => x.result === true).length
        const incorrect = exampleWords.filter(x => x.result === false).length

        setCorrectCount(correct)
        setIncorrectCount(incorrect)

    }, [exampleWords])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minWidth: '100vw', backgroundColor: '' }}>

            <Box sx={{ display: 'flex', flex: 4, flexDirection: 'row', width: '100%', backgroundColor: 'white' }}>


                {/* top left box */}
                <Box sx={{ flex: 1 }} />

                {/* top center box */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: 856, backgroundColor: '' }}>

                    {/* box for typography */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px', flexDirection: 'column' }}>
                        <Typography variant='h4' sx={{ textAlign: 'center', paddingBottom: '25px', minWidth: '42px' }}>「日本語能力試験アシスト」</Typography>
                        <Typography gutterBottom variant='subtitle1' sx={{ color: 'grey', fontWeight: '50', textAlign: 'center' }}>日本語能力試験の基礎固めをサポートするアプリ</Typography>
                        <Typography gutterBottom variant='subtitle1' sx={{ color: 'grey', fontWeight: '50', textAlign: 'center' }}>語彙表の確認、知らない単語の記録、カスタムクイズで効率的に復習しよう</Typography>
                        <Typography variant='subtitle1' sx={{ color: 'grey', fontWeight: '50', textAlign: 'center' }}></Typography>
                    </Box>

                    {/* box for buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', backgroundColor: '', justifyContent: 'center', alignItems: 'center', paddingTop: '35px', gap: '20px' }}>
                        <Tooltip
                            open={(activeExample === 'vocabtable')}
                            placement='left'
                            arrow
                            title={
                                <Link href='/vocabtable'>
                                    <LaunchIcon fontSize='small' />
                                </Link>
                            }
                            slots={{
                                transition: Zoom,
                            }}
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        bgcolor: '#ef5350',
                                        '& .MuiTooltip-arrow': {
                                            color: '#ef5350',
                                        },
                                    },
                                }
                            }}
                        >
                            <Button
                                sx={(activeExample === 'vocabtable') ? { boxShadow: ' 0 0 10px #fff, 0 0 0px #fff, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f' } : null}
                                onClick={() => {
                                    setActiveExample('vocabtable')

                                }}
                                startIcon={<AutoStoriesIcon />}
                                color='error' variant='outlined'>
                                語彙を復習
                            </Button>
                        </Tooltip>
                        <Tooltip
                            open={(activeExample === 'quiz')}
                            placement='right'
                            arrow
                            title={
                                <Link href='/quizpage'>
                                    <LaunchIcon fontSize='small' />
                                </Link>
                            }
                            slots={{
                                transition: Zoom,
                            }}
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        bgcolor: '#ef5350',
                                        '& .MuiTooltip-arrow': {
                                            color: '#ef5350',
                                        },
                                    },
                                }
                            }}
                        >
                            <Button
                                sx={(activeExample === 'quiz') ? { boxShadow: ' 0 0 10px #fff, 0 0 0px #fff, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f, 0 0 1px #d32f2f' } : null}
                                onClick={() => setActiveExample('quiz')}
                                startIcon={<Quiz />}
                                color='error' variant='outlined'>
                                クイズを試す
                            </Button>
                        </Tooltip>
                    </Box>

                    {/* box for feature demonstration */}
                    <Box sx={{ backgroundColor: '', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 780, paddingTop: 5, overflow: 'hidden', paddingBottom: 5, marginTop: 0 }}>
                        <Paper sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: 755, flex: 1, minWidth: 420, maxWidth: 770, overflow: 'hidden' }}>
                            {(activeExample === 'vocabtable') ?
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Table sx={{}}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: '5%', padding: '0' }} />
                                                <TableCell sx={{ width: '5%', padding: '0' }} />
                                                <TableCell sx={{ textAlign: 'center', width: 'auto' }}>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>
                                                    <IconButton onClick={() => toggleTableExpand(prev => !prev)} aria-label='expand row' size='small'>
                                                        <KeyboardArrowDownIcon />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox defaultChecked></Checkbox>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 500, paddingRight: 10 }}>
                                                    美味しい
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    <Collapse in={tableExpand}>
                                                        <Box>
                                                            <Typography gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>美味しい</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>読み方</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 500 }}>おいしい</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>意味 </Typography>
                                                            <Typography sx={{ fontSize: '1rem', color: 'grey' }}>
                                                                {`I-adjective (keiyoushi)`}
                                                            </Typography>
                                                            <Typography gutterBottom>
                                                                {`good (tasting), nice, delicious, tasty`}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '1rem', color: 'grey' }}>
                                                                {`I-adjective (keiyoushi)`}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '1rem' }}>
                                                                {`attractive (offer, opportunity, etc.), appealing, convenient, favorable, desirable, profitable`}
                                                            </Typography>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <IconButton onClick={() => toggleTableExpand2(prev => !prev)} aria-label='expand row' size='small'>
                                                        <KeyboardArrowDownIcon />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox></Checkbox>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 500, paddingRight: 10 }}>
                                                    良心
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    <Collapse in={tableExpand2}>
                                                        <Box>
                                                            <Typography gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>良心</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>読み方</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 500 }}>りょうしん</Typography>
                                                            <Typography gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>意味</Typography>
                                                            <Typography sx={{ fontSize: '1rem', color: 'grey' }}>
                                                                {`Noun`}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '1rem' }}>
                                                                {`Conscience`}
                                                            </Typography>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <Alert color='info' severity='info' sx={{ marginTop: '20px' }}><Typography>単語を一つずつ確認し、展開ボタンで詳細を見て、知っている単語にチェックする</Typography></Alert>
                                </Box>

                                :
                                // main box for quiz

                                <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '30px' }}>

                                    {/* box for n number and quiz type buttons */}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                        <Box>
                                            <ToggleButtonGroup
                                                exclusive
                                                color="primary">
                                                <ToggleButton value='n1'>N1</ToggleButton>
                                                <ToggleButton value='n2'>N2</ToggleButton>
                                                <ToggleButton value='n3'>N3</ToggleButton>
                                                <ToggleButton value='n4'>N4</ToggleButton>
                                                <ToggleButton value='n5'>N5</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                        <Box>
                                            <ToggleButtonGroup
                                                color="secondary"
                                                value={quizType}
                                                sx={{ alignItems: 'center', display: 'flex' }}
                                                exclusive
                                            >
                                                <ToggleButton onClick={() => setQuizType('all')} value='all'>全て</ToggleButton>
                                                <ToggleButton onClick={() => setQuizType('allUnknown')} value='allUnknown'>知らない全て</ToggleButton>
                                                <ToggleButton onClick={() => setQuizType('custom')} value='custom'>カスタム</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>
                                    </Box>

                                    {/* box for custom card number form and randomiser toggle */}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '30px', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'left',
                                                gap: '20px',
                                                width: '112px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <TextField
                                                disabled
                                                label="カードの数"
                                                size="small"
                                                sx={{ width: '100%' }}
                                                value='2'
                                            />
                                        </Box>
                                        <Box>
                                            <FormGroup>
                                                <FormControlLabel disabled checked control={<Switch sx={{ margin: 0 }} />} label="ランダムにする" />
                                            </FormGroup>
                                        </Box>
                                        <Button disabled color="secondary" variant="contained">中止</Button>
                                    </Box>

                                    {/* box for card number, correct and incorrect counters  */}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '20px', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '30px' }}>

                                        <Button disableRipple disableFocusRipple startIcon={<Quiz />} variant="outlined" color="info">
                                            <Typography variant="body1"> カード {cardNumber + 1} / {exampleWords.length} </Typography>
                                        </Button>

                                        <Button startIcon={<DoneOutline />} disableRipple disableFocusRipple variant={(exampleWords[cardNumber].result === true ? 'contained' : 'outlined')} color="success">
                                            <Typography variant="body1">{correctCount}</Typography>
                                        </Button>

                                        <Button startIcon={<CancelOutlined />} disableRipple disableFocusRipple variant={(exampleWords[cardNumber].result === false ? 'contained' : 'outlined')} color="error">
                                            <Typography variant="body1">{incorrectCount}</Typography>
                                        </Button>

                                    </Box>

                                    {/* main box for flashcard */}
                                    <Card sx={{ marginTop: '30px', display: 'flex', flexDirection: 'column', minWidth: 669 }}>

                                        {/* contains slug + forward/back, correct/incorrect buttons and show/hide card */}
                                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>

                                            <CardContent sx={{ width: '30%' }}>
                                                <Box>
                                                    <Typography variant='h4'>
                                                        {exampleWords[cardNumber].slug}
                                                    </Typography>

                                                </Box>
                                            </CardContent>

                                            <CardContent sx={{ width: '70%', display: 'flex', justifyContent: 'right', height: '80px' }}>
                                                <Box sx={{ display: 'flex', gap: '10px' }}>

                                                    <Button
                                                        size='small'
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<ArrowLeft />}
                                                        onClick={() => changeCard('back')}
                                                    >
                                                        前
                                                    </Button>

                                                    <Button
                                                        size='small'
                                                        variant="outlined"
                                                        color="primary"
                                                        endIcon={<ArrowRight />}
                                                        onClick={() => changeCard('forward')}
                                                    >
                                                        次
                                                    </Button>

                                                    <Button disabled={(cardCollapse === true)} onClick={() => toggleCardCollapse(true)} size='small' variant="contained" color="primary">
                                                        <Typography><Visibility /> 表示</Typography>
                                                    </Button>

                                                    <Button
                                                        disabled={cardCollapse === true ? false : true}
                                                        onClick={() => evaluateCard('correct')}
                                                        size='small'
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<Check />}
                                                    >
                                                        正解
                                                    </Button>
                                                    <Button
                                                        disabled={cardCollapse === true ? false : true}
                                                        onClick={() => evaluateCard('incorrect')}
                                                        size='small'
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<Clear />}
                                                    >
                                                        不正解
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Box>

                                        {/* content holder for card details */}
                                        <Collapse in={cardCollapse} timeout={{ enter: 250, exit: 10 }}>
                                            <CardContent>
                                                <Box>

                                                    <Typography sx={{ color: 'text.secondary' }}>Readings</Typography>

                                                    {exampleWords[cardNumber].reading.map((x, index) => (
                                                        <Typography key={`reading ${index}`}>{x}</Typography>
                                                    ))}

                                                    <Typography sx={{ color: 'text.secondary', mt: 1 }}>Meaning</Typography>

                                                    {exampleWords[cardNumber].definitions.map((y, index) => (
                                                        <Box sx={{ mb: 1 }} key={`meaning ${index}`}>
                                                            <Typography>{y.type}</Typography>
                                                            <Typography>{y.meaning}</Typography>
                                                        </Box>
                                                    ))}

                                                </Box>
                                            </CardContent>
                                        </Collapse>
                                    </Card>
                                    <Alert color='info' severity='info' sx={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {
                                            (quizType === 'all') ? <Typography >すべてを選ぶと、選択したNレベルの全単語が出題されます</Typography> :
                                                (quizType === 'allUnknown') ? <Typography >知らないすべてを選ぶと、語彙表でチェックしていない単語が出題されます</Typography> :
                                                    (quizType === 'custom') ? <Typography >カスタムを選ぶと、テストする単語数を自分で決められます</Typography> :
                                                        null
                                        }
                                    </Alert>
                                    <Alert color='success' severity='success' sx={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography>
                                            登録すると、クイズの結果を保存して確認できます
                                        </Typography>
                                    </Alert>
                                </Box>
                            }
                        </Paper>
                    </Box>
                </Box>

                {/* top right box */}
                <Box sx={{ flex: 1 }} />

            </Box>

            <Box sx={{ flex: 1, width: '100%', backgroundColor: '#ffebee' }}>
            </Box>


        </Box>


    )
}

export default Banner