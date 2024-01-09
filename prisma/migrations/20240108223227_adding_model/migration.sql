/*
  Warnings:

  - Added the required column `model` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Models" AS ENUM ('DS_DSSP', 'AS_DSSP', 'DeepSplicer', 'SpliceAI');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "model" "Models" NOT NULL;
