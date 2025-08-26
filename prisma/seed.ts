// prisma/seed.ts

import {
  PrismaClient,
  Segment,
  RegistrationSource,
  PaymentMethod,
  PaymentStatus,
  PaymentGateway,
  ProgramCategory
} from '@prisma/client';

import { DefaultPassword } from '../src/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Create Program
  const program = await prisma.program.upsert({
    where: { id: 'program-1' },
    update: {},
    create: {
      id: 'program-1',
      name: 'AI & Data Workshop',
      priceMember: 200000,
      priceNonMember: 400000,
      description: 'Learn AI fundamentals with hands-on practice.',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-03'),
      category: ProgramCategory.BOOTCAMP
    }
  });

  // 2. Create Membership Package
  const membershipPackage = await prisma.membershipPackage.upsert({
    where: { id: 'member-basic' },
    update: {},
    create: {
      id: 'member-basic',
      name: 'Basic',
      description: 'Basic',
      price: 1000000
    }
  });

  // 3. Create Member (with User link)
  const user = await prisma.user.upsert({
    where: { email: 'ridhoajibx@gmail.com' },
    update: {},
    create: {
      email: 'ridhoajibx@gmail.com',
      name: 'Jumakri Ridho Fauzi',
      phone: '08123456789',
      isEmailVerified: true,
      password: DefaultPassword,
      role: 'ADMIN'
    }
  });

  // Create Member
  const member = await prisma.member.upsert({
    where: {
      email: user.email
    },
    update: {},
    create: {
      email: user.email,
      name: user.name ?? 'Jumakri Ridho Fauzi',
      phone: user.phone,
      institution: 'Nusantics',
      segment: Segment.PROFESSIONAL,
      interestAreas: ['Geology', 'Others'],
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { connect: { id: user.id } },
      membershipPackage: { connect: { id: membershipPackage.id } }
    }
  });

  // Member registers for program
  const memberRegistration = await prisma.programRegistration.create({
    data: {
      programId: program.id,
      memberId: member.id,
      userId: user.id,
      email: member.email,
      name: member.name,
      phone: member.phone,
      institution: member.institution,
      segment: member.segment,
      source: RegistrationSource.MEMBER,
      payments: {
        create: {
          amount: 2000000,
          method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          referenceType: 'PROGRAM',
          orderId: '12345678901',
          email: member.email
        }
      }
    }
  });

  // 4. Non-member registers directly
  const nonMemberRegistration = await prisma.programRegistration.create({
    data: {
      programId: program.id,
      email: 'anon@example.com',
      name: 'Anon User',
      phone: '08987654321',
      institution: 'Community',
      segment: Segment.STUDENT,
      source: RegistrationSource.NON_MEMBER,
      payments: {
        create: {
          amount: 1000000,
          method: PaymentMethod.EWALLET,
          status: PaymentStatus.PENDING,
          gateway: PaymentGateway.MIDTRANS,
          referenceType: 'PROGRAM',
          orderId: '1234567890',
          email: 'anon@example.com'
        }
      }
    }
  });

  // 5. Admin registers someone manually
  const adminRegistration = await prisma.programRegistration.create({
    data: {
      programId: program.id,
      email: 'manual@example.com',
      name: 'Manual Entry',
      institution: 'University A',
      segment: Segment.PROFESSIONAL,
      source: RegistrationSource.ADMIN,
      payments: {
        create: {
          amount: 1500000,
          method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.FAILED,
          referenceType: 'PROGRAM',
          orderId: '1234567890FF',
          email: 'manual@example.com'
        }
      }
    }
  });

  console.log('✅ Seeding finished.');
  console.log({ memberRegistration, nonMemberRegistration, adminRegistration });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
