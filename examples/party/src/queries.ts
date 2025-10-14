import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import {
        users,
        accounts,
        sessions,
        verificationTokens,
        authenticators,
        userProfiles,
        worlds,
        worldRegions,
        voxelChunks,
        semanticVoxels,
        Colors,
        culturalEvents,
        Activities,
        eventParticipation,
        communities,
        communityMemberships,
        culturalProjects,
        educationalContent,
        culturalAchievements,
        learningProgress,
        knowledgeSharing,
        colorUsageLogs,
        culturalContexts,
} from './schema'

export const getUserBySub = (DB: D1Database, sub: string) => drizzle(DB).select().from(users).where(eq(users.id, sub)).limit(1)

export const getProfile = (DB: D1Database, userId: string) => drizzle(DB).select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)

export const getWorldsByCreator = (DB: D1Database, creatorId: string) => drizzle(DB).select().from(worlds).where(eq(worlds.creatorId, creatorId)).orderBy(desc(worlds.createdAt))

export const getPublicWorlds = (DB: D1Database, limit = 50) => drizzle(DB).select().from(worlds).where(eq(worlds.publicAccess, true)).orderBy(desc(worlds.createdAt)).limit(limit)

export const getWorldRegions = (DB: D1Database, worldId: string) => drizzle(DB).select().from(worldRegions).where(eq(worldRegions.worldId, worldId))

export const getVoxelChunks = (DB: D1Database, regionId: string) => drizzle(DB).select().from(voxelChunks).where(eq(voxelChunks.regionId, regionId))

export const getSemanticVoxels = (DB: D1Database, chunkId: string) => drizzle(DB).select().from(semanticVoxels).where(eq(semanticVoxels.chunkId, chunkId))

export const getColors = (DB: D1Database, seasonalAssociation?: string) =>
        drizzle(DB)
                .select()
                .from(Colors)
                .where(seasonalAssociation ? eq(Colors.seasonalAssociation, seasonalAssociation) : undefined)

export const getEvents = (DB: D1Database, timeFrom: Date, timeTo: Date) =>
        drizzle(DB)
                .select()
                .from(culturalEvents)
                .where(and(gte(culturalEvents.startTime, timeFrom), lte(culturalEvents.endTime, timeTo)))
                .orderBy(culturalEvents.startTime)

export const getCommunityMembers = (DB: D1Database, communityId: string) =>
        drizzle(DB)
                .select({
                        userId: users.id,
                        username: users.name,
                        role: communityMemberships.role,
                        joinedAt: communityMemberships.joinedAt,
                        culturalContributions: communityMemberships.culturalContributions,
                })
                .from(communityMemberships)
                .innerJoin(users, eq(users.id, communityMemberships.userId))
                .where(eq(communityMemberships.communityId, communityId))

export const getEducationalContent = (DB: D1Database, culturalContext?: string, difficultyLevel?: number) =>
        drizzle(DB)
                .select()
                .from(educationalContent)
                .where(and(culturalContext ? eq(educationalContent.culturalContext, culturalContext) : undefined, difficultyLevel ? eq(educationalContent.difficultyLevel, difficultyLevel) : undefined))
                .orderBy(desc(educationalContent.createdAt))

export const getLearningProgressByProfile = (DB: D1Database, profileId: string) =>
        drizzle(DB)
                .select({
                        contentTitle: educationalContent.contentTitle,
                        progressPercentage: learningProgress.progressPercentage,
                        completedAt: learningProgress.completedAt,
                        lastAccessed: learningProgress.lastAccessed,
                })
                .from(learningProgress)
                .innerJoin(educationalContent, eq(educationalContent.contentId, learningProgress.contentId))
                .where(eq(learningProgress.profileId, profileId))

export const getAchievements = (DB: D1Database, profileId: string) => drizzle(DB).select().from(culturalAchievements).where(eq(culturalAchievements.profileId, profileId)).orderBy(desc(culturalAchievements.earnedAt))

export const createProfile = (DB: D1Database, userId: string, culturalIdentity: string) =>
        drizzle(DB).insert(userProfiles).values({
                userId,
                culturalIdentity,
                culturalKnowledgeLevel: 1,
                learningPreferences: '{}',
                culturalInterests: '[]',
                achievementBadges: '[]',
        })

export const createWorld = (DB: D1Database, worldName: string, culturalTheme: string, creatorId: string, worldParameters = '{}', seasonalSettings = '{}') =>
        drizzle(DB).insert(worlds).values({
                worldName,
                culturalTheme,
                creatorId,
                worldParameters,
                seasonalSettings,
                maxParticipants: 32,
                publicAccess: true,
        })

