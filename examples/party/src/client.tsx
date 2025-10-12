// client.tsx
import './components/style.css'
import { SessionProvider, signIn } from '@hono/auth-js/react'
import { hc } from 'hono/client'
import { createRoot } from 'react-dom/client'
import PC from './components/PC'
import SP from './components/SP'
import Canvas from './canvas'
import { useFetch, useSearchParam, useWindowSize } from './hooks'
import { createDefaultWorld, loadTraditionalColorsWithClient } from './helpers'
import { useVoxelWorld } from './hooks/useVoxelWorld'
import { useEffect, useState, useMemo } from 'react'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const w = useWindowSize()
        const colors = useFetch('colors', client.api.v1.colors.$get).data
        const profile = useFetch('profile', () => client.api.v1.profile.$get()).data
        const events = useFetch('events', () =>
                client.api.v1.events.$get({
                        query: {
                                from: new Date().toISOString(),
                                to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        },
                })
        ).data
        const hud = useSearchParam('hud')
        const menu = useSearchParam('menu')
        const modal = useSearchParam('modal')
        const page = useSearchParam('page')

        // Create cultural world context with async loading
        const [culturalWorld, setWorld] = useState<any>(null)
        const [region, setRegion] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
        const [isBuilding, setIsBuilding] = useState(false)

        // Default to Tokyo coordinates for 3D Tiles
        const defaultRegion = useMemo(
                () => ({
                        lat: 35.6762,
                        lng: 139.6503,
                        zoom: 15,
                }),
                []
        )

        const currentRegion = { ...defaultRegion, ...(region || {}) }
        const vox = useVoxelWorld(client, currentRegion)
        useEffect(() => {
                const initializeWorld = async () => {
                        const world = await createDefaultWorld()
                        setWorld(world)
                }
                initializeWorld()
        }, [])

        useEffect(() => {
                loadTraditionalColorsWithClient(client)
        }, [])

        const onRegionChange = (lat: number, lng: number, zoom?: number) => {
                setIsBuilding(true)
                setRegion({ lat, lng, zoom })
        }

        const onCanvasReady = () => {
                setIsBuilding(false)
        }

        const isHUD = hud !== '0'
        const isMenu = menu === '1'
        const isModal = modal === '1'
        const hasProfile = !!profile
        const canSignIn = !profile
        const isSignedIn = !!profile
        const traditionalColors = colors || []

        const onSemanticVoxel = (v: any) => client.api.v1.voxels.$post({ json: v })
        const children = (
                <Canvas //
                        size={16}
                        dims={{ size: [32, 16, 32], center: [16, 8, 16] }}
                        atlas={vox?.atlas}
                        mesh={vox?.mesh}
                        region={currentRegion}
                        onReady={onCanvasReady}
                        isBuilding={isBuilding}
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
                traditionalColors,
                culturalWorld,
                culturalEvents: Array.isArray(events) ? events : [],
                seasonalColors: colors?.filter((c: any) => c.seasonalAssociation === culturalWorld?.seasonalCycle) || [],
                page: page || '1',
                onSignIn: () => signIn(),
                onRegionChange,
                currentRegion,
                isBuilding,
                //  metaverse 3D Tiles features
                isMode: true,
                hasTraditionalColors: true,
                isSemanticVoxels: true,
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
