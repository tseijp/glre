import { loadColors, getColorsBySeasonalAssociation } from '../voxel/colors'
export { initAtlasWorld } from '../voxel/atlas'
import { ColorToRgb } from '../voxel/colors'
import { CHUNK, GRID } from '../utils'

//  world generation based on  principles
export type Region = {
        theme: string
        season: string
        colors: number[]
        culturalElements: string[]
        spiritualSignificance: string
}

export type World = {
        regions: Region[]
        centerPoint: [number, number, number]
        seasonalCycle: string
        culturalNarrative: string
}

//  landscape principles for world generation
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

export const generateWorld = async (culturalTheme: string = 'zen_garden', seasonalSettings: any = {}): Promise<World> => {
        // Initialize color system if not loaded
        await loadColors()
        const theme = CULTURAL_THEMES[culturalTheme as keyof typeof CULTURAL_THEMES] || CULTURAL_THEMES.zen_garden
        const currentSeason = seasonalSettings.season || 'spring'

        // Generate regions based on  principles
        const regions: Region[] = []

        // Central sacred space
        regions.push({
                theme: 'sacred_center',
                season: currentSeason,
                colors: theme.colors.map(ColorToRgb),
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

export const createDefaultWorld = async (): Promise<World> => {
        return await generateWorld('zen_garden', { season: 'spring' })
}
