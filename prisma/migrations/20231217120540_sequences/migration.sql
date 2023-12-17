/*
  Warnings:

  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JobSequenceStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAIL');

-- DropTable
DROP TABLE "jobs";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasta_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "fasta_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "fastaFileId" TEXT NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs_sequences" (
    "id" TEXT NOT NULL,
    "status" "JobSequenceStatus" NOT NULL,
    "result" TEXT,

    CONSTRAINT "jobs_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "fasta_files" ADD CONSTRAINT "fasta_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_fastaFileId_fkey" FOREIGN KEY ("fastaFileId") REFERENCES "fasta_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
