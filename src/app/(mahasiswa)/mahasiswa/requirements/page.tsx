import { redirect } from 'next/navigation';

export default function RequirementsRedirect() {
  redirect('/mahasiswa/project?tab=persyaratan');
}
