// routes/workouts.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

// Return all sessions for the demo user, newest first
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "demo@local" },
      select: { id: true },
    });

    if (!user) return res.json([]);

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        label: true,
        startedAt: true,
      },
    });

    res.json(sessions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

module.exports = router;
