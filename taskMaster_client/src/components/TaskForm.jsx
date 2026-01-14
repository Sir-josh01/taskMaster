import React, {useState} from 'react';

const TaskForm = ({isProcessing, createTask }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { name, description, priority, dueDate };

    // Call the parent function and wait for success
    const success = await createTask(taskData);  
    if (success) {
      // Clear local state only if the task was actually created
      setName('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
    }
  };

 return (
        <form onSubmit={handleSubmit} className='form-container'> 
          <div className='input-group'>
            <input
              className='main-input'
              type="text"
              placeholder="Capture a new task..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
  );
};

export default TaskForm;