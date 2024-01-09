/*
  Warnings:

  - You are about to drop the column `sequence` on the `sequences` table. All the data in the column will be lost.
  - You are about to drop the column `sequenceName` on the `sequences` table. All the data in the column will be lost.
  - Added the required column `content` to the `sequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `sequences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sequences" DROP COLUMN "sequence",
DROP COLUMN "sequenceName",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
