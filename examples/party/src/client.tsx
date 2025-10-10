// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import { hc } from 'hono/client'
import { createRoot } from 'react-dom/client'
import PC from './components/PC'
import SP from './components/SP'
import Canvas from './canvas'
import { useFetch, useSearchParam, useWindowSize } from './hooks'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const w = useWindowSize()
        const res = useFetch('res', client.api.v1.res.$get).data
        const hud = useSearchParam('hud')
        const menu = useSearchParam('menu')
        const modal = useSearchParam('modal')
        const page = useSearchParam('page')
        if (!res) return null
        const isHUD = hud !== '0'
        const isMenu = menu === '1'
        const isModal = modal === '1'
        const children = <Canvas />
        const props = {
                isHUD,
                isMenu,
                isModal,
                page: page || '1',
                onSignIn: () => signIn(),
                children,
        }
        if (w < 800) return <SP {...props} />
        return <PC {...props} />
}

createRoot(document.getElementById('root')!).render(
        <SessionProvider>
                <App />
        </SessionProvider>
)
