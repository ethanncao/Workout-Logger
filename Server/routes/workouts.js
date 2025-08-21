const express = require("express");
const router = express.Router();

let WORKOUTS = [];

router.get("/", (req, res) => {
  res.json(WORKOUTS.sort((a, b) => b.date.localeCompare(a.date)));
});

router.post("/", (req, res) => {
  const { title, date, notes } = req.body || {};

  if (!title || !date)
    return res.status(400).json({ error: "Title and date required!" });

  const workout = { id: crypto.randomUUID(), title, date, notes: notes ?? "" };
  WORKOUTS.push(workout);
  res.status(201).json(workout);
});

module.exports = router;
