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

export const encodeSemanticVoxel = (voxel: SemanticVoxel): number => {
        const rgbPacked = (voxel.rgbValue & 0xffffff) << 8
        const alphaPacked = voxel.alphaProperties & 0xff
        return rgbPacked | alphaPacked
}

export const decodeSemanticVoxel = (encoded: number): SemanticVoxel => {
        const rgbValue = (encoded >>> 8) & 0xffffff
        const alphaProperties = encoded & 0xff
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
                        return name // Approximate match
                }
        }
        return null
}

export const traditionalColorToRgb = (colorName: string): number => {
        const colorData = TRADITIONAL_COLORS.get(colorName)
        return colorData?.rgb || 0x808080 // Default gray
}

export const applySeasonalTransform = (baseColor: number, season: string, intensity: number = 1.0): number => {
        const r = (baseColor >>> 16) & 0xff
        const g = (baseColor >>> 8) & 0xff
        const b = baseColor & 0xff
        let nr = r
        let ng = g
        let nb = b
        if (season === 'spring') ng = Math.min(255, g + Math.floor(20 * intensity)) // More green
        if (season === 'summer') nr = Math.min(255, r + Math.floor(15 * intensity)) // Warmer
        if (season === 'autumn') {
                nr = Math.min(255, r + Math.floor(25 * intensity)) // More red/orange
                ng = Math.max(0, g - Math.floor(10 * intensity))
        }
        if (season === 'winter') {
                const avg = (r + g + b) / 3
                nr = Math.floor(r + (avg - r) * intensity * 0.3)
                ng = Math.floor(g + (avg - g) * intensity * 0.3)
                nb = Math.floor(b + (avg - b) * intensity * 0.3)
        }
        return (nr << 16) | (ng << 8) | nb
}
