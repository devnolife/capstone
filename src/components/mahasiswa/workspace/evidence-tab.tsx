'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/react';
import { WorkLogSection } from '@/components/mahasiswa/work-log-section';
import { UserPhotoUpload } from '@/components/mahasiswa/user-photo-upload';
import StakeholderUpload from '@/components/mahasiswa/stakeholder-upload';
import ProjectScreenshotUpload from '@/components/mahasiswa/screenshot-upload';
import { CodeBrowser } from './code-browser';
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
    <div className="space-y-6 pt-6">
      {/* Laporan pengerjaan per-commit */}
      <section id="section-worklog" className="scroll-mt-24">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-6">
            <WorkLogSection projectId={project.id} readOnly={!canEdit} />
          </CardBody>
        </Card>
      </section>

      {/* Foto bersama pengguna */}
      <section id="section-userphoto" className="scroll-mt-24">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-6">
            <UserPhotoUpload projectId={project.id} readOnly={!canEdit} />
          </CardBody>
        </Card>
      </section>

      {/* Dokumen stakeholder */}
      <section id="section-stakeholder" className="scroll-mt-24">
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-6">
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
      </section>

      {/* Screenshot aplikasi */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-6">
          <ProjectScreenshotUpload projectId={project.id} readOnly={!canEdit} />
        </CardBody>
      </Card>

      {/* Lihat kode repository */}
      {project.githubRepoUrl && (
        <section id="section-code" className="scroll-mt-24">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardBody className="p-4 md:p-6">
              <CodeBrowser projectId={project.id} />
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}
