import { redirect } from 'next/navigation';

export default function ProjectRequirementsPage({
  params,
}: {
  params: { id: string };
}) {
  // Redirect to new documents/requirements page
  redirect(`/mahasiswa/documents/${params.id}`);
}
