import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Workout from "./Workout.jsx";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((res) => {
        setMessage(res.data);
      })
      .catch((err) => {
        console.error("Error fetching from backend:", err);
      });
  }, []);

  console.log(message);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Workout />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
