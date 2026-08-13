'use client';

import { Card, CardBody } from '@heroui/react';
import { GitBranch } from 'lucide-react';
import { RequirementsForm } from './requirements-form';
import { ProjectSetupForm } from './project-setup-form';

interface CompletenessTabProps {
  projectId: string;
  canEdit: boolean;
}

/**
 * Tab Kelengkapan — satu tempat untuk mengisi SEMUA data project:
 * setup repository/consent/URL produksi + form persyaratan lengkap.
 */
export function CompletenessTab({ projectId, canEdit }: CompletenessTabProps) {
  return (
    <div className="space-y-6 pt-6">
      {/* Setup: GitHub repo, consent, production URL */}
      <section id="section-setup" className="scroll-mt-24">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch size={16} className="text-primary" />
          <h2 className="font-semibold">Repository & Setup Project</h2>
        </div>
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardBody className="p-4 md:p-6">
            <ProjectSetupForm projectId={projectId} canEdit={canEdit} />
          </CardBody>
        </Card>
      </section>

      {/* Form persyaratan lengkap */}
      <section id="section-persyaratan" className="scroll-mt-24">
        <RequirementsForm projectId={projectId} />
      </section>
    </div>
  );
}
