import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Create sample equipment
  const equipment = await Promise.all([
    prisma.equipment.upsert({
      where: { name: 'Pressure Washer' },
      update: {},
      create: {
        name: 'Pressure Washer',
        status: 'available',
      },
    }),
    prisma.equipment.upsert({
      where: { name: 'Scaffolding Set' },
      update: {},
      create: {
        name: 'Scaffolding Set',
        status: 'available',
      },
    }),
    prisma.equipment.upsert({
      where: { name: 'Hydraulic Lift' },
      update: {},
      create: {
        name: 'Hydraulic Lift',
        status: 'available',
      },
    }),
    prisma.equipment.upsert({
      where: { name: 'Concrete Mixer' },
      update: {},
      create: {
        name: 'Concrete Mixer',
        status: 'available',
      },
    }),
    prisma.equipment.upsert({
      where: { name: 'Compressor' },
      update: {},
      create: {
        name: 'Compressor',
        status: 'available',
      },
    }),
  ]);

  console.log('✅ Equipment created:', equipment.map(e => e.name));

  // Create sample user
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });

  console.log('✅ Sample user created:', user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Database seeded successfully!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
