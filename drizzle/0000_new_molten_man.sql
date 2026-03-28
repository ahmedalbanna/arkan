CREATE TABLE `agent_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`description` text,
	`order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`prompt` text NOT NULL,
	`guidelines` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`author` text NOT NULL,
	`version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `device_tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`category` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generation_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` text NOT NULL,
	`user_id` text NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`credit_cost` integer NOT NULL,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `indexed_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text,
	`source_file` text NOT NULL,
	`chunks_count` integer NOT NULL,
	`file_size` integer NOT NULL,
	`type` text NOT NULL,
	`timestamp` integer NOT NULL,
	`indexed_at` text NOT NULL,
	`chunk_size` integer NOT NULL,
	`overlap` integer NOT NULL,
	`status` text NOT NULL,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `login_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`ip` text,
	`location` text,
	`user_agent` text,
	`fingerprint` text
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`link` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`snapshot_data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`project_description` text,
	`project_type` text,
	`specialization` text,
	`university` text,
	`supervisor` text,
	`course` text,
	`educational_level` text,
	`team_members` text,
	`logo_url` text,
	`university_logo_url` text,
	`content` text,
	`external_context` text,
	`author_id` text NOT NULL,
	`version` text DEFAULT '1.0.0',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`table_of_contents_markdown` text,
	`active_section_id` text,
	`language` text,
	`complexity` integer DEFAULT 50,
	`formality` integer DEFAULT 70,
	`tone` text,
	`behaviors` text,
	`rules` text,
	`constraints` text,
	`citation_style` text
);
--> statement-breakpoint
CREATE TABLE `scheduled_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`link` text,
	`scheduled_at` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scheduled_status_idx` ON `scheduled_notifications` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_time_idx` ON `scheduled_notifications` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `scheduled_user_idx` ON `scheduled_notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text,
	`guidelines` text,
	`model` text
);
--> statement-breakpoint
CREATE TABLE `security_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`admin_id` text,
	`timestamp` text NOT NULL,
	`ip` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`is_default` integer DEFAULT false,
	`content` text,
	`project_type` text,
	`specialization` text,
	`university` text,
	`course` text,
	`educational_level` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`plan_name` text NOT NULL,
	`credits` integer NOT NULL,
	`price` real NOT NULL,
	`user_name` text NOT NULL,
	`user_email` text NOT NULL,
	`status` text NOT NULL,
	`proof_url` text NOT NULL,
	`created_at` text NOT NULL,
	`admin_notes` text,
	`verified_at` text,
	`verified_by` text
);
--> statement-breakpoint
CREATE TABLE `user_fingerprints` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`last_used_at` text NOT NULL,
	`metadata` text,
	`token_version` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`credits` integer DEFAULT 0,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`bio` text,
	`profile_picture_url` text,
	`has_completed_onboarding` integer DEFAULT false,
	`api_keys` text,
	`last_daily_credit_update` text,
	`password_hash` text,
	`security_settings` text,
	`token_version` integer DEFAULT 1,
	`is_disabled` integer DEFAULT false,
	`two_factor_secret` text,
	`is_two_factor_enabled` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);