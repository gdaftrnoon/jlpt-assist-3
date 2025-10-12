'use client'

import { ArticleOutlined, CheckBoxOutlineBlankRounded, DeleteForever, Expand, InfoOutline, KeyboardArrowDown, LooksOne, ManageSearchOutlined, X } from "@mui/icons-material";
import { Box, Button, Card, Checkbox, Container, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText, Pagination, Table, TableBody, TableCell, TableRow, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"

export default function VocabTable() {

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const [vocab, setVocab] = useState()
    const flag = useRef(false)

    const [level, setLevel] = useState('n1')
    const [page, setPage] = useState(1)

    const [levelDia, openLevelDia] = useState(false)

    useEffect(() => {
        if (!flag.current) {
            fetch('/api/FetchJlpt')
                .then(response => response.json())
                .then(data => {
                    setVocab(data.message)
                    console.log(data.message)
                })
                .finally(
                    flag.current = true
                )
        }
    }, [])

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

            <Box sx={{ pt: 5, textAlign: 'center' }}>
                <ToggleButtonGroup size={matches ? 'large' : 'medium'}>

                    <ToggleButton sx={{ borderColor: '#d32f2f' }}>
                        <InfoOutline color='error' />
                    </ToggleButton>

                    <ToggleButton onClick={() => openLevelDia(true)} sx={{ borderColor: '#d32f2f' }}>
                        <LooksOne color='error' />
                    </ToggleButton>

                    <ToggleButton sx={{ borderColor: '#d32f2f' }}>

                        <Expand color='error' />
                    </ToggleButton>

                    <ToggleButton sx={{ borderColor: '#d32f2f' }}>

                        <CheckBoxOutlineBlankRounded color='error' />
                    </ToggleButton>

                    <ToggleButton sx={{ borderColor: '#d32f2f' }}>
                        <ManageSearchOutlined color='error' />
                    </ToggleButton>

                    <ToggleButton sx={{ borderColor: '#d32f2f' }}>

                        <DeleteForever color='error' />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 2 }}>
                <Button
                    variant="outlined"
                    color="error"
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
                    0 / 10
                </Button>

                <Button

                    variant="contained"
                    color="error"
                    size={matches ? 'large' : 'medium'}
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
                    Save Changes
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
                    onChange={(event, value) => { setPage(value) }}
                >
                </Pagination>
            </Box>

            {
                (vocab) ?
                    <Card
                        sx={{
                            width: { xs: '100%', md: '60%' },
                            mt: 4,
                            borderRadius: '16px',
                            mb: 4
                        }}>
                        <Table>
                            <TableBody>
                                {vocab[level].slice((page - 1) * 10, ((page - 1) * 10) + 10).map(x => (
                                    <TableRow key={x.slug}>
                                        <TableCell sx={{ paddingY: 0, paddingRight: 0, paddingLeft: 1 }}>
                                            <KeyboardArrowDown />
                                        </TableCell>
                                        <TableCell sx={{ padding: 0 }}>
                                            <Checkbox
                                                checked={false}
                                                disabled
                                                sx={{ color: 'primary.main' }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                width: '98%',
                                                textAlign: 'center',
                                                pr: 9,
                                                fontWeight: '700',
                                                fontSize: { xs: '1.4rem', md: '2rem' }
                                            }}>
                                            {x.slug}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                    : null
            }

        </Container>
    )
}