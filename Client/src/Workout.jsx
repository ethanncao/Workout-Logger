import { useState, useEffect } from "react";

const BASE = "http://localhost:5000";

function Workout() {
  const [session, setSession] = useState(null);
  const [prevSessions, setPrevSessions] = useState([]);
  const [exForm, setExForm] = useState({ name: "" });

  const fetchSessions = async () => {
    const res = await fetch(`${BASE}/workouts/`);
    const data = await res.json();

    setPrevSessions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSession({ title: "Workout", date: today, exercises: [] });
  };

  // handles adding an exercise to our session
  const handleExercise = (e) => {
    e.preventDefault();
    const { name } = exForm;

    setSession((d) => ({
      ...d,
      exercises: [...d.exercises, { name, sets: [] }],
    }));

    setExForm({ name: "" });
  };

  const handleFinish = async () => {
    if (!session) return; // just making sure we have a session

    // POST this info to our backend
    await fetch(`${BASE}/workouts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });

    // reset our current session to null
    setSession(null);
    await fetchSessions();
  };

  const handleCancel = () => {
    alert("Cancelling the current workout session!");
    setSession(null);
  };

  return (
    <>
      <h1>Welcome to my workout logger website!</h1>
      <h2>Start logging new workout sessions:</h2>
      <button onClick={handleClick}>Start New Workout</button>

      {session && (
        <div>
          <h2>{session.title}</h2>
          <h2>{session.date}</h2>
          <ul style={{ marginTop: 8 }}>
            {session.exercises.map((ex) => (
              <li key={ex.id}>{ex.name}</li>
            ))}
            {session.exercises.length === 0 && <i>No exercises yet.</i>}
          </ul>
          <form onSubmit={handleExercise}>
            <input
              placeholder="Exercise"
              value={exForm.name}
              onChange={(e) =>
                setExForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <button type="submit">Add</button>
          </form>
          <button onClick={handleFinish}>Finish</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}

      {prevSessions.map((s) => (
        <li>
          <h2>{s.title}</h2>
          <h2>{s.date}</h2>
          <ul style={{ marginTop: 8 }}>
            {s.exercises.map((ex) => (
              <li key={ex.id}>
                {ex.name} — {ex.reps} reps — {ex.weight} lbs
              </li>
            ))}
          </ul>
        </li>
      ))}
      {prevSessions.length === 0 && <p>No previous sessions yet.</p>}
    </>
  );
}

export default Workout;
