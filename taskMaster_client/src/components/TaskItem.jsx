import React, {useState} from 'react'

const TaskItem = ({task, handleUpdate, toggleComplete, deleteTask, isProcessing}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.name);

  const handleUpdateSubmit = async () => {
    if (!editText.trim()) {
      setIsEditing(false);
      setEditText(task.name)
      return;
    }
    const success = await handleUpdate(task._id, editText);
    if (success) setIsEditing(false);
  };

  return (
       <div key={task._id} className={`task-card priority-${(task.priority || "Medium").toLowerCase()}`}>
          <div className="main-row">
            <input 
              type='checkbox'
              checked={task.isCompleted}
              onChange={() => toggleComplete(task._id, task.isCompleted)}
            />
            
            {isEditing ? (
              <input 
                className="inline-edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                // onBlur={() => handleUpdate(task._id)}
                onBlur={handleUpdateSubmit}
                // onKeyDown={(e) => e.key === 'Enter' && handleUpdate(task._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateSubmit();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditText(task.name);
                  }
                }}
                autoFocus
              />
            ) : (
              <p 
                className={`task-name ${task.isCompleted ? 'strikethrough' : ''}`}
                // onClick={() => startEditing(task)}
                onClick={() => setIsEditing(true)}
              >
                {task.name}
              </p>
            )}
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
          <button onClick={() => deleteTask(task._id)} 
            disabled={isProcessing === task._id} className='delete-btn'>
            {isProcessing === task._id ? <div className='spinner-small'></div> : "Delete"}
            </button>
        </div>
    )
  }

export default TaskItem