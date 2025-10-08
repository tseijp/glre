// client.tsx
import './style.css'
import { createRoot } from 'react-dom/client'
import { SessionProvider, signIn, signOut, useSession } from '@hono/auth-js/react'
import { usePartySocket } from 'partysocket/react'
import { useEffect, useState } from 'react'
import type { UserStatusType } from '.'

const handleSignIn = () => signIn()
const handleSignOut = () => signOut({ redirect: true, callbackUrl: '/' })

const UserCursors = () => {
        const [users, set] = useState<UserStatusType[]>([])
        const socket = usePartySocket({
                party: 'v1',
                room: 'my-room',
                onMessage(e) {
                        set(JSON.parse(e.data))
                },
        })
        useEffect(() => {
                const handleMouseMove = (e: MouseEvent) => {
                        socket.send(JSON.stringify({ position: [e.clientX, e.clientY] }))
                }
                window.addEventListener('mousemove', handleMouseMove)
                return () => {
                        window.removeEventListener('mousemove', handleMouseMove)
                }
        }, [socket])
        return (
                <ul>
                        {users.map(({ username, position: [x, y] }, key) => (
                                <li key={key} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
                                        {username}
                                </li>
                        ))}
                </ul>
        )
}

const App = () => {
        const { status } = useSession()
        if (status === 'unauthenticated') return <button onClick={handleSignIn}>Sign In</button>
        if (status === 'authenticated')
                return (
                        <div>
                                <button onClick={handleSignOut}>Sign Out</button>
                                <UserCursors />
                        </div>
                )
        return null
}

createRoot(document.getElementById('root')!).render(
        <SessionProvider>
                <App />
        </SessionProvider>
)
