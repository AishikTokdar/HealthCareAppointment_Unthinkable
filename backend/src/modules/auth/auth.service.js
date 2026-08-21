const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

async function registerPatient(data) {
  const { email, password, name, phone } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      role: 'PATIENT'
    }
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone } };
}

async function registerDoctor(data) {
  const { email, password, name, phone, specialisation, slotDuration, workingHours, bio } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: 'DOCTOR'
      }
    });

    const profile = await tx.doctorProfile.create({
      data: {
        userId: user.id,
        specialisation,
        slotDuration: parseInt(slotDuration, 10) || 30,
        workingHours: workingHours || {
          MON: { start: '09:00', end: '17:00' },
          TUE: { start: '09:00', end: '17:00' },
          WED: { start: '09:00', end: '17:00' },
          THU: { start: '09:00', end: '17:00' },
          FRI: { start: '09:00', end: '17:00' }
        },
        bio,
        approvalStatus: 'PENDING'
      }
    });

    return { user, profile };
  });

  const token = jwt.sign(
    { userId: result.user.id, role: result.user.role, email: result.user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      approvalStatus: result.profile.approvalStatus
    }
  };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctorProfile: true }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      doctorProfile: user.doctorProfile
    }
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      gcalTokens: true,
      createdAt: true,
      doctorProfile: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    hasGcalConnected: !!user.gcalTokens
  };
}

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  getMe
};
