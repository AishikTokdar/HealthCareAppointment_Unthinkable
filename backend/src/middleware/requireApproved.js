const prisma = require('../config/db');

async function requireApproved(req, res, next) {
  if (!req.user || req.user.role !== 'DOCTOR') {
    return next();
  }

  try {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    if (profile.approvalStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'Doctor account is pending approval or rejected',
        approvalStatus: profile.approvalStatus
      });
    }

    req.doctorProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireApproved;
