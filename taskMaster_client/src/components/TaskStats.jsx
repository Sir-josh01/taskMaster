import React from 'react'
import './TaskStats.css';

const TaskStats = ({tasks, clearCompleted}) => {
  const total = tasks.length;
  const pending = tasks.filter(t => !t.isCompleted).length;
  const completed = tasks.filter(t => t.isCompleted).length;
  return (
    <>
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
              <span className="stat-count">{total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-badge pending">
              <span className="stat-count">{pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-badge completed">
              <span className="stat-count">{completed}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
     </>
  )
}

export default TaskStats