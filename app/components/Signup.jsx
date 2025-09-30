'use client'
import {
  Box,
  Button,
  Collapse,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Alert from '@mui/material/Alert';
import { redirect, useRouter } from 'next/navigation'
import CircularProgress from '@mui/material/CircularProgress';

const SignUp = () => {

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  const router = useRouter()

  const [username, setUsername] = useState('')

  const [alertMsgBody, setAlertMsgBody] = useState('Username is required and must be 3-15 characters long.')
  const [alertMsgVisible, setAlertMsgVisible] = useState(true)
  const [alertSeverity, setAlertSeverity] = useState('info')

  const [loading, setLoading] = useState(false)

  // handling the post request
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (username.length < 3 || username.length > 15) {
      setLoading(false)
      setAlertMsgVisible(true)
      setAlertSeverity('warning')
      setAlertMsgBody(`Username must be 3-15 characters long.`)
      return
    }

    const response = await fetch('/api/registerusername', {
      method: 'POST',
      body: JSON.stringify({ username })
    })
    const responseCode = response.status
    const responseBody = await response.json()

    if (responseBody.message === `duplicate key value violates unique constraint "users_username_key"`) {
      setLoading(false)
      setAlertMsgVisible(true)
      setAlertSeverity('error')
      setAlertMsgBody(`"${username}" seems to be taken, please try another one.`)
    }
    else if (responseCode === 400) {
      setLoading(false)
      setAlertMsgVisible(true)
      setAlertSeverity('error')
      setAlertMsgBody('Username is required.')
    }
    else if (responseCode === 500) {
      setLoading(false)
      setAlertMsgVisible(true)
      setAlertSeverity('error')
      setAlertMsgBody(`Internal error: ${responseBody.message}`)
    }
    else if (responseCode === 200) {
      setLoading(false)
      setAlertMsgVisible(true)
      setAlertSeverity('success')
      setAlertMsgBody('User successfully registered!')
      await timeout(2000)
      router.push('/')
    }
  }

  return (

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >

          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 4,
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sign Up with Google
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
              }}
            >

              <TextField placeholder="Enter username" id='username' value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth autoFocus />
              {loading ?
                <Button variant="contained" fullWidth sx={{ mt: 1 }}>
                  <CircularProgress size="25px" color="inherit" />
                </Button>
                :
                <Button color="error" type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
                  Create Account
                </Button>
              }
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  mt: 1,
                }}
              >
                <Typography>Already have an account?</Typography>
              </Box>
              <Button color="error" variant="outlined" onClick={() => { redirect('/login') }} fullWidth>
                Login
              </Button>
            </Box>
          </Paper>
          <Collapse in={alertMsgVisible} sx={{ marginTop: '20px' }}>
            <Alert severity={alertSeverity}>
              {alertMsgBody}
            </Alert>
          </Collapse>
        </Box >

  );
};

export default SignUp;
