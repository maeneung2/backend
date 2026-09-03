ALTER TABLE "group" ADD COLUMN "rest_blocks_next_day_day" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "schedule" ADD COLUMN "rest_blocks_next_day_day" BOOLEAN NOT NULL DEFAULT true;
