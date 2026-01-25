import prisma from './src/lib/prisma';

async function main() {
  const projectId = 'cmks3xqlh0000owrt3d0js5p6';

  console.log('=== Checking Screenshots for Project ===');
  console.log('Project ID:', projectId);

  // Check project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      mahasiswaId: true,
    }
  });

  if (!project) {
    console.log('Project not found!');
    return;
  }

  console.log('Project found:', project.title);

  // Get screenshots
  const screenshots = await prisma.projectScreenshot.findMany({
    where: { projectId },
    orderBy: { orderIndex: 'asc' },
  });

  console.log('\n=== Screenshots ===');
  console.log('Total:', screenshots.length);

  if (screenshots.length > 0) {
    screenshots.forEach((s, i) => {
      console.log(`\n[${i + 1}] ${s.title}`);
      console.log('   ID:', s.id);
      console.log('   URL:', s.fileUrl);
      console.log('   Key:', s.fileKey);
    });
  } else {
    console.log('No screenshots found for this project.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
