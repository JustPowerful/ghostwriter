-- CreateEnum
CREATE TYPE "Role" AS ENUM ('viewer', 'editor', 'commenter', 'admin');

-- AddColumn
ALTER TABLE "Member" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'viewer';