// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import { hc } from 'hono/client'
import { createRoot } from 'react-dom/client'
import PC from './components/PC'
import SP from './components/SP'
import Canvas from './canvas'
import { useFetch, useSearchParam, useWindowSize } from './hooks'
import { useVoxelWorld } from './hooks/useVoxelWorld'
import { useState, useMemo } from 'react'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const colors = useFetch('colors', client.api.v1.colors.$get).data
        const profile = useFetch('profile', client.api.v1.profile.$get).data
        const events = useFetch('events', client.api.v1.events.$get).data
        const [region, setRegion] = useState<{ lat: number; lng: number; zoom: number } | null>(null)
        const defaultRegion = useMemo(() => ({ lat: 35.6762, lng: 139.6503, zoom: 15 }), [])
        const currentRegion = region || defaultRegion
        const onRegionChange = (lat: number, lng: number, zoom: number) => setRegion({ lat, lng, zoom })
        const vox = useVoxelWorld(currentRegion)
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
        const onSemanticVoxel = (v: any) => {} // client.api.v1.voxels.$post({ json: v })
        const children = !vox ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100">
                        <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <div className="text-sm text-gray-600">{'伝統色彩システム初期化中...'}</div>
                                {region && (
                                        <div className="text-xs text-gray-500 mt-2">
                                                Region: {region.lat.toFixed(4)}, {region.lng.toFixed(4)}
                                        </div>
                                )}
                        </div>
                </div>
        ) : (
                <Canvas //
                        size={16}
                        dims={{ size: [32, 16, 32], center: [16, 8, 16] }}
                        atlas={vox?.atlas}
                        meshes={vox?.mesh}
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
                onRegionChange,
                currentRegion,
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
