import { redirect } from 'next/navigation';

export default async function ProjectDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/mahasiswa/project?project=${id}`);
}
