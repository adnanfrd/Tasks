import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { ClipLoader } from "react-spinners";

const SearchBar = ({ query, onChange }) => (
  <div className="sticky top-0 bg-white z-10 pb-4">
    <input
      type="text"
      value={query}
      onChange={onChange}
      placeholder="Search tasks..."
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700 shadow-sm"
    />
  </div>
);

const TaskList = ({ tasks }) => (
  <ul className="space-y-3">
    {tasks.map((task) => (
      <li
        key={task.id}
        className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-white border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition cursor-pointer"
      >
        <span className="text-gray-800 font-medium">{task.title}</span>
      </li>
    ))}
  </ul>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="mt-6 text-center">
    <p className="text-red-500 font-medium">{message}</p>
    <button
      onClick={onRetry}
      className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
    >
      Retry
    </button>
  </div>
);

const EmptyState = () => (
  <p className="mt-6 text-center text-gray-500 italic">No tasks found</p>
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (search = "") => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `https://jsonplaceholder.typicode.com/todos`
      );
      let filtered = res.data.slice(0, 20);
      if (search) {
        filtered = filtered.filter((t) =>
          t.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTasks(filtered);
    } catch (err) {
      setError("Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        fetchTasks(val);
      }, 500),
    [fetchTasks]
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen p-3 bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 h-[90vh] flex flex-col">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 p-6">
          Task 2
        </h1>
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <SearchBar query={query} onChange={handleChange} />
          {loading && (
            <div className="flex justify-center mt-6">
              <ClipLoader color="#6366F1" size={40} />
            </div>
          )}
          {error && (
            <ErrorState message={error} onRetry={() => fetchTasks(query)} />
          )}
          {!loading && !error && tasks.length === 0 && <EmptyState />}
          {!loading && !error && tasks.length > 0 && <TaskList tasks={tasks} />}
        </div>
      </div>
    </div>
  );
}
