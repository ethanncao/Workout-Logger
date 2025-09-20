import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:5000";

function Data() {
  const [exerData, setExerData] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    const res = await fetch(
      `${BASE}/data/exercise/d92e5cdd-1b12-4414-a974-4b9de49904f0`
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
    </>
  );
}

export default Data;
