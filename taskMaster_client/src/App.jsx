import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import Auth from "./components/Auth";
import { API_BASE_URL } from "./config";

import "./App.css";
import "./components/TaskList.css";

import NavBar from "./components/NavBar";
import ThemeToggle from "./components/ThemeToggle";
import TaskForm from "./components/TaskForm";
import TaskStats from "./components/TaskStats";
import TaskList from "./components/TaskList";
import Toast from "./components/Toast";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [feedback, setFeedback] = useState({ msg: "", type: "" });

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("task-master-theme") || "dark",
  );
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  // const [eatTheFrogMode, setEatTheFrogMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [overduePlayed, setOverduePlayed] = useState(new Set());
  const [soundsEnabled, setSoundsEnabled] = useState(false);

const enableSounds = () => {
  const audio = new Audio('/sounds/Eugy_Official_-_Winners_Side__Official_Video_(128k).mp3');
  audio.volume = 0;
  audio.play()
    .then(() => {
      setSoundsEnabled(true);
      showFeedback("Alarm sounds enabled! 🔔", "success");
    })
    .catch(err => {
      showFeedback("Couldn't enable sounds – try again or check browser permissions", "error");
    });
};


  // Identify tasks
  const today = new Date().toISOString().split("T")[0]; // "2025-02-23"

  const urgentTasks = tasks.filter((task) => {
    if (task.isCompleted) return false;
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate);
    const todayEnd = new Date(today + "T23:59:59");

    return due <= todayEnd;
  });

  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  const oneWeekStr = oneWeekFromNow.toISOString().split("T")[0];

  // Group tasks into categories for sorting
  const overdue = tasks.filter(
    (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date(today),
  );

  const dueToday = tasks.filter(
    (t) =>
      !t.isCompleted &&
      t.dueDate &&
      new Date(t.dueDate).toISOString().split("T")[0] === today,
  );

  const dueSoon = tasks.filter(
    (t) =>
      !t.isCompleted &&
      t.dueDate &&
      new Date(t.dueDate).toISOString().split("T")[0] > today &&
      new Date(t.dueDate).toISOString().split("T")[0] <= oneWeekStr,
  );

  const laterOrNoDate = tasks.filter(
    (t) =>
      !t.isCompleted &&
      (!t.dueDate ||
        new Date(t.dueDate).toISOString().split("T")[0] > oneWeekStr),
  );

  const completed = tasks.filter((t) => t.isCompleted);

  // Now combine them in priority order
  const sortedTasks = [
    ...overdue,
    ...dueToday,
    ...dueSoon,
    ...laterOrNoDate,
    ...completed,
  ];

  // For debugging
  // console.log({
  //   overdue: overdue.length,
  //   dueToday: dueToday.length,
  //   dueSoon: dueSoon.length,
  //   laterOrNoDate: laterOrNoDate.length,
  //   completed: completed.length,
  // });

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
          "error",
        );
        setTimeout(() => fetchTasks(retryCount + 1), (retryCount + 1) * 2000);
      } else {
        showFeedback(
          "Database is currently offline. Please try again later.",
          "error",
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
        { headers: { Authorization: `Bearer ${token}` } },
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
      task._id === id ? { ...task, isCompleted: !currentStatus } : task,
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showFeedback(
        newStatus === "completed" ? "Task Completed! 🎉" : "Task Re-opened",
        "success",
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
        { headers: { Authorization: `Bearer ${token}` } }, // Added Auth
      );

      fetchTasks();
      showFeedback("Task created successfully!", "success");
      return true;
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED";
      // showFeedback(errorMsg, "Failed to create task");
      showFeedback(
        isTimeout ? "Request timed out. Try again." : "Failed to create task",
        "error",
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
        "error",
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
      "WARNING: This will permanently delete your accounts and all tasks!, Are you sure?",
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
          }),
        ),
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

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 10000); 

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && soundsEnabled) {
      // Tab just became visible → check for overdue and play sound
      tasks.forEach((task) => {
        if (!task.dueDate || task.isCompleted) return;

        const due = new Date(task.dueDate).getTime();
        const now = Date.now();

        if (due < now && !overduePlayed.has(task._id)) {
          const audio = new Audio('/sounds/Eugy_Official_-_Winners_Side__Official_Video_(128k).mp3');
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [tasks, overduePlayed, soundsEnabled]);

// useEffect(() => {
  // if (Notification.permission !== "granted" || !currentTime) return;

  // tasks.forEach((task) => {
  //   if (!task.dueDate || task.isCompleted) return;

  //   const due = new Date(task.dueDate).getTime();
  //   const now = currentTime;

  //   if (due < now && !overduePlayed.has(task._id)) {
  //     new Notification("Task Overdue!", {
  //       body: `"${task.name}" is overdue! Time to act.`,
  //       icon: "/favicon.ico", // optional: your app icon
  //       tag: task._id, // prevent duplicate notifications
  //       renotify: true,
  //     });

  //     setOverduePlayed(prev => new Set([...prev, task._id]));
  //     showFeedback(`Overdue: "${task.name}" – Notification sent!`, "warning");
  //   }
  // });
// }, [currentTime, tasks, overduePlayed]);

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration('/').then(reg => {
      if (reg) {
        console.log('Service Worker already registered');
      } else {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registered:', reg.scope))
          .catch(err => console.error('SW registration failed:', err));
      }
    });
  }
}, []);

