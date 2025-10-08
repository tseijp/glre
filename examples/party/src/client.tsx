// client.tsx
import './style.css'
import { createRoot } from 'react-dom/client'
import { SessionProvider, signIn, signOut, useSession } from '@hono/auth-js/react'
import { usePartySocket } from 'partysocket/react'
import { useState } from 'react'

const handleSignIn = () => signIn()
const handleSignOut = () => signOut()

const UserStatus = () => {
        const [users, set] = useState({} as Record<string, string>)
        usePartySocket({
                party: 'v1',
                room: 'my-room',
                onMessage(e) {
                        set(JSON.parse(e.data))
                },
        })
        return (
                <ul>
                        {Object.entries(users).map(([id, username]) => (
                                <li key={id}>{username}</li>
                        ))}
                </ul>
        )
}

const App = () => {
        const { status } = useSession()
        if (status === 'authenticated')
                return (
                        <div>
                                <button onClick={handleSignOut}>Sign Out</button>
                                <UserStatus />
                        </div>
                )

        if (status === 'unauthenticated') return <button onClick={handleSignIn}>Sign In</button>
        return null
}

createRoot(document.getElementById('root')!).render(
        <SessionProvider>
                <App />
        </SessionProvider>
)
