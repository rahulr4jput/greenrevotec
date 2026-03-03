/*
  Warnings:

  - A unique constraint covering the columns `[appCode]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobCode]` on the table `JobOpening` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "appCode" TEXT;

-- AlterTable
ALTER TABLE "JobOpening" ADD COLUMN     "jobCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_appCode_key" ON "JobApplication"("appCode");

-- CreateIndex
CREATE UNIQUE INDEX "JobOpening_jobCode_key" ON "JobOpening"("jobCode");
