# 🏆 Multi-Attribute Student Ranking System

A dynamic, data-driven web platform that evaluates student performance using an optimized multi-attribute ranking framework. Instead of evaluating engineering students purely on marks, this system integrates multiple academic and non-academic variables—**Academics, Attendance percentages, and Cumulative Extracurricular Milestones**—into a single composite score.

---

## 🚀 Key Features

* **Real-Time Weight Customization Panels:** Interactive control sliders allow administrators to modify criteria weights dynamically. Ranks shift and re-sort instantly in the UI via an asynchronous local processing layer.
* **Extracurricular Milestone Tracker:** Dedicated tracking sheets categorize and reward student performance across Technical Events, Sports, and Cultural actions.
* **Modular Deep-Dive Views:** Isolated sub-dashboards provide granular tracking for Academic Prowess distributions, Attendance regularisation alerts (flagging counts below 75%), and Activity footprints.
* **Object-Relational Mapping (ORM):** Engineered with an elegant SQLite backend managed entirely through object-oriented relational schemas (Flask-SQLAlchemy) for modern, fast query tracking.

---

## 🛠️ Architecture & Tech Stack

* **Backend Framework:** Python (Flask)
* **Database Layer:** SQLite managed via Object-Relational Mapping (Flask-SQLAlchemy)
* **Frontend UI Layout:** HTML5 (Jinja2 Templating Engine), CSS3 (Modern Glassmorphic UI layout panels), and Native JavaScript (ES6+ asynchronous UI sorting logic)

---

## 📂 Project Structure

```text
studentrankingsystem/
│
├── app.py                  # Core backend routing logic, ORM models & service API endpoints
├── database.db             # Local relational SQLite database
├── .gitignore              # Safeguards database & temporary workspace files from upload
├── README.md               # Professional project presentation panel
│
├── static/
│   ├── css/
│   │   └── style.css       # Custom high-end stylesheet (Glassmorphism layout specs)
│   └── js/
│       └── app.js          # Dynamic UI balancing computations & leaderboard sorting
│
└── templates/
    ├── base.html           # Shared navigation layout tree (Upgraded sidebar console)
    ├── index.html          # Core dashboard (Forms control panel & live leaderboard)
    ├── academics.html      # Grade distribution analytics page
    ├── attendance.html     # Anomaly threshold radar view
    └── achievements.html   # Extra-curricular milestone logger views