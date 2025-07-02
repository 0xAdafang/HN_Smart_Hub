# 🧠 HN Smart Hub

**HN Smart Hub** is a modern, high-performance, and functional desktop application developed with **Tauri**, **TypeScript**, **Rust**, and **React**. It's designed to centralize HR management, sales, training, and customer support in an ergonomic and responsive environment.

> ⚠️ *Please note: The application is in French to reflect its localized context.*

---

## 🎨 Visual Overview

### 🌞 Light Theme
![Dashboard Light](./images/1.jpg)

### 🌙 Dark Theme
![Dashboard Dark](./images/2.jpg)

---

## 🚀 Key Features

### 🔐 Secure Authentication
- Login system with role management (admin / user).
- Automatic redirection to the appropriate dashboard after login.

### 🧭 Interactive Dashboard
- Personalized overview based on user role.
- Dynamic widgets: alerts, remaining vacation days, reminders, HR indicators to process.

### 📊 HR Indicators
- Employee visualization and evaluation (1–10 rating scales).
- Role-based access restrictions.
- Dynamic filters for quick navigation.

### 🌴 Vacation Management
- Request and approval system.
- Remaining days counter.
- Synchronized interactive calendar.

### 🥦 Food Directory
- Quick access to a food product database.
- Detailed descriptions useful for customer calls.

### 📞 Telesales
- Quick entry form with progress gauge.
- Detailed sales view per user.
- Statistics & unlockable achievements.
- Admin view: comparison, filters, PDF export.

### 🎓 Training
- Interactive training modules (Acomba, orders, routes, calls, etc.).
- Integrated validation quizzes.
- Progress tracking visible to admins.

### 👤 Account Management
- User creation/modification (admin only).
- Dynamically assigned roles.

### 👥 Role-Based Interface
- Personalized user interface.
- Admins have access to HR management, training, sales, account creation, etc.

### 📆 Events
- Add reminders to the integrated calendar.
- Clear visualization of scheduled events.

### ✅ Todo List
- Simple daily task management.
- Integrated into the dashboard.

### 🚨 Alert Widget
- Dynamic notifications based on context (sales to make, customers to call back, etc.).

### 🤖 Local AI Assistant (offline)
- Embedded local chatbot (Rust - Concept: Regex, Intent, StaticWords, HashMap).
- Capable of answering business questions (remaining vacation days, product info, etc.).
- Intent intelligence with semantic recognition.

---

## 🔌 Offline Mode

The application includes an **offline-first** system:
- Actions (e.g., vacation requests) are stored locally if the connection fails.
- Automatic synchronization as soon as the connection is restored.

---

## 🛠️ Tech Stack

| Frontend          | Backend / Software  |
|-------------------|---------------------|
| TypeScript        | Rust (Tauri)        |
| React             | SQLx + PostgreSQL   |
| Tailwind CSS      |                     |
| Framer Motion     |                     |

---

## 🧠 Learning Objectives

This project allowed me to:

- Deepen my knowledge of Rust in a concrete application context.
- Create a modern design with React + Tailwind.
- Experiment with offline-first architectures.
- Integrate a local AI with intent logic.
- Manage a complete frontend + backend project.

---

## 📸 Credits & Acknowledgments

- 💡 Interface inspired by the [`tauri-ui`](https://github.com/agmmnn) project by [@agmmnn](https://github.com/agmmnn)
- 🎨 Color palette: **Marble** (`#F2F8DC`) & **Dark Blue** (`#0F172A`)
- 🖼 Icons: [Lucide](https://lucide.dev/)
- 📊 Charts: [Recharts](https://recharts.org/)

---

## 💼 Author

👨‍💻 **0xAdafang - Térence**  
📫 [adafang@proton.me]  
🇨🇦 Project completed in Montreal/Quebec as part of an end-of-studies internship. The application will be deployed and used by the company that hired me for this internship.

---

## 📦 Installation (dev mode)

```bash
git clone https://github.com/your-username/hn-smart-hub
cd hn-smart-hub
npm install
npm run tauri dev
```
