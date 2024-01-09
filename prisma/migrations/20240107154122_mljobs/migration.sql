/*
  Warnings:

  - You are about to drop the `jobs_sequences` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MlJobStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAIL');

-- DropForeignKey
ALTER TABLE "jobs_sequences" DROP CONSTRAINT "jobs_sequences_job_id_fkey";

-- DropForeignKey
ALTER TABLE "jobs_sequences" DROP CONSTRAINT "jobs_sequences_sequence_id_fkey";

-- DropTable
DROP TABLE "jobs_sequences";

-- DropEnum
DROP TYPE "JobSequenceStatus";

-- CreateTable
CREATE TABLE "ml_jobs" (
    "id" TEXT NOT NULL,
    "status" "MlJobStatus" NOT NULL,
    "result" TEXT,
    "sequence_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ml_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ml_jobs" ADD CONSTRAINT "ml_jobs_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ml_jobs" ADD CONSTRAINT "ml_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
