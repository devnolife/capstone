-- CreateTable
CREATE TABLE "project_work_logs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_user_photos" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "caption" TEXT,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationResult" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_user_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_work_logs_projectId_dayNumber_idx" ON "project_work_logs"("projectId", "dayNumber");

-- CreateIndex
CREATE INDEX "project_user_photos_projectId_idx" ON "project_user_photos"("projectId");

-- AddForeignKey
ALTER TABLE "project_work_logs" ADD CONSTRAINT "project_work_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_work_logs" ADD CONSTRAINT "project_work_logs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_user_photos" ADD CONSTRAINT "project_user_photos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_user_photos" ADD CONSTRAINT "project_user_photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

