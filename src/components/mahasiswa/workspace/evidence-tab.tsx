'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/react';
import { WorkLogSection } from '@/components/mahasiswa/work-log-section';
import { UserPhotoUpload } from '@/components/mahasiswa/user-photo-upload';
import StakeholderUpload from '@/components/mahasiswa/stakeholder-upload';
import ProjectScreenshotUpload from '@/components/mahasiswa/screenshot-upload';
import type { WorkspaceProject, WorkspaceStakeholderDocument } from './types';

interface EvidenceTabProps {
  project: WorkspaceProject;
  canEdit: boolean;
}

export function EvidenceTab({ project, canEdit }: EvidenceTabProps) {
  const [stakeholderDocs, setStakeholderDocs] = useState(
    project.stakeholderDocuments.map((doc) => ({
      ...doc,
      uploadedAt:
        typeof doc.uploadedAt === 'string'
          ? doc.uploadedAt
          : doc.uploadedAt.toISOString(),
    })),
  );

  return (
    <div className="space-y-5 pt-2">
      {/* Laporan pengerjaan per-commit */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <WorkLogSection projectId={project.id} readOnly={!canEdit} />
        </CardBody>
      </Card>

      {/* Foto bersama pengguna */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <UserPhotoUpload projectId={project.id} readOnly={!canEdit} />
        </CardBody>
      </Card>

      {/* Dokumen stakeholder */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <StakeholderUpload
            projectId={project.id}
            documents={
              stakeholderDocs as Parameters<typeof StakeholderUpload>[0]['documents']
            }
            onDocumentsChange={(docs) =>
              setStakeholderDocs(docs as WorkspaceStakeholderDocument[] & typeof stakeholderDocs)
            }
            readOnly={!canEdit}
          />
        </CardBody>
      </Card>

      {/* Screenshot aplikasi */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <ProjectScreenshotUpload projectId={project.id} readOnly={!canEdit} />
        </CardBody>
      </Card>
    </div>
  );
}
