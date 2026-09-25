const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuthApi } = require('../middleware/requireAuth');

router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { id: 'desc' } });
  res.json(posts);
});

router.post('/', requireAuthApi, async (req, res) => {
  const { type, title, content, date, time, location } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const isEvent = type === 'event';
  const newItem = await prisma.post.create({
    data: {
      type: isEvent ? 'event' : 'post',
      title,
      content,
      date: isEvent ? (date || 'TBD') : new Date().toISOString().split('T')[0],
      time: isEvent ? (time || null) : null,
      location: isEvent ? (location || null) : null
    }
  });

  res.status(201).json(newItem);
});

router.delete('/:id', requireAuthApi, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.post.deleteMany({ where: { id } });
  res.json({ success: true });
});

module.exports = router;
