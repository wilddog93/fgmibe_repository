// create seed user
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Jumakri Ridho Fauzi',
    email: 'ridhoajibx@gmail.com',
    password: '', // myPassword42
    role: 'ADMIN',
    isEmailVerified: true
  },
  {
    name: 'john doe',
    email: 'johndoe@gmail.com',
    password: '', // myPassword42
    role: 'MEMBER',
    isEmailVerified: true,
    member: {
      create: {
        name: 'john doe',
        email: 'johndoe@gmail.com',
        phone: '081234567890',
        segment: 'PROFESSIONAL',
        institution: 'University of Indonesia',
        interestAreas: ['Geology', 'Others'],
        membershipPackage: 'ADVANCED'
      }
    }
  },
  {
    name: 'jane doe',
    email: 'janedoe@gmail.com',
    password: '', // myPassword42
    role: 'USER',
    isEmailVerified: true
  }
];

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: {
        ...u,
        password: hashedPassword
      }
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
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
