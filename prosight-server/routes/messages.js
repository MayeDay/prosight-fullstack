const router = require('express').Router({ mergeParams: true });
const prisma = require('../db');
const auth = require('../middleware/auth');

// GET /api/projects/:projectId/messages
router.get('/:projectId/messages', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const uid = req.userId;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.ownerId !== uid && project.proId !== uid)
      return res.status(403).json({ message: 'Forbidden' });

    const messages = await prisma.message.findMany({
      where: { projectId },
      include: { sender: true },
      orderBy: { sentAt: 'asc' }
    });

    res.json(messages.map(m => ({
      id: m.id, text: m.text, sentAt: m.sentAt,
      sender: {
        id: m.sender.id, name: m.sender.name, role: m.sender.role,
        profession: m.sender.profession,
        hourlyRate: m.sender.hourlyRate != null ? Number(m.sender.hourlyRate) : null,
        averageRating: null, reviewCount: 0
      }
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects/:projectId/messages
router.post('/:projectId/messages', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const uid = req.userId;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.ownerId !== uid && project.proId !== uid)
      return res.status(403).json({ message: 'Forbidden' });

    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

    const sender = await prisma.user.findUnique({ where: { id: uid } });
    const message = await prisma.message.create({
      data: { projectId, senderId: uid, text: text.trim() }
    });

    res.json({
      id: message.id, text: message.text, sentAt: message.sentAt,
      sender: {
        id: sender.id, name: sender.name, role: sender.role,
        profession: sender.profession,
        hourlyRate: sender.hourlyRate != null ? Number(sender.hourlyRate) : null,
        averageRating: null, reviewCount: 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
