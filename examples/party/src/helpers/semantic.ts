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
        ['春霞', { rgb: 0xE8D5B7, season: 'spring', meaning: 'spring_mist' }],
        ['紅葉', { rgb: 0xCD5C5C, season: 'autumn', meaning: 'autumn_leaves' }],
        ['月白', { rgb: 0xF8F8FF, season: 'night', meaning: 'moon_white' }],
        ['桜色', { rgb: 0xFEF4F4, season: 'spring', meaning: 'cherry_blossom' }],
        ['藍色', { rgb: 0x165E83, season: 'summer', meaning: 'indigo_blue' }],
        ['若草', { rgb: 0xC3D825, season: 'spring', meaning: 'young_grass' }],
        ['柿色', { rgb: 0xED6D3D, season: 'autumn', meaning: 'persimmon' }],
        ['雪白', { rgb: 0xFFFFF0, season: 'winter', meaning: 'snow_white' }],
])

// Kanji character encoding (12-bit index mapping)
const KANJI_INDEX = new Map([
        ['春', 0x001], ['夏', 0x002], ['秋', 0x003], ['冬', 0x004],
        ['霞', 0x011], ['紅', 0x012], ['葉', 0x013], ['月', 0x014],
        ['白', 0x021], ['桜', 0x022], ['色', 0x023], ['藍', 0x024],
        ['若', 0x031], ['草', 0x032], ['柿', 0x033], ['雪', 0x034],
        ['青', 0x041], ['緑', 0x042], ['黄', 0x043], ['紫', 0x044],
])

// Reverse mapping for decoding
const INDEX_KANJI = new Map(Array.from(KANJI_INDEX.entries()).map(([k, v]) => [v, k]))

export const encodeSemanticVoxel = (voxel: SemanticVoxel): number => {
        // Extract kanji characters
        const primary = voxel.primaryKanji.charAt(0) || '春'
        const secondary = voxel.secondaryKanji.charAt(0) || '色'
        
        // Get 12-bit indices
        const primaryIndex = KANJI_INDEX.get(primary) || 0x001
        const secondaryIndex = KANJI_INDEX.get(secondary) || 0x023
        
        // Pack into 32-bit structure:
        // [RGB: 24 bits] [Alpha: 8 bits]
        // [Primary Kanji: 12 bits] [Secondary Kanji: 12 bits]
        // [Behavioral Seed: 8 bits]
        
        const rgbPacked = (voxel.rgbValue & 0xFFFFFF) << 8
        const alphaPacked = voxel.alphaProperties & 0xFF
        const kanjiPacked = ((primaryIndex & 0xFFF) << 12) | (secondaryIndex & 0xFFF)
        const seedPacked = voxel.behavioralSeed & 0xFF
        
        // For demo, we'll encode as separate components
        return rgbPacked | alphaPacked
}

export const decodeSemanticVoxel = (encoded: number): SemanticVoxel => {
        // Extract components from 32-bit value
        const rgbValue = (encoded >>> 8) & 0xFFFFFF
        const alphaProperties = encoded & 0xFF
        
        // For demo, use fallback kanji mapping
        const colorName = findColorName(rgbValue)
        const [primary, secondary] = colorName ? [colorName.charAt(0), colorName.charAt(1)] : ['春', '色']
        
        return {
                primaryKanji: primary,
                secondaryKanji: secondary,
                rgbValue,
                alphaProperties,
                behavioralSeed: Math.floor(Math.random() * 256) // Pseudo-random for demo
        }
}

export const findColorName = (rgb: number): string | null => {
        for (const [name, data] of TRADITIONAL_COLORS) {
                if (Math.abs(data.rgb - rgb) < 0x1000) { // Approximate match
                        return name
                }
        }
        return null
}

export const getSeasonalColors = (season: string): string[] => {
        const colors: string[] = []
        for (const [name, data] of TRADITIONAL_COLORS) {
                if (data.season === season) {
                        colors.push(name)
                }
        }
        return colors
}

export const rgbToTraditionalColor = (r: number, g: number, b: number): string => {
        const rgb = (r << 16) | (g << 8) | b
        return findColorName(rgb) || '色'
}

export const traditionalColorToRgb = (colorName: string): number => {
        const colorData = TRADITIONAL_COLORS.get(colorName)
        return colorData?.rgb || 0x808080 // Default gray
}

// Cultural validation for color harmony
export const validateColorHarmony = (color1: string, color2: string): boolean => {
        const data1 = TRADITIONAL_COLORS.get(color1)
        const data2 = TRADITIONAL_COLORS.get(color2)
        
        if (!data1 || !data2) return false
        
        // Traditional harmony rules (simplified)
        if (data1.season === data2.season) return true // Same season
        if (data1.meaning.includes('white') || data2.meaning.includes('white')) return true // White harmonizes
        
        return false
}

// Seasonal transformation for environmental response
export const applySeasonalTransform = (baseColor: number, season: string, intensity: number = 1.0): number => {
        const r = (baseColor >>> 16) & 0xFF
        const g = (baseColor >>> 8) & 0xFF
        const b = baseColor & 0xFF
        
        let nr = r, ng = g, nb = b
        
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