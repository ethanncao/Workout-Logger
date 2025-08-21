const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); // this is used to control what is allowed to use our backend (later on that will be our frontend that is running from vercel)
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Workout logger backend is running! test test test");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
