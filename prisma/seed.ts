import prisma from '../src/app/shared/prisma';
import { adminSeeder } from './seeders/admin-seeder';
import { recruiterSeeder } from './seeders/recruiter-seeder';
import { candidateSeeder } from './seeders/candidate-seeder';

export const adminEmail = 'admin@hirehub.com';
export const recruiterEmail = 'recruiter@hirehub.com';
export const candidateEmail = 'candidate@hirehub.com';

async function main() {
  // Parse '--name={name}' argument from process.argv
  let target: string | null = null;
  const nameIndex = process.argv.findIndex((arg) => arg.startsWith('--name'));
  if (nameIndex !== -1) {
    const arg = process.argv[nameIndex];
    if (arg.includes('=')) {
      target = arg.split('=')[1];
    } else if (nameIndex + 1 < process.argv.length) {
      target = process.argv[nameIndex + 1];
    }
  }

  console.log(`🌱 Starting database seeding... ${target ? `[Target: ${target}]` : '[All]'}`);

  if (!target || target === 'admin') {
    await adminSeeder();
  }
  
  if (!target || target === 'recruiter') {
    await recruiterSeeder();
  }
  
  if (!target || target === 'candidate') {
    await candidateSeeder();
  }

  console.log('🌱 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
