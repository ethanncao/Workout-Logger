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

// this creates our workout in backend
app.post("/workouts", async (req, res) => {
  const { title, date, notes } = req.body;

  // find our user
  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@local" },
      update: {},
      create: { email: "demo@local" },
    });

    // create a new session for that user
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        label: title,
        startedAt: new Date(date),
        notes: notes,
      },
    });

    return res.status(201).json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create session" });
  }
});

// normalize name function to help remove any redundance in exercise naming
function normalize(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// when an exercise is added we post to our backend
app.post("/exercises", async (req, res) => {
  const { name } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Exercise name is required!" });
  }

  const norm = normalize(name);

  // get our user
  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@local" },
      update: {},
      create: { email: "demo@local" },
    });

    const exercise = await prisma.exercise.upsert({
      where: { userId_normalized: { userId: user.id, normalized: norm } },
      update: { name },
      create: { userId: user.id, name, normalized: norm },
    });

    return res.status(201).json({
      id: exercise.id,
      name: exercise.name,
      normalized: exercise.normalized,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create exercise" });
  }
});

app.post("/sessions/:sessionId/exercises", async (req, res) => {
  const { exerciseId } = req.body;
  const { sessionId } = req.params;

  try {
    const se = await prisma.sessionExercise.create({
      data: {
        sessionId: sessionId,
        exerciseId: exerciseId,
      },
    });

    return res.status(201).json({
      id: se.id,
      sessionId: se.sessionId,
      exerciseId: se.exerciseId,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create session exercise" });
  }
});

// when "Add Set" is pressed, find our session and add that set
app.post("/session-exercises/:seId/sets", async (req, res) => {
  const { seId } = req.params;
  const { reps, weight } = req.body;

  const last = await prisma.set.findFirst({
    where: { sessionExerciseId: seId },
    orderBy: { setNumber: "desc" },
  });

  const setNumber = (last?.setNumber ?? 0) + 1;

  try {
    const set = await prisma.set.create({
      data: {
        sessionExerciseId: seId,
        reps: reps,
        weight: weight,
        setNumber,
      },
    });

    return res.status(201).json(set);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add set to exercise" });
  }
});

app.get("/sessions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    session = await prisma.session.findUnique({
      where: { id: id },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return res.status(200).json(session);
  } catch (e) {
    console.error(e);
    return res.status(404).json({ error: "Failed to get the workout session" });
  }
});

// new route to get data for a workout
app.get("/data/exercise/:exerciseId", async (req, res) => {
  const { exerciseId } = req.params;

  const ses = await prisma.sessionExercise.findMany({
    where: { exerciseId },
    include: {
      sets: true,
      session: true, // so we get the session’s date
    },
    orderBy: { session: { startedAt: "asc" } },
  });

  let arr = [];

  ses.forEach((exercise) => {
    let maxWeight =
      exercise.sets.length > 0
        ? Math.max(...exercise.sets.map((s) => s.weight))
        : null;
    let date = exercise.session.startedAt.toISOString().slice(0, 10);

    arr.push({ date, maxWeight });
  });

  return res.json(arr);
});

app.get("/exercises", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: "demo@local" },
    select: { id: true },
  });

  if (!user) return res.json([]);

  const exercises = await prisma.exercise.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return res.json(exercises);
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
