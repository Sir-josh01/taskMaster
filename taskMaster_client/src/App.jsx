import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import Auth from "./components/Auth";
import { API_BASE_URL } from "./config";

import "./App.css";
import "./components/TaskList.css"

import NavBar from "./components/NavBar";
import ThemeToggle from "./components/ThemeToggle";
import TaskForm from "./components/TaskForm";
import TaskStats from "./components/TaskStats";
import TaskList from "./components/TaskList";
import Toast from "./components/Toast";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [feedback, setFeedback] = useState({ msg: "", type: "" });

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("task-master-theme") || "dark"
  );
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Identify tasks
  const today = new Date().toISOString().split('T')[0]; // "2025-02-23"

  const urgentTasks = tasks.filter(task => {
    if (task.isCompleted) return false; 
    if (!task.dueDate) return false;  

    const due = new Date(task.dueDate);
    const todayEnd = new Date(today + 'T23:59:59');

    return due <= todayEnd; 
  });

  // For debugging
  console.log("Urgent tasks count:", urgentTasks.length);

  const fetchTasks = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Get the saved token
      const res = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      setTasks(res.data.tasks);
    } catch (err) {
      const isNetworkError = !err.response;
      const isTimeout = err.code === "ECONNABORTED";

      if ((isTimeout || isNetworkError) && retryCount < MAX_RETRIES) {
        showFeedback(
          `Connection weak. Retrying... (${retryCount + 1}/${MAX_RETRIES})`,
          "error"
        );
        setTimeout(() => fetchTasks(retryCount + 1), (retryCount + 1) * 2000);
      } else {
        showFeedback(
          "Database is currently offline. Please try again later.",
          "error"
        );
        console.log("Final attempt failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, newName) => {
    const token = localStorage.getItem("token");
    const originalTasks = [...tasks];

    setTasks(tasks.map((t) => (t._id === id ? { ...t, name: newName } : t)));
    try {
      await axios.patch(
        `${API_BASE_URL}/tasks/${id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showFeedback("Task updated!", "success");
      return true;
      // fetchTasks();
    } catch (error) {
      setTasks(originalTasks);
      showFeedback("Update failed. Reverting...", "error");
      console.log("Update failed", error);
      return false;
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    const token = localStorage.getItem("token");

    const updatedTasks = tasks.map((task) =>
      task._id === id ? { ...task, isCompleted: !currentStatus } : task
    );
    setTasks(updatedTasks);

    try {
      const newStatus = !currentStatus ? "completed" : "pending"; // Logic: if not completed, make it completed
      await axios.patch(
        `${API_BASE_URL}/tasks/${id}`,
        {
          isCompleted: !currentStatus,
          status: newStatus, //flip the true or false;
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showFeedback(
        newStatus === "completed" ? "Task Completed! 🎉" : "Task Re-opened",
        "success"
      );
    } catch (error) {
      fetchTasks();
      showFeedback("Update failed", "error");
      console.log("Toggle failed", error);
    }
  };

  const createTask = async (taskData) => {
    const token = localStorage.getItem("token"); //get token
    setIsProcessing("creating");
    try {
      await axios.post(
        `${API_BASE_URL}/tasks`,
        {
          ...taskData,
          status: "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } } // Added Auth
      );

      fetchTasks();
      showFeedback("Task created successfully!", "success");
      return true;
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED";
      // showFeedback(errorMsg, "Failed to create task");
      showFeedback(
        isTimeout ? "Request timed out. Try again." : "Failed to create task",
        "error"
      );
      console.log("Error creating task", error.response?.data || error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    const originalTasks = [...tasks];
    // const filteredTasks = tasks.filter(task => task._d !== id);

    // Optimistic Remove
    setTasks(tasks.filter((t) => t._id !== id));
    setIsProcessing(id);

    // setTasks(filteredTasks);
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      showFeedback("Task deleted", "success");
    } catch (error) {
      const isTimeout =
        error.code === "ECONNABORTED" || error.message.includes("timeout");

      setTasks(originalTasks);
      // showFeedback("Error deleting task", "Task restored.", "error");
      showFeedback(
        isTimeout ? "Network too slow. Task restored." : "Error deleting task",
        "error"
      );
      console.log("Error deleting task", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = () => {
    // 1. Wipe the storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Reset React state
    setUser(null);

    // 3. Optional: Show feedback
    showFeedback("Logged out successfully", "success");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: This will permanently delete your accounts and all tasks!, Are you sure?"
    );
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/auth/deleteAccount`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Cleanup frontend
        localStorage.clear();
        setUser(null);
        alert("Account deleted successfully.");
      } catch (error) {
        console.log("Could not delete account", error);
      }
    }
  };

  const clearCompleted = async () => {
    // Confirmation dialog so users don't accidentally delete everything
    if (!window.confirm("Are you sure you want to remove all completed tasks?"))
      return;
    const token = localStorage.getItem("token"); // Need token here!

    try {
      // We only target tasks where isCompleted is true
      const completedTasks = tasks.filter((task) => task.isCompleted);

      // Use Promise.all to delete them all in one go
      await Promise.all(
        completedTasks.map((task) =>
          axios.delete(`${API_BASE_URL}/tasks/${task._id}`, {
            headers: { Authorization: `Bearer ${token}` }, // Added this
          })
        )
      );

      fetchTasks(); // Refresh the list
    } catch (error) {
      console.log("Bulk delete failed", error);
    }
  };

  const showFeedback = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
        console.log("Server status: Awake");
      } catch (err) {
        if (err.code === "ECONNABORTED") {
          console.log("Server is sleeping. Initializing wake-up sequence...");
        }
      }
    };
    wakeUpServer();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    // Save choice for next time
    localStorage.setItem("task-master-theme", theme);
  }, [theme]); // Runs every time 'theme' changes

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchTasks();
      }
    };
    loadData();
  }, [user]);

  // GateKeeper
  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <>
      <Toast feedback={feedback} />

      <div className="task-container">
        <NavBar
          user={user}
          handleLogout={handleLogout}
          handleDeleteAccount={handleDeleteAccount}
        />

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {/* ────── New: Urgent filter toggle ────── */}
      <div style={{
        margin: '12px 0 24px 0',
        textAlign: 'center'
      }}>
        <button
          onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            background: showOnlyUrgent ? 'var(--accent)' : 'var(--glass)',
            color: showOnlyUrgent ? 'white' : 'var(--text)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontWeight: showOnlyUrgent ? 'bold' : 'normal'
          }}
        >
          {showOnlyUrgent ? 'Showing Urgent Only' : 'Show Urgent / Overdue'}
          {urgentTasks.length > 0 && ` (${urgentTasks.length})`}
        </button>
      </div>

        <h2 className="title">Task Master</h2>

        {/* form container */}
        <TaskForm isProcessing={isProcessing} createTask={createTask} />

        {/* Add this right after your form tag */}
        <TaskStats tasks={tasks} clearCompleted={clearCompleted} />

        <TaskList
          loading={loading}
          tasks={showOnlyUrgent ? urgentTasks : tasks}
          handleUpdate={handleUpdate}
          toggleComplete={toggleComplete}
          deleteTask={deleteTask}
          isProcessing={isProcessing}
        />
      </div>
    </>
  );
}

export default App;
