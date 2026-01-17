-- CreateTable
CREATE TABLE "project_requirements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_requirements_projectId_category_idx" ON "project_requirements"("projectId", "category");

-- AddForeignKey
ALTER TABLE "project_requirements" ADD CONSTRAINT "project_requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
