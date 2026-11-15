/* Talk 04 — Section 3 (Frontend ↔ Backend communication) and Section 4 (Axios in practice) */
window.DECK = window.DECK || { chapters: [] };

/* =====================================================================
   SECTION 3 — How the frontend communicates with the backend
   ===================================================================== */
DECK.chapters.push({
    n: 9, level: 2, icon: '📡', t: ['fetch vs Axios'],
    sub: 'Two ways to send HTTP requests from React.',
    slides: [
        {
            kind: 'code', t: 'Fetch API vs Axios: same request, two styles',
            b: [
                { cols: [
                    [{ code: `// fetch: built into every browser
const res = await fetch('http://localhost:4000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Prepare Talk 04' }),
});

if (!res.ok) {                        // 4xx / 5xx do NOT throw!
  throw new Error(\`HTTP \${res.status}\`);
}
const task = await res.json();        // parse the body yourself`, file: 'with-fetch.ts', hl: '4-5,8' }],
                    [{ code: `// Axios: a small library on top of the browser HTTP API
import axios from 'axios';

const { data: task } = await axios.post(
  'http://localhost:4000/api/tasks',
  { title: 'Prepare Talk 04' },       // object → JSON automatically
);

// 4xx / 5xx reject the promise → handled in catch
// data is already parsed JSON`, file: 'with-axios.ts', hl: '6,9-10' }]
                ] },
                { table: { h: ['', 'fetch', 'Axios'], r: [
                    ['Install', 'Nothing, it’s built in', '<code>npm install axios</code>'],
                    ['JSON body', '<code>JSON.stringify</code> + header by hand', 'Pass an object'],
                    ['Errors on 4xx / 5xx', '❌ Resolves, so check <code>res.ok</code>', '✅ Throws'],
                    ['Shared config (base URL, token, timeout)', 'Write your own wrapper', '<code>axios.create()</code> + interceptors']
                ] } },
                { tip: 'Both are fine. <b>fetch</b> for a quick call, <b>Axios</b> when a whole app talks to one API. We use Axios for the Task app.' }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 10, level: 2, icon: '🔁', t: ['GET, POST, PATCH, DELETE'],
    sub: 'The four requests of the Task app: frontend and backend side by side.',
    slides: [
        {
            kind: 'code', t: 'The four requests, frontend ↔ backend',
            b: [{ html: () => Talk.tabs('crud') }]
        }
    ]
});

DECK.tabs.crud = {
    label: 'CRUD requests',
    hint: 'Left: the React side (src/api/tasks.api.ts). Right: the Express side that answers it.',
    items: [
        { k: 'GET: read', i: '👀', c: '#38bdf8', b: [
            { cols: [
                [{ code: `export async function getTasks() {
  const { data } = await api.get<Task[]>('/tasks');
  return data;                         // Task[]
}

// query params → GET /tasks?done=false
await api.get('/tasks', { params: { done: false } });`, file: '⚛️ frontend · src/api/tasks.api.ts', hl: '2' }],
                [{ code: `// src/routes/tasks.routes.js
tasksRouter.get('/', tasks.list);

// src/controllers/tasks.controller.js
export async function list(req, res) {
  const tasks = await taskService.list();
  res.json(tasks);                     // 200 + JSON array
}`, file: '🚂 backend · routes + controller', hl: '2,7' }]
            ] },
            { p: 'On the wire: <code>GET /api/tasks</code> → <code>200 OK</code> + <code>[{…}, {…}]</code>. No body in the request.' }
        ] },
        { k: 'POST: create', i: '➕', c: '#34d399', b: [
            { cols: [
                [{ code: `export async function createTask(title: string) {
  const { data } = await api.post<Task>('/tasks', { title });
  return data;              // the saved task, now with an id
}`, file: '⚛️ frontend · src/api/tasks.api.ts', hl: '2' }],
                [{ code: `// validateTask runs first and can answer 400
tasksRouter.post('/', validateTask, tasks.create);

export async function create(req, res) {
  const task = await taskService.create(req.body.title);
  res.status(201).json(task);          // 201 Created
}`, file: '🚂 backend · routes + controller', hl: '2,6' }]
            ] },
            { p: 'On the wire: <code>POST /api/tasks</code> + <code>{ "title": "…" }</code> → <code>201 Created</code> + the new task. The <b>server</b> chooses the <code>id</code>.' }
        ] },
        { k: 'PATCH: update', i: '✏️', c: '#fbbf24', b: [
            { cols: [
                [{ code: `export async function updateTask(id: number, changes: TaskChanges) {
  const { data } = await api.patch<Task>(\`/tasks/\${id}\`, changes);
  return data;
}

// usage: toggle a checkbox
await updateTask(7, { done: true });`, file: '⚛️ frontend · src/api/tasks.api.ts', hl: '2' }],
                [{ code: `tasksRouter.patch('/:id', tasks.update);

export async function update(req, res) {
  const id = Number(req.params.id);    // "7" → 7 (params are strings!)
  const task = await taskService.update(id, req.body);
  res.json(task);                      // 200 + updated task
}`, file: '🚂 backend · routes + controller', hl: '4' }]
            ] },
            { p: 'On the wire: <code>PATCH /api/tasks/7</code> + <code>{ "done": true }</code> → <code>200 OK</code> + the updated task. Use <code>PUT</code> instead only if you send the <b>whole</b> task.' }
        ] },
        { k: 'DELETE: remove', i: '🗑️', c: '#f87171', b: [
            { cols: [
                [{ code: `export async function deleteTask(id: number) {
  await api.delete(\`/tasks/\${id}\`);   // 204: nothing to read
}`, file: '⚛️ frontend · src/api/tasks.api.ts', hl: '2' }],
                [{ code: `tasksRouter.delete('/:id', tasks.remove);

export async function remove(req, res) {
  await taskService.remove(Number(req.params.id));
  res.status(204).end();               // success, empty body
}`, file: '🚂 backend · routes + controller', hl: '5' }]
            ] },
            { p: 'On the wire: <code>DELETE /api/tasks/7</code> → <code>204 No Content</code>. After it resolves, remove the task from React state.' }
        ] }
    ]
};

DECK.chapters.push({
    n: 11, level: 2, icon: '📦', t: ['Headers, body & response data'],
    sub: 'What you put in a request, and what you get back.',
    slides: [
        {
            kind: 'code', t: 'Request headers, request body, response data',
            b: [
                { cols: [
                    [{ code: `const res = await api.post(
  '/tasks',                              // URL (joined to baseURL)
  { title: 'Prepare Talk 04' },          // body → JSON
  {
    headers: { 'X-Request-Id': crypto.randomUUID() },
    params: { notify: true },            // → /tasks?notify=true
    timeout: 5000,
  },
);

res.status;                    // 201
res.headers['content-type'];   // "application/json; charset=utf-8"
res.data;                      // { id: 4, title: "Prepare Talk 04", ... }`, file: '⚛️ what React sends and receives', hl: '3,13' }],
                    [{ code: `export async function create(req, res) {
  req.body;                    // { title: "Prepare Talk 04" }  ← express.json()
  req.query;                   // { notify: "true" }   ← a string!
  req.params;                  // { id: "7" } on /tasks/:id   ← strings too
  req.headers['x-request-id']; // header names are lowercase
  req.headers.authorization;   // "Bearer eyJ…" (Section 7)

  res.status(201).json(task);  // sets Content-Type for you
}`, file: '🚂 what Express reads and sends', hl: '2' }]
                ] },
                { table: { h: ['Header', 'Who sets it', 'What it means'], r: [
                    ['<code>Content-Type: application/json</code>', 'Axios / Express', '“The body is JSON.” Missing → <code>req.body</code> is <code>undefined</code>'],
                    ['<code>Authorization: Bearer …</code>', 'Axios interceptor', '“This is who I am.” (Section 7)'],
                    ['<code>Origin</code>', 'The browser', 'Which site is calling (used for CORS)'],
                    ['<code>Access-Control-Allow-Origin</code>', 'Express <code>cors()</code>', '“This origin may read my response.”']
                ] } }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 12, level: 2, icon: '⏳', t: ['async/await & UI states'],
    sub: 'Requests take time and can fail, and the UI must show it.',
    slides: [
        {
            kind: 'code', t: 'async / await + loading, success and error states',
            b: [
                { cols: [
                    [{ code: `type Status = 'idle' | 'loading' | 'success' | 'error';

const [status, setStatus] = useState<Status>('idle');
const [tasks, setTasks] = useState<Task[]>([]);
const [error, setError] = useState<string | null>(null);

async function load() {
  setStatus('loading');                // 1. show a spinner
  try {
    const data = await getTasks();     // 2. wait, page stays responsive
    setTasks(data);                    // 3a. success → store the data
    setStatus('success');
  } catch (err) {
    setError(getErrorMessage(err));    // 3b. failure → readable message
    setStatus('error');
  }
}`, file: 'src/hooks/useTasks.ts (simplified)', hl: '8,10,14' }],
                    [{ diagram: 'states', cap: 'Every request goes through these states. Your UI should have something to show for each one.' },
                     { p: '<code>await</code> pauses <b>this function</b> until the promise settles. It doesn’t freeze the page: React keeps rendering and the user can still scroll.' }]
                ] },
                { mistake: 'Only coding the happy path. On a slow 3G connection in a lecture hall, users stare at an empty page with no spinner and no error, and they assume your app is broken.' }
            ]
        },
        {
            kind: 'demo', t: 'Live: loading, success and error states',
            b: [
                { p: '① Click <b>Load tasks</b> and watch <code>status</code> in the address bar. ② Set the network to <b>Slow 3G</b>, then click <b>↻ Reload</b>. ③ Pick <b>API offline</b> and reload to see the error state and the Retry button.' },
                { html: () => Talk.demo() }
            ]
        }
    ]
});

/* =====================================================================
   SECTION 4 — Axios in practice
   ===================================================================== */
DECK.chapters.push({
    n: 13, level: 3, icon: '⚙️', t: ['Install, instance & environment variables'],
    sub: 'Configure Axios once, use it everywhere.',
    slides: [
        {
            kind: 'code', t: 'Install Axios and create one instance',
            b: [
                { cols: [
                    [{ term: `cd frontend
npm install axios`, out: `added 9 packages in 2s` },
                     { code: `import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // http://localhost:4000/api
  timeout: 10_000,                         // give up after 10 s
  headers: { Accept: 'application/json' },
});`, file: 'src/api/axios.ts', hl: '3-4' }],
                    [{ p: 'Why an instance instead of plain <code>axios.get(fullUrl)</code> everywhere?' },
                     { ul: [
                        '<b>One base URL</b>: write <code>api.get(\'/tasks\')</code>; switching to production means changing one variable.',
                        '<b>One timeout</b> so requests don’t hang forever.',
                        '<b>One place for the token</b> later: an interceptor adds <code>Authorization</code> to every request (Section 7).'
                     ] },
                     { code: `// before
axios.get('http://localhost:4000/api/tasks');

// after
api.get('/tasks');`, file: 'usage', hl: '5' }]
                ] }
            ]
        },
        {
            kind: 'code', t: 'Environment variables on both sides',
            b: [
                { cols: [
                    [{ code: `# frontend/.env.development
VITE_API_URL=http://localhost:4000/api

# frontend/.env.production
VITE_API_URL=https://task-api.onrender.com/api`, file: 'frontend/.env.*', lang: 'env' },
                     { code: `// Vite replaces this at build time
const url = import.meta.env.VITE_API_URL;`, file: 'any frontend file' },
                     { warn: 'Only variables starting with <code>VITE_</code> reach the browser, and they end up <b>inside the JS bundle</b>, readable by anyone. A public API URL is fine there. Secrets never are.' }],
                    [{ code: `# backend/.env  (never committed!)
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskapp"
JWT_SECRET="a-long-random-string-only-the-server-knows"
CLIENT_URL=http://localhost:5173`, file: 'backend/.env', lang: 'env' },
                     { code: `import 'dotenv/config';         // loads .env into process.env

export const env = {
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
};`, file: 'backend/src/config/env.js', hl: '1' }]
                ] },
                { mistake: 'Changing <code>.env</code> and wondering why nothing changed. Both Vite and Node read env variables <b>at startup</b>, so restart the dev server. Add <code>.env</code> to <code>.gitignore</code> and commit a <code>.env.example</code> instead.' }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 14, level: 3, icon: '🧾', t: ['A typed API module'],
    sub: 'Components call functions, not URLs.',
    slides: [
        {
            kind: 'code', t: 'tasks.api.ts: the only file that knows the URLs',
            b: [
                { cols: [
                    [{ code: `import { api } from './axios';
export type Task = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;      // dates arrive as ISO strings
  updatedAt: string;
};
export type TaskChanges = Partial<Pick<Task, 'title' | 'done'>>;
export async function getTasks() {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}
export async function createTask(title: string) {
  const { data } = await api.post<Task>('/tasks', { title });
  return data;
}
export async function updateTask(id: number, changes: TaskChanges) {
  const { data } = await api.patch<Task>(\`/tasks/\${id}\`, changes);
  return data;
}
export async function deleteTask(id: number) {
  await api.delete(\`/tasks/\${id}\`);
}`, file: 'src/api/tasks.api.ts', hl: '2-8' }],
                    [{ steps: [
                        'The <code>Task</code> type <b>mirrors the JSON</b> the backend returns. It documents the API contract in code.',
                        'Each function = <b>one endpoint</b>. It returns plain data, not the Axios response.',
                        'Hooks import <code>getTasks()</code> and never build URLs or touch Axios. If a route changes, you edit <b>one line</b> here.'
                     ] },
                     { tip: 'Types disappear at runtime: they don’t check what the server <i>really</i> sends. If the backend renames a field, the types lie. That’s why the API contract matters (Section 9).' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 15, level: 3, icon: '🧯', t: ['Handling errors'],
    sub: 'Three kinds of failure, one readable message.',
    slides: [
        {
            kind: 'code', t: 'Handling Axios errors properly',
            b: [
                { cols: [
                    [{ table: { h: ['What happened', '<code>err.response</code>', 'Example'], r: [
                        ['Server answered 4xx / 5xx', '✅ status + data', '<code>400 { "error": "title is required" }</code>'],
                        ['No answer at all', '❌ undefined', 'API down, wrong port, CORS, timeout'],
                        ['Request never left', '❌ undefined', 'Bug in your config / code']
                    ] } },
                     { code: `// backend: every error has the SAME shape
res.status(400).json({ error: 'title is required' });
res.status(404).json({ error: 'Task not found' });`, file: 'the error contract' },
                     { best: 'Agree on one error shape (<code>{ "error": "…" }</code>) for the whole API. Then the frontend needs only one helper to show it.' }],
                    [{ code: `import axios from 'axios';

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // the server answered: use its message if it sent one
      return err.response.data?.error
        ?? \`Request failed (\${err.response.status})\`;
    }
    if (err.code === 'ECONNABORTED') {
      return 'The server took too long to answer.';
    }
    return 'Cannot reach the server. Check your connection.';
  }
  return 'Something went wrong.';
}`, file: 'src/api/errors.ts', hl: '5,7' },
                     { code: `try {
  await createTask(title);
} catch (err) {
  setError(getErrorMessage(err));   // "title is required"
}`, file: 'usage in TaskForm.tsx' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 16, level: 3, icon: '🗂️', t: ['Project structure'],
    sub: 'Where every piece of code lives, and why.',
    slides: [
        {
            kind: 'concept', t: 'Frontend structure: one job per folder',
            b: [
                { cols: [
                    [{ tree: `frontend/src/
├── api/
│   ├── axios.ts        # the configured instance
│   ├── errors.ts       # getErrorMessage()
│   ├── tasks.api.ts    # getTasks, createTask…
│   └── auth.api.ts     # login, register
├── components/
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useTasks.ts     # data + loading/error
│   └── useAuth.ts
├── pages/
│   ├── TasksPage.tsx
│   └── LoginPage.tsx
├── App.tsx             # the routes
└── main.tsx`, file: '📁 frontend/src' }],
                    [{ table: { h: ['Folder', 'Responsibility'], r: [
                        ['<code>api/</code>', 'Talk to the backend. The <b>only</b> place that knows URLs and Axios.'],
                        ['<code>hooks/</code>', 'State + side effects: call <code>api/</code>, track loading and errors.'],
                        ['<code>components/</code>', 'Reusable UI. Gets data and callbacks through <b>props</b>.'],
                        ['<code>pages/</code>', 'One per route. Combines hooks + components.']
                    ] } },
                     { html: '<div class="chain"><span style="--sc:var(--c-client)">pages</span><i>→</i><span style="--sc:var(--c-client)">hooks</span><i>→</i><span style="--sc:var(--c-client)">api</span><i>→</i><span style="--sc:var(--c-back)">HTTP</span></div>' },
                     { tip: 'Dependencies point one way. A component never imports Axios, and <code>api/</code> never imports React.' }]
                ] }
            ]
        },
        {
            kind: 'concept', t: 'Backend structure: layers with clear borders',
            b: [
                { cols: [
                    [{ tree: `backend/
├── prisma/
│   ├── schema.prisma     # tables as models
│   └── migrations/       # generated SQL history
└── src/
    ├── config/env.js     # reads + checks .env
    ├── prisma/client.js  # one shared PrismaClient
    ├── routes/           # URL + method → controller
    ├── middlewares/      # validate · auth · errors
    ├── controllers/      # HTTP in, HTTP out
    ├── services/         # business rules + Prisma
    ├── app.js            # builds the Express app
    └── server.js         # app.listen(PORT)`, file: '📁 backend' }],
                    [{ diagram: 'layers', cap: 'A request goes down through the layers; the result comes back up as JSON.' }]
                ] },
                { table: { h: ['Folder', 'Knows about', 'Must NOT know about'], r: [
                    ['<code>routes/</code>', 'URLs, methods, which middleware', 'Business logic'],
                    ['<code>middlewares/</code>', '<code>req</code> / <code>res</code>, headers, validation', 'The database (except auth lookups)'],
                    ['<code>controllers/</code>', '<code>req</code> / <code>res</code>, status codes', 'SQL / Prisma'],
                    ['<code>services/</code>', 'Business rules, Prisma', '<code>req</code> / <code>res</code>, so it’s reusable from tests, jobs, CLI'],
                    ['<code>config/</code> · <code>prisma/</code>', 'Env variables, the DB client', 'Everything else']
                ] } }
            ]
        }
    ]
});
