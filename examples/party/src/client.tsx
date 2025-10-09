// client.tsx
import './style.css'
import { SessionProvider, signIn, signOut, useSession } from '@hono/auth-js/react'
import { usePartySocket } from 'partysocket/react'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

const UserCursors = () => {
        const [users, set] = useState([] as [username: string, [x: number, y: number]][])
        const sendPosition = (e: MouseEvent) => {
                socket.send(JSON.stringify([e.clientX, e.clientY]))
        }
        const socket = usePartySocket({
                party: 'v1',
                room: 'my-room',
                onOpen: () => window.addEventListener('mousemove', sendPosition),
                onMessage: (e) => set(Object.entries(JSON.parse(e.data))),
        })
        return users.map(([username, [x, y]]) => (
                <div key={username} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
                        {username}
                </div>
        ))
}

const App = () => {
        const { status } = useSession()
        if (status === 'unauthenticated') return <button onClick={() => signIn()}>Sign In</button>
        if (status === 'authenticated')
                return (
                        <div>
                                <button onClick={() => signOut()}>Sign Out</button>
                                <UserCursors />
                        </div>
                )
        return 'Loading...'
}

createRoot(document.getElementById('root')!).render(
        <SessionProvider>
                <App />
        </SessionProvider>
)
