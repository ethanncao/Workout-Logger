import { useState, useEffect } from "react";
import axios from "axios";

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
      <h1>Welcome to the app!</h1>
    </>
  );
}

export default App;
