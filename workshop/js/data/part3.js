/* Talk 04 — Section 5: the complete integration demo (Task Manager) */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 17, level: 4, icon: '🔗', t: ['The full loop'],
    sub: 'React form → Axios → Express → Prisma → PostgreSQL → JSON → UI.',
    slides: [
        {
            kind: 'concept', t: 'One click, ten stops',
            b: [
                { lead: 'The user types <i>“Prepare Talk 04”</i> and presses <b>Add</b>. Before the task appears in the list, the data passes through <b>ten</b> pieces of code on three machines.' },
                { diagram: 'loop', cap: 'Top row: the request travels into the backend. Bottom row: the data is stored and comes back as JSON to update the UI.' },
                { cols: [
                    [{ ul: [
                        '<span style="color:var(--c-client)">●</span> <b>Frontend</b>: form, Axios, UI update',
                        '<span style="color:var(--c-server)">●</span> <b>Backend</b>: route, middleware, controller, service',
                        '<span style="color:var(--c-db)">●</span> <b>Data</b>: Prisma and PostgreSQL'
                    ] }],
                    [{ tip: 'Debugging tip: when “Add” doesn’t work, walk this loop and find the <b>first stop</b> where the data looks wrong. Don’t guess.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 18, level: 4, icon: '🧭', t: ['Step through: adding a task'],
    sub: 'The code at every stop, in order.',
    slides: [
        {
            kind: 'demo', t: 'Follow the request: POST /api/tasks',
            b: [{ html: () => Talk.tour('create') }]
        }
    ]
});

DECK.tours.create = {
    label: 'Add a task: ten steps',
    steps: [
        {
            k: 'React form', i: '📝', side: 'client', file: 'src/components/TaskForm.tsx', hl: '2-3,7',
            code: `async function handleSubmit(e: FormEvent) {
  e.preventDefault();            // no full page reload
  setSaving(true);               // disable the button
  setError(null);
  try {
    await onAdd(title);          // → useTasks().addTask(title)
    setTitle('');                // clear the input
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setSaving(false);
  }
}`,
            say: 'The user submits the form. React stops the browser’s default page reload, switches the button to <b>Saving…</b> and calls <code>onAdd</code>, the function from our <code>useTasks</code> hook.',
            data: '{ "title": "Prepare Talk 04" }', dataLabel: 'Component state'
        },
        {
            k: 'Axios POST', i: '📡', side: 'client', file: 'src/api/tasks.api.ts', hl: '2',
            code: `export async function createTask(title: string) {
  const { data } = await api.post<Task>('/tasks', { title });
  return data;
}

// baseURL = import.meta.env.VITE_API_URL
// → POST http://localhost:4000/api/tasks
//   Content-Type: application/json`,
            say: 'Axios joins <code>baseURL</code> + <code>/tasks</code>, turns the object into JSON text, sets <code>Content-Type: application/json</code> and sends it. The browser adds the <code>Origin</code> header by itself.',
            data: '{ "title": "Prepare Talk 04" }', dataLabel: 'Request body on the wire',
            tip: 'Open DevTools → Network: this is the row you’ll see, with its headers and payload.'
        },
        {
            k: 'Express route', i: '🧭', side: 'server', file: 'src/routes/tasks.routes.js', hl: '6',
            code: `// app.js: app.use('/api/tasks', tasksRouter);

export const tasksRouter = Router();

tasksRouter.get('/', tasks.list);
tasksRouter.post('/', validateTask, tasks.create);
tasksRouter.patch('/:id', tasks.update);
tasksRouter.delete('/:id', tasks.remove);`,
            say: 'Express matches <b>method + path</b>: <code>POST</code> on <code>/api/tasks</code> → the router’s <code>post(\'/\')</code>. It will run <code>validateTask</code> first, then <code>tasks.create</code>. No match at all? The <code>notFound</code> middleware answers <b>404</b>.'
        },
        {
            k: 'Middleware', i: '🧩', side: 'server', file: 'src/middlewares/validate.js', hl: '3-5',
            code: `export function validateTask(req, res, next) {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.length > 120) {
    return res.status(400).json({ error: 'title is too long (max 120)' });
  }
  req.body.title = title.trim();
  next();                         // ✅ go on to the controller
}`,
            say: 'Before this, the global middleware already ran: <code>cors()</code> added the CORS headers and <code>express.json()</code> parsed the body into <code>req.body</code>. Now <code>validateTask</code> either stops the request with <b>400</b> or calls <code>next()</code>.',
            data: '{ "title": "Prepare Talk 04" }', dataLabel: 'req.body after express.json()',
            tip: 'Never trust the client: a user can bypass your React form and send anything with curl.'
        },
        {
            k: 'Controller', i: '🎛️', side: 'server', file: 'src/controllers/tasks.controller.js', hl: '2-3',
            code: `export async function create(req, res) {
  const task = await taskService.create(req.body.title);
  res.status(201).json(task);
}

// Express 5: if the promise rejects, the error goes
// to errorHandler automatically, no try/catch needed.`,
            say: 'The controller is the <b>translator</b> between HTTP and your app: it pulls plain data out of <code>req</code>, calls the service, and turns the result into a status code + JSON. It contains no business rules and no SQL.'
        },
        {
            k: 'Service', i: '🧠', side: 'server', file: 'src/services/tasks.service.js', hl: '4-6',
            code: `import { prisma } from '../prisma/client.js';

export async function create(title) {
  // business rules live here, e.g. limits, defaults, notifications
  return prisma.task.create({
    data: { title },
  });
}`,
            say: 'The service holds the <b>business logic</b> and talks to the database through Prisma. It never touches <code>req</code> or <code>res</code>, so you could reuse it from a test, a cron job or a CLI.'
        },
        {
            k: 'Prisma', i: '🔷', side: 'db', file: 'prisma/schema.prisma', lang: 'prisma', hl: '10-16',
            code: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(120)
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
            say: 'Prisma reads the <code>Task</code> model, fills in the defaults (<code>done: false</code>, timestamps) and generates a <b>parameterized</b> SQL query. Values are sent separately from the SQL text, which is why SQL injection can’t happen here.',
            data: 'INSERT INTO "Task" ("title", "done", "createdAt", "updatedAt")\nVALUES ($1, $2, $3, $4)\nRETURNING *', dataLabel: 'Generated SQL (simplified)',
            tip: 'Version note: Prisma 7 moves the database URL into <code>prisma.config.ts</code> and connects through a driver adapter (<code>@prisma/adapter-pg</code>). The models, the queries and this flow stay the same.'
        },
        {
            k: 'PostgreSQL', i: '🐘', side: 'db', file: 'psql · taskapp', lang: 'sql',
            code: `taskapp=# SELECT * FROM "Task" ORDER BY id DESC LIMIT 2;

 id |      title       | done |        createdAt
----+------------------+------+-------------------------
  4 | Prepare Talk 04  | f    | 2026-11-15 10:00:00.000
  3 | Write the slides | t    | 2026-11-14 18:10:00.000`,
            say: 'PostgreSQL checks the constraints (title not null, max 120 chars), assigns the next <code>id</code>, writes the row to disk and returns it. Prisma converts the row into a plain JS object.',
            data: '{ "id": 4, "title": "Prepare Talk 04", "done": false,\n  "createdAt": "2026-11-15T10:00:00.000Z", "updatedAt": "2026-11-15T10:00:00.000Z" }', dataLabel: 'What the service gets back'
        },
        {
            k: 'JSON response', i: '📦', side: 'back', file: 'response.http', lang: 'http', hl: '1,3',
            code: `HTTP/1.1 201 Created
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8

{
  "id": 4,
  "title": "Prepare Talk 04",
  "done": false,
  "createdAt": "2026-11-15T10:00:00.000Z",
  "updatedAt": "2026-11-15T10:00:00.000Z"
}`,
            say: '<code>res.status(201).json(task)</code> sends the new task back. <code>Access-Control-Allow-Origin</code> (from <code>cors()</code>) tells the browser that our React app is allowed to read this response.',
            tip: 'The Date objects became ISO strings: JSON has no date type.'
        },
        {
            k: 'React UI update', i: '✨', side: 'client', file: 'src/hooks/useTasks.ts', hl: '3',
            code: `async function addTask(title: string) {
  const task = await tasksApi.createTask(title);  // the 201 body
  setTasks((prev) => [task, ...prev]);            // → re-render
}

// TasksPage re-renders:
// {tasks.map((t) => <TaskItem key={t.id} task={t} … />)}`,
            say: 'Axios resolves the promise with the parsed JSON. We add the <b>server’s</b> version of the task (with its real <code>id</code>) to state, React re-renders, and the form clears. The loop is complete. 🎉',
            tip: 'We use the server response instead of what the user typed: it has the real id, the trimmed title and the timestamps.'
        }
    ]
};

DECK.chapters.push({
    n: 19, level: 4, icon: '🧱', t: ['View, update & delete: the code'],
    sub: 'The full hook on the frontend, the full service on the backend.',
    slides: [
        {
            kind: 'code', t: 'Frontend ① VIEW: the hook loads the tasks',
            b: [{ cols: [
                [{ code: `// imports: useEffect, useState · * as tasksApi · getErrorMessage
type Status = 'loading' | 'success' | 'error';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setStatus('loading');
    try {
      setTasks(await tasksApi.getTasks());      // GET /api/tasks
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }
  useEffect(() => { load(); }, []);            // once, on first render

  // addTask, toggleTask, deleteTask → next slide
  return { tasks, status, error, reload: load, addTask, toggleTask, deleteTask };
}`, file: 'src/hooks/useTasks.ts', hl: '12,19' }],
                [{ code: `export function TasksPage() {
  const { tasks, status, error, reload, addTask, toggleTask, deleteTask } = useTasks();

  if (status === 'loading') return <p>Loading tasks…</p>;
  if (status === 'error') {
    return <p role="alert">{error} <button onClick={reload}>Retry</button></p>;
  }

  return (
    <main>
      <TaskForm onAdd={addTask} />
      {tasks.length === 0 && <p>No tasks yet. Add your first one!</p>}
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task}
                    onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </ul>
    </main>
  );
}`, file: 'src/pages/TasksPage.tsx', hl: '4-7' },
                 { p: 'The page never calls Axios. It reads <code>status</code> and renders one of the three states: loading, error with Retry, or the list.' }]
            ] }]
        },
        {
            kind: 'code', t: 'Frontend ② ③ ④ ADD, UPDATE, DELETE',
            b: [{ cols: [
                [{ code: `// inside useTasks()

async function addTask(title: string) {                 // ② ADD
  const task = await tasksApi.createTask(title);        // POST → 201
  setTasks((prev) => [task, ...prev]);
}

async function toggleTask(task: Task) {                 // ③ UPDATE
  const updated = await tasksApi.updateTask(task.id, { done: !task.done });
  setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
}

async function deleteTask(id: number) {                 // ④ DELETE
  await tasksApi.deleteTask(id);                        // DELETE → 204
  setTasks((prev) => prev.filter((t) => t.id !== id));
}`, file: 'src/hooks/useTasks.ts', hl: '5,10,15' },
                 { p: 'The same pattern for every mutation: <b>call the API → wait for success → update state from the response</b>. If the request fails, the promise rejects, state stays unchanged, and the caller shows the error.' }],
                [{ code: `type Props = {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <li className={task.done ? 'done' : ''}>
      <input type="checkbox" checked={task.done}
             onChange={() => onToggle(task)} />
      <span>{task.title}</span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </li>
  );
}`, file: 'src/components/TaskItem.tsx', hl: '11,13' },
                 { tip: 'Want an instant UI? <b>Optimistic updates</b> change state first and roll back on error. Libraries like TanStack Query handle that, and caching, for you. Learn the manual way first.' }]
            ] }]
        },
        {
            kind: 'code', t: 'Backend: service + error handling',
            b: [{ cols: [
                [{ code: `import { prisma } from '../prisma/client.js';

export const list = () =>
  prisma.task.findMany({ orderBy: { createdAt: 'desc' } });

export const create = (title) =>
  prisma.task.create({ data: { title } });

export const update = (id, { title, done }) =>
  prisma.task.update({
    where: { id },
    data: { title, done },    // undefined fields are ignored
  });

export const remove = (id) =>
  prisma.task.delete({ where: { id } });`, file: 'src/services/tasks.service.js' },
                 { code: `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();   // one instance for the app`, file: 'src/prisma/client.js' }],
                [{ code: `import { Prisma } from '@prisma/client';

export function notFound(req, res) {
  res.status(404).json({ error: \`Route not found: \${req.method} \${req.originalUrl}\` });
}

export function errorHandler(err, req, res, next) {
  // update/delete on an id that doesn't exist
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (err.type === 'entity.parse.failed') {      // invalid JSON body
    return res.status(400).json({ error: 'Malformed JSON' });
  }
  console.error(err);                            // details stay on the server
  const status = err.status ?? 500;
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
}`, file: 'src/middlewares/error.js', hl: '9,12,15' },
                 { best: 'One central error handler = one error format for the whole API, and no stack traces leaked to users.' }]
            ] }]
        }
    ]
});

DECK.chapters.push({
    n: 20, level: 4, icon: '🎬', t: ['Live demo: the Task Manager'],
    sub: 'Use the app and watch every request travel through the layers.',
    slides: [
        {
            kind: 'demo', t: 'Live demo: view, add, update, delete',
            b: [
                { p: 'The app runs in this slide against an in-browser copy of our API, with the same routes, status codes and JSON. <b>Load</b> the tasks, <b>add</b> one (try an empty title → 400), <b>tick</b> one (PATCH), <b>delete</b> one, and watch the pipeline and the Network log.' },
                { html: () => Talk.demo() }
            ]
        }
    ]
});
