import InvitationsContent from '@/components/mahasiswa/invitations-content';

export const metadata = {
  title: 'Undangan Tim | Capstone',
  description: 'Kelola undangan bergabung ke tim project',
};

export default function InvitationsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Undangan Tim</h1>
        <p className="text-default-500 text-sm">
          Kelola undangan dari ketua project untuk bergabung ke tim
        </p>
      </div>

      <InvitationsContent />
    </div>
  );
}
