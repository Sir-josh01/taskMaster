import React from 'react'
import './Toast.css'

const Toast = ({ feedback }) => {
  if (!feedback.msg) return null;
  return (
    <div>
       {feedback.msg && (
      <div className={`feedback-toast ${feedback.type === 'error' ? 'error' : 'success'}`}>
        {feedback.msg}
      </div>
    )}
    </div>
  )
}

export default Toast