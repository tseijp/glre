import { integer, sqliteTable, text, primaryKey, index } from 'drizzle-orm/sqlite-core'
import type { AdapterAccountType } from '@auth/core/adapters'

/**
 * ↓↓↓　DO NOT CHANGE ↓↓↓
 */
export const users = sqliteTable('user', {
        id: text('id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        name: text('name'),
        email: text('email').unique(),
        emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
        image: text('image'),
})

export const accounts = sqliteTable(
        'account',
        {
                userId: text('userId')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                type: text('type').$type<AdapterAccountType>().notNull(),
                provider: text('provider').notNull(),
                providerAccountId: text('providerAccountId').notNull(),
                refresh_token: text('refresh_token'),
                access_token: text('access_token'),
                expires_at: integer('expires_at'),
                token_type: text('token_type'),
                scope: text('scope'),
                id_token: text('id_token'),
                session_state: text('session_state'),
        },
        (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
)

export const sessions = sqliteTable('session', {
        sessionToken: text('sessionToken').primaryKey(),
        userId: text('userId')
                .notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
        expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
        'verificationToken',
        {
                identifier: text('identifier').notNull(),
                token: text('token').notNull(),
                expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
        },
        (verificationToken) => [primaryKey({ columns: [verificationToken.identifier, verificationToken.token] })]
)

export const authenticators = sqliteTable(
        'authenticator',
        {
                credentialID: text('credentialID').notNull().unique(),
                userId: text('userId')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                providerAccountId: text('providerAccountId').notNull(),
                credentialPublicKey: text('credentialPublicKey').notNull(),
                counter: integer('counter').notNull(),
                credentialDeviceType: text('credentialDeviceType').notNull(),
                credentialBackedUp: integer('credentialBackedUp', {
                        mode: 'boolean',
                }).notNull(),
                transports: text('transports'),
        },
        (authenticator) => [primaryKey({ columns: [authenticator.userId, authenticator.credentialID] })]
)
/**
 * ↑↑↑　DO NOT CHANGE ↑↑↑
 */

export const userProfiles = sqliteTable('user_cultural_profile', {
        profileId: text('profile_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        userId: text('user_id')
                .notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
        culturalIdentity: text('cultural_identity'),
        culturalKnowledgeLevel: integer('cultural_knowledge_level').default(1),
        learningPreferences: text('learning_preferences', { mode: 'json' }),
        culturalInterests: text('cultural_interests', { mode: 'json' }),
        achievementBadges: text('achievement_badges', { mode: 'json' }),
        profileCreated: integer('profile_created', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
})

export const worlds = sqliteTable('world', {
        worldId: text('world_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        worldName: text('world_name').notNull(),
        culturalTheme: text('cultural_theme'),
        worldParameters: text('world_parameters', { mode: 'json' }),
        maxParticipants: integer('max_participants').default(32),
        creatorId: text('creator_id')
                .notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
        createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        publicAccess: integer('public_access', { mode: 'boolean' }).default(true),
        seasonalSettings: text('seasonal_settings', { mode: 'json' }),
})

export const worldRegions = sqliteTable(
        'world_region',
        {
                regionId: text('region_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                worldId: text('world_id')
                        .notNull()
                        .references(() => worlds.worldId, { onDelete: 'cascade' }),
                regionX: integer('region_x').notNull(),
                regionY: integer('region_y').notNull(),
                regionZ: integer('region_z').notNull(),
                culturalContext: text('cultural_context'),
                environmentalState: text('environmental_state', { mode: 'json' }),
                lastModified: integer('last_modified', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
                pngAtlasUrl: text('png_atlas_url'),
        },
        (table) => [index('world_region_coord_idx').on(table.worldId, table.regionX, table.regionY, table.regionZ)]
)

export const voxelChunks = sqliteTable(
        'voxel_chunk',
        {
                chunkId: text('chunk_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                regionId: text('region_id')
                        .notNull()
                        .references(() => worldRegions.regionId, { onDelete: 'cascade' }),
                chunkX: integer('chunk_x').notNull(),
                chunkY: integer('chunk_y').notNull(),
                chunkZ: integer('chunk_z').notNull(),
                voxelData: text('voxel_data'),
                lastModified: integer('last_modified', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        },
        (table) => [index('voxel_chunk_coord_idx').on(table.regionId, table.chunkX, table.chunkY, table.chunkZ)]
)

export const semanticVoxels = sqliteTable(
        'semantic_voxel',
        {
                voxelId: text('voxel_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                chunkId: text('chunk_id')
                        .notNull()
                        .references(() => voxelChunks.chunkId, { onDelete: 'cascade' }),
                localX: integer('local_x').notNull(),
                localY: integer('local_y').notNull(),
                localZ: integer('local_z').notNull(),
                primaryKanji: text('primary_kanji'),
                secondaryKanji: text('secondary_kanji'),
                rgbValue: integer('rgb_value').notNull(),
                alphaProperties: integer('alpha_properties').default(255),
                behavioralSeed: integer('behavioral_seed').default(0),
                creatorId: text('creator_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                placedAt: integer('placed_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        },
        (table) => [index('semantic_voxel_chunk_idx').on(table.chunkId, table.localX, table.localY, table.localZ)]
)

export const Colors = sqliteTable(
        'color',
        {
                colorId: text('color_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                colorNameZh: text('color_name_zh'),
                colorNameJa: text('color_name_ja'),
                colorNameEn: text('color_name_en').notNull(),
                rgbValue: integer('rgb_value').notNull(),
                seasonalAssociation: text('seasonal_association'),
                culturalSignificance: text('cultural_significance', { mode: 'json' }),
                historicalContext: text('historical_context', { mode: 'json' }),
                usageGuidelines: text('usage_guidelines', { mode: 'json' }),
        },
        (table) => [index('color_rgb_idx').on(table.rgbValue), index('color_season_idx').on(table.seasonalAssociation)]
)

export const culturalEvents = sqliteTable(
        'cultural_event',
        {
                eventId: text('event_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                eventName: text('event_name').notNull(),
                culturalOrigin: text('cultural_origin'),
                startTime: integer('start_time', { mode: 'timestamp_ms' }).notNull(),
                endTime: integer('end_time', { mode: 'timestamp_ms' }).notNull(),
                eventDetails: text('event_details', { mode: 'json' }),
                participationRequirements: text('participation_requirements', { mode: 'json' }),
                hostCommunityId: text('host_community_id').references(() => communities.communityId, { onDelete: 'set null' }),
                repeatingAnnual: integer('repeating_annual', { mode: 'boolean' }).default(false),
        },
        (table) => [index('cultural_event_time_idx').on(table.startTime, table.endTime)]
)

export const communities = sqliteTable('community', {
        communityId: text('community_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        communityName: text('community_name').notNull(),
        culturalFocus: text('cultural_focus'),
        communityGuidelines: text('community_guidelines', { mode: 'json' }),
        founderId: text('founder_id')
                .notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
        established: integer('established', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        memberCount: integer('member_count').default(1),
        culturalExpertise: text('cultural_expertise', { mode: 'json' }),
})

export const communityMemberships = sqliteTable(
        'community_membership',
        {
                membershipId: text('membership_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                communityId: text('community_id')
                        .notNull()
                        .references(() => communities.communityId, { onDelete: 'cascade' }),
                userId: text('user_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                role: text('role').default('member'),
                joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
                culturalContributions: text('cultural_contributions', { mode: 'json' }),
        },
        (table) => [index('community_membership_unique_idx').on(table.communityId, table.userId)]
)

export const educationalContent = sqliteTable(
        'educational_content',
        {
                contentId: text('content_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                contentTitle: text('content_title').notNull(),
                contentType: text('content_type').notNull(),
                contentData: text('content_data', { mode: 'json' }),
                culturalContext: text('cultural_context'),
                difficultyLevel: integer('difficulty_level').default(1),
                learningObjectives: text('learning_objectives', { mode: 'json' }),
                creatorId: text('creator_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        },
        (table) => [index('educational_content_type_idx').on(table.contentType), index('educational_content_cultural_idx').on(table.culturalContext)]
)

export const culturalAchievements = sqliteTable(
        'cultural_achievement',
        {
                achievementId: text('achievement_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                profileId: text('profile_id')
                        .notNull()
                        .references(() => userProfiles.profileId, { onDelete: 'cascade' }),
                achievementType: text('achievement_type').notNull(),
                achievementData: text('achievement_data', { mode: 'json' }),
                earnedAt: integer('earned_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
                culturalSignificance: text('cultural_significance'),
        },
        (table) => [index('cultural_achievement_profile_idx').on(table.profileId, table.achievementType)]
)

export const learningProgress = sqliteTable(
        'learning_progress',
        {
                progressId: text('progress_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                profileId: text('profile_id')
                        .notNull()
                        .references(() => userProfiles.profileId, { onDelete: 'cascade' }),
                contentId: text('content_id')
                        .notNull()
                        .references(() => educationalContent.contentId, { onDelete: 'cascade' }),
                progressPercentage: integer('progress_percentage').default(0),
                completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
                skillAssessment: text('skill_assessment', { mode: 'json' }),
                lastAccessed: integer('last_accessed', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        },
        (table) => [index('learning_progress_profile_idx').on(table.profileId, table.contentId)]
)

export const eventParticipation = sqliteTable(
        'event_participation',
        {
                participationId: text('participation_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                eventId: text('event_id')
                        .notNull()
                        .references(() => culturalEvents.eventId, { onDelete: 'cascade' }),
                userId: text('user_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                participationLevel: text('participation_level').default('observer'),
                joinedAt: integer('joined_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
                culturalContribution: text('cultural_contribution', { mode: 'json' }),
        },
        (table) => [index('event_participation_unique_idx').on(table.eventId, table.userId)]
)

export const Activities = sqliteTable('activity', {
        activityId: text('activity_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        eventId: text('event_id')
                .notNull()
                .references(() => culturalEvents.eventId, { onDelete: 'cascade' }),
        activityName: text('activity_name').notNull(),
        activityDescription: text('activity_description'),
        culturalInstructions: text('cultural_instructions', { mode: 'json' }),
        requiredSkillLevel: integer('required_skill_level').default(1),
        maxParticipants: integer('max_participants'),
        scheduledTime: integer('scheduled_time', { mode: 'timestamp_ms' }),
})

export const culturalProjects = sqliteTable('cultural_project', {
        projectId: text('project_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        communityId: text('community_id')
                .notNull()
                .references(() => communities.communityId, { onDelete: 'cascade' }),
        projectName: text('project_name').notNull(),
        projectDescription: text('project_description'),
        culturalObjectives: text('cultural_objectives', { mode: 'json' }),
        startDate: integer('start_date', { mode: 'timestamp_ms' }),
        targetCompletion: integer('target_completion', { mode: 'timestamp_ms' }),
        projectStatus: text('project_status').default('planning'),
        collaborativeData: text('collaborative_data', { mode: 'json' }),
})

export const knowledgeSharing = sqliteTable(
        'knowledge_sharing',
        {
                sharingId: text('sharing_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                communityId: text('community_id')
                        .notNull()
                        .references(() => communities.communityId, { onDelete: 'cascade' }),
                sharerId: text('sharer_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                knowledgeType: text('knowledge_type').notNull(),
                Wisdom: text('wisdom', { mode: 'json' }),
                culturalContext: text('cultural_context'),
                sharedAt: integer('shared_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
                accessLevel: text('access_level').default('community'),
        },
        (table) => [index('knowledge_sharing_type_idx').on(table.knowledgeType), index('knowledge_sharing_community_idx').on(table.communityId, table.sharedAt)]
)

export const colorUsageLogs = sqliteTable(
        'color_usage_log',
        {
                usageId: text('usage_id')
                        .primaryKey()
                        .$defaultFn(() => crypto.randomUUID()),
                colorId: text('color_id')
                        .notNull()
                        .references(() => Colors.colorId, { onDelete: 'cascade' }),
                userId: text('user_id')
                        .notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
                usageContext: text('usage_context'),
                appropriatenessScore: integer('appropriateness_score'),
                seasonalRelevance: integer('seasonal_relevance', { mode: 'boolean' }).default(true),
                usedAt: integer('used_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()),
        },
        (table) => [index('color_usage_log_color_idx').on(table.colorId, table.usedAt), index('color_usage_log_user_idx').on(table.userId, table.usedAt)]
)

export const culturalContexts = sqliteTable('cultural_context', {
        contextId: text('context_id')
                .primaryKey()
                .$defaultFn(() => crypto.randomUUID()),
        colorId: text('color_id').references(() => Colors.colorId, { onDelete: 'cascade' }),
        contentId: text('content_id').references(() => educationalContent.contentId, { onDelete: 'cascade' }),
        contextType: text('context_type').notNull(),
        culturalMeaning: text('cultural_meaning', { mode: 'json' }),
        historicalPeriod: text('historical_period'),
        geographicalOrigin: text('geographical_origin'),
        spiritualSignificance: text('spiritual_significance', { mode: 'json' }),
        modernRelevance: text('modern_relevance'),
})
