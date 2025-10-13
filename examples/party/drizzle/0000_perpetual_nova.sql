CREATE TABLE `activity` (
	`activity_id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`activity_name` text NOT NULL,
	`activity_description` text,
	`cultural_instructions` text,
	`required_skill_level` integer DEFAULT 1,
	`max_participants` integer,
	`scheduled_time` integer,
	FOREIGN KEY (`event_id`) REFERENCES `cultural_event`(`event_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `color` (
	`color_id` text PRIMARY KEY NOT NULL,
	`color_name_zh` text,
	`color_name_ja` text,
	`color_name_en` text NOT NULL,
	`rgb_value` integer NOT NULL,
	`seasonal_association` text,
	`cultural_significance` text,
	`historical_context` text,
	`usage_guidelines` text
);
--> statement-breakpoint
CREATE INDEX `color_rgb_idx` ON `color` (`rgb_value`);--> statement-breakpoint
CREATE INDEX `color_season_idx` ON `color` (`seasonal_association`);--> statement-breakpoint
CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authenticator` (
	`credentialID` text NOT NULL,
	`userId` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`credentialPublicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`credentialDeviceType` text NOT NULL,
	`credentialBackedUp` integer NOT NULL,
	`transports` text,
	PRIMARY KEY(`userId`, `credentialID`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE TABLE `color_usage_log` (
	`usage_id` text PRIMARY KEY NOT NULL,
	`color_id` text NOT NULL,
	`user_id` text NOT NULL,
	`usage_context` text,
	`appropriateness_score` integer,
	`seasonal_relevance` integer DEFAULT true,
	`used_at` integer,
	FOREIGN KEY (`color_id`) REFERENCES `color`(`color_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `color_usage_log_color_idx` ON `color_usage_log` (`color_id`,`used_at`);--> statement-breakpoint
CREATE INDEX `color_usage_log_user_idx` ON `color_usage_log` (`user_id`,`used_at`);--> statement-breakpoint
CREATE TABLE `community` (
	`community_id` text PRIMARY KEY NOT NULL,
	`community_name` text NOT NULL,
	`cultural_focus` text,
	`community_guidelines` text,
	`founder_id` text NOT NULL,
	`established` integer,
	`member_count` integer DEFAULT 1,
	`cultural_expertise` text,
	FOREIGN KEY (`founder_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `community_membership` (
	`membership_id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`joined_at` integer,
	`cultural_contributions` text,
	FOREIGN KEY (`community_id`) REFERENCES `community`(`community_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `community_membership_unique_idx` ON `community_membership` (`community_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `cultural_achievement` (
	`achievement_id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`achievement_type` text NOT NULL,
	`achievement_data` text,
	`earned_at` integer,
	`cultural_significance` text,
	FOREIGN KEY (`profile_id`) REFERENCES `user_cultural_profile`(`profile_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cultural_achievement_profile_idx` ON `cultural_achievement` (`profile_id`,`achievement_type`);--> statement-breakpoint
CREATE TABLE `cultural_context` (
	`context_id` text PRIMARY KEY NOT NULL,
	`color_id` text,
	`content_id` text,
	`context_type` text NOT NULL,
	`cultural_meaning` text,
	`historical_period` text,
	`geographical_origin` text,
	`spiritual_significance` text,
	`modern_relevance` text,
	FOREIGN KEY (`color_id`) REFERENCES `color`(`color_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_id`) REFERENCES `educational_content`(`content_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cultural_event` (
	`event_id` text PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`cultural_origin` text,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`event_details` text,
	`participation_requirements` text,
	`host_community_id` text,
	`repeating_annual` integer DEFAULT false,
	FOREIGN KEY (`host_community_id`) REFERENCES `community`(`community_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `cultural_event_time_idx` ON `cultural_event` (`start_time`,`end_time`);--> statement-breakpoint
CREATE TABLE `cultural_project` (
	`project_id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`project_name` text NOT NULL,
	`project_description` text,
	`cultural_objectives` text,
	`start_date` integer,
	`target_completion` integer,
	`project_status` text DEFAULT 'planning',
	`collaborative_data` text,
	FOREIGN KEY (`community_id`) REFERENCES `community`(`community_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `educational_content` (
	`content_id` text PRIMARY KEY NOT NULL,
	`content_title` text NOT NULL,
	`content_type` text NOT NULL,
	`content_data` text,
	`cultural_context` text,
	`difficulty_level` integer DEFAULT 1,
	`learning_objectives` text,
	`creator_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `educational_content_type_idx` ON `educational_content` (`content_type`);--> statement-breakpoint
CREATE INDEX `educational_content_cultural_idx` ON `educational_content` (`cultural_context`);--> statement-breakpoint
CREATE TABLE `event_participation` (
	`participation_id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`participation_level` text DEFAULT 'observer',
	`joined_at` integer,
	`cultural_contribution` text,
	FOREIGN KEY (`event_id`) REFERENCES `cultural_event`(`event_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_participation_unique_idx` ON `event_participation` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `knowledge_sharing` (
	`sharing_id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`sharer_id` text NOT NULL,
	`knowledge_type` text NOT NULL,
	`wisdom` text,
	`cultural_context` text,
	`shared_at` integer,
	`access_level` text DEFAULT 'community',
	FOREIGN KEY (`community_id`) REFERENCES `community`(`community_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sharer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `knowledge_sharing_type_idx` ON `knowledge_sharing` (`knowledge_type`);--> statement-breakpoint
CREATE INDEX `knowledge_sharing_community_idx` ON `knowledge_sharing` (`community_id`,`shared_at`);--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`progress_id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`content_id` text NOT NULL,
	`progress_percentage` integer DEFAULT 0,
	`completed_at` integer,
	`skill_assessment` text,
	`last_accessed` integer,
	FOREIGN KEY (`profile_id`) REFERENCES `user_cultural_profile`(`profile_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_id`) REFERENCES `educational_content`(`content_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_progress_profile_idx` ON `learning_progress` (`profile_id`,`content_id`);--> statement-breakpoint
CREATE TABLE `semantic_voxel` (
	`voxel_id` text PRIMARY KEY NOT NULL,
	`chunk_id` text NOT NULL,
	`local_x` integer NOT NULL,
	`local_y` integer NOT NULL,
	`local_z` integer NOT NULL,
	`primary_kanji` text,
	`secondary_kanji` text,
	`rgb_value` integer NOT NULL,
	`alpha_properties` integer DEFAULT 255,
	`behavioral_seed` integer DEFAULT 0,
	`creator_id` text NOT NULL,
	`placed_at` integer,
	FOREIGN KEY (`chunk_id`) REFERENCES `voxel_chunk`(`chunk_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `semantic_voxel_chunk_idx` ON `semantic_voxel` (`chunk_id`,`local_x`,`local_y`,`local_z`);--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_cultural_profile` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cultural_identity` text,
	`cultural_knowledge_level` integer DEFAULT 1,
	`learning_preferences` text,
	`cultural_interests` text,
	`achievement_badges` text,
	`profile_created` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `voxel_chunk` (
	`chunk_id` text PRIMARY KEY NOT NULL,
	`region_id` text NOT NULL,
	`chunk_x` integer NOT NULL,
	`chunk_y` integer NOT NULL,
	`chunk_z` integer NOT NULL,
	`voxel_data` text,
	`last_modified` integer,
	FOREIGN KEY (`region_id`) REFERENCES `world_region`(`region_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `voxel_chunk_coord_idx` ON `voxel_chunk` (`region_id`,`chunk_x`,`chunk_y`,`chunk_z`);--> statement-breakpoint
CREATE TABLE `world_region` (
	`region_id` text PRIMARY KEY NOT NULL,
	`world_id` text NOT NULL,
	`region_x` integer NOT NULL,
	`region_y` integer NOT NULL,
	`region_z` integer NOT NULL,
	`cultural_context` text,
	`environmental_state` text,
	`last_modified` integer,
	`png_atlas_url` text,
	FOREIGN KEY (`world_id`) REFERENCES `world`(`world_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `world_region_coord_idx` ON `world_region` (`world_id`,`region_x`,`region_y`,`region_z`);--> statement-breakpoint
CREATE TABLE `world` (
	`world_id` text PRIMARY KEY NOT NULL,
	`world_name` text NOT NULL,
	`cultural_theme` text,
	`world_parameters` text,
	`max_participants` integer DEFAULT 32,
	`creator_id` text NOT NULL,
	`created_at` integer,
	`public_access` integer DEFAULT true,
	`seasonal_settings` text,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
