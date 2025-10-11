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
import { createDefaultCulturalWorld } from './helpers'
import { useEffect, useState, useMemo } from 'react'
import type { AppType } from '.'

const client = hc<AppType>('/')

export const App = () => {
        const w = useWindowSize()
        const vox = useVoxelWorld()
        const res = useFetch('res', client.api.v1.res.$get).data
        const colors = useFetch('colors', client.api.v1.colors.$get).data
        const profile = useFetch('profile', client.api.v1.profile.$get).data
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
        const [culturalWorld, setCulturalWorld] = useState<any>(null)
        const [region, setRegion] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
        const [isBuilding, setIsBuilding] = useState(false)
        
        // Default to Tokyo coordinates for 3D Tiles
        const defaultRegion = useMemo(() => ({
                lat: 35.6762,
                lng: 139.6503,
                zoom: 15
        }), [])

        useEffect(() => {
                const initializeCulturalWorld = async () => {
                        const world = await createDefaultCulturalWorld()
                        setCulturalWorld(world)
                }
                initializeCulturalWorld()
        }, [])
        
        const onRegionChange = (lat: number, lng: number, zoom?: number) => {
                setIsBuilding(true)
                setRegion({ lat, lng, zoom })
        }
        
        const onCanvasReady = () => {
                setIsBuilding(false)
        }

        if (!res) return null

        const isHUD = hud !== '0'
        const isMenu = menu === '1'
        const isModal = modal === '1'
        const hasCulturalProfile = !!profile
        const traditionalColors = colors || []

        const currentRegion = region || defaultRegion
        
        const children = (
                <Canvas 
                        size={16} 
                        dims={{ size: [32, 16, 32], center: [16, 8, 16] }} 
                        atlas={vox?.atlas as any} 
                        mesh={vox?.mesh as any}
                        region={currentRegion}
                        onReady={onCanvasReady}
                        isBuilding={isBuilding}
                />
        )

        const props = {
                isHUD,
                isMenu,
                isModal,
                hasCulturalProfile,
                traditionalColors,
                culturalWorld,
                culturalEvents: Array.isArray(events) ? events : [],
                seasonalColors: colors?.filter((c: any) => c.seasonalAssociation === culturalWorld?.seasonalCycle) || [],
                page: page || '1',
                onSignIn: () => signIn(),
                onRegionChange,
                currentRegion,
                isBuilding,
                // Cultural metaverse 3D Tiles features
                isCulturalMode: true,
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
