// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import { hc } from 'hono/client'
import { createRoot } from 'react-dom/client'
import PC from './components/PC'
import SP from './components/SP'
import Canvas from './canvas'
import { useFetch, useSearchParam, useWindowSize } from './hooks'
import { createDefaultCulturalWorld } from './helpers/world'
import { useMemo, useEffect, useState } from 'react'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const w = useWindowSize()
        const res = useFetch('res', client.api.v1.res.$get).data
        const colors = useFetch('colors', client.api.v1.colors.$get).data
        const profile = useFetch('profile', client.api.v1.profile.$get).data
        const hud = useSearchParam('hud')
        const menu = useSearchParam('menu')
        const modal = useSearchParam('modal')
        const page = useSearchParam('page')

        // Create cultural world context with async loading
        const [culturalWorld, setCulturalWorld] = useState<any>(null)

        useEffect(() => {
                const initializeCulturalWorld = async () => {
                        const world = await createDefaultCulturalWorld()
                        setCulturalWorld(world)
                }
                initializeCulturalWorld()
        }, [])

        if (!res) return null

        const isHUD = hud !== '0'
        const isMenu = menu === '1'
        const isModal = modal === '1'
        const hasCulturalProfile = !!profile
        const traditionalColors = colors || []

        const children = <Canvas size={16} dims={{ size: [32, 16, 32], center: [16, 8, 16] }} />

        const props = {
                isHUD,
                isMenu,
                isModal,
                hasCulturalProfile,
                traditionalColors,
                culturalWorld,
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
