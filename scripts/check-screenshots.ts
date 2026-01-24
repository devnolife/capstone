import prisma from '../src/lib/prisma';

async function main() {
  const screenshots = await prisma.projectScreenshot.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileKey: true,
    }
  });

  console.log('Screenshots in database:');
  console.log(JSON.stringify(screenshots, null, 2));

  if (screenshots.length > 0) {
    console.log('\nTesting URL access...');
    for (const s of screenshots) {
      console.log(`\nURL: ${s.fileUrl}`);
      try {
        const res = await fetch(s.fileUrl, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.statusText}`);
      } catch (e) {
        console.log(`Error: ${e}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
