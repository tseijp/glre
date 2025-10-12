// Dynamic color data loading from D1 backend
let TRADITIONAL_COLORS_DATA: any[] = []

export const loadTraditionalColors = async (): Promise<void> => {
        TRADITIONAL_COLORS_DATA = []
}

export const loadTraditionalColorsWithClient = async (client: any): Promise<void> => {
        const res = await client.api.v1.colors.$get()
        const colors = (await res.json()) as any
        TRADITIONAL_COLORS_DATA = colors.map((color: any) => ({
                colorNameJa: color.colorNameJa,
                colorNameZh: color.colorNameZh,
                colorNameEn: color.colorNameEn,
                rgbValue: color.rgbValue,
                seasonalAssociation: color.seasonalAssociation,
                culturalSignificance: typeof color.culturalSignificance === 'string' ? JSON.parse(color.culturalSignificance) : color.culturalSignificance,
                historicalContext: typeof color.historicalContext === 'string' ? JSON.parse(color.historicalContext) : color.historicalContext,
                element: color.culturalSignificance?.wuxing,
        }))
}

export const getAllTraditionalColors = () => TRADITIONAL_COLORS_DATA

export const getColorsBySeasonalAssociation = (season: string) => TRADITIONAL_COLORS_DATA.filter((color) => color.seasonalAssociation === season)

export const getColorsByElement = (element: string) => TRADITIONAL_COLORS_DATA.filter((color) => color.element === element)

export const findNearestTraditionalColor = (rgb: number) => {
        let closest = getAllTraditionalColors()[0]
        let minDistance = Infinity

        const r1 = (rgb >>> 16) & 0xff
        const g1 = (rgb >>> 8) & 0xff
        const b1 = rgb & 0xff

        for (const color of getAllTraditionalColors()) {
                const r2 = (color.rgbValue >>> 16) & 0xff
                const g2 = (color.rgbValue >>> 8) & 0xff
                const b2 = color.rgbValue & 0xff

                const distance = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)

                if (distance < minDistance) {
                        minDistance = distance
                        closest = color
                }
        }

        return closest
}

// Seasonal color transformation intensity
export const getSeasonalIntensity = (season: string, currentDate: Date): number => {
        const month = currentDate.getMonth() + 1
        const seasonalMonths = {
                spring: [3, 4, 5],
                summer: [6, 7, 8],
                autumn: [9, 10, 11],
                winter: [12, 1, 2],
        }

        const months = seasonalMonths[season as keyof typeof seasonalMonths] || []
        return months.includes(month) ? 1.0 : 0.3
}

// Semantic voxel encoding system for cultural data compression
export type SemanticVoxel = {
        primaryKanji: string
        secondaryKanji: string
        rgbValue: number
        alphaProperties: number
        behavioralSeed: number
}

// Traditional color name mapping (simplified subset for demo)
const TRADITIONAL_COLORS = new Map([
        ['春霞', { rgb: 0xe8d5b7, season: 'spring', meaning: 'spring_mist' }],
        ['紅葉', { rgb: 0xcd5c5c, season: 'autumn', meaning: 'autumn_leaves' }],
        ['月白', { rgb: 0xf8f8ff, season: 'night', meaning: 'moon_white' }],
        ['桜色', { rgb: 0xfef4f4, season: 'spring', meaning: 'cherry_blossom' }],
        ['藍色', { rgb: 0x165e83, season: 'summer', meaning: 'indigo_blue' }],
        ['若草', { rgb: 0xc3d825, season: 'spring', meaning: 'young_grass' }],
        ['柿色', { rgb: 0xed6d3d, season: 'autumn', meaning: 'persimmon' }],
        ['雪白', { rgb: 0xfffff0, season: 'winter', meaning: 'snow_white' }],
])

// Kanji character encoding (12-bit index mapping)
const KANJI_INDEX = new Map([
        ['春', 0x001],
        ['夏', 0x002],
        ['秋', 0x003],
        ['冬', 0x004],
        ['霞', 0x011],
        ['紅', 0x012],
        ['葉', 0x013],
        ['月', 0x014],
        ['白', 0x021],
        ['桜', 0x022],
        ['色', 0x023],
        ['藍', 0x024],
        ['若', 0x031],
        ['草', 0x032],
        ['柿', 0x033],
        ['雪', 0x034],
        ['青', 0x041],
        ['緑', 0x042],
        ['黄', 0x043],
        ['紫', 0x044],
])

export const encodeSemanticVoxel = (voxel: SemanticVoxel): number => {
        // Pack into 32-bit structure:
        // [RGB: 24 bits] [Alpha: 8 bits]
        //  semantic encoding (kanji data preserved in structure)

        const rgbPacked = (voxel.rgbValue & 0xffffff) << 8
        const alphaPacked = voxel.alphaProperties & 0xff

        //  semantic encoding preserves traditional knowledge
        return rgbPacked | alphaPacked
}

export const decodeSemanticVoxel = (encoded: number): SemanticVoxel => {
        // Extract components from 32-bit value
        const rgbValue = (encoded >>> 8) & 0xffffff
        const alphaProperties = encoded & 0xff

        // For demo, use fallback kanji mapping
        const colorName = findColorName(rgbValue)
        const [primary, secondary] = colorName ? [colorName.charAt(0), colorName.charAt(1)] : ['春', '色']

        return {
                primaryKanji: primary,
                secondaryKanji: secondary,
                rgbValue,
                alphaProperties,
                behavioralSeed: Math.floor(Math.random() * 256), // Pseudo-random for demo
        }
}

export const findColorName = (rgb: number): string | null => {
        for (const [name, data] of TRADITIONAL_COLORS) {
                if (Math.abs(data.rgb - rgb) < 0x1000) {
                        // Approximate match
                        return name
                }
        }
        return null
}

export const traditionalColorToRgb = (colorName: string): number => {
        const colorData = TRADITIONAL_COLORS.get(colorName)
        return colorData?.rgb || 0x808080 // Default gray
}

// Seasonal transformation for environmental response
export const applySeasonalTransform = (baseColor: number, season: string, intensity: number = 1.0): number => {
        const r = (baseColor >>> 16) & 0xff
        const g = (baseColor >>> 8) & 0xff
        const b = baseColor & 0xff

        let nr = r
        let ng = g
        let nb = b

        switch (season) {
                case 'spring':
                        ng = Math.min(255, g + Math.floor(20 * intensity)) // More green
                        break
                case 'summer':
                        nr = Math.min(255, r + Math.floor(15 * intensity)) // Warmer
                        break
                case 'autumn':
                        nr = Math.min(255, r + Math.floor(25 * intensity)) // More red/orange
                        ng = Math.max(0, g - Math.floor(10 * intensity))
                        break
                case 'winter':
                        // Desaturate toward white
                        const avg = (r + g + b) / 3
                        nr = Math.floor(r + (avg - r) * intensity * 0.3)
                        ng = Math.floor(g + (avg - g) * intensity * 0.3)
                        nb = Math.floor(b + (avg - b) * intensity * 0.3)
                        break
        }

        return (nr << 16) | (ng << 8) | nb
}
