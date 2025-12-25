# Task Manager with Comments

Full-stack app for managing tasks and comments. Built with Flask + React + MongoDB.

## What I Built

**Task 1 (Backend):** Comments CRUD API with automated tests  
**Task 2 (Frontend):** UI for tasks and comments

## How to Run

### Backend
  bash
cd backend
pip install flask flask-cors pymongo python-dotenv pytest
python app.py

Runs on http://localhost:5000

### Frontend
  bash
cd frontend
npm install
npm start

Runs on http://localhost:3000

### Run Tests
  bash
cd backend
pytest tests/test_api.py -v


## API Routes

**Comments:**
- `POST /api/comments` - create comment
- `GET /api/comments?task_id=xxx` - get comments for task
- `PUT /api/comments/:id` - update comment
- `DELETE /api/comments/:id` - delete comment

**Tasks:**
- `POST /api/tasks` - create task
- `GET /api/tasks` - get all tasks
- `PUT /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task

## Project Structure

── backend/
   ├── app.py                 # API routes (tasks + comments)
   ├── models.py              # MongoDB models
   ├── .env                   # DB connection string
   └── tests/
       └── test_api.py        # 9 automated tests

── frontend/
   ├── package.json
   ├── public/
   │   └── index.html
   └── src/
       ├── index.js           # entry point
       ├── App.js             # main component
       ├── App.css            # styles
       └── components/
           └── TaskManager.js # tasks + comments UI

── package.json               # root scripts
── README.md


## Tech Used

- Flask (backend)
- MongoDB (database)
- React (frontend)
- Axios (API calls)
- pytest (testing)


### Approach
- Used Flask for backend due to its lightweight nature and suitability for REST APIs.
- Chose SQLite for simplicity and quick setup for the given scope.
- Built the frontend using React functional components and hooks.
- Used Axios for API calls for cleaner and more readable request handling.
- Enabled CORS since frontend and backend run on different ports.

### Key Decisions
- Filtered comments by task_id to efficiently fetch task-specific comments.
- Reused the same form component for create and edit actions to reduce duplication.
- Added toast notifications to provide immediate feedback to users.
- Wrote automated tests covering both success and error scenarios.

### Trade-offs
- Used client-side filtering; server-side pagination would be better for large datasets.
- Validation is minimal; a dedicated validation library would be preferable in production.
- Authentication was not implemented but can be added without major refactoring.

 
