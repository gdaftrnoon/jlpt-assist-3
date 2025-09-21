'use client'
import { Typography, Container, CardContent, Card, Button } from "@mui/material"
import BuildIcon from '@mui/icons-material/Build';


const ReviewComponent = () => {

    return (
        <Container>
            <Card sx={{ mt: 6 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Button color="error" sx={{ backgroundColor: 'transparent' }} disableTouchRipple disableFocusRipple disableRipple variant="text" startIcon={<BuildIcon fontSize="large" />}>
                        <Typography sx={{ fontSize: { md: '1.2rem', xs: '0.8rem' } }}>
                            Review feature in development
                        </Typography>
                    </Button>
                    <Typography sx={{ fontSize: { md: '1.2rem', xs: '0.8rem' } }}>
                        We are working hard on building a review page to enable users to analyse their quiz results.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    )

}

export default ReviewComponent