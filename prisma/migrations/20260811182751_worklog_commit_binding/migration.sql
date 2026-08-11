-- Ikat laporan pengerjaan ke commit GitHub
ALTER TABLE "project_work_logs" ADD COLUMN "commitSha" TEXT NOT NULL DEFAULT '';
ALTER TABLE "project_work_logs" ALTER COLUMN "commitSha" DROP DEFAULT;
ALTER TABLE "project_work_logs" ADD COLUMN "commitMessage" TEXT;
ALTER TABLE "project_work_logs" ADD COLUMN "commitUrl" TEXT;
ALTER TABLE "project_work_logs" ADD COLUMN "commitDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "project_work_logs_projectId_commitSha_key" ON "project_work_logs"("projectId", "commitSha");
