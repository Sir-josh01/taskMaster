import React, { useState } from "react";
import "./TaskItem.css";

const TaskItem = ({
  task,
  handleUpdate,
  toggleComplete,
  deleteTask,
  isProcessing,
  currentTime,
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

  // Calculate how "full" the pressure bar should be (0–100%)
  const calculatePressurePercent = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate).getTime();
    const now = Date.now();

    if (due <= now) return 100; // overdue or due now = full red bar

    const diffMs = due - now;
    const daysLeft = diffMs / (1000 * 60 * 60 * 24);

    // Rough but effective scaling:
    // - >7 days left → very low pressure (10–20%)
    // - 3–7 days → medium (30–60%)
    // - 1–3 days → high (60–90%)
    // - <1 day → almost full (90–100%)
    let percent = 100 - daysLeft * 12; // adjust multiplier to taste (12 = aggressive)
    return Math.min(100, Math.max(0, percent));
  };

  // Get color based on pressure level
  const getPressureColor = (percent) => {
    if (percent >= 90) return "#f43f5e"; // red – urgent/overdue
    if (percent >= 60) return "#fbbf24"; // yellow/orange – getting close
    if (percent >= 30) return "#a78bfa"; // purple – moderate
    return "#10b981"; // green – plenty of time
  };

  // Optional short text description (can show below bar)
  const getPressureLabel = (percent, isOverdue) => {
    if (isOverdue) return "Overdue – Act Now!";
    if (percent >= 90) return "Very Urgent!";
    if (percent >= 60) return "Getting Close";
    if (percent >= 30) return "Moderate Pressure";
    return "Plenty of Time";
  };

  <span className={`priority-tag ${priorityClass}`}></span>;

  const getTimeLeft = (dueDate) => {
    if (!dueDate)
      return { text: "No deadline", color: "var(--text-secondary)" };

    const due = new Date(dueDate).getTime();
    const now = currentTime || Date.now();
    const diffMs = due - now;

    let text = "";
    let color = "var(--primary)";
    let shouldBlink = false;

    if (diffMs <= 0) {
      // Overdue
      const overdueMs = Math.abs(diffMs);
    const totalHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const daysOverdue = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const minutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));


     color = "#f43f5e";

    if (daysOverdue >= 1) {
      text = `Overdue by ${daysOverdue}d`;
      if (remainingHours > 0) text += ` ${remainingHours}h`;
    } else if (totalHours > 0) {
      text = `Overdue by ${totalHours}h ${minutes}m`;
    } else if (minutes > 0) {
      text = `Overdue by ${minutes}m`;
    } else {
      text = "Overdue – Act now!";
    }
  } else {
    // Future logic (your existing code)
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      text = `Due in ${days}d ${hours}h`;
    } else if (hours > 0) {
      text = `Due in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      text = `Due in ${minutes}m`;
    } else {
      text = "Due very soon!";
    }

    if (diffMs < 3600000) color = "#fbbf24";

    // Blink only when < 5 min left and still future
    shouldBlink = diffMs > 0 && diffMs < 300000;
  }

  return { text, color, shouldBlink };
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
            className={`inline-edit-input ${task.isCompleted ? "strikethrough" : ""}`}
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
          <div style={{ flex: 1 }}>
            <span className="date-tag">
              📅{" "}
              {task.dueDate &&
                (() => {
                  const { text, color, shouldBlink } = getTimeLeft(task.dueDate);

                  // Calculate diffMs again here (or return it from getTimeLeft if you prefer)
                  // const due = new Date(task.dueDate).getTime();
                  // const now = currentTime || Date.now();
                  // const diffMs = due - now;

                  // Add blink class only when 0 < diffMs < 5 minutes (300000 ms)
                  // const shouldBlink = diffMs > 0 && diffMs < 300000;

                  return (
                    <span
                      className={`countdown-tag ${shouldBlink ? 'blink' : ''}`}
                      style={{
                        marginLeft: "12px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        background: "rgba(99, 102, 241, 0.08)",
                        color: color, // ← now dynamic
                        border: `1px solid ${color}30`, // subtle border with opacity
                      }}
                    >
                      ⏱️ {text}
                    </span>
                  );
                })()}
            </span>

            {task.dueDate && !task.isCompleted && (
              <div
                style={{
                  marginTop: "8px",
                  width: "100%",
                  maxWidth: "180px",
                  height: "6px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${calculatePressurePercent(task.dueDate)}%`,
                    background: getPressureColor(
                      calculatePressurePercent(task.dueDate),
                    ),
                    transition: "width 0.6s ease, background 0.6s ease",
                  }}
                />
              </div>
            )}
          </div>

          {/* Optional small label under the bar */}
          {task.dueDate && !task.isCompleted && (
            <small
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                opacity: 0.8,
              }}
            >
              {getPressureLabel(
                calculatePressurePercent(task.dueDate),
                isOverdue(task.dueDate),
              )}
            </small>
          )}
        </div>

        <span className={`priority-tag ${priorityClass}`}>
          {task.priority || "Medium"}
        </span>
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
