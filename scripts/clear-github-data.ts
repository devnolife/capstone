import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = "postgresql://postgres:ifbumm@103.151.145.21:5401/capstone?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing GitHub data from all users...');

  const result = await prisma.user.updateMany({
    where: {
      githubId: { not: null }
    },
    data: {
      githubId: null,
      githubUsername: null,
      githubToken: null
    }
  });

  console.log(`Updated ${result.count} users - GitHub data cleared`);

  // Also clear from Account table if exists
  try {
    const accountResult = await prisma.account.deleteMany({
      where: {
        provider: 'github'
      }
    });
    console.log(`Deleted ${accountResult.count} GitHub accounts from Account table`);
  } catch (e) {
    console.log('No Account table or no GitHub accounts found');
  }

  // Show remaining users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      githubId: true,
      githubUsername: true
    }
  });
  console.log('\nCurrent users:');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
