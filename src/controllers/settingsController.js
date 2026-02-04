const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get carousel mode
exports.getCarouselMode = async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'carouselMode' } });
    res.json({ mode: setting ? setting.value : 'custom' });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching carousel mode' });
  }
};

// Set carousel mode
exports.setCarouselMode = async (req, res) => {
  const { mode } = req.body;
  if (!mode || !['custom', 'auto'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode' });
  }
  try {
    const setting = await prisma.setting.upsert({
      where: { key: 'carouselMode' },
      update: { value: mode },
      create: { key: 'carouselMode', value: mode },
    });
    res.json({ mode: setting.value });
  } catch (err) {
    res.status(500).json({ error: 'Error updating carousel mode' });
  }
};
