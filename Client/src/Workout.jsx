import { useState, useEffect } from "react";

const BASE = "http://localhost:5000";

function Workout() {
  const [session, setSession] = useState(null);
  const [prevSessions, setPrevSessions] = useState([]);
  const [exForm, setExForm] = useState({ name: "" });
  const [setForm, setSetForm] = useState({ reps: "", weight: "" });

  const fetchSessions = async () => {
    const res = await fetch(`${BASE}/workouts/`);
    const data = await res.json();

    setPrevSessions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // handles when the user wants to start a new workout and we default to Workout and today's date. Each session hollds exercises
  const handleClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSession({ title: "Workout", date: today, exercises: [] });
  };

  // handles adding an exercise to our session
  const handleExercise = (e) => {
    e.preventDefault();
    const { name } = exForm;

    // adds an exercise to our session with an empty array of sets
    setSession((d) => ({
      ...d,
      exercises: [...d.exercises, { name, sets: [] }],
    }));

    // resets our add exercise form
    setExForm({ name: "" });
  };

  const handleSet = (e, exerciseIndex) => {
    // we grab the user's input from our setForm
    e.preventDefault();
    const repsNum = Number(setForm.reps);
    const weightNum = Number(setForm.weight);

    // add it to our sets inside our exercise
    setSession((prev) => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };

      ex.sets = [...ex.sets, { reps: repsNum, weight: weightNum }];
      exercises[exerciseIndex] = ex;

      return { ...prev, exercises };
    });

    setSetForm({ reps: "", weight: "" });
  };

  // handles adding our session to our database in the backend
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

  // when we cancel our workout we simply just reset session state
  const handleCancel = () => {
    alert("Cancelling the current workout session!");
    setSession(null);
  };

  return (
    <>
      {/* Simple headers */}
      <h1>Welcome to my workout logger website!</h1>
      <h2>Start logging new workout sessions:</h2>

      {/* Button that starts a new workout */}
      {!session ? (
        <button onClick={handleClick}>Start New Workout</button>
      ) : (
        <> </>
      )}

      {/* If a session is active we display the session's title, date, and exercises */}
      {session && (
        <div>
          <h2>{session.title}</h2>
          <h2>{session.date}</h2>
          {/* diplaying our exercises */}
          <ul style={{ marginTop: 8 }}>
            {session.exercises.map((ex, index) => {
              const isActive = index === session.exercises.length - 1;

              return (
                <li key={index}>
                  {ex.name}
                  {/* Displays each set */}
                  <ul>
                    {ex.sets.map((s, i) => (
                      <li key={i}>
                        Set {i + 1}: {s.reps} reps @ {s.weight} lbs
                      </li>
                    ))}
                  </ul>
                  {/* Later on we will be putting our sets in here with info on their reps and weight */}
                  {/* Allows the user to only add sets to the most recent exercise */}
                  {isActive ? (
                    <form onSubmit={(e) => handleSet(e, index)}>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={setForm.reps}
                        onChange={(e) =>
                          setSetForm((f) => ({ ...f, reps: e.target.value }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Weight"
                        value={setForm.weight}
                        onChange={(e) =>
                          setSetForm((f) => ({ ...f, weight: e.target.value }))
                        }
                      />
                      <button type="submit">Add Set</button>
                    </form>
                  ) : (
                    <></>
                  )}
                </li>
              );
            })}
            {session.exercises.length === 0 && <i>No exercises yet.</i>}
          </ul>

          {/* Here we have a form with a submit button that adds an exercise to our session */}
          <form onSubmit={handleExercise}>
            <input
              placeholder="Exercise Name"
              value={exForm.name}
              onChange={(e) =>
                setExForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <button type="submit">Add</button>
          </form>
          {/* Our finish or cancel button when the user is done with their session or wants to cancel it */}
          <button onClick={handleFinish}>Finish</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}

      {/* This will simply show our previous session that the user finished before */}
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
