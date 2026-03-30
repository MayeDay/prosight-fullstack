const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = require('../config');

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: '7d' }
  );
}

function buildAuthResponse(user, credentials) {
  const reviews = user.reviewsReceived || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    profession: user.profession,
    bio: user.bio,
    hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : null,
    averageRating: avgRating,
    reviewCount: reviews.length,
    token: createToken(user),
    credentials: credentials.map(c => ({
      id: c.id, trade: c.trade, licenseType: c.licenseType,
      licenseNumber: c.licenseNumber, issuingState: c.issuingState
    }))
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profession, bio, hourlyRate, credentials } = req.body;

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(400).json({ message: 'Email already in use.' });

    if (role !== 'homeowner' && role !== 'pro')
      return res.status(400).json({ message: "Role must be 'homeowner' or 'pro'." });

    if (role === 'pro') {
      if (!credentials?.length)
        return res.status(400).json({ message: 'Professionals must provide at least one license credential.' });
      for (const c of credentials) {
        if (!c.trade || !c.licenseType || !c.licenseNumber)
          return res.status(400).json({ message: 'Each credential must have a trade, license type, and license number.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role, profession, bio, hourlyRate: hourlyRate ?? null },
      include: { reviewsReceived: true }
    });

    let createdCredentials = [];
    if (role === 'pro' && credentials?.length) {
      await prisma.proCredential.createMany({
        data: credentials.map(c => ({
          userId: user.id,
          trade: c.trade.trim(),
          licenseType: c.licenseType.trim(),
          licenseNumber: c.licenseNumber.trim(),
          issuingState: c.issuingState?.trim() ?? null
        }))
      });
      createdCredentials = await prisma.proCredential.findMany({ where: { userId: user.id } });
    }

    res.json(buildAuthResponse(user, createdCredentials));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { reviewsReceived: true, credentials: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    res.json(buildAuthResponse(user, user.credentials));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
