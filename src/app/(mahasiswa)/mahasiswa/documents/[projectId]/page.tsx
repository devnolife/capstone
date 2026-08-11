import { redirect } from 'next/navigation';

export default async function DocumentsProjectRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/mahasiswa/project?project=${projectId}&tab=persyaratan`);
}
