import { Quicksand } from 'next/font/google'
import MuiThemeProvider from './MuiThemeProvider';

const quicksand = Quicksand({
  subsets: ['latin'],
})

export const metadata = {
  title: "JLPT Assist",
  description: "Let Japanese take you further",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" className={quicksand.className}>
      <body>
        <MuiThemeProvider>
          {children}
        </MuiThemeProvider>
      </body>
    </html>

  )
}
