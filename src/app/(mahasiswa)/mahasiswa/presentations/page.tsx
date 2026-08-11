import { redirect } from 'next/navigation';

export default function PresentationsRedirect() {
  redirect('/mahasiswa/project?tab=review');
}
