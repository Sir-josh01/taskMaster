import React, {useState} from 'react';


const TaskForm = () => {
  const [formData, setFormData] = useState({name: "", description: "", priority: "Medium", dueDate: ""});
  const [isCreating, setIsCreating] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    await onCreate(formData); // Call the parent function
    setFormData({ name: '', description: '', priority: 'Medium', dueDate: '' }); // Reset
    setIsCreating(false); 
  };

  return (
    <form onSubmit={handleSubmit} className='form-container'>
      <input 
        className='main-input' 
        value={formData.name} 
        onChange={(e) => setFormData({...formData, name: e.target.value})} 
        placeholder="Capture a new task..." required 
      />
      <textarea 
        className='desc-input' 
        value={formData.description} 
        onChange={(e) => setFormData({...formData, description: e.target.value})} 
        placeholder='Add a description...' 
      />
      <div className='meta-inputs'>
        <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
      </div>
      <button type='submit' className='add-btn' disabled={isCreating}>
        {isCreating ? <div className='spinner-small'></div> : "Add Task"}
      </button>
    </form>
  )
}

export default TaskForm