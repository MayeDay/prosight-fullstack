const router = require('express').Router();
const prisma = require('../db');
const auth = require('../middleware/auth');
const { userSummary, projectResponse } = require('../helpers');

const projectInclude = {
  owner: { include: { reviewsReceived: true } },
  pro:   { include: { reviewsReceived: true } },
  applications: true
};

async function getReviewedProjectIds(userId) {
  const reviews = await prisma.review.findMany({
    where: { reviewerId: userId },
    select: { projectId: true }
  });
  return new Set(reviews.map(r => r.projectId));
}

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const where = req.query.status ? { status: req.query.status } : {};
    const projects = await prisma.project.findMany({
      where, include: projectInclude, orderBy: { createdAt: 'desc' }
    });
    const reviewed = await getReviewedProjectIds(req.userId);
    res.json(projects.map(p => projectResponse(p, req.userId, reviewed)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/projects/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const uid = req.userId;
    const where = req.userRole === 'homeowner' ? { ownerId: uid } : { proId: uid };
    const projects = await prisma.project.findMany({
      where, include: projectInclude, orderBy: { createdAt: 'desc' }
    });
    const reviewed = await getReviewedProjectIds(uid);
    res.json(projects.map(p => projectResponse(p, uid, reviewed)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const p = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: projectInclude
    });
    if (!p) return res.status(404).json({ message: 'Not found' });
    const reviewed = await getReviewedProjectIds(req.userId);
    res.json(projectResponse(p, req.userId, reviewed));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'homeowner')
      return res.status(403).json({ message: 'Forbidden' });

    const { title, category, description, budget } = req.body;
    const project = await prisma.project.create({
      data: { title, category, description, budget, ownerId: req.userId },
      include: projectInclude
    });
    const reviewed = await getReviewedProjectIds(req.userId);
    res.json(projectResponse(project, req.userId, reviewed));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects/:id/apply
router.post('/:id/apply', auth, async (req, res) => {
  try {
    if (req.userRole !== 'pro')
      return res.status(403).json({ message: 'Forbidden' });

    const projectId = parseInt(req.params.id);
    const uid = req.userId;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is not open.' });

    const exists = await prisma.application.findFirst({ where: { projectId, proId: uid } });
    if (exists) return res.status(400).json({ message: 'Already applied.' });

    await prisma.application.create({ data: { projectId, proId: uid } });
    res.json({ message: 'Application submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/projects/:id/applications
router.get('/:id/applications', auth, async (req, res) => {
  try {
    if (req.userRole !== 'homeowner')
      return res.status(403).json({ message: 'Forbidden' });

    const projectId = parseInt(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    const apps = await prisma.application.findMany({
      where: { projectId },
      include: { pro: { include: { reviewsReceived: true } } }
    });

    res.json(apps.map(a => ({
      id: a.id, status: a.status, appliedAt: a.appliedAt,
      pro: userSummary(a.pro)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects/:id/accept/:proId
router.post('/:id/accept/:proId', auth, async (req, res) => {
  try {
    if (req.userRole !== 'homeowner')
      return res.status(403).json({ message: 'Forbidden' });

    const projectId = parseInt(req.params.id);
    const proId = parseInt(req.params.proId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { applications: true }
    });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.ownerId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is not open.' });

    const app = project.applications.find(a => a.proId === proId);
    if (!app) return res.status(400).json({ message: 'No application from this pro.' });

    await Promise.all(project.applications.map(a =>
      prisma.application.update({
        where: { id: a.id },
        data: { status: a.proId === proId ? 'accepted' : 'rejected' }
      })
    ));

    await prisma.project.update({
      where: { id: projectId },
      data: { proId, status: 'in-progress' }
    });

    res.json({ message: 'Pro accepted. Project is now in progress.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const uid = req.userId;
    const role = req.userRole;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.status !== 'in-progress')
      return res.status(400).json({ message: 'Project is not in progress.' });

    const data = {};
    if (role === 'homeowner') {
      if (project.ownerId !== uid) return res.status(403).json({ message: 'Forbidden' });
      data.ownerApprovedComplete = true;
    } else if (role === 'pro') {
      if (project.proId !== uid) return res.status(403).json({ message: 'Forbidden' });
      data.proApprovedComplete = true;
    } else return res.status(403).json({ message: 'Forbidden' });

    const ownerApproved = role === 'homeowner' ? true : project.ownerApprovedComplete;
    const proApproved   = role === 'pro'       ? true : project.proApprovedComplete;
    if (ownerApproved && proApproved) data.status = 'completed';

    const updated = await prisma.project.update({ where: { id: projectId }, data });

    const msg = updated.status === 'completed'
      ? 'Project marked as completed!'
      : 'Completion approved. Waiting for the other party.';

    res.json({ message: msg, status: updated.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
