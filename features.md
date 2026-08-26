# TaskFlow: Task Manager

## 1. Feature List

**Core Features:**
*   **User Authentication:** Secure sign-up, login, password management, and OAuth (Google, GitHub).
*   **Task Management:** Create, read, update, and delete (CRUD) tasks with rich text descriptions.
*   **Task Organization:** Group tasks into custom lists/projects, boards (Kanban view), and add tags.
*   **Task Attributes:** Add due dates, priority levels (Low, Medium, High, Urgent), and estimated effort.
*   **Status Tracking:** Mark tasks as to-do, in-progress, in-review, or completed.

**Advanced Features:**
*   **Search & Filtering:** Advanced search by keyword, tag, status, priority, or date range.
*   **Reminders & Notifications:** Push notifications, email alerts, and in-app bell notifications for deadlines and mentions.
*   **Collaboration:** Share task lists, assign tasks to multiple team members, and leave comments with attachments.
*   **Subtasks & Checklists:** Break down larger tasks into smaller, manageable checklists.
*   **Task Dependencies:** Link tasks together (e.g., "Task B is blocked by Task A").
*   **Time Tracking:** Built-in timer to track hours spent on specific tasks.
*   **Integrations:** Sync with external tools like Google Calendar, Slack, and Microsoft Teams.
*   **Customization & Accessibility:** Dark mode toggle, custom themes, and keyboard shortcuts for quick actions.
*   **Data Export:** Export lists and task histories to CSV or PDF formats.

---

## 2. User Stories and Acceptance Criteria

### User Story 1: Task Creation
**As a** user,
**I want to** create a new task,
**So that** I can keep track of my upcoming to-dos.

**Acceptance Criteria:**
*   **Given** the user is logged in, **When** they press the `N` key or click "Add Task", **Then** a quick-add task modal appears.
*   **Given** the task form is open, **When** the user enters a title and clicks "Save", **Then** the task is added to their active list.
*   **Given** the task form is open, **When** the user attempts to save without a title, **Then** a validation error message is displayed.

### User Story 2: Task Organization (Kanban View)
**As a** user,
**I want to** view my tasks on a Kanban board,
**So that** I can visually track their progress through different stages.

**Acceptance Criteria:**
*   **Given** the user is in a project, **When** they select "Board View", **Then** tasks are displayed as cards in columns (To Do, In Progress, Completed).
*   **Given** the user is in Board View, **When** they drag a task card from one column to another, **Then** the task's status is automatically updated to reflect the new column.

### User Story 3: Task Prioritization and Deadlines
**As a** user,
**I want to** assign priorities and due dates to my tasks,
**So that** I know what to focus on first.

**Acceptance Criteria:**
*   **Given** a user is creating or editing a task, **When** they interact with the priority selector, **Then** they can choose between "Low", "Medium", "High", and "Urgent".
*   **Given** a user is setting a due date, **When** they type "tomorrow" or "next Friday", **Then** natural language processing automatically sets the correct calendar date.
*   **Given** tasks have deadlines, **When** viewed on the dashboard, **Then** tasks due today are highlighted in orange, and overdue tasks are highlighted in red.

### User Story 4: Collaboration & Commenting
**As a** user,
**I want to** leave comments on a shared task and tag my colleagues,
**So that** we can discuss the work contextually.

**Acceptance Criteria:**
*   **Given** a user is viewing a task details pane, **When** they type a comment and hit "Send", **Then** the comment is appended to the task's activity feed with a timestamp.
*   **Given** a user is typing a comment, **When** they type `@` followed by a colleague's name, **Then** an autocomplete dropdown appears to tag them.
*   **Given** a user is tagged in a comment, **When** the comment is posted, **Then** they receive an in-app and email notification.

### User Story 5: Time Tracking
**As a** user,
**I want to** track the time I spend on a specific task,
**So that** I can accurately report my hours.

**Acceptance Criteria:**
*   **Given** a task is open, **When** the user clicks the "Start Timer" button, **Then** a running clock begins tracking time for that task.
*   **Given** a timer is running, **When** the user clicks "Stop Timer", **Then** the logged duration is recorded and added to the task's total time spent.
*   **Given** the user wants to add time manually, **When** they click "Log Time", **Then** they can input a specific duration (e.g., "1h 30m") directly.

### User Story 6: Calendar Integration
**As a** user,
**I want to** sync my TaskFlow deadlines with my Google Calendar,
**So that** I can view my meetings and tasks in one unified schedule.

**Acceptance Criteria:**
*   **Given** the user is in the settings menu, **When** they click "Connect Google Calendar", **Then** they are prompted with an OAuth consent screen.
*   **Given** the calendar is synced, **When** a task with a due date and time is created in TaskFlow, **Then** a corresponding event appears on their Google Calendar.
*   **Given** a task date changes in TaskFlow, **When** the update is saved, **Then** the synced calendar event automatically shifts to the new date/time.

### User Story 7: Customization (Dark Mode)
**As a** user,
**I want to** toggle between light and dark mode,
**So that** I can reduce eye strain in low-light environments.

**Acceptance Criteria:**
*   **Given** the user is logged in, **When** they navigate to their profile dropdown, **Then** there is a toggle switch for "Dark Mode".
*   **Given** the user clicks the "Dark Mode" toggle, **Then** the application's CSS theme immediately switches to a dark color palette.
*   **Given** the user has selected a theme preference, **When** they log in on a different device, **Then** their theme preference is remembered and applied.
