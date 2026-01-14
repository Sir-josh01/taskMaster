import { useState, useEffect, Fragment } from 'react'
import axios from 'axios';
import Auth from './components/Auth';
import { API_BASE_URL } from './config';

import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

import './App.css'

function App() {

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [feedback, setFeedback] = useState({ msg: "", type: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('task-master-theme') || 'dark');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");


  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Get the saved token
      const res = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
     });

      setTasks(res.data.tasks) 
    } catch(err) {
      if (err.code === 'ECONNABORTED') {

      showFeedback('Server is waking up from sleep. Retrying...', 'error');
      setTimeout(() => fetchTasks(), 2000);
      } else {
        console.log('Silent error: Database offline', err);
      } 
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditText(task.name);
  };

  const handleUpdate = async (id, newName) => {
    const token = localStorage.getItem('token');
    const originalTasks = [...tasks];

    // if(!editText.trim()) { 
    //   setEditingId(null);
    //   return;
    // } 
    
    // const updatedTasks = tasks.map(task => 
    //   task.id === id ? {...task, name: editTask} : task
    // );
    // setTasks(updatedTasks);
    setTasks(tasks.map(t => t._id === id ? {...t, name: newName} : t));
    // setEditingId(null);
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${id}`,
         { name: newName }, 
         { headers: { Authorization: `Bearer ${token}` } });

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
      const token = localStorage.getItem('token');

      const updatedTasks = tasks.map(task => 
        task._id === id ? {...task, isCompleted: !currentStatus} : task
      );
      setTasks(updatedTasks);

    try {
      const newStatus = !currentStatus ? 'completed' : 'pending'; // Logic: if not completed, make it completed
    await axios.patch(`${API_BASE_URL}/tasks/${id}`, {
      isCompleted: !currentStatus, status: newStatus //flip the true or false;
    }, {headers: { Authorization: `Bearer ${token}` }} );
      showFeedback(newStatus === 'completed' ? "Task Completed! 🎉" : "Task Re-opened", "success");
    } catch(error) {
      fetchTasks();
      showFeedback("Update failed", "error");
      console.log("Toggle failed", error);
    }
  };

  const createTask = async (taskData) => {
  
    const token = localStorage.getItem('token'); //get token
    setIsProcessing('creating');
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        ...taskData,
        status: 'pending'
      }, { headers: { Authorization: `Bearer ${token}` } } // Added Auth
    );
      
      fetchTasks();
      showFeedback("Task created successfully!", "success");
      return true;
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED";
      // showFeedback(errorMsg, "Failed to create task");
      showFeedback(isTimeout ? "Request timed out. Try again." : "Failed to ceeate task", "error");
      console.log('Error creating task', error.response?.data || error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    const originalTasks = [...tasks];
    // const filteredTasks = tasks.filter(task => task._d !== id);

    // Optimistic Remove
    setTasks(tasks.filter(t => t._id !== id));
    setIsProcessing(id);

    // setTasks(filteredTasks);
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
      fetchTasks();
      showFeedback("Task deleted", "success");
    } catch (error) {
       const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');

      setTasks(originalTasks);
      // showFeedback("Error deleting task", "Task restored.", "error");
      showFeedback(isTimeout ? "Network too slow. Task restored." : "Error deleting task", "error");
      console.log('Error deleting task', error);
    } finally {
      setIsProcessing(null);
    }
  }

  const handleLogout = () => {
  // 1. Wipe the storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 2. Reset React state
  setUser(null);
  
  // 3. Optional: Show feedback
  showFeedback("Logged out successfully", "success");
};

  const toggleTheme = () => {

  setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("WARNING: This will permanently delete your accounts and all tasks!, Are you sure?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/auth/deleteAccount`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Cleanup frontend
        localStorage.clear();
        setUser(null);
        alert("Account deleted successfully.");
      } catch (error) {
        console.log("Could not delete account", error);
      }
  };
}

  const clearCompleted = async () => {
  // Confirmation dialog so users don't accidentally delete everything
  if (!window.confirm("Are you sure you want to remove all completed tasks?")) return;
  const token = localStorage.getItem('token'); // Need token here!

  try {
    // We only target tasks where isCompleted is true
    const completedTasks = tasks.filter(task => task.isCompleted);
    
    // Use Promise.all to delete them all in one go
    await Promise.all(
      completedTasks.map(task => axios.delete(`${API_BASE_URL}/tasks/${task._id}`, {
          headers: { Authorization: `Bearer ${token}` } // Added this
        }))
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
        if (err.code === 'ECONNABORTED') {
          console.log("Server is sleeping. Initializing wake-up sequence...");
        }
      }
    };
    wakeUpServer();
  }, []);


useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Save choice for next time
  localStorage.setItem('task-master-theme', theme);
}, [theme]); // Runs every time 'theme' changes

  useEffect(() => {
    const loadData = async () => {

    if (user) {
      await fetchTasks();
      }
    };
    loadData();
  }, [user])

  // GateKeeper
  if(!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <>
       {feedback.msg && (
      <div className={`feedback-toast ${feedback.type}`}>
        {feedback.msg}
      </div>
    )}
      <div className='task-container'>
          <div className="user-bar">
            <p>Logged in as: <strong>{user.name}</strong></p>

              <div className="user-actions">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                
                {/* Settings Toggle */}
                <button 
                  className="settings-toggle" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? "✖" : "⚙️"}
                </button>
              </div>

              {/* Hidden Settings Panel */}
              {showSettings && (
                <div className="settings-panel">
                  <h4>Account Settings</h4>
                  <p className="danger-text">Warning: This action is permanent.</p>
                  <button className="delete-acc-btn" onClick={handleDeleteAccount}>
                    Delete My Account
                  </button>
                </div>
              )}
          </div>

        <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <h2 className='title'>Task Master</h2>

        {/* form container */}
        <TaskForm isProcessing={isProcessing} createTask={createTask} />
     
             {/* Add this right after your form tag */}
          <div className="list-header">
            <h3>Your Tasks</h3>
              {tasks.some(t => t.isCompleted) && (
                <button onClick={clearCompleted} className="clear-btn">
                  🧹 Clear Completed
                </button>
              )}
          </div>

          <div className="stats-container">
            <div className="stat-badge total">
              <span className="stat-count">{tasks.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-badge pending">
              <span className="stat-count">{tasks.filter(t => !t.isCompleted).length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-badge completed">
              <span className="stat-count">{tasks.filter(t => t.isCompleted).length}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>

          <div className='task-list'>
          {
            loading ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <p>Syncing with database...</p>
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
              <Fragment key={task._id}>
                <TaskItem 
                  task={task}
                  // startEditing={startEditing}
                  handleUpdate={handleUpdate}
                  toggleComplete={toggleComplete}
                  deleteTask={deleteTask}
                  isProcessing={isProcessing}
                  />
              </Fragment>
              ))
            ) : (
              <div className="empty-msg">
              <p>No tasks found. Enjoy your day! ☕</p>
              </div>
            )
          }
        </div>
      </div>
    
    </>
  )
}

export default App
