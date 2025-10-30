ALTER TABLE "posts" ALTER COLUMN "excerpt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "cover_image" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "cover_image" DROP DEFAULT;