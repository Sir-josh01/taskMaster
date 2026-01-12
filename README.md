# ✅ Task Master

A powerful task management system designed to streamline productivity and time management.

## 🎯 Problems It Solves
* **Task Overload:** Prevents users from losing track of daily responsibilities.
* **Lack of Focus:** Uses priority levels to highlight what needs immediate attention.
* **Deadlines:** Solves the issue of forgotten dates through visual due-date tracking.

## 🚀 Key Functions
* **User Authentication:** Secure Login/Register using JWT.
* **Task Management:** Create, Read, Update, and Delete tasks with priority levels.
* **Account Privacy:** Users can only see and manage their own data.
* **Responsive UI:** Dark/Light mode with real-time task statistics.
* **Account Security:** Hidden settings panel with permanent account deletion.

## Preview
![App Screenshot](./assets/Screenshot%20(270).png)
![App Screenshot](./assets/Screenshot%20(271).png)
![App Screenshot](./assets/Screenshot%20(272).png)
![App Screenshot](./assets/Screenshot%20(273).png)
![App Screenshot](./assets/Screenshot%20(274).png)
![App Screenshot](./assets/Screenshot%20(275).png)
![App Screenshot](./assets/Screenshot%20(276).png)
![App Screenshot](./assets/Screenshot%20(277).png)

## 🧠 Challenges Encountered
* **Monorepo Orchestration:** Setting up a single command to launch the full stack.
* **Data Validation:** Ensuring tasks cannot be created without a title or valid date.

## Problems Solved
* **Data Isolation:** Solved the issue of users seeing each other's tasks by implementing a middleware "Gatekeeper."
* **UI Clutter:** Fixed "stretched" UI elements by using absolute positioning and flexbox for a compact header.
* **User Errors:** Implemented real-time feedback toasts to alert users of wrong credentials or server errors.