'use client'
import { Google } from "@mui/icons-material";
import {
  Box,
  Button,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Card,
  TextField,
  Typography,
} from "@mui/material";
import GoogleSignIn from "../serveraction";

const LoginLogout = () => {

  const MobileLogin = () => (

    <Container sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'white' }}>


      <Box sx={{ pt: 5 }}>
        <Card sx={{padding:2, borderRadius: '16px' }}>

          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            <Typography variant='h6' sx={{ fontWeight: 500, letterSpacing: 0.5 }}>
              ログイン選択肢
            </Typography>

            <Box sx={{mt:3}}>
              <Button
                onClick={() => GoogleSignIn()}
                color="error"
                variant="contained"
                startIcon={<Google />}
                sx={{
                  borderRadius: '16px'
                }}
              >
                Googleでログイン
              </Button>
            </Box>

          </CardContent>
        </Card>
      </Box>

    </Container>

  )

  return (
    <MobileLogin />
  );
};

export default LoginLogout;
