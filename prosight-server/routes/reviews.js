const router = require('express').Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

// GET /api/reviews/pro/:proId (public)
router.get('/pro/:proId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: parseInt(req.params.proId) },
      include: { reviewer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews.map(r => ({
      id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt,
      reviewer: {
        id: r.reviewer.id, name: r.reviewer.name, role: r.reviewer.role,
        profession: null, hourlyRate: null, averageRating: null, reviewCount: 0
      }
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'homeowner')
      return res.status(403).json({ message: 'Forbidden' });

    const { rating, comment, projectId } = req.body;
    const uid = req.userId;

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.ownerId !== uid) return res.status(403).json({ message: 'Forbidden' });
    if (!project.proId) return res.status(400).json({ message: 'No pro assigned to this project.' });

    const alreadyReviewed = await prisma.review.findFirst({ where: { projectId, reviewerId: uid } });
    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this project.' });

    await prisma.review.create({
      data: { projectId, reviewerId: uid, revieweeId: project.proId, rating, comment }
    });

    res.json({ message: 'Review submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
