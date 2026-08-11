'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { Settings2, Code2 } from 'lucide-react';
import { ProjectSetupForm } from './project-setup-form';
import { CodeBrowser } from './code-browser';

interface RepositoryTabProps {
  projectId: string;
  canEdit: boolean;
}

export function RepositoryTab({ projectId }: RepositoryTabProps) {
  const [subTab, setSubTab] = useState('setup');

  return (
    <div className="pt-6">
      <Tabs
        aria-label="Repository"
        selectedKey={subTab}
        onSelectionChange={(key) => setSubTab(String(key))}
        variant="light"
        size="sm"
        className="mb-2"
      >
        <Tab
          key="setup"
          title={
            <span className="flex items-center gap-1.5">
              <Settings2 size={14} /> Pengaturan & Repo
            </span>
          }
        >
          <ProjectSetupForm projectId={projectId} />
        </Tab>
        <Tab
          key="code"
          title={
            <span className="flex items-center gap-1.5">
              <Code2 size={14} /> Lihat Kode
            </span>
          }
        >
          <CodeBrowser projectId={projectId} />
        </Tab>
      </Tabs>
    </div>
  );
}
