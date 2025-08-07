import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ebmquickhits.com' },
    update: {},
    create: {
      email: 'admin@ebmquickhits.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'ADMIN',
    },
  });

  // Create sample end user
  const userPassword = await bcrypt.hash('user123', 10);
  const endUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'sampleuser',
      password: userPassword,
      firstName: 'Sample',
      lastName: 'User',
      userType: 'END_USER',
    },
  });

  // Create sample presentations
  const presentations = [
    {
      title: 'SPRINT Trial: Intensive vs Standard Blood Pressure Control',
      specialty: 'Cardiology',
      summary: 'Landmark randomized trial demonstrating that intensive blood pressure control (target <120 mmHg) significantly reduces cardiovascular events and mortality compared to standard treatment (<140 mmHg).',
      authors: 'SPRINT Research Group',
      journal: 'N Engl J Med',
      year: '2015',
      viewerCount: 1234,
      createdBy: admin.id,
    },
    {
      title: 'KEYNOTE-189: Pembrolizumab in Metastatic NSCLC',
      specialty: 'Heme/Onc',
      summary: 'Phase 3 trial showing significant improvement in overall survival with pembrolizumab plus chemotherapy versus chemotherapy alone in previously untreated metastatic non-squamous NSCLC.',
      authors: 'Gandhi L, et al.',
      journal: 'N Engl J Med',
      year: '2018',
      viewerCount: 987,
      createdBy: admin.id,
    },
    {
      title: 'COMPASS Trial: Rivaroxaban in Stable CAD',
      specialty: 'Cardiology',
      summary: 'Demonstrated that low-dose rivaroxaban plus aspirin reduces major adverse cardiovascular events in patients with stable coronary artery disease or peripheral artery disease.',
      authors: 'Eikelboom JW, et al.',
      journal: 'N Engl J Med',
      year: '2017',
      viewerCount: 756,
      createdBy: admin.id,
    },
    {
      title: 'CLARITY-AD: Lecanemab in Early Alzheimer\'s Disease',
      specialty: 'Neurology',
      summary: 'Phase 3 trial showing that lecanemab significantly slowed cognitive decline in patients with early Alzheimer\'s disease, marking a breakthrough in amyloid-targeting therapy.',
      authors: 'van Dyck CH, et al.',
      journal: 'N Engl J Med',
      year: '2023',
      viewerCount: 2341,
      createdBy: admin.id,
    },
    {
      title: 'EMPA-REG OUTCOME: Empagliflozin in Type 2 Diabetes',
      specialty: 'Endocrinology',
      summary: 'Groundbreaking cardiovascular outcome trial demonstrating that empagliflozin reduces cardiovascular death and heart failure hospitalization in patients with type 2 diabetes.',
      authors: 'Zinman B, et al.',
      journal: 'N Engl J Med',
      year: '2015',
      viewerCount: 1456,
      createdBy: admin.id,
    },
  ];

  for (const presentationData of presentations) {
    await prisma.presentation.upsert({
      where: { 
        title: presentationData.title 
      },
      update: {},
      create: presentationData,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@ebmquickhits.com / admin123`);
  console.log(`👤 Sample user: user@example.com / user123`);
  console.log(`📚 Created ${presentations.length} sample presentations`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
