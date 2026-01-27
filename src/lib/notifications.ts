import prisma from '@/lib/prisma';

export type NotificationType = 'assignment' | 'review' | 'submission' | 'system' | 'invitation';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

interface BulkNotificationParams {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Create a single notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, title, message, type, link } = params;
  
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
}

/**
 * Create notifications for multiple users at once
 */
export async function createBulkNotifications(params: BulkNotificationParams) {
  const { userIds, title, message, type, link } = params;
  
  return prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      link,
    })),
  });
}

/**
 * Notify all admins with a notification
 */
export async function notifyAdmins(params: Omit<CreateNotificationParams, 'userId'>) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  if (admins.length === 0) return;

  return createBulkNotifications({
    userIds: admins.map(a => a.id),
    ...params,
  });
}

/**
 * Notify all dosen assigned to a project
 */
export async function notifyProjectDosen(projectId: string, params: Omit<CreateNotificationParams, 'userId'>) {
  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId },
    select: { dosenId: true },
  });

  if (assignments.length === 0) return;

  return createBulkNotifications({
    userIds: assignments.map(a => a.dosenId),
    ...params,
  });
}

// =====================================
// Pre-built notification templates
// =====================================

export const NotificationTemplates = {
  /**
   * When a dosen is assigned to review a project
   */
  dosenAssigned: (dosenId: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: dosenId,
      title: 'Penugasan Baru',
      message: `Anda ditugaskan untuk menguji project "${projectTitle}"`,
      type: 'assignment',
      link: `/dosen/projects/${projectId}`,
    }),

  /**
   * Notify mahasiswa that a dosen has been assigned to their project
   */
  mahasiswaDosenAssigned: (mahasiswaId: string, dosenName: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: mahasiswaId,
      title: 'Dosen Penguji Ditugaskan',
      message: `${dosenName} telah ditugaskan sebagai penguji untuk project "${projectTitle}"`,
      type: 'assignment',
      link: `/mahasiswa/projects/${projectId}`,
    }),

  /**
   * When a project is submitted
   */
  projectSubmitted: (projectTitle: string, mahasiswaName: string, projectId: string) =>
    notifyAdmins({
      title: 'Project Baru Disubmit',
      message: `${mahasiswaName} telah mengsubmit project "${projectTitle}"`,
      type: 'submission',
      link: `/admin/projects/${projectId}`,
    }),

  /**
   * When a review is completed
   */
  reviewCompleted: (mahasiswaId: string, dosenName: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: mahasiswaId,
      title: 'Review Selesai',
      message: `${dosenName} telah memberikan review untuk project "${projectTitle}"`,
      type: 'review',
      link: `/mahasiswa/projects/${projectId}`,
    }),

  /**
   * When a project needs revision
   */
  revisionNeeded: (mahasiswaId: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: mahasiswaId,
      title: 'Revisi Diperlukan',
      message: `Project "${projectTitle}" memerlukan revisi. Silakan periksa feedback dari dosen.`,
      type: 'review',
      link: `/mahasiswa/projects/${projectId}`,
    }),

  /**
   * When a project is approved
   */
  projectApproved: (mahasiswaId: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: mahasiswaId,
      title: 'Project Disetujui',
      message: `Selamat! Project "${projectTitle}" telah disetujui.`,
      type: 'review',
      link: `/mahasiswa/projects/${projectId}`,
    }),

  /**
   * Team invitation sent
   */
  teamInvitation: (inviteeId: string, inviterName: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: inviteeId,
      title: 'Undangan Tim',
      message: `${inviterName} mengundang Anda untuk bergabung dengan project "${projectTitle}"`,
      type: 'invitation',
      link: `/mahasiswa/notifications`,
    }),

  /**
   * Invitation accepted
   */
  invitationAccepted: (inviterId: string, inviteeName: string, projectTitle: string, projectId: string) =>
    createNotification({
      userId: inviterId,
      title: 'Undangan Diterima',
      message: `${inviteeName} telah bergabung dengan project "${projectTitle}"`,
      type: 'invitation',
      link: `/mahasiswa/projects/${projectId}`,
    }),

  /**
   * Invitation rejected
   */
  invitationRejected: (inviterId: string, inviteeName: string, projectTitle: string) =>
    createNotification({
      userId: inviterId,
      title: 'Undangan Ditolak',
      message: `${inviteeName} menolak undangan untuk project "${projectTitle}"`,
      type: 'invitation',
    }),

  /**
   * System announcement
   */
  systemAnnouncement: (userId: string, title: string, message: string, link?: string) =>
    createNotification({
      userId,
      title,
      message,
      type: 'system',
      link,
    }),

  /**
   * Broadcast system announcement to all users
   */
  broadcastAnnouncement: async (title: string, message: string, link?: string) => {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    return createBulkNotifications({
      userIds: users.map(u => u.id),
      title,
      message,
      type: 'system',
      link,
    });
  },
};
