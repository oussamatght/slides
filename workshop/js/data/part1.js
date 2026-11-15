/* Talk 04 — Section 1 (Introduction) and Section 2 (Full Stack Architecture) */
window.DECK = window.DECK || { chapters: [] };

/* =====================================================================
   SECTION 1 — Introduction
   ===================================================================== */
DECK.chapters.push({
    n: 1, level: 0, icon: '🧩', t: ['What is full stack development?'],
    sub: 'Frontend, backend and database: three jobs, one feature.',
    slides: [
        {
            kind: 'concept', t: 'Full stack = every layer a feature touches',
            b: [
                { lead: 'A user only sees a button. Behind it, three parts of the app have to cooperate. A <b>full stack developer</b> can build and connect all of them.' },
                { cards: [
                    { i: '🖥️', t: 'Frontend: what users see', d: 'Runs <b>in the browser</b>. Shows data, handles clicks and forms, calls the API.<br><code>React · TypeScript · Axios</code>' },
                    { i: '⚙️', t: 'Backend: rules and security', d: 'Runs <b>on a server</b>. Validates input, checks who you are, applies business rules.<br><code>Node.js · Express</code>' },
                    { i: '🗄️', t: 'Database: long-term memory', d: 'Stores data <b>permanently</b> and answers queries fast and safely.<br><code>PostgreSQL · Prisma ORM</code>' }
                ] },
                { note: 'Think of a restaurant. The <b>dining room</b> (frontend) is where guests order. The <b>kitchen</b> (backend) follows recipes and hygiene rules. The <b>pantry</b> (database) stores the ingredients. Guests never walk into the pantry; they go through the waiter, and in a web app that waiter is the <b>API</b>.' }
            ]
        },
        {
            kind: 'concept', t: 'What does a full stack developer actually do?',
            b: [
                { cols: [
                    [{ h3: 'A normal week' }, { ul: [
                        '🎨 Build pages and components from a design',
                        '📝 Agree on the <b>API contract</b>: URLs, request and response shapes',
                        '🧭 Write Express routes, validation and business rules',
                        '🗄️ Model data and write database migrations',
                        '🔌 Connect the UI to the API and handle loading and errors',
                        '🐞 Debug across layers: “is it the frontend, the API or the DB?”',
                        '🚀 Deploy, configure environment variables, watch the logs'
                    ] }],
                    [{ h3: 'Real world: one feature, every layer' }, { p: 'The product owner asks: <i>“Tasks need a due date.”</i> Here is everything you change:' }, { steps: [
                        '<b>Database</b>: add <code>dueDate DateTime?</code> to the Prisma model and run a migration.',
                        '<b>Backend</b>: accept and validate <code>dueDate</code> in <code>POST</code> / <code>PATCH /api/tasks</code>.',
                        '<b>API module</b>: add <code>dueDate</code> to the <code>Task</code> type in <code>tasks.api.ts</code>.',
                        '<b>UI</b>: add a date input to the form and show the date in the list.',
                        '<b>Ship it</b>: commit, open a PR, deploy, run the migration in production.'
                    ] }]
                ] },
                { best: 'You don’t need to be an expert in every layer. You need to understand <b>how the layers connect</b>, so you can follow a bug or a feature from one end to the other. That’s what today is about.' }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 2, level: 0, icon: '🔌', t: ['How the pieces communicate'],
    sub: 'HTTP is the only bridge between the browser and your data.',
    slides: [
        {
            kind: 'concept', t: 'How the pieces communicate',
            b: [
                { diagram: 'trio', cap: 'The frontend never talks to the database directly. Every piece of data goes through the backend over HTTP.' },
                { cols: [
                    [{ ul: [
                        '<b>Frontend → Backend</b>: an <b>HTTP request</b> (method + URL + headers + optional JSON body).',
                        '<b>Backend → Database</b>: a <b>query</b>. Prisma writes the SQL for us.',
                        '<b>Backend → Frontend</b>: an <b>HTTP response</b> (status code + JSON).'
                    ] }],
                    [{ mistake: 'Putting database credentials in React code. Everything that ships to the browser is <b>public</b>: anyone can open DevTools and read it. Secrets live only on the server.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 3, level: 0, icon: '✅', t: ['Our example: the Task Manager'],
    sub: 'One small app, used on every slide.',
    slides: [
        {
            kind: 'project', t: 'Our example application: Task Manager',
            b: [
                { lead: 'Small enough to understand in one talk, real enough to have every integration problem you’ll meet at work.' },
                { cols: [
                    [{ h3: 'What users can do' }, { cards: [
                        { i: '👀', t: 'View tasks', d: '<code>GET /api/tasks</code>' },
                        { i: '➕', t: 'Add a task', d: '<code>POST /api/tasks</code>' },
                        { i: '✏️', t: 'Update a task', d: '<code>PATCH /api/tasks/:id</code>' },
                        { i: '🗑️', t: 'Delete a task', d: '<code>DELETE /api/tasks/:id</code>' }
                    ] }, { p: '…and later, <b>register / log in</b> so every user only sees their own tasks (Section 7).' }],
                    [{ h3: 'The stack, and why each piece is there' }, { table: { h: ['Layer', 'Tech', 'Its job'], r: [
                        ['UI', '<b>React</b> + TypeScript (Vite)', 'Components, state, forms'],
                        ['HTTP client', '<b>Axios</b>', 'Send requests, parse JSON, handle errors'],
                        ['API', '<b>Express 5</b> on Node.js', 'Routes, validation, business rules'],
                        ['ORM', '<b>Prisma</b>', 'Typed JS queries → SQL, migrations'],
                        ['Database', '<b>PostgreSQL</b>', 'Stores users and tasks'],
                        ['Hosting', '<b>Render</b>', 'Static site + web service + Postgres']
                    ] } }]
                ] }
            ]
        },
        {
            kind: 'project', t: 'One repository, two apps',
            b: [
                { cols: [
                    [{ tree: `task-manager/
├── frontend/          # React app → runs in the browser
│   ├── src/
│   ├── .env           # VITE_API_URL=http://localhost:4000/api
│   └── package.json
├── backend/           # Express API → runs on a server
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   ├── .env           # DATABASE_URL, JWT_SECRET, CLIENT_URL
│   └── package.json
└── README.md`, file: '📁 task-manager (monorepo)' }],
                    [{ term: `# terminal 1: the API on http://localhost:4000
cd backend && npm run dev

# terminal 2: the UI on http://localhost:5173
cd frontend && npm run dev`, file: 'two terminals, two servers' },
                     { ul: [
                        'Two separate apps, two ports, <b>two origins</b>. Remember this, it explains CORS in Section 6.',
                        'They share nothing except the <b>API contract</b>: URLs plus JSON shapes.',
                        'Each one has its own <code>package.json</code>, <code>.env</code> and deployment.'
                     ] }]
                ] },
                { tip: 'Frontend on <code>:5173</code> (Vite’s default) and API on <code>:4000</code>. We’ll use these exact ports on every slide.' }
            ]
        }
    ]
});

/* =====================================================================
   SECTION 2 — Understanding Full Stack Architecture
   ===================================================================== */
DECK.chapters.push({
    n: 4, level: 1, icon: '🗺️', t: ['The big picture'],
    sub: 'React → HTTP → Express → Prisma → PostgreSQL.',
    slides: [
        {
            kind: 'concept', t: 'The architecture of a modern web app',
            b: [
                { diagram: 'arch', cap: 'Watch the dot: a request travels left to right and the answer comes back right to left. Three machines, one conversation.' },
                { cols: [
                    [{ p: 'Each arrow is a <b>boundary</b>. Data changes shape when it crosses one: a JS object becomes JSON text, then a SQL query, then table rows, and the same trip happens in reverse.' }],
                    [{ note: 'Like posting a letter. You (React) write it, the post office (HTTP) carries it, the clerk (Express) reads it, the archive keeper (Prisma) finds the folder in the archive (PostgreSQL), and the answer comes back by post.' }]
                ] }
            ]
        },
        {
            kind: 'concept', t: 'Explore each layer: click a layer',
            b: [{ html: () => Talk.tabs('layers') }]
        }
    ]
});

DECK.tabs.layers = {
    label: 'Architecture layers',
    hint: 'Click a layer to see its job, a real snippet from our app, and what you see when it breaks.',
    items: [
        { k: 'React', i: '⚛️', c: 'var(--c-client)', b: [{ cols: [
            [{ p: '<b>Job:</b> render the UI from <b>state</b>, react to user events, and call the API when data is needed.' },
             { ul: ['Runs on the user’s device, inside the browser.', 'Knows nothing about SQL or passwords.', 'Treats the API like a remote function call.'] },
             { mistake: 'If it breaks: blank page or a red error in the browser <b>Console</b>.' }],
            [{ code: `export function TasksPage() {
  const { tasks, status } = useTasks();   // asks the API

  if (status === 'loading') return <p>Loading…</p>;

  return (
    <ul>
      {tasks.map((t) => <li key={t.id}>{t.title}</li>)}
    </ul>
  );
}`, file: 'src/pages/TasksPage.tsx', hl: '2' }]
        ] }] },
        { k: 'HTTP + JSON', i: '📨', c: 'var(--accent-warm)', b: [{ cols: [
            [{ p: '<b>Job:</b> carry requests and responses between two machines. <b>JSON</b> is the shared language both sides understand.' },
             { ul: ['Stateless: each request carries everything the server needs.', 'You can inspect every message in DevTools → <b>Network</b>.'] },
             { mistake: 'If it breaks: <code>(failed)</code> or <code>CORS error</code> in the Network tab, with no response at all.' }],
            [{ code: `GET /api/tasks HTTP/1.1
Host: localhost:4000
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

[{ "id": 1, "title": "Design the Task API", "done": true }]`, file: 'one round trip', lang: 'http', hl: '1,5' }]
        ] }] },
        { k: 'Express API', i: '🚂', c: 'var(--c-server)', b: [{ cols: [
            [{ p: '<b>Job:</b> receive HTTP requests, run middleware (validation, auth), apply business rules, and answer with a status code + JSON.' },
             { ul: ['The <b>only</b> door to your data.', 'Never trusts the client: validates everything.'] },
             { mistake: 'If it breaks: <code>500</code> responses and a stack trace in the backend terminal.' }],
            [{ code: `const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());          // JSON body → req.body

app.use('/api/tasks', tasksRouter);
app.use(errorHandler);            // errors → JSON`, file: 'src/app.js' }]
        ] }] },
        { k: 'Prisma ORM', i: '🔷', c: 'var(--c-db)', b: [{ cols: [
            [{ p: '<b>Job:</b> turn JavaScript calls into safe SQL and SQL rows back into JS objects. The schema file is the single source of truth for your tables.' },
             { ul: ['Generated, autocompleted client: <code>prisma.task.findMany()</code>.', 'Migrations keep every database in sync with the schema.', 'Parameterized queries → no SQL injection.'] },
             { mistake: 'If it breaks: <code>PrismaClientInitializationError</code> (can’t connect) or <code>P2025</code> (record not found).' }],
            [{ code: `// you write
const tasks = await prisma.task.findMany({
  where: { done: false },
  orderBy: { createdAt: 'desc' },
});

// Prisma sends (simplified)
// SELECT * FROM "Task" WHERE "done" = $1
//   ORDER BY "createdAt" DESC`, file: 'src/services/tasks.service.js', hl: '2-5' }]
        ] }] },
        { k: 'PostgreSQL', i: '🐘', c: 'var(--violet)', b: [{ cols: [
            [{ p: '<b>Job:</b> store data permanently in tables, enforce constraints (unique email, not-null title) and answer queries quickly.' },
             { ul: ['Runs as its own server (port <code>5432</code>).', 'Only the backend has the connection string.'] },
             { mistake: 'If it breaks: the API can’t start or every query fails. Check <code>DATABASE_URL</code> and that Postgres is running.' }],
            [{ code: `-- the "Task" table, created by a Prisma migration
CREATE TABLE "Task" (
  "id"        SERIAL PRIMARY KEY,
  "title"     VARCHAR(120) NOT NULL,
  "done"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);`, file: 'migration.sql', lang: 'sql' }]
        ] }] }
    ]
};

DECK.chapters.push({
    n: 5, level: 1, icon: '📨', t: ['Client, server, request & response'],
    sub: 'Who asks, who answers, and what a message looks like.',
    slides: [
        {
            kind: 'concept', t: 'Client and server: who asks, who answers',
            b: [
                { table: { h: ['', '💻 Client (React app)', '🖥️ Server (Express API)'], r: [
                    ['Where it runs', 'The user’s browser', 'A machine you control (laptop, Render…)'],
                    ['Role', '<b>Asks</b>: sends requests', '<b>Answers</b>: sends responses'],
                    ['Can be trusted?', '❌ No. Users can change anything', '✅ Yes. Your rules, your secrets'],
                    ['Holds secrets?', 'Never', '<code>DATABASE_URL</code>, <code>JWT_SECRET</code>']
                ] } },
                { cols: [
                    [{ code: `POST /api/tasks HTTP/1.1
Host: localhost:4000
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{ "title": "Prepare Talk 04" }`, file: '➡️ request', lang: 'http', hl: '1,3' }],
                    [{ code: `HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 4,
  "title": "Prepare Talk 04",
  "done": false,
  "createdAt": "2026-11-15T10:00:00.000Z"
}`, file: '⬅️ response', lang: 'http', hl: '1' }]
                ] },
                { p: 'Every message has the same anatomy: a <b>start line</b> (method + path, or status), <b>headers</b> (metadata), a blank line, then an optional <b>body</b>.' }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 6, level: 1, icon: '🧾', t: ['REST & JSON'],
    sub: 'Predictable URLs for resources, JSON for the data.',
    slides: [
        {
            kind: 'concept', t: 'REST API: resources + methods',
            b: [
                { lead: '<b>REST</b> is a set of conventions: URLs name <b>things</b> (nouns), HTTP methods say <b>what to do</b> with them (verbs). If you know one REST API, you can guess the next.' },
                { table: { h: ['Method', 'URL', 'Meaning', 'Success'], r: [
                    ['<code>GET</code>', '<code>/api/tasks</code>', 'List all tasks', '<code>200</code> + array'],
                    ['<code>GET</code>', '<code>/api/tasks/7</code>', 'Get task 7', '<code>200</code> + object'],
                    ['<code>POST</code>', '<code>/api/tasks</code>', 'Create a task', '<code>201</code> + new object'],
                    ['<code>PUT</code>', '<code>/api/tasks/7</code>', 'Replace task 7 entirely', '<code>200</code>'],
                    ['<code>PATCH</code>', '<code>/api/tasks/7</code>', 'Change some fields of task 7', '<code>200</code>'],
                    ['<code>DELETE</code>', '<code>/api/tasks/7</code>', 'Delete task 7', '<code>204</code> (no body)']
                ] } },
                { mistake: 'Verbs in URLs: <code>POST /api/createTask</code>, <code>GET /api/deleteTask?id=7</code>. The method already says the action. Also: never change data with <code>GET</code>, because browsers and crawlers can call it automatically.' }
            ]
        },
        {
            kind: 'concept', t: 'JSON: the language both sides speak',
            b: [
                { cols: [
                    [{ p: 'HTTP only carries <b>text</b>. JSON is a text format for objects and arrays that every language can read.' },
                     { steps: [
                        'React has a JS object → Axios calls <code>JSON.stringify()</code>.',
                        'The text travels in the request body.',
                        'Express’s <code>express.json()</code> parses it → <code>req.body</code>.',
                        'The response goes back the same way: <code>res.json(obj)</code> → text → <code>response.data</code>.'
                     ] }],
                    [{ code: `{
  "id": 4,
  "title": "Prepare Talk 04",
  "done": false,
  "tags": ["talk", "club"],
  "createdAt": "2026-11-15T10:00:00.000Z",
  "assignee": null
}`, file: 'task.json', lang: 'json' },
                     { mistake: 'JSON ≠ JavaScript: keys need <b>double quotes</b>, no trailing commas, no comments, no <code>undefined</code>, no functions. Dates travel as <b>ISO strings</b>, so convert with <code>new Date(task.createdAt)</code>.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 7, level: 1, icon: '🚦', t: ['HTTP methods & status codes'],
    sub: 'Pick the right verb, read the right number.',
    slides: [
        {
            kind: 'concept', t: 'HTTP methods: PUT vs PATCH and friends',
            b: [
                { cols: [
                    [{ table: { h: ['Method', 'Purpose', 'Has body?', 'Safe to retry?'], r: [
                        ['<code>GET</code>', 'Read', '❌', '✅'],
                        ['<code>POST</code>', 'Create / trigger', '✅', '❌ (may create twice)'],
                        ['<code>PUT</code>', 'Replace whole resource', '✅', '✅'],
                        ['<code>PATCH</code>', 'Partial update', '✅', '⚠️ usually'],
                        ['<code>DELETE</code>', 'Remove', '❌', '✅']
                    ] } }, { tip: '“Safe to retry” = <b>idempotent</b>: sending it twice leaves the server in the same state as sending it once. That’s why a double-click on “Add” can create two tasks, but a double-click on “Delete” can’t delete two.' }],
                    [{ code: `// task 7 is { title: "Old", done: false }

// PUT — send the WHOLE new version
await api.put('/tasks/7', { title: 'New', done: true });

// PATCH — send only what changes
await api.patch('/tasks/7', { done: true });
// → { title: "Old", done: true }

// A PUT with missing fields means "set them to defaults"
await api.put('/tasks/7', { done: true });
// → title is missing: 400 or title wiped!`, file: 'put-vs-patch.ts', hl: '4,7' },
                     { best: 'Our app uses <code>PATCH</code> for toggling “done”: we send one field, not the whole task.' }]
                ] }
            ]
        },
        {
            kind: 'concept', t: 'Status codes: the server’s one-number summary',
            b: [
                { cards: [
                    { i: '✅', t: '2xx: it worked', d: '<code>200</code> OK · <code>201</code> Created · <code>204</code> No Content' },
                    { i: '↪️', t: '3xx: look elsewhere', d: '<code>301</code> Moved · <code>304</code> Not Modified (use your cache)' },
                    { i: '🙋', t: '4xx: the client made a mistake', d: '<code>400</code> Bad Request · <code>401</code> Unauthorized · <code>403</code> Forbidden · <code>404</code> Not Found · <code>409</code> Conflict' },
                    { i: '💥', t: '5xx: the server failed', d: '<code>500</code> Internal Error · <code>502</code> Bad Gateway · <code>503</code> Unavailable' }
                ] },
                { cols: [
                    [{ code: `export async function create(req, res) {
  const task = await taskService.create(req.body.title);
  res.status(201).json(task);       // created
}

export async function remove(req, res) {
  await taskService.remove(Number(req.params.id));
  res.status(204).end();            // done, nothing to send
}`, file: 'src/controllers/tasks.controller.js', hl: '3,8' }],
                    [{ best: 'The first digit tells you <b>where to look</b> when debugging: <b>4xx</b> → check what the frontend sent; <b>5xx</b> → check the backend logs.' },
                     { mistake: 'Answering <code>200 { "error": "not found" }</code>. Axios treats any 2xx as success, so your <code>catch</code> never runs. Use the real status code.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 8, level: 1, icon: '🔄', t: ['The request/response lifecycle'],
    sub: 'Everything that happens between a click and a re-render.',
    slides: [
        {
            kind: 'concept', t: 'The request / response lifecycle',
            b: [
                { diagram: 'lifecycle', cap: 'One click on “Add task”, from start to finish. The dot follows the order of events: solid arrows are requests, dashed arrows are responses, boxes are work done locally.' }
            ]
        },
        {
            kind: 'concept', t: 'The lifecycle, step by step',
            b: [
                { cols: [
                    [{ steps: [
                        'The <b>user</b> clicks → React sets a “saving” state (button disabled).',
                        'Axios sends <code>POST /api/tasks</code> with a JSON body.',
                        'Express runs middleware, then the controller and service.',
                        'Prisma inserts a row in PostgreSQL and gets it back.'
                    ] }],
                    [{ steps: [
                        'Express answers <code>201 Created</code> + the new task as JSON.',
                        'Axios parses the JSON and resolves the promise.',
                        'React adds the task to state → the list re-renders.',
                        'If anything fails, a <b>status code</b> tells us which side to blame.'
                    ] }]
                ] },
                { tip: 'Real world: open DevTools → Network on any site you use, click a request and open the <b>Timing</b> tab. You’ll see this lifecycle measured in milliseconds: waiting for the server vs downloading the response.', label: 'Try it tonight' }
            ]
        }
    ],
    quiz: [
        { q: 'The browser sends <code>GET /api/tasks/99</code> and task 99 doesn’t exist. Best response?', o: ['<code>200</code> with an empty object', '`404 Not Found`', '`500 Internal Server Error`', '`400 Bad Request`'], a: 1, e: 'The request is well-formed, but the resource doesn’t exist: 404. A 200 would make the frontend think everything worked.' },
        { q: 'Why can’t React query PostgreSQL directly?', o: ['React is too slow for SQL', 'The browser can’t be trusted with database credentials, and anyone could run any query', 'PostgreSQL only accepts XML', 'It can, it’s just not common'], a: 1, e: 'Everything in the frontend bundle is public. The backend is the gatekeeper: it validates, authorizes and only runs the queries you allow.' },
        { q: 'You want to mark task 7 as done without touching its title. Which request fits best?', o: ['<code>PATCH /api/tasks/7</code> with <code>{ "done": true }</code>', '`GET /api/tasks/7?done=true`', '`POST /api/tasks/7/done`', '`DELETE /api/tasks/7`'], a: 0, e: 'PATCH = partial update; you send only the field that changes. GET must never change data.' }
    ]
});
