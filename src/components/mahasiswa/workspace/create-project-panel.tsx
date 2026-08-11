'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Github, Rocket } from 'lucide-react';
import { CreateProjectForm } from './create-project-form';

interface CreateProjectPanelProps {
  hasGitHubConnected: boolean;
}

export function CreateProjectPanel({ hasGitHubConnected }: CreateProjectPanelProps) {
  return (
    <div className="space-y-5">
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Rocket size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Mulai Project Capstone</h1>
              <p className="text-xs text-default-500">
                Anda belum memiliki project. Buat project pertama Anda di sini —
                semua kebutuhan selanjutnya dikelola dalam satu halaman workspace.
              </p>
            </div>
            <Chip
              size="sm"
              variant="flat"
              color={hasGitHubConnected ? 'success' : 'warning'}
              startContent={<Github size={12} />}
            >
              {hasGitHubConnected ? 'GitHub terhubung' : 'GitHub belum terhubung'}
            </Chip>
          </div>
        </CardBody>
      </Card>

      <CreateProjectForm />
    </div>
  );
}
