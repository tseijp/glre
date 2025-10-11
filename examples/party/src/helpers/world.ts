import { loadTraditionalColors, getAllTraditionalColors, getColorsBySeasonalAssociation, findNearestTraditionalColor, checkWuXingHarmony, getSeasonalIntensity } from './colors'
import { traditionalColorToRgb, applySeasonalTransform } from './semantic'
import { CHUNK, GRID } from './utils'

// Cultural world generation based on traditional principles
export type CulturalRegion = {
        theme: string
        season: string
        colors: number[]
        culturalElements: string[]
        spiritualSignificance: string
}

export type CulturalWorld = {
        regions: CulturalRegion[]
        centerPoint: [number, number, number]
        seasonalCycle: string
        culturalNarrative: string
}

// Traditional landscape principles for world generation
const CULTURAL_THEMES = {
        zen_garden: {
                colors: ['雪白', '青竹色', '海松色'],
                elements: ['stone', 'water', 'bamboo'],
                mood: 'contemplation',
        },
        cherry_grove: {
                colors: ['桜色', '若草色', '朝霧'],
                elements: ['sakura', 'grass', 'mist'],
                mood: 'celebration',
        },
        autumn_temple: {
                colors: ['紅葉', '夕焼け', '月白'],
                elements: ['maple', 'temple', 'moonlight'],
                mood: 'reflection',
        },
        mountain_hermitage: {
                colors: ['藍色', '雪白', '海松色'],
                elements: ['mountain', 'snow', 'pine'],
                mood: 'solitude',
        },
}

export const generateCulturalWorld = async (culturalTheme: string = 'zen_garden', seasonalSettings: any = {}): Promise<CulturalWorld> => {
        // Initialize color system if not loaded
        await loadTraditionalColors()
        const theme = CULTURAL_THEMES[culturalTheme as keyof typeof CULTURAL_THEMES] || CULTURAL_THEMES.zen_garden
        const currentSeason = seasonalSettings.season || 'spring'

        // Generate regions based on traditional principles
        const regions: CulturalRegion[] = []

        // Central sacred space
        regions.push({
                theme: 'sacred_center',
                season: currentSeason,
                colors: theme.colors.map(traditionalColorToRgb),
                culturalElements: theme.elements,
                spiritualSignificance: 'center_of_harmony',
        })

        // Four directional regions based on cultural orientation
        const directions = [
                { name: 'east', season: 'spring', significance: 'renewal' },
                { name: 'south', season: 'summer', significance: 'growth' },
                { name: 'west', season: 'autumn', significance: 'harvest' },
                { name: 'north', season: 'winter', significance: 'rest' },
        ]

        directions.forEach((dir) => {
                const seasonalColors = getColorsBySeasonalAssociation(dir.season)
                const baseColors = seasonalColors.slice(0, 3).map((c) => c.rgbValue)

                regions.push({
                        theme: `${dir.name}_${dir.season}`,
                        season: dir.season,
                        colors: baseColors,
                        culturalElements: theme.elements,
                        spiritualSignificance: dir.significance,
                })
        })

        return {
                regions,
                centerPoint: [(GRID[0] * CHUNK) / 2, (GRID[1] * CHUNK) / 2, (GRID[2] * CHUNK) / 2],
                seasonalCycle: currentSeason,
                culturalNarrative: `A ${culturalTheme} world celebrating ${theme.mood}`,
        }
}

// Generate voxel data for a cultural region
export const generateRegionVoxels = (region: CulturalRegion, regionCoords: [number, number, number], size: number = 16): Uint8Array => {
        const voxelData = new Uint8Array(size * size * size)
        const [rx, ry, rz] = regionCoords

        // Apply cultural generation patterns based on theme
        for (let z = 0; z < size; z++) {
                for (let y = 0; y < size; y++) {
                        for (let x = 0; x < size; x++) {
                                const worldX = rx * size + x
                                const worldY = ry * size + y
                                const worldZ = rz * size + z

                                const voxelType = generateCulturalVoxel(worldX, worldY, worldZ, region)

                                const index = x + (y + z * size) * size
                                voxelData[index] = voxelType
                        }
                }
        }

        return voxelData
}

