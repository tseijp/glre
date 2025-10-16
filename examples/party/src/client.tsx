// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import useSWR from 'swr'
import { hc } from 'hono/client'
import { createRoot } from 'react-dom/client'
import PC from './components/PC'
import SP from './components/SP'
import Canvas from './canvas'
import { SWR_CONFIG, useFetch, useSearchParam, useWindowSize } from './hooks'
import { useMemo } from 'react'
import { createCamera, createRegions } from './helpers'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const colors = useFetch('colors', client.api.v1.colors.$get).data
        const profile = useFetch('profile', client.api.v1.profile.$get).data
        const events = useFetch('events', client.api.v1.events.$get).data
        const camera = useMemo(() => createCamera(16, { size: [32, 16, 32], center: [16, 8, 16] }), [])
        const regions = useMemo(() => createRegions(camera), [])
        const { data: regionData, mutate } = useSWR(
                'regions',
                async () => {
                        const keys = regions.initialKeys
                        for (const key of keys) {
                                await regions.fetchRegion(key)
                        }
                        return regions.getRegions()
                },
                { ...SWR_CONFIG }
        )
        const hud = useSearchParam('hud')
        const menu = useSearchParam('menu')
        const modal = useSearchParam('modal')
        const page = useSearchParam('page')
        const isHUD = hud !== '0'
        const isMenu = menu === '1'
        const isModal = modal === '1'
        const hasProfile = !!profile
        const canSignIn = !profile
        const isSignedIn = !!profile
        const Colors = colors || []
        const onSemanticVoxel = (_v: any) => {} // client.api.v1.voxels.$post({ json: v })
        const children = (
                <Canvas //
                        camera={camera}
                        mutate={mutate}
                        updateCamera={regions.updateCamera}
                        regions={regionData ? regionData.filter((r) => r && r.visible) : []}
                        onSemanticVoxel={onSemanticVoxel}
                />
        )
        const props = {
                isHUD,
                isMenu,
                isModal,
                hasProfile,
                canSignIn,
                isSignedIn,
                Colors,
                culturalEvents: Array.isArray(events) ? events : [],
                page: page || '1',
                onSignIn: () => signIn(),
                //  metaverse 3D Tiles features
                isMode: true,
                hasColors: true,
                isSemanticVoxels: true,
                children,
        }
        if (useWindowSize()) return <SP {...props} />
        return <PC {...props} />
}

createRoot(document.getElementById('root')!).render(
        <SessionProvider>
                <App />
        </SessionProvider>
)
