import { redirect } from 'next/navigation';

export default function ReviewsRedirect() {
  redirect('/mahasiswa/project?tab=review');
}
