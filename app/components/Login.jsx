'use client'
import { Google } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import GoogleSignIn from "../serveraction";

const LoginLogout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
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
          Login Options
        </Typography>

        <Button
          onClick={() => GoogleSignIn()}
          variant="contained"
          startIcon={<Google />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Sign In with Google
        </Button>

        <Divider sx={{ width: '100%', mb: 2 }}>Or</Divider>

        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          <TextField disabled placeholder="Enter username" required fullWidth autoFocus />
          <TextField disabled placeholder="Enter password" type="password" required fullWidth />
          <FormControlLabel
            disabled
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button disabled type="submit" variant="contained" fullWidth>
            Login
          </Button>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              mt: 1,
            }}
          >
            <Typography>Forgot username?</Typography>
            <Typography>|</Typography>
            <Typography>Forgot password?</Typography>
          </Box>
          <Button disabled variant="outlined" fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginLogout;
