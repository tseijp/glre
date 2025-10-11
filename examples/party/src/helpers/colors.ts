// Traditional Japanese colors with cultural context
export const TRADITIONAL_COLORS_DATA = [
        {
                colorNameJa: '桜色',
                colorNameEn: 'Cherry Blossom Pink',
                rgbValue: 0xfef4f4,
                seasonalAssociation: 'spring',
                culturalSignificance: { beauty: 'ephemeral', emotion: 'joy', ceremony: 'hanami' },
                historicalContext: { period: 'heian', poetry: true, aristocracy: true },
        },
        {
                colorNameJa: '紅葉',
                colorNameEn: 'Autumn Leaves Red',
                rgbValue: 0xcd5c5c,
                seasonalAssociation: 'autumn',
                culturalSignificance: { beauty: 'transient', emotion: 'melancholy', ceremony: 'momiji-gari' },
                historicalContext: { period: 'heian', poetry: true, nature: true },
        },
        {
                colorNameJa: '月白',
                colorNameEn: 'Moonlight White',
                rgbValue: 0xf8f8ff,
                seasonalAssociation: 'night',
                culturalSignificance: { purity: true, meditation: true, zen: true },
                historicalContext: { period: 'muromachi', poetry: true, spirituality: true },
        },
        {
                colorNameJa: '藍色',
                colorNameEn: 'Indigo Blue',
                rgbValue: 0x165e83,
                seasonalAssociation: 'summer',
                culturalSignificance: { craft: 'dyeing', tradition: 'artisan', protection: true },
                historicalContext: { period: 'edo', commerce: true, common: true },
        },
        {
                colorNameJa: '若草色',
                colorNameEn: 'Young Grass Green',
                rgbValue: 0xc3d825,
                seasonalAssociation: 'spring',
                culturalSignificance: { growth: true, renewal: true, hope: true },
                historicalContext: { period: 'ancient', nature: true, agriculture: true },
        },
        {
                colorNameJa: '雪白',
                colorNameEn: 'Snow White',
                rgbValue: 0xfffff0,
                seasonalAssociation: 'winter',
                culturalSignificance: { purity: true, silence: true, contemplation: true },
                historicalContext: { period: 'heian', poetry: true, isolation: true },
        },
        {
                colorNameJa: '夕焼け',
                colorNameEn: 'Sunset Orange',
                rgbValue: 0xff7f50,
                seasonalAssociation: 'autumn',
                culturalSignificance: { beauty: 'fleeting', emotion: 'nostalgia', time: 'twilight' },
                historicalContext: { period: 'heian', poetry: true, contemplation: true },
        },
        {
                colorNameJa: '青竹色',
                colorNameEn: 'Green Bamboo',
                rgbValue: 0x7ebeab,
                seasonalAssociation: 'summer',
                culturalSignificance: { strength: true, flexibility: true, growth: true },
                historicalContext: { period: 'ancient', architecture: true, zen: true },
        },
        {
                colorNameJa: '朝霧',
                colorNameEn: 'Morning Mist',
                rgbValue: 0xe6e6fa,
                seasonalAssociation: 'spring',
                culturalSignificance: { mystery: true, meditation: true, renewal: true },
                historicalContext: { period: 'heian', poetry: true, nature: true },
        },
        {
                colorNameJa: '海松色',
                colorNameEn: 'Seaweed Green',
                rgbValue: 0x726d40,
                seasonalAssociation: 'winter',
                culturalSignificance: { endurance: true, earth: true, survival: true },
                historicalContext: { period: 'kamakura', warrior: true, practical: true },
        },
]

// Chinese traditional colors with Five Elements theory
export const CHINESE_COLORS_DATA = [
        {
                colorNameZh: '春霞',
                colorNameEn: 'Spring Haze',
                rgbValue: 0xe8d5b7,
                seasonalAssociation: 'spring',
                element: 'wood',
                culturalSignificance: { wuxing: 'wood', direction: 'east', emotion: 'benevolence' },
                historicalContext: { dynasty: 'tang', poetry: true, painting: true },
        },
        {
                colorNameZh: '朱砂',
                colorNameEn: 'Cinnabar Red',
                rgbValue: 0xff4500,
                seasonalAssociation: 'summer',
                element: 'fire',
                culturalSignificance: { wuxing: 'fire', direction: 'south', emotion: 'joy' },
                historicalContext: { dynasty: 'han', imperial: true, ceremonial: true },
        },
        {
                colorNameZh: '土黄',
                colorNameEn: 'Earth Yellow',
                rgbValue: 0xdaa520,
                seasonalAssociation: 'late_summer',
                element: 'earth',
                culturalSignificance: { wuxing: 'earth', direction: 'center', emotion: 'thoughtfulness' },
                historicalContext: { dynasty: 'ming', imperial: true, architecture: true },
        },
        {
                colorNameZh: '秋白',
                colorNameEn: 'Autumn White',
                rgbValue: 0xf5f5dc,
                seasonalAssociation: 'autumn',
                element: 'metal',
                culturalSignificance: { wuxing: 'metal', direction: 'west', emotion: 'righteousness' },
                historicalContext: { dynasty: 'song', philosophy: true, literati: true },
        },
        {
                colorNameZh: '玄水',
                colorNameEn: 'Mysterious Water',
                rgbValue: 0x191970,
                seasonalAssociation: 'winter',
                element: 'water',
                culturalSignificance: { wuxing: 'water', direction: 'north', emotion: 'wisdom' },
                historicalContext: { dynasty: 'yuan', philosophy: true, daoism: true },
        },
]

export const getAllTraditionalColors = () => [...TRADITIONAL_COLORS_DATA, ...CHINESE_COLORS_DATA]

export const getColorsBySeasonalAssociation = (season: string) => getAllTraditionalColors().filter((color) => color.seasonalAssociation === season)

export const getColorsByElement = (element: string) => CHINESE_COLORS_DATA.filter((color) => color.element === element)

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

        const c1 = CHINESE_COLORS_DATA.find((c) => c.colorNameZh === color1)
        const c2 = CHINESE_COLORS_DATA.find((c) => c.colorNameZh === color2)

        if (!c1 || !c2) return true // Allow if not in system

        const e1 = c1.element
        const e2 = c2.element

        // Harmonious if same element or in generating cycle
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
