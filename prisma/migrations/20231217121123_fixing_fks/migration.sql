/*
  Warnings:

  - You are about to drop the column `userId` on the `fasta_files` table. All the data in the column will be lost.
  - You are about to drop the column `fastaFileId` on the `sequences` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `fasta_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence_id` to the `jobs_sequences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fasta_file_id` to the `sequences` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "fasta_files" DROP CONSTRAINT "fasta_files_userId_fkey";

-- DropForeignKey
ALTER TABLE "sequences" DROP CONSTRAINT "sequences_fastaFileId_fkey";

-- AlterTable
ALTER TABLE "fasta_files" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "jobs_sequences" ADD COLUMN     "sequence_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sequences" DROP COLUMN "fastaFileId",
ADD COLUMN     "fasta_file_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "fasta_files" ADD CONSTRAINT "fasta_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_fasta_file_id_fkey" FOREIGN KEY ("fasta_file_id") REFERENCES "fasta_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs_sequences" ADD CONSTRAINT "jobs_sequences_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
