const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@clinic.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.ADMIN_NAME || 'System Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'ADMIN'
    }
  });

  console.log(`Admin user created: ${email} / ${password}`);
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
