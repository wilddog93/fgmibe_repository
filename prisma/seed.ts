// create seed user
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Jumakri Ridho Fauzi',
    email: 'ridhoajibx@gmail.com',
    password: '$2a$10$TLtC603wy85MM./ot/pvEec0w2au6sjPaOmLpLQFbxPdpJH9fDwwS', // myPassword42
    role: 'ADMIN',
    isEmailVerified: true,
    posts: {
      create: [
        {
          title: 'Join the Prisma Discord',
          content: 'https://pris.ly/discord',
          published: true
        },
        {
          title: 'Follow Prisma on Twitter',
          content: 'https://pris.ly/twitter',
          published: true
        },
        {
          title: 'Visit the Prisma GitHub repo',
          content: 'https://github.com/prisma/prisma',
          published: true
        },
        {
          title: 'Watch Prisma on YouTube',
          content: 'https://pris.ly/youtube',
          published: true
        },
        {
          title: 'Join the Prisma Slack community',
          content: 'https://prisma.slack.com',
          published: true
        },
        {
          title: 'Follow Prisma on LinkedIn',
          content: 'https://www.linkedin.com/company/prisma',
          published: true
        },
        {
          title: 'Check out the Prisma blog',
          content: 'https://pris.ly/blog',
          published: true
        },
        {
          title: 'Subscribe to the Prisma newsletter',
          content: 'https://pris.ly/email',
          published: true
        },
        {
          title: 'Follow Prisma on Twitter',
          content: 'https://twitter.com/prisma',
          published: true
        },
        {
          title: 'Join the Prisma Discord community',
          content: 'https://discord.prisma.io',
          published: true
        },
        {
          title: 'Follow Prisma on GitHub',
          content: 'https://github.com/prisma',
          published: true
        }
      ]
    }
  }
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u
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
