import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Clock, MapPin, FileText, CalendarCheck, User } from 'lucide-react';

export const metadata = {
  title: 'Jadwal Presentasi | Capstone',
  description: 'Jadwal presentasi project capstone Anda',
};

const statusStyles: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: 'Terjadwal',
    className: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  rescheduled: {
    label: 'Dijadwalkan Ulang',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

export default async function MahasiswaPresentationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const presentations = await prisma.presentationSchedule.findMany({
    where: {
      project: {
        OR: [
          { mahasiswaId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          mahasiswa: { select: { name: true } },
        },
      },
      scheduledBy: { select: { name: true } },
    },
    orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
  });

  return (
    <div className="w-full space-y-5 pb-8">
      <header>
        <h1 className="text-2xl font-semibold text-default-900">Jadwal Presentasi</h1>
        <p className="text-sm text-default-500 mt-0.5">
          Jadwal presentasi untuk project yang Anda miliki atau ikuti sebagai anggota tim
        </p>
      </header>

      {presentations.length === 0 ? (
        <div className="rounded-2xl border border-default-200 bg-content1 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
            <CalendarCheck size={32} className="text-default-400" />
          </div>
          <p className="font-medium text-default-700">Belum ada jadwal presentasi</p>
          <p className="text-sm text-default-500 mt-1">
            Jadwal akan muncul di sini setelah project Anda di-ACC dan dijadwalkan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {presentations.map((presentation) => {
            const status =
              statusStyles[presentation.presentationStatus] ?? statusStyles.scheduled;

            return (
              <Link
                key={presentation.id}
                href={`/mahasiswa/projects/${presentation.project.id}`}
                className="block rounded-2xl border border-default-200 bg-content1 p-5 transition-colors hover:border-primary-300 hover:bg-default-50 dark:hover:bg-default-100/10"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-default-900">
                        {presentation.project.title}
                      </h2>
                      <p className="text-sm text-default-500 flex items-center gap-1 mt-0.5">
                        <User size={13} />
                        {presentation.project.mahasiswa.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`self-start inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 text-default-600">
                    <Calendar size={14} className="text-default-400" />
                    <span>
                      {new Date(presentation.scheduledDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-default-600">
                    <Clock size={14} className="text-default-400" />
                    <span>
                      {presentation.startTime}
                      {presentation.endTime && ` - ${presentation.endTime}`}
                    </span>
                  </div>
                  {presentation.location && (
                    <div className="flex items-center gap-2 text-default-600">
                      <MapPin size={14} className="text-default-400" />
                      <span>{presentation.location}</span>
                    </div>
                  )}
                </div>

                {presentation.notes && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-default-100 p-3 text-sm text-default-600 dark:bg-default-100/10">
                    <FileText size={14} className="mt-0.5 shrink-0 text-default-400" />
                    <span>{presentation.notes}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
