import InvitationsContent from '@/components/mahasiswa/invitations-content';

export const metadata = {
  title: 'Undangan Tim | Capstone',
  description: 'Kelola undangan bergabung ke tim project',
};

export default function InvitationsPage() {
  return (
    <div className="w-full">
      <InvitationsContent />
    </div>
  );
}
