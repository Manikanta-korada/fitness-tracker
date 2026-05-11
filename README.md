# Fitness Tracker

A full-stack fitness tracking application for logging workouts, tracking diet/nutrition, and monitoring progress over time.

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, React Router, Recharts, Vite
- **Backend:** Java 21, Spring Boot 3.2.5, Spring Data JPA, H2 Database

## Features

### Dashboard
- Daily overview of calories, protein, carbs, and fat intake vs targets
- Summary of today's logged meals and workouts
- Color-coded stat cards with progress toward daily goals

### Workout Log
- Log workout sessions with multiple exercises
- Track sets, reps, and weight (kg) per exercise
- Filter workouts by date range
- Delete workout sessions

### Workout Templates
- Create reusable workout templates with predefined exercises, sets, reps, and weights
- Apply a template to instantly create a workout session for today
- Manage (create/delete) templates

### Diet Log
- Log meals from the meal library or add custom entries
- Track servings per meal (macros auto-calculate based on servings)
- View daily diet log by date
- Delete individual diet entries

### Meal Library
- Browse pre-seeded meals (Chicken Rice Bowl, Protein Shake, Grilled Salmon, etc.)
- Add custom meals with calorie and macro details (protein, carbs, fat)
- Edit or delete meals

### Progress Tracking
- **Body Weight Chart:** Log daily weight and visualize trend over time
- **Calorie Trend:** 30-day calorie intake graph
- **Exercise Progress:** Select any exercise and view weight progression over time
- **Daily Targets:** Set and edit calorie/protein/carbs/fat goals

### Exercise Library
- 20 pre-seeded exercises organized by muscle group (Chest, Back, Legs, Shoulders, Arms, Core)
- Add custom exercises

## Prerequisites

- **Java 21** (for the backend)
- **Maven 3.9+** (for building the backend)
- **Node.js 18+** and **npm** (for the frontend)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd fitness-tracker
```

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

The H2 database is stored in `backend/data/fitnessdb` (file-based, persists across restarts).

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

The frontend starts on **http://localhost:5173**.

## API Endpoints

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | List all workouts (optional `?from=&to=` date filters) |
| GET | `/api/workouts/{id}` | Get a specific workout session |
| POST | `/api/workouts` | Create a new workout session |
| DELETE | `/api/workouts/{id}` | Delete a workout session |

### Workout Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workout-templates` | List all templates |
| POST | `/api/workout-templates` | Create a new template |
| POST | `/api/workout-templates/{id}/apply` | Apply template (creates today's workout) |
| DELETE | `/api/workout-templates/{id}` | Delete a template |

### Diet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diet?date=YYYY-MM-DD` | Get diet logs for a specific date |
| POST | `/api/diet` | Log a diet entry |
| DELETE | `/api/diet/{id}` | Delete a diet entry |

### Meals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | List all meals |
| POST | `/api/meals` | Create a custom meal |
| PUT | `/api/meals/{id}` | Update a meal |
| DELETE | `/api/meals/{id}` | Delete a meal |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | List all exercises |
| POST | `/api/exercises` | Create a custom exercise |
| DELETE | `/api/exercises/{id}` | Delete an exercise |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/weight` | Get body weight history |
| POST | `/api/progress/weight` | Log body weight |
| GET | `/api/progress/exercise/{id}` | Get progress for a specific exercise |
| GET | `/api/progress/calories?from=&to=` | Get daily calorie totals in date range |

### Targets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/targets` | Get daily nutrition targets |
| PUT | `/api/targets` | Update daily nutrition targets |

## H2 Database Console

Access the database console at **http://localhost:8080/h2-console** with:
- JDBC URL: `jdbc:h2:file:./data/fitnessdb`
- Username: `sa`
- Password: *(empty)*

## Project Structure

```
fitness-tracker/
├── backend/
│   ├── src/main/java/com/fitnesstracker/
│   │   ├── FitnessTrackerApplication.java
│   │   ├── WebConfig.java
│   │   ├── DataSeeder.java
│   │   ├── controller/
│   │   │   ├── WorkoutController.java
│   │   │   ├── WorkoutTemplateController.java
│   │   │   ├── DietController.java
│   │   │   ├── MealController.java
│   │   │   ├── ExerciseController.java
│   │   │   ├── ProgressController.java
│   │   │   └── TargetController.java
│   │   ├── model/
│   │   │   ├── Exercise.java
│   │   │   ├── Meal.java
│   │   │   ├── DietLog.java
│   │   │   ├── DailyTarget.java
│   │   │   ├── BodyWeight.java
│   │   │   ├── WorkoutSession.java
│   │   │   ├── WorkoutEntry.java
│   │   │   ├── WorkoutTemplate.java
│   │   │   └── WorkoutTemplateEntry.java
│   │   └── repository/
│   └── src/main/resources/application.yml
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   ├── components/Layout.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── WorkoutLog.jsx
│   │       ├── WorkoutTemplates.jsx
│   │       ├── DietLog.jsx
│   │       ├── MealLibrary.jsx
│   │       └── Progress.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```
