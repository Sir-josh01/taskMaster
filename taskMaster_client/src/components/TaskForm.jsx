import React, { useState } from "react";
import "./TaskForm.css";

const TaskForm = ({ isProcessing, createTask }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { name, description, priority, dueDate };

    // Call the parent function and wait for success
    const success = await createTask(taskData);
    if (success) {
      // Clear local state only if the task was actually created
      setName("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
    }
  };

 const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="input-group">
        <input
          className="main-input"
          type="text"
          placeholder="Capture a new task..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="secondary-inputs">
        <textarea
          className="desc-input"
          placeholder="Add a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="meta-inputs">
          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low priority</option>
            <option value="Medium">Medium priority</option>
            <option value="High">High priority</option>
          </select>

          <input
            className="date-input"
            type="date"
            value={dueDate.split("T")[0] || ""}
            onChange={(e) => {
              const newDate = e.target.value;
              if (!newDate) {
                setDueDate('');
                return;
              }
              const existingTime = dueDate.split('T')[1] || '23:59';
              setDueDate(`${newDate}T${existingTime}`);
            }}
            required
          />

          <input 
          className='time-input' 
          type="time"
          value={dueDate.split('T')[1] || '23:59'}
          onChange={(e) => {
          const newTime = e.target.value;
          if (!newTime) {
            setDueDate('');
            return;
          }
          let existingDate = dueDate.split('T')[0];
          if (!existingDate) {
            existingDate = today;
          }
          setDueDate(`${existingDate}T${newTime}`)
          }}
          required
        />
        </div>
      </div>

      <button
        type="submit"
        className="add-btn"
        disabled={isProcessing === "creating"}
      >
        {isProcessing === "creating" ? (
          <div className="spinner-small"></div>
        ) : (
          "Add Task"
        )}
      </button>
    </form>
  );
};

export default TaskForm;
