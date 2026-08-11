import { redirect } from 'next/navigation';

export default function DocumentsRedirect() {
  redirect('/mahasiswa/project?tab=persyaratan');
}