const generateCulturalVoxel = (x: number, y: number, z: number, region: CulturalRegion): number => {
        // Traditional landscape generation based on cultural principles

        // Ground level with cultural variation
        const groundHeight = 8 + Math.sin(x * 0.1) * 2 + Math.cos(z * 0.1) * 2

        if (y < groundHeight) {
                // Below ground - earth tones
                if (y < groundHeight - 3) return 3 // Deep earth
                return 2 // Soil layer
        }

        if (y === Math.floor(groundHeight)) {
                // Surface - apply cultural theming
                switch (region.theme.split('_')[0]) {
                        case 'sacred':
                                return generateSacredPattern(x, z) ? 4 : 1 // Sacred geometry
                        case 'east':
                                return Math.random() < 0.3 ? 5 : 1 // Spring growth
                        case 'south':
                                return Math.random() < 0.2 ? 6 : 1 // Summer abundance
                        case 'west':
                                return Math.random() < 0.4 ? 7 : 1 // Autumn variety
                        case 'north':
                                return Math.random() < 0.1 ? 8 : 1 // Winter sparsity
                        default:
                                return 1 // Default grass
                }
        }

        // Above ground - structures and vegetation based on cultural elements
        if (y < groundHeight + 5) {
                if (region.culturalElements.includes('bamboo') && Math.random() < 0.1) {
                        return 9 // Bamboo
                }
                if (region.culturalElements.includes('sakura') && Math.random() < 0.05) {
                        return 10 // Cherry blossom
                }
                if (region.culturalElements.includes('temple') && generateTemplePattern(x, y, z)) {
                        return 11 // Temple structure
                }
        }

        return 0 // Air
}

const generateSacredPattern = (x: number, z: number): boolean => {
        // Generate sacred geometry patterns (simplified mandala)
        const centerX = 8
        const centerZ = 8
        const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2)
        const angle = Math.atan2(z - centerZ, x - centerX)

        // Create circular patterns with 8-fold symmetry (Buddhist wheel)
        const radiusPattern = Math.sin(distance * 0.5) > 0.3
        const anglePattern = Math.sin(angle * 8) > 0

        return radiusPattern && anglePattern
}

const generateTemplePattern = (x: number, y: number, z: number): boolean => {
        // Simple temple foundation pattern
        const centerX = 8
        const centerZ = 8
        const inBase = Math.abs(x - centerX) < 3 && Math.abs(z - centerZ) < 3
        const isFoundation = y < 3

        return inBase && isFoundation
}

// Generate traditional color patterns for textures
export const generateColorPattern = (baseColors: number[], season: string, x: number, y: number): number => {
        const seasonalIntensity = getSeasonalIntensity(season, new Date())
        const colorIndex = (x + y) % baseColors.length
        const baseColor = baseColors[colorIndex]
        
        // Apply cultural color harmony validation
        const nearestColor = findNearestTraditionalColor(baseColor)
        const harmonicColor = validateCulturalHarmony(baseColor, season)

        return applySeasonalTransform(harmonicColor, season, seasonalIntensity)
}

// Cultural harmony validation using traditional color theory
const validateCulturalHarmony = (baseColor: number, season: string): number => {
        const traditionalColor = findNearestTraditionalColor(baseColor)
        
        // Check if color is appropriate for season
        if (traditionalColor.seasonalAssociation === season) {
                return baseColor
        }
        
        // Find harmonious alternative from seasonal colors
        const seasonalColors = getColorsBySeasonalAssociation(season)
        if (seasonalColors.length > 0) {
                const alternatives = seasonalColors.slice(0, 3)
                return alternatives[Math.floor(Math.random() * alternatives.length)].rgbValue
        }
        
        return baseColor
}

const getCurrentSeasonalIntensity = (season: string): number => {
        // Mock seasonal intensity based on current "time"
        const cyclePosition = (Date.now() / 10000) % (Math.PI * 2)
        return (Math.sin(cyclePosition) + 1) / 2
}

// Create PNG atlas from generated voxel data
export const generateWorldAtlas = async (world: CulturalWorld, size: number = 16): Promise<Uint8Array> => {
        const atlasSize = 4096
        const chunkSize = 64
        const atlas = new Uint8Array(atlasSize * atlasSize * 4) // RGBA

        // Fill with default cultural pattern
        for (let y = 0; y < atlasSize; y++) {
                for (let x = 0; x < atlasSize; x++) {
                        const index = (y * atlasSize + x) * 4

                        // Generate traditional pattern based on position
                        const chunkX = Math.floor(x / chunkSize)
                        const chunkY = Math.floor(y / chunkSize)
                        const regionIndex = (chunkX + chunkY) % world.regions.length
                        const region = world.regions[regionIndex]

                        const localX = x % chunkSize
                        const localY = y % chunkSize
                        const voxelIndex = (localX % 16) + (localY % 16) * 16

                        // Use region colors with cultural pattern
                        const colorIndex = voxelIndex % region.colors.length
                        const color = region.colors[colorIndex]

                        atlas[index] = (color >>> 16) & 0xff // R
                        atlas[index + 1] = (color >>> 8) & 0xff // G
                        atlas[index + 2] = color & 0xff // B
                        atlas[index + 3] = 255 // A
                }
        }

        return atlas
}

export const createDefaultCulturalWorld = async (): Promise<CulturalWorld> => {
        return await generateCulturalWorld('zen_garden', { season: 'spring' })
}
