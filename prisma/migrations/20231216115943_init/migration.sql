/*
  Warnings:

  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Job";

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);
