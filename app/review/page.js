import Navbar from "../components/Navbar"
import ReviewComponent from "../components/Review"

import { SessionProvider } from "next-auth/react"

const reviewPage = () => {
    return (
        <SessionProvider>
            <Navbar />
            <ReviewComponent />
        </SessionProvider>
    )
}

export default reviewPage