// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import useSWRInfinite from 'swr/infinite'
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
        const swr = useSWRInfinite(regions.getKey, regions.fetcher as any, { ...SWR_CONFIG, revalidateFirstPage: false })
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
        const children = !swr?.data ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100">
                        <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <div className="text-sm text-gray-600">{'伝統色彩システム初期化中...'}</div>
                        </div>
                </div>
        ) : (
                <Canvas //
                        camera={camera}
                        mutate={swr.mutate as any}
                        setSize={swr.setSize}
                        updateCamera={regions.updateCamera}
                        regions={(swr.data ? swr.data.flat().filter(Boolean) : []) as any}
                        onSemanticVoxel={onSemanticVoxel}
                />
        )
        console.log(swr.data)
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
