const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuthApi } = require('../middleware/requireAuth');

router.get('/', requireAuthApi, async (req, res) => {
  const applications = await prisma.application.findMany({ orderBy: { id: 'asc' } });
  res.json(applications);
});

router.post('/', async (req, res) => {
  const { fullName, phone, memberCategory, affiliation, location, position } = req.body || {};

  if (!fullName || !phone || !memberCategory || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newApplication = await prisma.application.create({
    data: {
      fullName,
      phone,
      memberCategory,
      affiliation: affiliation || null,
      location: location || null,
      position,
      submittedAt: new Date().toLocaleString()
    }
  });

  res.status(201).json(newApplication);
});

router.delete('/:id', requireAuthApi, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.application.deleteMany({ where: { id } });
  res.json({ success: true });
});

router.delete('/', requireAuthApi, async (req, res) => {
  await prisma.application.deleteMany({});
  res.json({ success: true });
});

module.exports = router;
