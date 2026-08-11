import { redirect } from 'next/navigation';

export default function InvitationsRedirect() {
  redirect('/mahasiswa/project?tab=tim');
}
