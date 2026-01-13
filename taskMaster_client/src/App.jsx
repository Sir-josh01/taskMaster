import { useState, useEffect } from 'react'
import axios from 'axios';
import Auth from './components/Auth';
import { API_BASE_URL } from './config';
import './App.css'

function App() {

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [feedback, setFeedback] = useState({ msg: "", type: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('task-master-theme') || 'dark');
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');


  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Get the saved token
      const res = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}` // Send the "Passport"
      }
     });
      setTasks(res.data.tasks)
      
    } catch(err) {
      console.log('Silent error: database is offline', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditText(task.name);
  };

  const handleUpdate = async (id) => {
    const token = localStorage.getItem('token');
    const originalTasks = [...tasks];

    if(!editText.trim()) { 
      setEditingId(null);
      return;
    } 
    
    // const updatedTasks = tasks.map(task => 
    //   task.id === id ? {...task, name: editTask} : task
    // );
    // setTasks(updatedTasks);
    setTasks(tasks.map(t => t._id === id ? {...t, name: editText} : t));
    setEditingId(null);
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${id}`,
         { name: editText }, 
         { headers: { Authorization: `Bearer ${token}` } });

      showFeedback("Task updated!", "success");
      fetchTasks();
    } catch (error) {
      setTasks(originalTasks);
      showFeedback("Update failed. Reverting...", "error");
      console.log("Update failed", error);
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

  const createTask = async (e) => {
    e.preventDefault();

    if (!name || !dueDate) return;
    const token = localStorage.getItem('token'); //get token

    setIsProcessing('creating');
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        name: name,
        dueDate:dueDate,
        priority,
        description,
        status: 'pending' //default status
      }, { headers: { Authorization: `Bearer ${token}` } } // Added Auth
    );

      setName('');
      setDueDate('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      fetchTasks();
      showFeedback("Task created successfully!", "success");

    } catch (error) {
      console.log('Error creating task', error.response?.data || error.message);
      const errorMsg = error.response?.data || "Network Error: Could not save task.";
      showFeedback(errorMsg, "Failed to create task");
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
      setTasks(originalTasks);
      showFeedback("Error deleting task", "Task restored.", "error");
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

            {/* <button className="delete-acc-btn" onClick={handleDeleteAccount}>Delete Account</button>
            <button className="logout-btn" onClick={() => {
              localStorage.clear();
              setUser(null);
            }}>Logout</button> */}
          </div>

        <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <h2 className='title'>Task Master</h2>
      
        {/* Form Container */}
          <form onSubmit={createTask} className='form-container'> 
            <div className='input-group'>
              <input 
                className='main-input'
                type="text"
                placeholder="Capture a new task..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {/* <button type='submit' className='add-btn'>Add Task</button> */}
            </div>

            <div className='secondary-inputs'>
              <textarea 
                className='desc-input'
                placeholder='Add a description...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className='meta-inputs'>
                <select className='priority-select' value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>

                <input 
                  className='date-input'
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                </div>
            </div>
              <button type='submit' className='add-btn' disabled={isProcessing === 'creating'}>{isProcessing === 'creating' ? <div className='spinner-small'></div> : "Add Task"}</button>
          </form>

             {/* Add this right after your </form> tag */}
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
                <div key={task._id} className={`task-card priority-${(task.priority || "Medium").toLowerCase()}`}>
                  <div className="main-row">
                    <input 
                      type='checkbox'
                      checked={task.isCompleted}
                      onChange={() => toggleComplete(task._id, task.isCompleted)} 
                    />
                    
                    {editingId === task._id ? (
                      <input 
                        className="inline-edit-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => handleUpdate(task._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(task._id)}
                        autoFocus
                      />
                    ) : (
                      <p 
                        className={`task-name ${task.isCompleted ? 'strikethrough' : ''}`}
                        onClick={() => startEditing(task)}
                      >
                        {task.name}
                      </p>
                    )}
                    {/* <button onClick={() => deleteTask(task._id)} className='delete-btn'>Delete</button> */}
                  </div>

                  {/* NEW: Secondary info section */}
                  <div className="task-details">
                    {task.description && <p className="desc-text">{task.description}</p>}
                    <div className="task-footer">
                      <span className="date-tag">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                {/* </div> */}
                  <button onClick={() => deleteTask(task._id)} disabled={isProcessing === task._id} className='delete-btn'>{isProcessing === task._id ? <div className='spinner-small'></div> : "Delete"}</button>
                </div>
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
