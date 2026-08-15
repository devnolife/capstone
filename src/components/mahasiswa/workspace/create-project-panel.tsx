'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Rocket } from 'lucide-react';
import { CreateProjectForm } from './create-project-form';

interface CreateProjectPanelProps {
  hasGitHubConnected: boolean;
}

export function CreateProjectPanel({ hasGitHubConnected }: CreateProjectPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Rocket size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Mulai Project Capstone</h1>
              <p className="text-xs text-muted-foreground">
                Anda belum memiliki project. Buat project pertama Anda di sini —
                semua kebutuhan selanjutnya dikelola dalam satu halaman workspace.
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                hasGitHubConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              }
            >
              <Github size={12} />
              {hasGitHubConnected ? 'GitHub terhubung' : 'GitHub belum terhubung'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <CreateProjectForm />
    </div>
  );
}
