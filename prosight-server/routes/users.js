const router = require('express').Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const auth = require('../middleware/auth');
const { userSummary } = require('../helpers');

const credentialResponse = c => ({
  id: c.id, trade: c.trade, licenseType: c.licenseType,
  licenseNumber: c.licenseNumber, issuingState: c.issuingState
});

// GET /api/users/pros
router.get('/pros', async (req, res) => {
  try {
    const pros = await prisma.user.findMany({
      where: { role: 'pro' },
      include: { reviewsReceived: true }
    });
    res.json(pros.map(userSummary));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/pros/:id
router.get('/pros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findFirst({
      where: { id, role: 'pro' },
      include: {
        reviewsReceived: { include: { reviewer: true } },
        credentials: true
      }
    });
    if (!user) return res.status(404).json({ message: 'Not found' });

    const completedProjects = await prisma.project.findMany({
      where: { proId: id, status: 'completed' },
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      pro: userSummary(user),
      credentials: user.credentials.map(credentialResponse),
      completedProjects: completedProjects.map(p => ({
        id: p.id, title: p.title, category: p.category, createdAt: p.createdAt,
        owner: userSummary({ ...p.owner, reviewsReceived: [] })
      })),
      reviews: user.reviewsReceived
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(r => ({
          id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
          reviewer: userSummary({ ...r.reviewer, reviewsReceived: [] })
        }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { reviewsReceived: true, credentials: true }
    });
    if (!user) return res.status(404).json({ message: 'Not found' });

    const reviews = user.reviewsReceived;
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

    res.json({
      id: user.id, name: user.name, email: user.email, role: user.role,
      location: user.location, profession: user.profession, bio: user.bio,
      hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : null,
      averageRating: avgRating, reviewCount: reviews.length,
      token: '',
      credentials: user.credentials.map(credentialResponse)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const uid = req.userId;
    const { name, email, location, bio, profession, hourlyRate, credentials } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: { reviewsReceived: true }
    });
    if (!user) return res.status(404).json({ message: 'Not found' });

    if (user.role === 'pro') {
      if (!credentials?.length)
        return res.status(400).json({ message: 'Professionals must have at least one license credential.' });
      for (const c of credentials) {
        if (!c.trade || !c.licenseType || !c.licenseNumber)
          return res.status(400).json({ message: 'Each credential must have a trade, license type, and license number.' });
      }
    }

    if (email.toLowerCase() !== user.email) {
      const taken = await prisma.user.findFirst({ where: { email: email.toLowerCase(), id: { not: uid } } });
      if (taken) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await prisma.user.update({
      where: { id: uid },
      data: { name, email: email.toLowerCase(), location, bio, profession, hourlyRate: hourlyRate ?? null },
      include: { reviewsReceived: true }
    });

    if (user.role === 'pro' && credentials) {
      await prisma.proCredential.deleteMany({ where: { userId: uid } });
      await prisma.proCredential.createMany({
        data: credentials.map(c => ({
          userId: uid,
          trade: c.trade.trim(),
          licenseType: c.licenseType.trim(),
          licenseNumber: c.licenseNumber.trim(),
          issuingState: c.issuingState?.trim() ?? null
        }))
      });
    }

    const newCredentials = await prisma.proCredential.findMany({ where: { userId: uid } });
    const reviews = updated.reviewsReceived;
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

    const token = jwt.sign(
      { sub: String(updated.id), name: updated.name, email: updated.email, role: updated.role },
      process.env.JWT_SECRET,
      { issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE, expiresIn: '7d' }
    );

    res.json({
      id: updated.id, name: updated.name, email: updated.email, role: updated.role,
      location: updated.location, profession: updated.profession, bio: updated.bio,
      hourlyRate: updated.hourlyRate != null ? Number(updated.hourlyRate) : null,
      averageRating: avgRating, reviewCount: reviews.length,
      token,
      credentials: newCredentials.map(credentialResponse)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