export const createSemanticVoxel = (DB: D1Database, chunkId: string, localX: number, localY: number, localZ: number, primaryKanji: string, secondaryKanji: string, rgbValue: number, creatorId: string, alphaProperties = 255, behavioralSeed = 0) =>
        drizzle(DB).insert(semanticVoxels).values({
                chunkId,
                localX,
                localY,
                localZ,
                primaryKanji,
                secondaryKanji,
                rgbValue,
                alphaProperties,
                behavioralSeed,
                creatorId,
        })

export const createCommunity = (DB: D1Database, communityName: string, culturalFocus: string, founderId: string, communityGuidelines = '{}', culturalExpertise = '{}') =>
        drizzle(DB).insert(communities).values({
                communityName,
                culturalFocus,
                founderId,
                communityGuidelines,
                culturalExpertise,
        })

export const joinCommunity = (DB: D1Database, communityId: string, userId: string, role = 'member') =>
        drizzle(DB).insert(communityMemberships).values({
                communityId,
                userId,
                role,
                culturalContributions: '[]',
        })

export const createEducationalContent = (DB: D1Database, contentTitle: string, contentType: string, culturalContext: string, creatorId: string, contentData = '{}', learningObjectives = '[]', difficultyLevel = 1) =>
        drizzle(DB).insert(educationalContent).values({
                contentTitle,
                contentType,
                contentData,
                culturalContext,
                difficultyLevel,
                learningObjectives,
                creatorId,
        })

export const recordColorUsage = (DB: D1Database, colorId: string, userId: string, usageContext: string, appropriatenessScore: number, seasonalRelevance = true) =>
        drizzle(DB).insert(colorUsageLogs).values({
                colorId,
                userId,
                usageContext,
                appropriatenessScore,
                seasonalRelevance,
        })

export const shareKnowledge = (DB: D1Database, communityId: string, sharerId: string, knowledgeType: string, Wisdom: string, culturalContext: string, accessLevel = 'community') =>
        drizzle(DB).insert(knowledgeSharing).values({
                communityId,
                sharerId,
                knowledgeType,
                Wisdom,
                culturalContext,
                accessLevel,
        })

export const updateLearningProgress = (DB: D1Database, progressId: string, progressPercentage: number, skillAssessment = '{}') =>
        drizzle(DB)
                .update(learningProgress)
                .set({
                        progressPercentage,
                        skillAssessment,
                        lastAccessed: sql`(strftime('%s','now')*1000)`,
                })
                .where(eq(learningProgress.progressId, progressId))

export const awardAchievement = (DB: D1Database, profileId: string, achievementType: string, achievementData: string, culturalSignificance: string) =>
        drizzle(DB).insert(culturalAchievements).values({
                profileId,
                achievementType,
                achievementData,
                culturalSignificance,
        })

// region helpers
export const getWorldByName = (DB: D1Database, worldName: string) => drizzle(DB).select().from(worlds).where(eq(worlds.worldName, worldName)).limit(1)

export const getRegionByCoords = (DB: D1Database, worldId: string, i: number, j: number, k: number) =>
        drizzle(DB)
                .select()
                .from(worldRegions)
                .where(and(eq(worldRegions.worldId, worldId), eq(worldRegions.regionX, i), eq(worldRegions.regionY, j), eq(worldRegions.regionZ, k)))
                .limit(1)

export const insertRegion = (DB: D1Database, worldId: string, i: number, j: number, k: number, pngAtlasUrl: string, culturalContext = '') => drizzle(DB).insert(worldRegions).values({ worldId, regionX: i, regionY: j, regionZ: k, pngAtlasUrl, culturalContext, environmentalState: '{}' })

export const updateRegionPng = (DB: D1Database, regionId: string, pngAtlasUrl: string) =>
        drizzle(DB)
                .update(worldRegions)
                .set({ pngAtlasUrl, lastModified: sql`(strftime('%s','now')*1000)` })
                .where(eq(worldRegions.regionId, regionId))

export const clear = async (DB: D1Database, R2: R2Bucket) => {
        const db = drizzle(DB)
        await db.delete(semanticVoxels)
        await db.delete(voxelChunks)
        await db.delete(worldRegions)
        await db.delete(worlds)
        await db.delete(eventParticipation)
        await db.delete(Activities)
        await db.delete(culturalEvents)
        await db.delete(communityMemberships)
        await db.delete(culturalProjects)
        await db.delete(knowledgeSharing)
        await db.delete(communities)
        await db.delete(learningProgress)
        await db.delete(culturalAchievements)
        await db.delete(culturalContexts)
        await db.delete(educationalContent)
        await db.delete(colorUsageLogs)
        await db.delete(Colors)
        await db.delete(accounts)
        await db.delete(sessions)
        await db.delete(authenticators)
        await db.delete(verificationTokens)
        await db.delete(userProfiles)
        await db.delete(users)
        const items = await R2.list()
        await Promise.all(items.objects.map((it) => R2.delete(it.key)))
}
