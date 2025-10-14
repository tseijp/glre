import { drizzle } from 'drizzle-orm/d1'
import { culturalEvents, educationalContent, traditionalColors } from '../../schema'
import { loadTraditionalColors, getTraditionalColorsData, getChineseColorsData } from '../color/colors'

export const seedTraditionalColors = async (DB: D1Database) => {
        const db = drizzle(DB)

        // Load color data from JSON files
        await loadTraditionalColors()
        const japaneseColors = getTraditionalColorsData()
        const chineseColors = getChineseColorsData()

        // Seed Japanese traditional colors
        for (const color of japaneseColors) {
                try {
                        await db
                                .insert(traditionalColors)
                                .values({
                                        colorNameJa: color.colorNameJa,
                                        colorNameEn: color.colorNameEn,
                                        rgbValue: color.rgbValue,
                                        seasonalAssociation: color.seasonalAssociation,
                                        culturalSignificance: JSON.stringify(color.culturalSignificance),
                                        historicalContext: JSON.stringify(color.historicalContext),
                                        usageGuidelines: JSON.stringify({
                                                appropriate: ['art', 'ceremony', 'meditation'],
                                                context: color.seasonalAssociation,
                                                harmony: 'traditional',
                                        }),
                                })
                                .execute()
                } catch (error) {
                        // Color may already exist, continue
                        console.warn(`Color ${color.colorNameJa} may already exist`)
                }
        }

        // Seed Chinese traditional colors
        for (const color of chineseColors) {
                try {
                        await db
                                .insert(traditionalColors)
                                .values({
                                        colorNameZh: color.colorNameZh,
                                        colorNameEn: color.colorNameEn,
                                        rgbValue: color.rgbValue,
                                        seasonalAssociation: color.seasonalAssociation,
                                        culturalSignificance: JSON.stringify({
                                                wuxing: (color as any).element,
                                                direction: (color as any).culturalSignificance?.direction,
                                                emotion: (color as any).culturalSignificance?.emotion,
                                        }),
                                        historicalContext: JSON.stringify(color.historicalContext),
                                        usageGuidelines: JSON.stringify({
                                                element: (color as any).element,
                                                harmony: 'wuxing',
                                                ceremonial: true,
                                        }),
                                })
                                .execute()
                } catch (error) {
                        // Color may already exist, continue
                        console.warn(`Color ${color.colorNameZh} may already exist`)
                }
        }

        return { success: true, count: japaneseColors.length + chineseColors.length }
}

export const seedEducationalContent = async (DB: D1Database) => {
        const db = drizzle(DB)

        const culturalLessons = [
                {
                        contentTitle: 'Introduction to Traditional Japanese Colors',
                        contentType: 'interactive_lesson',
                        culturalContext: 'japanese_aesthetics',
                        difficultyLevel: 1,
                        contentData: JSON.stringify({
                                introduction: 'Explore the rich world of traditional Japanese colors and their cultural significance',
                                activities: ['color_identification', 'seasonal_matching', 'cultural_context'],
                                resources: ['color_wheel', 'seasonal_calendar', 'poetry_examples'],
                        }),
                        learningObjectives: JSON.stringify(['Recognize 10 traditional Japanese color names', 'Understand seasonal color associations', 'Apply cultural context to color choices']),
                        creatorId: 'system',
                },
                {
                        contentTitle: 'Five Elements Color Theory',
                        contentType: 'philosophical_study',
                        culturalContext: 'chinese_philosophy',
                        difficultyLevel: 2,
                        contentData: JSON.stringify({
                                introduction: 'Learn the ancient Chinese Five Elements (Wu Xing) color system',
                                elements: ['wood', 'fire', 'earth', 'metal', 'water'],
                                interactions: ['generating_cycle', 'destructive_cycle'],
                                applications: ['feng_shui', 'traditional_medicine', 'architecture'],
                        }),
                        learningObjectives: JSON.stringify(['Understand the Five Elements theory', 'Apply elemental color harmony rules', 'Create balanced color compositions']),
                        creatorId: 'system',
                },
                {
                        contentTitle: 'Seasonal Color Transitions in Virtual Worlds',
                        contentType: 'practical_workshop',
                        culturalContext: 'digital_heritage',
                        difficultyLevel: 3,
                        contentData: JSON.stringify({
                                introduction: 'Create dynamic environments that respond to seasonal cycles',
                                techniques: ['color_transformation', 'environmental_response', 'cultural_authenticity'],
                                tools: ['semantic_voxels', 'cultural_validation', 'seasonal_calendar'],
                        }),
                        learningObjectives: JSON.stringify(['Implement seasonal color transitions', 'Maintain cultural authenticity', 'Create living digital environments']),
                        creatorId: 'system',
                },
        ]

        for (const lesson of culturalLessons) {
                try {
                        await db.insert(educationalContent).values(lesson).execute()
                } catch (error) {
                        console.warn(`Educational content may already exist: ${lesson.contentTitle}`)
                }
        }

        return { success: true, count: culturalLessons.length }
}

