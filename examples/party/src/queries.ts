import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { users, userCulturalProfiles, worlds, worldRegions, voxelChunks, semanticVoxels, traditionalColors, culturalEvents, communities, communityMemberships, educationalContent, culturalAchievements, learningProgress, knowledgeSharing, colorUsageLogs } from './schema'

export const getUserBySub = (DB: D1Database, sub: string) => drizzle(DB).select().from(users).where(eq(users.id, sub)).limit(1)

export const getCulturalProfile = (DB: D1Database, userId: string) => drizzle(DB).select().from(userCulturalProfiles).where(eq(userCulturalProfiles.userId, userId)).limit(1)

export const getWorldsByCreator = (DB: D1Database, creatorId: string) => drizzle(DB).select().from(worlds).where(eq(worlds.creatorId, creatorId)).orderBy(desc(worlds.createdAt))

export const getPublicWorlds = (DB: D1Database, limit = 50) => drizzle(DB).select().from(worlds).where(eq(worlds.publicAccess, true)).orderBy(desc(worlds.createdAt)).limit(limit)

export const getWorldRegions = (DB: D1Database, worldId: string) => drizzle(DB).select().from(worldRegions).where(eq(worldRegions.worldId, worldId))

export const getVoxelChunks = (DB: D1Database, regionId: string) => drizzle(DB).select().from(voxelChunks).where(eq(voxelChunks.regionId, regionId))

export const getSemanticVoxels = (DB: D1Database, chunkId: string) => drizzle(DB).select().from(semanticVoxels).where(eq(semanticVoxels.chunkId, chunkId))

export const getTraditionalColors = (DB: D1Database, seasonalAssociation?: string) =>
        drizzle(DB)
                .select()
                .from(traditionalColors)
                .where(seasonalAssociation ? eq(traditionalColors.seasonalAssociation, seasonalAssociation) : undefined)

export const getCulturalEvents = (DB: D1Database, timeFrom: Date, timeTo: Date) =>
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

export const getCulturalAchievements = (DB: D1Database, profileId: string) => drizzle(DB).select().from(culturalAchievements).where(eq(culturalAchievements.profileId, profileId)).orderBy(desc(culturalAchievements.earnedAt))

export const createCulturalProfile = (DB: D1Database, userId: string, culturalIdentity: string) =>
        drizzle(DB).insert(userCulturalProfiles).values({
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

export const shareKnowledge = (DB: D1Database, communityId: string, sharerId: string, knowledgeType: string, traditionalWisdom: string, culturalContext: string, accessLevel = 'community') =>
        drizzle(DB).insert(knowledgeSharing).values({
                communityId,
                sharerId,
                knowledgeType,
                traditionalWisdom,
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

export const awardCulturalAchievement = (DB: D1Database, profileId: string, achievementType: string, achievementData: string, culturalSignificance: string) =>
        drizzle(DB).insert(culturalAchievements).values({
                profileId,
                achievementType,
                achievementData,
                culturalSignificance,
        })
