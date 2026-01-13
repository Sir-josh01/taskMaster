# ✅ Task Master (MERN Stack)
<p align="center">
  <a href="https://task-master-three-delta.vercel.app">🚀 Live Demo</a> •
  <a href="https://github.com/Sir-josh01/taskMaster">💻 Source Code</a> •
  <a href="https://www.linkedin.com/in/sir-josh01/">🤝 LinkedIn</a> •
  <a href="https://my-portfolio-gamma-swart-lajqbxpjim.vercel.app/">📂 Portfolio</a>
</p>

## 📝 Developer Overview

A professional full-stack productivity application designed to streamline personal organization. This project provides users with a secure environment to manage tasks, track priorities, and maintain high efficiency through a clean, modern interface.

## 🎯 Problems It Solved

* **Asynchronous UX:** Eliminated the "frozen screen" issue during slow network requests by implementing a **CSS loading rotator** on action buttons.
* **Credential Errors:** Solved the frustration of mistyped passwords by adding a **password visibility toggle**, allowing users to verify their input before submission.
* **CORS & Connection Blocks:** Resolved the "Access-Control-Allow-Origin" error caused by Vercel's unique preview deployment URLs through a flexible backend origin whitelist.
* **Data Isolation:** Prevented unauthorized data access by ensuring tasks are strictly tied to the authenticated user's ID via JWT verification.

## 🚀 Key Functions

* **User Authentication:** Secure Registration and Login system using **JWT (JSON Web Tokens)** for persistent sessions.
* **Priority-Based Tasking:** Ability to create tasks with specific urgency levels (Low, Medium, High) and real-time status updates.
* **Environment-Aware Routing:** Dynamic API base URL switching that automatically detects if the app is running on `localhost` or production.
* **Responsive Dashboard:** A mobile-first interface that adapts task cards and statistics for any screen size.

## 📸 ScreenShots

| Screenshot 1 | Screenshot 2 | Screenshot 3 |
| --- | --- | --- |
| <img src="./assets/Screenshot (270).png" width="250"> | <img src="./assets/Screenshot (271).png" width="250"> | <img src="./assets/Screenshot (272).png" width="250"> |
| **Screenshot 4** | **Screenshot 5** | **Screenshot 6** |
| <img src="./assets/Screenshot (273).png" width="250"> | <img src="./assets/Screenshot (274).png" width="250"> | <img src="./assets/Screenshot (275).png" width="250"> |
| **Screenshot 7** | **Screenshot 8** | **Screenshot 9** |
| <img src="./assets/Screenshot (276).png" width="250"> | <img src="./assets/Screenshot (277).png" width="250"> | <img src="./assets/Screenshot (278).png" width="250"> |
 
## Check links above for live demo: Testing of application.

## 🧠 Challenges Faced

* **Vercel Build Failures:** Initially encountered `vite: command not found` errors; solved by correctly configuring the **Root Directory** settings to the `/client` folder on Vercel.
* **Pathing & Route Mounting:** Overcame `404 Not Found` errors in production by synchronizing the frontend `/api/v1` prefix with the backend router mounting order.
* **Preflight Request Blocks:** Fixed CORS "Preflight" failures by placing the CORS middleware at the very top of the server logic, before any route declarations.
* **SSL Protocol Mismatch:** Resolved "Mixed Content" warnings by ensuring both the frontend (Vercel) and backend (Render) strictly communicate over **HTTPS**.

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/react-%2320232d.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

## 🗺️ Future Roadmap

* **Dark Mode:** System-wide theme switcher using CSS variables.
* **Drag-and-Drop:** Task reordering with `dnd-kit`.
* **Push Notifications:** Deadline alerts via Web Push API.

## 📡 API Documentation

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/v1/auth/register` | Create a new user account |
| **POST** | `/api/v1/auth/login` | Authenticate user and return JWT token |
| **GET** | `/api/v1/tasks` | Retrieve all tasks for the logged-in user |
| **POST** | `/api/v1/tasks` | Create a new task entry |
| **PATCH** | `/api/v1/tasks/:id` | Update task status or description |
| **DELETE** | `/api/v1/tasks/:id` | Remove a task permanently |

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the `server` folder with the following:

* `MONGO_URI` = Your MongoDB Atlas Connection String
* `JWT_SECRET` = Your secure token secret key
* `PORT` = 8000

## 🛠️ Installation & Setup

To get this project running on your local machine in under 2 minutes:
Clone the Repository:Bash:git clone https://github.com/Sir-josh01/taskMaster.git
cd taskMaster
Setup Backend:Bash:cd server && npm install
# Create a .env file with MONGO_URI, JWT_SECRET, and PORT=8000

npm run dev
Setup Frontend:Bash# In a new terminal tab
cd client && npm install
npm run dev

## 📁 Project Structure

* `/client`: Vite + React frontend application
* `/server`: Node.js + Express backend API
* `/assets`: Project screenshots and documentation images

---

*Created as part of the Web Dev Journey 2026*

