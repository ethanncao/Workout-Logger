const express = require("express");
const router = express.Router();

let SESSIONS = [];

router.get("/", (req, res) => {
  // SESSIONS will be treated as a stack
  res.json(SESSIONS);
});

router.post("/", (req, res) => {
  const { title, date, exercises } = req.body || {};

  if (!title || !date)
    return res.status(400).json({ error: "Title and date required!" });

  const session = {
    id: crypto.randomUUID(),
    title,
    date,
    exercises: Array.isArray(exercises) ? exercises : [],
  };
  SESSIONS.push(session);
  res.status(201).json(session);
  console.log(SESSIONS);
});

module.exports = router;
