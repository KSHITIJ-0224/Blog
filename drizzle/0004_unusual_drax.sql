ALTER TABLE "posts" ALTER COLUMN "excerpt" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "cover_image" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "cover_image" SET DEFAULT '';