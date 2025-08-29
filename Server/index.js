const express = require("express");
const cors = require("cors");
const workoutsRouter = require("./routes/workouts");
const { PrismaClient } = require(`@prisma/client`);

const app = express();

app.use(cors()); // this is used to control what is allowed to use our backend (later on that will be our frontend that is running from vercel)
app.use(express.json());

const prisma = new PrismaClient();

// testing to see our db connects
app.get("/health/db", async (req, res) => {
  const count = await prisma.session.count();
  res.json({ ok: true, sessions: count });
});

app.post("/users/demo", async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@local" },
      update: {},
      create: { email: "demo@local" },
    });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to upsert demo user" });
  }
});

app.post("/workouts", async (req, res) => {
  const { title, date } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@local" },
      update: {},
      create: { email: "demo@local" },
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        label: title,
        startedAt: new Date(date),
      },
    });

    return res.status(201).json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create session" });
  }
});

// connecting workouts.js route
app.use("/workouts", workoutsRouter);

app.get("/", (req, res) => {
  res.send("Workout logger backend is running! test test test");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
