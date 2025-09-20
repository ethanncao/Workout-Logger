import { useState, useEffect } from "react";
import "./styles/Workout.css";
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:5000";

function Workout() {
  const [session, setSession] = useState(null);
  const [prevSessions, setPrevSessions] = useState([]);
  const [exForm, setExForm] = useState({ name: "" });
  const [setForm, setSetForm] = useState({ reps: "", weight: "" });
  const [expandedId, setExpandedId] = useState(null);
  const [detailsById, setDetailsById] = useState({});

  const navigate = useNavigate();

  const fetchSessions = async () => {
    const res = await fetch(`${BASE}/workouts/`);
    const data = await res.json();

    setPrevSessions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchSessions();

    async function createDemoUser() {
      const res = await fetch("http://localhost:5000/users/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("Demo user:", data);
    }

    createDemoUser();
  }, []);

  // handles when the user wants to start a new workout and we default to Workout and today's date. Each session hollds exercises
  const handleClick = async () => {
    // recoding this to be sent to our postgre
    const today = new Date().toISOString().slice(0, 10);

    // calling our backend with a title and today's date
    const res = await fetch(`${BASE}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Workout", date: today }),
    });

    if (!res.ok) {
      alert("Failed to start workout!");
      return;
    }

    // once created we set that as our current Session
    const created = await res.json();

    // now if we add exercises we will add it to exercises
    setSession({
      id: created.id,
      title: created.label || "Workout",
      date: new Date(created.startedAt).toISOString().slice(0, 10),
      exercises: [],
    });
  };

  // handles adding an exercise to our session
  const handleExercise = async (e) => {
    e.preventDefault();
    const { name } = exForm;

    const res = await fetch(`${BASE}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    });

    if (!res.ok) {
      alert("Failed to add exercise!");
      return;
    }

    // we get the exercise we just created
    const exercise = await res.json();

    // now we need to add it to our sessionExercise
    const sessionRes = await fetch(`${BASE}/sessions/${session.id}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id }),
    });

    if (!sessionRes.ok) {
      alert("Session exercise failed!");
      return;
    }

    const sessionEx = await sessionRes.json();

    // add the exercise into our current session
    setSession((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: sessionEx.id,
          exerciseId: exercise.id,
          name: exercise.name,
          sets: [],
        },
      ],
    }));

    // reset our exercise form
    setExForm({ name: "" });
  };

  const fetchSession = async function (sessionId) {
    const res = await fetch(`${BASE}/sessions/${sessionId}`);

    if (!res.ok) {
      alert("Fetching sessions failed!");
      return;
    }

    return await res.json();
  };

  const handleSet = async (e, exerciseIndex) => {
    // we grab the user's input from our setForm
    e.preventDefault();
    const repsNum = Number(setForm.reps);
    const weightNum = Number(setForm.weight);

    const seId = session.exercises[exerciseIndex].id;

    const res = await fetch(`${BASE}/session-exercises/${seId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reps: repsNum, weight: weightNum }),
    });

    if (!res.ok) {
      alert("Failed to add set!");
      return;
    }

    const set = await res.json();

    setSession((prev) => {
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };

      ex.sets = [
        ...ex.sets,
        {
          id: set.id,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
        },
      ];

      exercises[exerciseIndex] = ex;
      return { ...prev, exercises };
    });

    setSetForm({ reps: "", weight: "" });
  };

  // handles adding our session to our database in the backend
  const handleFinish = async () => {
    if (!session) return; // just making sure we have a session

    // POST this info to our backend

    const temp = await fetchSession(session.id);
    console.log(temp);

    // reset our current session to null
    setSession(null);
    await fetchSessions();
  };

  // when we cancel our workout we simply just reset session state
  const handleCancel = () => {
    alert("Cancelling the current workout session!");
    setSession(null);
  };

  const handleShowMore = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      if (!detailsById[id]) {
        const detail = await fetchSession(id);
        console.log(detail);

        setDetailsById((prev) => ({ ...prev, [id]: detail }));
      }
      setExpandedId(id);
    }
  };

  return (
    <>
      {/* Simple headers */}
      <nav>
        <ul class="nav-list">
          <li>
            <button
              class="nav-btn"
              onClick={() => {
                navigate("/data");
              }}
            >
              Analytics
            </button>
          </li>
          <li>
            <button class="nav-btn">Contact</button>
          </li>
          <li>
            <button class="nav-btn">Login</button>
          </li>
        </ul>
      </nav>

      <div class="main">
        <h1>Welcome Back, Ethan!</h1>
        <h2>Start a New Workout</h2>
        {/* Button that starts a new workout */}
        {!session ? (
          <button class="new-workout-btn" onClick={handleClick}>
            Start New Workout
          </button>
        ) : (
          <> </>
        )}
        {/* If a session is active we display the session's title, date, and exercises */}
        {session && (
          <div class="new-session">
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
                            setSetForm((f) => ({
                              ...f,
                              weight: e.target.value,
                            }))
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
        <h2>History</h2>
        {prevSessions.map((s) => (
          <div class="prev-workout-card">
            <li key={s.id}>
              <h2>{s.label || "Workout"}</h2>
              <h3>
                {new Date(s.startedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <button onClick={() => handleShowMore(s.id)}>Show More</button>
              {expandedId === s.id && detailsById[s.id] && (
                <div>
                  {detailsById[s.id].exercises.map((ex) => (
                    <div key={ex.id}>
                      {ex.exercise.name}
                      <ul>
                        {ex.sets.map((set) => (
                          <li key={set.id}>
                            Set {set.setNumber}: {set.reps} reps @ {set.weight}{" "}
                            lbs
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          </div>
        ))}
        {prevSessions.length === 0 && <p>No previous sessions yet.</p>}
        <div>Load More</div>
        {/* Will work on getting Load More later */}
      </div>
    </>
  );
}

export default Workout;
