import InvitationsContent from '@/components/mahasiswa/invitations-content';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Undangan Tim | Capstone',
  description: 'Kelola undangan bergabung ke tim project',
};

export default function InvitationsPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header - Soft Colored */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-cyan-950/40 border border-indigo-200/50 dark:border-indigo-800/30 p-6 md:p-8">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/15 to-indigo-400/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Undangan Tim</h1>
            <p className="text-indigo-600/70 dark:text-indigo-400/60 text-sm">
              Kelola undangan dari ketua project untuk bergabung ke tim
            </p>
          </div>
        </div>
      </div>

      <InvitationsContent />
    </div>
  );
}
