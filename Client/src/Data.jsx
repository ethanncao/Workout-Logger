import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./styles/Data.css";

const BASE = "http://localhost:5000";

function Data() {
  const [exerData, setExerData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [chartData, setChartData] = useState([]);

  const navigate = useNavigate();

  const fetchExercises = async () => {
    const res = await fetch(`${BASE}/exercises`);
    const data = await res.json();
    setExercises(data);
    setSelectedExerciseId(data[0]?.id ?? "");
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (!selectedExerciseId) {
      setChartData([]);
      return;
    }

    (async () => {
      const res = await fetch(`${BASE}/data/exercise/${selectedExerciseId}`);
      if (!res.ok) {
        setChartData([]);
        return;
      }
      const rows = await res.json();

      const mapped = rows.map((r) => {
        const iso =
          typeof r.date === "string"
            ? r.date.slice(0, 10)
            : new Date(r.date).toISOString().slice(0, 10);
        const [y, m, d] = iso.split("-");
        return { date: iso, dateMDY: `${m}/${d}/${y}`, maxWeight: r.maxWeight };
      });

      setExerData(rows); // raw
      setChartData(mapped); // chart-ready
    })();
  }, [selectedExerciseId]);

  useEffect(() => {
    if (exerData) console.log(exerData);
  }, [exerData]);

  return (
    <>
      <div className="container">
        <nav>
          <div class="logo-container">
            <img class="peak-logo" src="/peak-logo-noname.png" alt="" />
            <h1>PEAK</h1>
          </div>
          <ul class="nav-list">
            <li>
              <button
                className="nav-btn"
                onClick={() => {
                  navigate("/");
                }}
              >
                Home
              </button>
            </li>
            <li>
              <button class="nav-btn">Contact</button>
            </li>
          </ul>
        </nav>

        <div className="content-container">
          <h1 className="data-title">Exercise Data</h1>
          <div className="desc">
            An interactive line chart that plots your Max Weight (lbs) per
            session. Hover to see exact values, filter by exercise to compare
            lifts, and spot PRs and trends at a glance!
          </div>
          <div className="header-container">
            <div>Select an Exercise:</div>
            <select
              id="exercises"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
          <div className="graph" style={{ width: "50vw" }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateMDY" />
                <YAxis
                  label={{ value: "lbs", angle: -90, position: "insideLeft" }}
                />
                <Tooltip labelFormatter={(label) => label} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  name="Max Weight"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Data;