useEffect(() => {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'PLAY_ALARM') {
      const audio = new Audio('/sounds/Eugy_Official_-_Winners_Side__Official_Video_(128k).mp3');
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  });
}, []);

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

        {/* Test button */}
      <button 
        onClick={async () => {
          try {
            await axios.post(
              `${API_BASE_URL}/push/send-test-push`, 
              {}, 
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              }
            );
            showFeedback("Test push sent! Check your desktop.", "success");
          } catch (err) {
            console.error("Test push failed:", err);
            showFeedback("Failed to send test push – check console or subscription.", "error");
          }
        }}
        style={{
          padding: '8px 16px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          margin: '10px 0',
          fontWeight: '500'
        }}
      >
        Test Push
      </button>

        {/* subscribe notification */}
        <div>
          <button
          onClick={async () => {
            try {
              // Step 1: Ask permission
              if (Notification.permission !== 'granted') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                  showFeedback("Permission denied — change in browser settings.", "error");
                  return;
                }
              }

              // Step 2: Get registration
              const registration = await navigator.serviceWorker.ready;

              // Step 3: Subscribe with VAPID
              const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

              if (!vapidKey) {
                showFeedback("VAPID key missing in .env — cannot subscribe", "error");
                return;
              }

              const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
              });

              console.log('Subscription object:', sub.toJSON()); // debug

              // Step 4: Send to backend
              const res = await axios.post(
                `${API_BASE_URL}/push/subscribe`,
                { subscription: sub.toJSON() },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
              );

              console.log('Backend response:', res.data);
              showFeedback("Successfully subscribed to push notifications!", "success");
            } catch (err) {
              console.error('Push subscription failed:', err);
              showFeedback("Failed to subscribe — check console", "error");
            }
          }}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            margin: '15px 0',
            fontSize: '16px'
          }}
        >
          Subscribe to Push Notifications (Desktop)
          </button>
        </div>

        <div style={{
          // display: "flex",
          // justifyContent: "spaceBetween",
          // alignItems: "start",
          // marginRight: "50px"
        }}>
   <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

         {!soundsEnabled && (
          <button 
            onClick={enableSounds}
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              margin: '10px 0',
              fontWeight: '500'
            }}
          >
            Enable Alarms
          </button>
        )}
        </div>

        {Notification.permission !== "granted" && (
          <button
            onClick={async () => {
              try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                  showFeedback("Notifications enabled! You'll get alerts for overdue tasks.", "success");
                } else {
                  showFeedback("Notifications denied – you can change this in browser settings.", "error");
                }
              } catch (err) {
                showFeedback("Could not request notifications – check browser settings.", "error", err);
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              margin: '10px 0',
              fontWeight: '500'
            }}
          >
            Enable Desktop Notifications
          </button>
        )}
     

        {/* ────── New: Urgent filter toggle ────── */}
        <div
          style={{
            margin: "12px 0 24px 0",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              background: showOnlyUrgent ? "var(--accent)" : "var(--glass)",
              color: showOnlyUrgent ? "white" : "var(--text)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontWeight: showOnlyUrgent ? "bold" : "normal",
            }}
          >
            {showOnlyUrgent ? "Showing Urgent Only" : "Show Urgent / Overdue"}
            {urgentTasks.length > 0 && ` (${urgentTasks.length})`}
          </button>
        </div>

        {/* Eat the Frog toggle – place after urgent toggle */}
        <div
          style={{
            margin: "12px 0 24px 0",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {/* Your existing urgent toggle here... */}

          {/* <button
            onClick={() => setEatTheFrogMode(!eatTheFrogMode)}
            style={{
              padding: "8px 20px",
              borderRadius: "12px",
              background: eatTheFrogMode ? "#4ade80" : "var(--glass)", // green when active
              color: eatTheFrogMode ? "#0f172a" : "var(--text)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontWeight: eatTheFrogMode ? "bold" : "normal",
              boxShadow: eatTheFrogMode
                ? "0 0 12px rgba(74,222,128,0.4)"
                : "none",
            }}
          >
            {eatTheFrogMode ? "🐸 Eating the Frog" : "Eat the Frog"}
          </button> */}
        </div>
        

        <h2 className="title">Task Master</h2>

        {/* form container */}
        <TaskForm isProcessing={isProcessing} createTask={createTask} />

        {/* Add this right after your form tag */}
        <TaskStats tasks={tasks} clearCompleted={clearCompleted} />

        <TaskList
          loading={loading}
          tasks={showOnlyUrgent ? urgentTasks : sortedTasks}
          handleUpdate={handleUpdate}
          toggleComplete={toggleComplete}
          deleteTask={deleteTask}
          isProcessing={isProcessing}
          currentTime={currentTime}
        />
      </div>
    </>
  );
}

export default App;
