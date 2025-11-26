-- CreateEnum
CREATE TYPE "public"."CompetitionStatus" AS ENUM ('DRAFT', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CompetitionType" AS ENUM ('LEAGUE', 'TOURNAMENT', 'CUP');

-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "competitionId" TEXT;

-- CreateTable
CREATE TABLE "public"."Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."CompetitionType" NOT NULL DEFAULT 'LEAGUE',
    "status" "public"."CompetitionStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL,
    "city" "public"."City" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompetitionPlayer" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompetitionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Competition_city_idx" ON "public"."Competition"("city");

-- CreateIndex
CREATE INDEX "Competition_isActive_idx" ON "public"."Competition"("isActive");

-- CreateIndex
CREATE INDEX "Competition_status_idx" ON "public"."Competition"("status");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_competitionId_idx" ON "public"."CompetitionPlayer"("competitionId");

-- CreateIndex
CREATE INDEX "CompetitionPlayer_playerId_idx" ON "public"."CompetitionPlayer"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionPlayer_competitionId_playerId_key" ON "public"."CompetitionPlayer"("competitionId", "playerId");

-- CreateIndex
CREATE INDEX "Group_competitionId_idx" ON "public"."Group"("competitionId");

-- AddForeignKey
ALTER TABLE "public"."CompetitionPlayer" ADD CONSTRAINT "CompetitionPlayer_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetitionPlayer" ADD CONSTRAINT "CompetitionPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
