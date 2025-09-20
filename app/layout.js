import "./globals.css";
import { Quicksand } from 'next/font/google'

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
        {children}
      </body>
    </html>

  )
}
