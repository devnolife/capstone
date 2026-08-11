'use client';

import { RequirementsForm } from './requirements-form';

interface RequirementsTabProps {
  projectId: string;
  readOnly?: boolean;
}

export function RequirementsTab({ projectId }: RequirementsTabProps) {
  // RequirementsForm sudah menangani mode baca-saja sendiri
  // (non-owner otomatis read-only).
  return (
    <div className="pt-6">
      <RequirementsForm projectId={projectId} />
    </div>
  );
}
