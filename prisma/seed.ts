import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Delete existing data (for clean slate)
  await prisma.reservation.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample equipment
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        name: 'Pressure Washer',
        status: 'available',
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Scaffolding Set',
        status: 'available',
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Hydraulic Lift',
        status: 'available',
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Concrete Mixer',
        status: 'available',
      },
    }),
    prisma.equipment.create({
      data: {
        name: 'Compressor',
        status: 'available',
      },
    }),
  ]);

  console.log('✅ Equipment created:', equipment.map(e => e.name));

  // Create sample user
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  const user = await prisma.user.create({
    data: {
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
