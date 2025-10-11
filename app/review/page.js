import Navbar from "../components/Navbar"
import ReviewComponent from "../components/Review"
import UserProvider from "../context/UserContext"
import { SessionProvider } from "next-auth/react"

const reviewPage = () => {
    return (
        <SessionProvider>
            <UserProvider>
                <Navbar />
                <ReviewComponent />
            </UserProvider>
        </SessionProvider>
    )
}

export default reviewPage