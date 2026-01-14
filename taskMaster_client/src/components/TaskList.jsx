import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ loading, tasks, handleUpdate, toggleComplete, deleteTask, isProcessing }) => {
  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Syncing with database...</p>
      </div>
    );
  }
  if (tasks.length === 0) {
    return (
      <div className="empty-msg">
        <p>No tasks found. Enjoy your day! ☕</p>
      </div>
    );
  }
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          handleUpdate={handleUpdate}
          toggleComplete={toggleComplete}
          deleteTask={deleteTask}
          isProcessing={isProcessing}
        />
      ))}
    </div>
  );
};

export default TaskList;
