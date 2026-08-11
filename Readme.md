# TaskFlow (Task Manager) - Project Roadmap

## Phase 1 — Foundation

*   **Day 1:** Choose the app: "TaskFlow" (a task manager). Write a feature list, user stories, and acceptance criteria.
    *   *Deliverable:* features.md + user stories
*   **Day 2:** Sketch the screens (login, task board, task form). List entities & relationships: User, Project, Task.
    *   *Deliverable:* UI sketches + entity list
*   **Day 3:** Design JSON data shapes for User / Project / Task (with ids & refs); create sample data files.
    *   *Deliverable:* sample-data.json
*   **Day 4:** Create GitHub repo; add README (goals) + .gitignore; set up client/ and server/ folders; first commit.
    *   *Deliverable:* Git repo + README
*   **Day 5:** Node script: load the sample JSON and print tasks grouped by status and sorted by due date.
    *   *Deliverable:* seed / print script
*   **Day 6:** Scaffold the Angular app (standalone) in client/; run it; commit.
    *   *Deliverable:* running Angular app
*   **Day 7:** Build TaskList + TaskCard components rendering sample tasks with @for (track) and an empty state.
    *   *Deliverable:* task list UI
*   **Day 8:** Add a signal-based TaskService (in-memory); wire the list to it; support add, edit & delete.
    *   *Deliverable:* add / edit / delete works
*   **Day 9:** Add routing: /login, /board, /task/:id, a nav shell and a wildcard 404 route.
    *   *Deliverable:* multi-route app
*   **Day 10:** Build the Add/Edit Task reactive form (title, status, due date) with validation & error messages.
    *   *Deliverable:* task form + validation

## Phase 2 — Frontend Features + Polish

*   **Day 11:** Serve tasks from a mock REST (json-server) and load them via HttpClient GET with typed models + async pipe.
    *   *Deliverable:* tasks load over HTTP
*   **Day 12:** Add search + status filter using RxJS (debounceTime, switchMap); cancel stale requests.
    *   *Deliverable:* filter / search
*   **Day 13:** Add a "dueSoon" pipe and a status-color directive on the task cards.
    *   *Deliverable:* custom pipe + directive
*   **Day 14:** Add an auth service stub + functional route guard on /board; login stores a token.
    *   *Deliverable:* guarded board
*   **Day 15:** Apply Angular Material (toolbar, cards, form fields); polish the board layout & responsiveness.
    *   *Deliverable:* Frontend MVP (mock data)

## Phase 3 — Backend API (Express)

*   **Day 16:** Scaffold an Express server in server/; add a health route; nodemon + npm scripts + a request logger.
    *   *Deliverable:* server boots
*   **Day 17:** Build task routes on an in-memory array: GET / POST / PUT / DELETE /api/tasks with correct status codes.
    *   *Deliverable:* tasks CRUD API
*   **Day 18:** Add project routes; organise into routes / controllers; keep response shapes consistent.
    *   *Deliverable:* projects API and fixed the folder structure and architecture
*   **Day 19:** Add input validation (express-validator), central error-handling middleware, CORS and dotenv config.
    *   *Deliverable:* auth-protected API
