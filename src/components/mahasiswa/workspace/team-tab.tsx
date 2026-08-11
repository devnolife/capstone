'use client';

import { Card, CardBody } from '@heroui/react';
import TeamMembersNim from '@/components/mahasiswa/team-members-nim';
import InvitationsContent from '@/components/mahasiswa/invitations-content';
import type { WorkspaceProject } from './types';

interface TeamTabProps {
  project: WorkspaceProject;
  canEdit: boolean;
  isOwner: boolean;
}

export function TeamTab({ project, canEdit, isOwner }: TeamTabProps) {
  const members = project.members.map((member) => ({
    id: member.id,
    githubUsername: member.githubUsername ?? '',
    githubId: member.githubId ?? undefined,
    githubAvatarUrl: member.githubAvatarUrl ?? undefined,
    name: member.name ?? member.user?.name ?? undefined,
    role: member.role,
    userId: member.userId ?? undefined,
    user: member.user
      ? {
          id: member.user.id,
          name: member.user.name,
          nim: member.user.nim,
          image: member.user.image,
        }
      : undefined,
    joinedAt:
      typeof member.joinedAt === 'string'
        ? member.joinedAt
        : member.joinedAt?.toISOString?.(),
  }));

  return (
    <div className="space-y-5 pt-2">
      {/* Anggota tim */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardBody className="p-5">
          <TeamMembersNim
            projectId={project.id}
            members={members}
            ownerGithubUsername={project.mahasiswa.githubUsername ?? undefined}
            ownerName={project.mahasiswa.name}
            ownerImage={project.mahasiswa.image ?? undefined}
            ownerNim={project.mahasiswa.nim ?? undefined}
            isEditable={canEdit && isOwner}
          />
        </CardBody>
      </Card>

      {/* Undangan yang saya terima */}
      <div>
        <h2 className="font-semibold text-lg mb-3">Undangan untuk Saya</h2>
        <InvitationsContent />
      </div>
    </div>
  );
}
