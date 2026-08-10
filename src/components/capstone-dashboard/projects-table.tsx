'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  accentFor,
  ACCENT_CARD,
  ACCENT_SOLID,
  ACCENT_TINT,
  CARD_FX,
} from '@/components/capstone-dashboard/accent';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowUpRightIcon, FolderGitIcon } from 'lucide-react';

import {
  projects,
  STATUS_LABEL,
  type ProjectStatus,
} from '@/components/capstone-dashboard/data';

const STATUS_BADGE_CLASS: Record<ProjectStatus, string> = {
  DRAFT: 'border-border bg-muted/60 text-muted-foreground',
  SUBMITTED: 'border-info/35 bg-info/12 text-info',
  IN_REVIEW: 'border-brand/35 bg-brand/12 text-brand',
  REVISION_NEEDED: 'border-warning/40 bg-warning/12 text-warning',
  READY_FOR_PRESENTATION: 'border-success/35 bg-success/12 text-success',
  PRESENTATION_SCHEDULED: 'border-highlight/35 bg-highlight/12 text-highlight',
  APPROVED: 'border-success/50 bg-success text-success-foreground',
};

export function ProjectsTable() {
  return (
    <Card className={cn(CARD_FX, ACCENT_CARD.info)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              ACCENT_SOLID.info,
            )}
          >
            <FolderGitIcon className="size-4" />
          </span>
          Project Terbaru
        </CardTitle>
        <CardDescription>
          Aktivitas submission periode Ganjil 2025/2026
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Lihat Semua
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl bg-background/60 px-2 shadow-xs backdrop-blur-sm dark:bg-background/30">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="hidden md:table-cell">Tim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Milestone</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Diperbarui
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const progressValue =
                (project.milestone.current / project.milestone.total) * 100;
              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href="#"
                        className="font-medium hover:underline"
                      >
                        {project.title}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.map((member) => (
                          <Tooltip key={member.name}>
                            <TooltipTrigger
                              render={
                                <Avatar className="size-7 border-2 border-background" />
                              }
                            >
                              <AvatarFallback
                                className={cn(
                                  'border text-[10px]',
                                  ACCENT_TINT[accentFor(member.name)],
                                )}
                              >
                                {member.initials}
                              </AvatarFallback>
                            </TooltipTrigger>
                            <TooltipContent>{member.name}</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {project.team}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[project.status]}
                    >
                      {STATUS_LABEL[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={progressValue}
                        className={
                          progressValue >= 100
                            ? 'w-24 **:data-[slot=progress-indicator]:bg-success'
                            : 'w-24 **:data-[slot=progress-indicator]:bg-brand'
                        }
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.milestone.current}/{project.milestone.total}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                    {project.updatedAt}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
