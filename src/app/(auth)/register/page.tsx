import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Registration is disabled - redirect to login
  redirect('/login');
}
