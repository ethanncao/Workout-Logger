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

  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await fetch(
      `${BASE}/data/exercise/d92e5cdd-1b12-4414-a974-4b9de49904f0` // right now we are just generating our bench press (later will do it dynamically)
    );
    const data = await res.json();

    setExerData(data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (exerData) console.log(exerData);
  }, [exerData]);

  const dummy = [
    { date: "2025-09-01", maxWeight: 150 },
    { date: "2025-09-02", maxWeight: 130 },
    { date: "2025-09-05", maxWeight: 155 },
    { date: "2025-09-10", maxWeight: 160 },
  ];

  return (
    <>
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        Home
      </button>
      <pre>{JSON.stringify(exerData, null, 2)}</pre>

      <div class="graph" style={{ width: "50vw" }}>
        <ResponsiveContainer>
          <LineChart
            data={dummy}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="maxWeight" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default Data;
