const bcrypt = require('bcryptjs');

async function seed(prisma) {
  const count = await prisma.user.count();
  if (count > 0) return;

  console.log('Seeding database...');

  const [marcus, sandra, dave] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Marcus T.', email: 'marcus@example.com',
        passwordHash: await bcrypt.hash('password123', 10), role: 'homeowner'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sandra K.', email: 'sandra@example.com',
        passwordHash: await bcrypt.hash('password123', 10), role: 'homeowner'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Dave R.', email: 'dave@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'pro', profession: 'Licensed Electrician',
        bio: '20 years in residential electrical. Love helping DIYers do it right the first time.',
        hourlyRate: 45
      }
    })
  ]);

  await prisma.user.create({
    data: {
      name: 'Elena M.', email: 'elena@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'pro', profession: 'General Contractor',
      bio: 'Full remodel experience. I can oversee almost any home project.',
      hourlyRate: 55
    }
  });

  await prisma.project.createMany({
    data: [
      { title: 'Deck Framing & Ledger Board', category: 'Carpentry', budget: 120,
        description: 'Building a 12×16 ft deck off the back door. Need a pro to review my framing plan.',
        status: 'open', ownerId: marcus.id },
      { title: 'Bathroom Tile Backsplash', category: 'Tiling', budget: 80,
        description: 'Installing subway tile above vanity. First time tiling.',
        status: 'open', ownerId: marcus.id }
    ]
  });

  const p3 = await prisma.project.create({
    data: {
      title: 'Electrical Outlet Addition', category: 'Electrical', budget: 150,
      description: 'Want to add two outlets in the garage.',
      status: 'in-progress', ownerId: sandra.id, proId: dave.id
    }
  });

  await prisma.message.createMany({
    data: [
      { projectId: p3.id, senderId: dave.id,
        text: 'Hi Sandra! I reviewed your plan. Make sure to turn off the correct breaker.',
        sentAt: new Date(Date.now() - 2 * 3600000) },
      { projectId: p3.id, senderId: sandra.id,
        text: 'Perfect, thank you! Should I use 12-gauge or 14-gauge wire?',
        sentAt: new Date(Date.now() - 3600000) }
    ]
  });

  await prisma.review.create({
    data: {
      projectId: p3.id, reviewerId: sandra.id, revieweeId: dave.id,
      rating: 5, comment: 'Dave was incredibly helpful and patient!'
    }
  });

  console.log('Database seeded.');
}

module.exports = { seed };
