// Dynamic color data loading from D1 backend
let TRADITIONAL_COLORS_DATA: any[] = []

export const loadTraditionalColors = async (): Promise<void> => {
        try {
                // Load traditional colors from D1 backend
                const response = await fetch('/api/v1/colors')
                const colors = await response.json()
                
                TRADITIONAL_COLORS_DATA = colors.map((color: any) => ({
                        colorNameJa: color.colorNameJa,
                        colorNameZh: color.colorNameZh,
                        colorNameEn: color.colorNameEn,
                        rgbValue: color.rgbValue,
                        seasonalAssociation: color.seasonalAssociation,
                        culturalSignificance: typeof color.culturalSignificance === 'string' 
                                ? JSON.parse(color.culturalSignificance) 
                                : color.culturalSignificance,
                        historicalContext: typeof color.historicalContext === 'string' 
                                ? JSON.parse(color.historicalContext) 
                                : color.historicalContext,
                        element: color.culturalSignificance?.wuxing
                }))
        } catch (error) {
                initializeFallbackColors()
        }
}

export const getTraditionalColorsData = () => TRADITIONAL_COLORS_DATA.filter(c => c.colorNameJa)
export const getChineseColorsData = () => TRADITIONAL_COLORS_DATA.filter(c => c.colorNameZh)

// Color analysis helper functions
const convertKanjiToEnglish = (kanji: string): string => {
        const kanjiMap: Record<string, string> = {
                '桜': 'cherry', '色': 'color', '紅': 'crimson', '葉': 'leaf',
                '月': 'moon', '白': 'white', '藍': 'indigo', '若': 'young',
                '草': 'grass', '柿': 'persimmon', '雪': 'snow', '青': 'blue',
                '竹': 'bamboo', '海': 'sea', '松': 'pine', '朝': 'morning',
                '霧': 'mist', '夕': 'evening', '焼': 'glow'
        }
        return kanji.split('').map(char => kanjiMap[char] || 'traditional').join('_')
}

const convertChineseToEnglish = (chinese: string): string => {
        const chineseMap: Record<string, string> = {
                '粉': 'powder', '鳳': 'phoenix', '浅': 'light', '淡': 'pale',
                '紫': 'purple', '薇': 'violet', '暗': 'dark', '荷': 'lotus',
                '花': 'flower', '石': 'stone', '木': 'wood', '槿': 'hibiscus',
                '長': 'long', '春': 'spring', '洋': 'foreign', '葱': 'onion'
        }
        return chinese.split('').map(char => chineseMap[char] || 'traditional').join('_')
}

const inferSeasonFromColor = (name: string, r: number, g: number, b: number): string => {
        if (name.includes('桜') || name.includes('若')) return 'spring'
        if (name.includes('紅') || name.includes('柿')) return 'autumn'
        if (name.includes('雪') || name.includes('白')) return 'winter'
        if (name.includes('青') || name.includes('緑')) return 'summer'
        
        // Infer from RGB values
        const brightness = (r + g + b) / 3
        const greenish = g > r && g > b
        const reddish = r > g && r > b
        
        if (greenish) return 'spring'
        if (reddish && brightness < 150) return 'autumn'
        if (brightness > 200) return 'winter'
        return 'summer'
}

const inferSeasonFromWuXing = (name: string): string => {
        if (name.includes('春') || name.includes('青')) return 'spring'
        if (name.includes('夏') || name.includes('紅')) return 'summer'
        if (name.includes('秋') || name.includes('白')) return 'autumn'
        if (name.includes('冬') || name.includes('黑')) return 'winter'
        return 'all_seasons'
}

const inferWuXingElement = (name: string, r: number, g: number, b: number): string => {
        if (name.includes('青') || name.includes('緑')) return 'wood'
        if (name.includes('紅') || name.includes('赤')) return 'fire'
        if (name.includes('黄') || name.includes('土')) return 'earth'
        if (name.includes('白') || name.includes('金')) return 'metal'
        if (name.includes('黑') || name.includes('藍')) return 'water'
        
        // Infer from color values
        if (g > r && g > b) return 'wood'
        if (r > g && r > b) return 'fire'
        if (r > 200 && g > 200 && b < 150) return 'earth'
        if (r > 200 && g > 200 && b > 200) return 'metal'
        return 'water'
}

const generatePoetryContext = (name: string): string => {
        if (name.includes('桜')) return 'Cherry blossoms dancing'
        if (name.includes('月')) return 'Moonlight whispers'
        if (name.includes('雪')) return 'Silent snowfall'
        if (name.includes('海')) return 'Ocean depths'
        return 'Traditional beauty'
}

const inferEmotion = (name: string): string => {
        if (name.includes('桜')) return 'renewal'
        if (name.includes('紅')) return 'passion'
        if (name.includes('雪')) return 'purity'
        if (name.includes('海')) return 'depth'
        return 'harmony'
}

const inferDirection = (name: string): string => {
        if (name.includes('青') || name.includes('緑')) return 'east'
        if (name.includes('紅') || name.includes('赤')) return 'south'
        if (name.includes('白') || name.includes('金')) return 'west'
        if (name.includes('黑') || name.includes('藍')) return 'north'
        return 'center'
}

const inferChineseEmotion = (name: string): string => {
        if (name.includes('春')) return 'growth'
        if (name.includes('紅')) return 'joy'
        if (name.includes('白')) return 'righteousness'
        if (name.includes('黑')) return 'wisdom'
        return 'balance'
}

const initializeFallbackColors = (): void => {
        TRADITIONAL_COLORS_DATA = [
                { colorNameJa: '桜色', rgbValue: 0xFEF4F4, seasonalAssociation: 'spring' }
        ]
        CHINESE_COLORS_DATA = [
                { colorNameZh: '朱红', rgbValue: 0xFF2D2D, element: 'fire' }
        ]
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

// Cultural color harmony rules based on Five Elements theory
export const checkWuXingHarmony = (color1: string, color2: string): boolean => {
        const elementCycles = {
                generating: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
                destructive: { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' },
        }

        const c1 = TRADITIONAL_COLORS_DATA.find((c) => c.colorNameZh === color1)
        const c2 = TRADITIONAL_COLORS_DATA.find((c) => c.colorNameZh === color2)

        if (!c1 || !c2) return true

        const e1 = c1.element
        const e2 = c2.element

        return e1 === e2 || elementCycles.generating[e1 as keyof typeof elementCycles.generating] === e2
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