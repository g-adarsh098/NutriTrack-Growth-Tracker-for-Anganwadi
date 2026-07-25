# NutriTrack — Anganwadi Growth Monitor

Paper-based Anganwadi growth registers are prone to manual calculation errors and make it difficult to instantly identify malnourished children.
This application digitizes the register, automatically deriving nutritional status to ensure trustworthy, actionable health data.

Built with a **React + Vite** frontend and an **Express + MySQL** backend.

---

## Project Structure

```
SIH (React)/
├── DB.js                          # Express REST API server (backend)
├── .env                           # Environment variables (DB password)
├── dataset.csv                    # Sample seed data
├── README.md
└── nutritrack-app/                # React + Vite frontend
    ├── index.html                 # Entry HTML with SEO meta tags
    ├── vite.config.js             # Vite config + API proxy to :3000
    ├── package.json
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Root component — state, data fetching, routing
        ├── index.css              # Global design system (CSS variables, dark theme)
        └── components/
            ├── AppLoader.jsx      # Full-page branded splash loader
            ├── TopBar.jsx         # Sticky navigation bar with live indicator
            ├── Header.jsx         # Search, filter controls, Add button
            ├── StatsBar.jsx       # Summary cards (Total, Normal, UW, MAM, SAM)
            ├── DataTable.jsx      # Measurements table with status badges
            ├── StateMessage.jsx   # Loading / error / empty state placeholders
            └── MeasurementModal.jsx  # Add / Edit form modal
```

---

## How to Run

### Prerequisites
- Node.js (v18+)
- MySQL server running locally

### 1. Set up the database

Open your MySQL client and create the database and table:

```sql
CREATE DATABASE sih;

USE sih;

CREATE TABLE growth_measurements (
    record_id    VARCHAR(20) PRIMARY KEY,
    child_name   VARCHAR(100) NOT NULL,
    age_months   INT NOT NULL,
    weight_kg    DECIMAL(5,2),
    height_cm    DECIMAL(5,2),
    status       VARCHAR(20),
    visit_date   DATE
);
```

### 2. Configure environment

Create (or verify) the `.env` file in the project root:

```
DB_PASSWORD=your_mysql_password
```

### 3. Install backend dependencies

```bash
npm install express mysql2 cors dotenv
```

### 4. Start the backend

```bash
node DB.js
```

The API server starts on **http://localhost:3000**.

### 5. Install and start the frontend

```bash
cd nutritrack-app
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:3000` — no CORS configuration required.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/measurements` | Fetch all records, ordered by visit date descending |
| `POST` | `/api/measurements` | Add a new record or update an existing one (upsert by `record_id`) |

---

## Data Dictionary

| Field | Type | Description |
|---|---|---|
| `record_id` | `VARCHAR` | Unique identifier, must start with `REC` followed by numbers |
| `child_name` | `VARCHAR` | Child's name (minimum 2 characters) |
| `age_months` | `INT` | Age in months, restricted to the ICDS range of 0–72 |
| `weight_kg` | `DECIMAL` | Body weight in kg (positive, up to 40 kg) |
| `height_cm` | `DECIMAL` | Length or height in centimeters |
| `status` | `VARCHAR` | Nutritional status — derived server-side, never user-entered |
| `visit_date` | `DATE` | Automatically stamped by the server on submission |

---

## Status Calculation Logic

The `status` field is computed entirely on the server using weight-for-age thresholds:

**Baseline:** `Expected Weight = (Age in Months × 0.2) + 4`

| Status | Condition |
|---|---|
| 🚨 **SAM** (Severe Acute Malnutrition) | Actual weight < 70% of expected |
| 🔴 **MAM** (Moderate Acute Malnutrition) | Actual weight < 85% of expected |
| ⚠️ **Underweight** | Actual weight < 95% of expected |
| ✅ **Normal** | Actual weight ≥ 95% of expected (or weight left blank) |

`visit_date` is also stamped server-side in `YYYY-MM-DD` format to prevent backdating.

---

## Known Limitations

- **Authentication**: No login system or role-based access control (worker vs. supervisor).
- **Longitudinal Tracking**: Shows only the latest record per child; historical growth curves are not plotted.
- **Stunting Metrics**: Status uses weight-for-age only; height-for-age (stunting) is not yet integrated.
- **Production Deployment**: API and DB are hardcoded to `localhost` — not yet configured for a public deployment.