// Seed cultural events based on traditional calendar
export const seedCulturalEvents = async (DB: D1Database) => {
        const db = drizzle(DB)
        const currentYear = new Date().getFullYear()
        const events = [
                {
                        eventName: 'Spring Cherry Blossom Festival',
                        culturalOrigin: 'japanese',
                        startTime: new Date(currentYear, 3, 1), // April 1st
                        endTime: new Date(currentYear, 3, 15), // April 15th
                        repeatingAnnual: true,
                        eventDetails: JSON.stringify({
                                description: 'Celebrate the ephemeral beauty of cherry blossoms',
                                activities: ['hanami_viewing', 'poetry_composition', 'traditional_dance'],
                                colors: ['桜色', '若草色', '朝霧'],
                                cultural_meaning: 'appreciation of transient beauty',
                        }),
                        participationRequirements: JSON.stringify({
                                respectful_behavior: true,
                                cultural_sensitivity: true,
                                appropriate_attire: 'traditional_or_respectful',
                        }),
                },
                {
                        eventName: 'Autumn Moon Viewing',
                        culturalOrigin: 'chinese_japanese',
                        startTime: new Date(currentYear, 8, 15), // September 15th
                        endTime: new Date(currentYear, 8, 17), // September 17th
                        repeatingAnnual: true,
                        eventDetails: JSON.stringify({
                                description: 'Traditional moon viewing ceremony with poetry and reflection',
                                activities: ['moon_viewing', 'poetry_sharing', 'tea_ceremony'],
                                colors: ['月白', '紅葉', '秋白'],
                                cultural_meaning: 'contemplation and gratitude',
                        }),
                        participationRequirements: JSON.stringify({
                                quiet_contemplation: true,
                                respect_for_tradition: true,
                                cultural_learning: true,
                        }),
                },
                {
                        eventName: 'Winter Solstice Meditation',
                        culturalOrigin: 'universal',
                        startTime: new Date(currentYear, 11, 21), // December 21st
                        endTime: new Date(currentYear, 11, 22), // December 22nd
                        repeatingAnnual: true,
                        eventDetails: JSON.stringify({
                                description: 'Meditative gathering for the longest night',
                                activities: ['silent_meditation', 'candlelight_ceremony', 'wisdom_sharing'],
                                colors: ['雪白', '玄水', '海松色'],
                                cultural_meaning: 'inner reflection and renewal',
                        }),
                        participationRequirements: JSON.stringify({
                                respectful_silence: true,
                                meditative_presence: true,
                                open_heart: true,
                        }),
                },
        ]

        for (const event of events) {
                try {
                        await db.insert(culturalEvents).values(event).execute()
                } catch (error) {
                        console.warn(`Event may already exist: ${event.eventName}`)
                }
        }

        return { success: true, count: events.length }
}

export const seedAllCulturalData = async (DB: D1Database) => {
        const results = await Promise.all([seedTraditionalColors(DB), seedEducationalContent(DB), seedCulturalEvents(DB)])

        return {
                success: true,
                results: {
                        colors: results[0],
                        education: results[1],
                        events: results[2],
                },
        }
}
