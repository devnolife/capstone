import InvitationsContent from '@/components/mahasiswa/invitations-content';

export const metadata = {
  title: 'Undangan Tim | Capstone',
  description: 'Kelola undangan bergabung ke tim project',
};

export default function InvitationsPage() {
  return (
    <div className="w-full space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-default-900">Undangan Tim</h1>
        <p className="text-sm text-default-500 mt-0.5">
          Kelola undangan dari ketua project untuk bergabung ke tim
        </p>
      </header>

      <InvitationsContent />
    </div>
  );
}
