import React, { useState } from "react";
import "./TaskItem.css";

const TaskItem = ({
  task,
  handleUpdate,
  toggleComplete,
  deleteTask,
  isProcessing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.name);

  const handleUpdateSubmit = async () => {
    if (!editText.trim()) {
      setIsEditing(false);
      setEditText(task.name);
      return;
    }
    const success = await handleUpdate(task._id, editText);
    if (success) setIsEditing(false);
  };

  const priorityClass = (task.priority || "Medium").toLowerCase();

  // to detech overdue tasks
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const isDueToday = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date().toISOString().split("T")[0];
    const dueStr = due.toISOString().split("T")[0];
    return dueStr === today;
  };

  return (
    <div
      key={task._id}
      className={`task-card priority-${(task.priority || "Medium").toLowerCase()} 
    ${isOverdue(task.dueDate) ? "overdue" : ""} 
    ${isDueToday(task.dueDate) && !isOverdue(task.dueDate) ? "due-today" : ""}`}
      style={{
        borderLeftWidth: "6px",
        borderLeftStyle: "solid",
        borderLeftColor: isOverdue(task.dueDate)
          ? "#f43f5e"
          : isDueToday(task.dueDate)
            ? "#fbbf24"
            : "transparent", // fallback to priority color or nothing
      }}
    >
      <div className="main-row">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => toggleComplete(task._id, task.isCompleted)}
        />

        {isEditing ? (
          <input
            className="inline-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleUpdateSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateSubmit();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditText(task.name);
              }
            }}
            autoFocus
          />
        ) : (
          <>
            <p
              className={`task-name ${task.isCompleted ? "strikethrough" : ""}`}
              onClick={() => {
                if (!isEditing) {
                  toggleComplete(task._id, task.isCompleted);
                }
              }}
              onDoubleClick={() => setIsEditing(true)}
            >
              {task.name}
            </p>

            {/* Urgency badge – shown only if not completed and has due date */}
            {!task.isCompleted && task.dueDate && (
              <div
                className="urgency-badge"
                style={{
                  marginLeft: "auto",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  background: isOverdue(task.dueDate)
                    ? "rgba(244, 63, 94, 0.18)"
                    : isDueToday(task.dueDate)
                      ? "rgba(251, 191, 36, 0.18)"
                      : "transparent",
                  color: isOverdue(task.dueDate)
                    ? "#f43f5e"
                    : isDueToday(task.dueDate)
                      ? "#fbbf24"
                      : "transparent",
                  border: isOverdue(task.dueDate)
                    ? "1px solid #f43f5e"
                    : isDueToday(task.dueDate)
                      ? "1px solid #fbbf24"
                      : "none",
                }}
              >
                {isOverdue(task.dueDate) ? "Overdue!" : "Today"}
              </div>
            )}
          </>
        )}
      </div>

      {/* NEW: Secondary info section */}
      <div className="task-details">
        {task.description && <p className="desc-text">{task.description}</p>}

        <div className="task-footer">
          <span className="date-tag">
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
          <span className={`priority-tag ${priorityClass}`}>
            {task.priority || "Medium"}
          </span>
        </div>
      </div>

      <button
        onClick={() => deleteTask(task._id)}
        disabled={isProcessing === task._id}
        className="delete-btn"
      >
        {isProcessing === task._id ? (
          <div className="spinner-small"></div>
        ) : (
          "Delete"
        )}
      </button>
    </div>
  );
};

export default TaskItem;
