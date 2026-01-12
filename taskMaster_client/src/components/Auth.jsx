import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Auth = ({ onAuthSuccess }) => {

  // 1. Toggle between Login and Register
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // 2. Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
     setErrorMsg("");

      const url = isLogin 
    ? `${API_BASE_URL}/auth/login` 
    : `${API_BASE_URL}/auth/register`;

    try {
      const { data } = await axios.post(url, formData);
      
      // Save the "Passport" (token) and user info to LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Tell App.jsx we are logged in
      onAuthSuccess(data.user);
    } catch (error) {
      const msg = error.response?.data?.msg || "No Account Found, Create An Account";
    setErrorMsg(msg);
      // alert(error.response?.data?.msg || 'Something went wrong');
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Enter your details to manage tasks' : 'Join Task Master today'}
        </p>

          {/* error notification */}
          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
          
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button type="submit" className="add-btn auth-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Auth;