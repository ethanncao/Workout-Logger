/*
  Warnings:

  - A unique constraint covering the columns `[userId,normalized]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Exercise_normalized_key";

-- AlterTable
ALTER TABLE "public"."Exercise" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Exercise_userId_normalized_idx" ON "public"."Exercise"("userId", "normalized");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_userId_normalized_key" ON "public"."Exercise"("userId", "normalized");

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
