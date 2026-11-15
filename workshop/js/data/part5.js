/* Talk 04 — Section 8 (Localhost → production), Section 9 (Workflow & collaboration), Section 10 (Quiz & Q&A) */
window.DECK = window.DECK || { chapters: [] };

/* =====================================================================
   SECTION 8 — From localhost to production
   ===================================================================== */
DECK.chapters.push({
    n: 28, level: 7, icon: '🌗', t: ['Development vs production'],
    sub: 'Same code, different addresses, secrets and rules.',
    slides: [
        {
            kind: 'concept', t: 'Development vs production',
            b: [
                { table: { h: ['', '💻 Development', '🌍 Production (Render)'], r: [
                    ['Frontend', '<code>http://localhost:5173</code>, Vite dev server, hot reload', '<code>https://task-manager.onrender.com</code>, static files from <code>npm run build</code>'],
                    ['API', '<code>http://localhost:4000/api</code>', '<code>https://task-api.onrender.com/api</code>'],
                    ['Database', 'Local PostgreSQL (or Docker)', 'Render PostgreSQL'],
                    ['Env variables from', '<code>.env</code> files', 'Render dashboard → <b>Environment</b>'],
                    ['CORS origin', '<code>http://localhost:5173</code>', '<code>https://task-manager.onrender.com</code>'],
                    ['Migrations', '<code>prisma migrate dev</code> (creates them)', '<code>prisma migrate deploy</code> (applies them)'],
                    ['Errors', 'Full stack traces in your terminal', 'Generic messages to users, details in logs']
                ] } },
                { cols: [
                    [{ code: `# frontend/.env.development
VITE_API_URL=http://localhost:4000/api

# frontend/.env.production  (or set it on Render)
VITE_API_URL=https://task-api.onrender.com/api`, file: 'the frontend API URL', lang: 'env' }],
                    [{ warn: 'Vite <b>inlines</b> <code>import.meta.env.VITE_API_URL</code> into the JS bundle when you run <code>npm run build</code>. If the variable is missing <i>at build time</i>, the production app calls <code>undefined/tasks</code>, and changing it later needs a <b>rebuild</b>.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 29, level: 7, icon: '☁️', t: ['Deployment architecture on Render'],
    sub: 'Three services: a static site, a web service and a database.',
    slides: [
        {
            kind: 'concept', t: 'Deployment architecture on Render',
            b: [
                { diagram: 'deploy', cap: 'Users download React from the Static Site; React calls the Web Service; the API talks to Postgres over Render’s private network.' },
                { cols: [
                    [{ ul: [
                        '🌐 <b>Static Site</b>: serves <code>dist/</code> from a CDN. No server code.',
                        '⚙️ <b>Web Service</b>: runs <code>node src/server.js</code> + env + logs.',
                        '🐘 <b>PostgreSQL</b>: managed database. The API uses its <b>Internal</b> URL.'
                    ] }],
                    [{ steps: [
                        '<code>git push</code> → Render runs the <b>build command</b>.',
                        'API only: <code>prisma migrate deploy</code> updates the schema.',
                        '<b>Start command</b> → <code>/api/health</code> OK → live.'
                    ] }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 30, level: 7, icon: '🛫', t: ['Deploy step by step'],
    sub: 'Database → API → frontend → connect them.',
    slides: [
        {
            kind: 'code', t: 'Deploying the Task Manager on Render',
            b: [{ html: () => Talk.tabs('render') }]
        }
    ]
});

DECK.tabs.render = {
    label: 'Render deployment steps',
    hint: 'Do it in this order: each step needs a URL from the previous one.',
    items: [
        { k: '1 · Database', i: '🐘', c: 'var(--c-db)', b: [{ cols: [
            [{ steps: [
                'Render dashboard → <b>New → Postgres</b>.',
                'Name it <code>taskapp-db</code>, pick a <b>region</b> (use the same one for the API).',
                'Create it, then copy the <b>Internal Database URL</b>.',
                'Keep the External URL for your laptop only (Prisma Studio, psql).'
            ] }],
            [{ code: `postgresql://taskapp_user:•••••@dpg-xxxxx-a/taskapp_db`, file: 'Internal Database URL (example)', lang: 'text', nonum: true },
             { tip: 'The internal URL only works <b>inside Render</b> (faster, private network). From your laptop, use the external one.' },
             { warn: 'Free Render databases are for learning: they have storage limits and expire after a trial period. Check Render’s current free-tier limits before demo day.' }]
        ] }] },
        { k: '2 · API (Web Service)', i: '⚙️', c: 'var(--c-server)', b: [{ cols: [
            [{ table: { h: ['Setting', 'Value'], r: [
                ['Root Directory', '<code>backend</code>'],
                ['Runtime', 'Node'],
                ['Build Command', '<code>npm ci && npx prisma generate && npx prisma migrate deploy</code>'],
                ['Start Command', '<code>npm start</code>'],
                ['Health Check Path', '<code>/api/health</code>'],
                ['Env: <code>DATABASE_URL</code>', 'the Internal Database URL'],
                ['Env: <code>JWT_SECRET</code>', 'a long random string'],
                ['Env: <code>CLIENT_URL</code>', 'the Static Site URL (step 4)']
            ] } }],
            [{ code: `{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  }
}`, file: 'backend/package.json', lang: 'json', hl: '5' },
             { code: `// Render sets PORT for you, so always read it
app.listen(env.port, () => console.log(\`API ready on :\${env.port}\`));`, file: 'src/server.js' },
             { mistake: 'Setting <code>NODE_ENV=production</code> makes <code>npm ci</code> skip devDependencies. If <code>prisma</code> is a devDependency, the build fails. Move it to <code>dependencies</code> or use <code>npm ci --include=dev</code>.' }]
        ] }] },
        { k: '3 · Frontend (Static Site)', i: '🌐', c: 'var(--c-client)', b: [{ cols: [
            [{ table: { h: ['Setting', 'Value'], r: [
                ['Root Directory', '<code>frontend</code>'],
                ['Build Command', '<code>npm ci && npm run build</code>'],
                ['Publish Directory', '<code>dist</code>'],
                ['Env: <code>VITE_API_URL</code>', '<code>https://task-api.onrender.com/api</code>'],
                ['Redirects / Rewrites', 'Source <code>/*</code> → Destination <code>/index.html</code> · Action <b>Rewrite</b>']
            ] } }],
            [{ p: 'Why the rewrite rule? React Router handles <code>/tasks</code> <b>in the browser</b>. When a user refreshes on <code>/tasks</code>, the static host looks for a file called <code>tasks</code>, can’t find one, and returns 404. The rewrite always serves <code>index.html</code> and lets React pick the page.' },
             { term: `npm run build`, out: `vite v6 building for production...
✓ 112 modules transformed.
dist/index.html                  0.46 kB
dist/assets/index-B9x2k1.css     4.10 kB
dist/assets/index-Dq81Lm.js    182.30 kB
✓ built in 1.9s` }]
        ] }] },
        { k: '4 · Connect & test', i: '🔗', c: 'var(--accent-warm)', b: [{ cols: [
            [{ steps: [
                'Copy the Static Site URL → set it as <code>CLIENT_URL</code> on the API → <b>save</b> (the API redeploys).',
                'Open <code>https://task-api.onrender.com/api/health</code>: you should get <code>{ "ok": true }</code>.',
                'Open the site, register, add a task.',
                'DevTools → Network: requests must go to <code>task-api.onrender.com</code>, not <code>localhost</code>.',
                'Something fails? Read <b>Logs</b> on the Web Service.'
            ] }],
            [{ code: `// allow production AND local dev (comma-separated in CLIENT_URL)
// CLIENT_URL=https://task-manager.onrender.com,http://localhost:5173
const allowedOrigins = env.clientUrl.split(',');

app.use(cors({ origin: allowedOrigins }));`, file: 'src/app.js · production CORS', hl: '5' },
             { tip: 'Free web services <b>sleep</b> after about 15 minutes without traffic, and the first request can take up to a minute to wake them. Open the API a minute before you present!' }]
        ] }] }
    ]
};

DECK.chapters.push({
    n: 31, level: 7, icon: '✅', t: ['Production checklist'],
    sub: 'Ten checks before you share the link.',
    slides: [
        {
            kind: 'concept', t: 'Production checklist',
            b: [{ cols: [
                [{ ul: [
                    '✅ The frontend reads the API URL from <code>VITE_API_URL</code>, set <b>before</b> the build',
                    '✅ CORS allows the exact production origin (<code>https</code>, no trailing slash)',
                    '✅ Secrets live only in Render env variables, never in Git',
                    '✅ <code>.env.example</code> documents every variable',
                    '✅ <code>prisma migrate deploy</code> runs on every deploy',
                    '✅ The server listens on <code>process.env.PORT</code>',
                    '✅ <code>/api/health</code> returns <code>200</code>',
                    '✅ The SPA rewrite rule is set, so refreshing <code>/tasks</code> works',
                    '✅ Users never see stack traces, only friendly messages',
                    '✅ You watched the logs during the first real request'
                ] }],
                [{ table: { h: ['Symptom after deploy', 'Usual cause'], r: [
                    ['Frontend calls <code>localhost:4000</code>', '<code>VITE_API_URL</code> missing at build time'],
                    ['<code>CORS error</code> in production only', '<code>CLIENT_URL</code> wrong or still localhost'],
                    ['Build fails: <code>prisma: not found</code>', 'Prisma in devDependencies'],
                    ['500 + “table does not exist”', 'Migrations not applied'],
                    ['404 when refreshing a page', 'Missing rewrite rule'],
                    ['First request takes ~1 minute', 'Free instance waking up']
                ] } },
                 { best: 'Deploy <b>early</b>, as soon as “hello world” works on both sides. A small deployment problem today is much easier than ten of them the night before the deadline.' }]
            ] }]
        }
    ]
});

/* =====================================================================
   SECTION 9 — Developer workflow & collaboration
   ===================================================================== */
DECK.chapters.push({
    n: 32, level: 8, icon: '🌿', t: ['Git & GitHub as a team'],
    sub: 'Branches, commits and a main branch that always works.',
    slides: [
        {
            kind: 'concept', t: 'Branches, commits and the team git flow',
            b: [
                { diagram: 'git', cap: 'Frontend and backend developers work on separate branches, in parallel, and meet in a Pull Request before anything reaches main.' },
                { best: '<b>main is always deployable.</b> Nobody pushes to it directly: every change arrives through a reviewed Pull Request, and Render deploys main automatically.' }
            ]
        },
        {
            kind: 'code', t: 'One feature, start to finish',
            b: [
                { cols: [
                    [{ term: `git switch main && git pull           # start from the latest main
git switch -c feature/task-due-date   # one branch per feature

# ...write code, test it...
git add .
git commit -m "feat(api): accept dueDate on POST /api/tasks"
git push -u origin feature/task-due-date
# → open a Pull Request on GitHub`, file: 'one feature, start to finish' }],
                    [{ table: { h: ['Commit message', 'Meaning'], r: [
                        ['<code>feat(ui): add due date picker</code>', 'New feature'],
                        ['<code>fix(api): return 404 for unknown task</code>', 'Bug fix'],
                        ['<code>refactor: move validation to middleware</code>', 'Same behaviour, cleaner code'],
                        ['<code>docs: document POST /tasks in OpenAPI</code>', 'Documentation'],
                        ['<code>chore: bump axios</code>', 'Maintenance']
                    ] } },
                     { tip: 'Small commits with clear messages make <code>git log</code> readable and make reviews faster.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 33, level: 8, icon: '🔍', t: ['Pull requests & responsibilities'],
    sub: 'Who owns what, and where frontend and backend meet.',
    slides: [
        {
            kind: 'concept', t: 'Pull requests and frontend / backend responsibilities',
            b: [{ cols: [
                [{ code: `## What
Add a due date to tasks (API + UI).

## Why
Closes #42: users asked for deadlines.

## How to test
1. npx prisma migrate dev
2. Create a task with a date → appears in the list
3. POST without date → still works (field optional)

## API changes
- POST/PATCH /api/tasks accept "dueDate" (ISO string, optional)
- Task JSON now includes "dueDate": string | null`, file: 'PULL_REQUEST.md', lang: 'text', nonum: true }],
                [{ table: { h: ['Frontend dev', 'Backend dev', 'Both, together'], r: [
                    ['Pages & components', 'Routes & controllers', '<b>The API contract</b>'],
                    ['UI states (loading / error)', 'Validation & business rules', 'Error format <code>{ error }</code>'],
                    ['Calling the API (<code>api/</code>)', 'Prisma schema & migrations', 'Auth flow & token format'],
                    ['Forms & UX', 'Security & performance', 'Env variable names'],
                    ['Static site deploy', 'Web service & DB deploy', 'Testing the full flow']
                ] } },
                 { best: 'Review checklist: does it match the contract? Are errors handled? Any secrets in the diff? Can I run it from “How to test”? And if the API changed, does the PR <b>say so</b>? A silent rename of <code>title</code> → <code>name</code> breaks the other half of the team.' }]
            ] }]
        }
    ]
});

DECK.chapters.push({
    n: 34, level: 8, icon: '📜', t: ['The API contract: Swagger & Postman'],
    sub: 'Agree on the interface first, then build both sides in parallel.',
    slides: [
        {
            kind: 'code', t: 'API documentation: the contract between the two halves',
            b: [
                { cols: [
                    [{ code: `openapi: 3.0.3
info: { title: Task Manager API, version: 1.0.0 }
paths:
  /tasks:
    post:
      summary: Create a task
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title: { type: string, maxLength: 120 }
      responses:
        '201': { description: The created task }
        '400': { description: Validation error }
        '401': { description: Missing or invalid token }`, file: 'backend/openapi.yaml', lang: 'yaml', hl: '4-5,18-20' }],
                    [{ code: `import fs from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

const spec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
// → http://localhost:4000/api/docs: interactive docs`, file: 'src/app.js · Swagger UI', hl: '6' },
                     { cards: [
                        { i: '📘', t: 'Swagger / OpenAPI', d: 'A machine-readable contract → interactive docs where you can “Try it out”.' },
                        { i: '📮', t: 'Postman', d: 'Shared collections with <code>{{baseUrl}}</code> environments, saved examples and mock servers.' }
                     ] },
                     { best: '<b>Contract first:</b> agree on the endpoint and JSON shapes, then the backend implements it while the frontend builds against a mock. Integration becomes “swap the URL”.' }]
                ] }
            ]
        }
    ]
});

/* =====================================================================
   SECTION 10 — Final quiz & Q&A
   ===================================================================== */
DECK.chapters.push({
    n: 35, level: 9, icon: '🎯', t: ['The Full Stack Challenge'],
    sub: 'Ten questions on how everything connects.',
    slides: [
        {
            kind: 'concept', t: 'Recap: what we connected today',
            b: [
                { html: '<div class="chain"><span style="--sc:var(--c-client)">⚛️ React</span><i>→</i><span style="--sc:var(--c-client)">📡 Axios</span><i>→</i><span style="--sc:var(--c-back)">HTTP + JSON</span><i>→</i><span style="--sc:var(--c-server)">🚂 Express</span><i>→</i><span style="--sc:var(--c-server)">🧠 Service</span><i>→</i><span style="--sc:var(--c-db)">🔷 Prisma</span><i>→</i><span style="--sc:var(--c-db)">🐘 PostgreSQL</span></div>' },
                { cards: [
                    { i: '🌉', t: 'HTTP is the bridge', d: 'Method + URL + headers + JSON body in, status code + JSON out.' },
                    { i: '🧱', t: 'Layers have one job', d: 'api / hooks / components on the frontend; routes / middleware / controllers / services on the backend.' },
                    { i: '⏳', t: 'Design for failure', d: 'Every request needs loading, success and error states, and one error format.' },
                    { i: '🔎', t: 'Debug by halves', d: 'Network tab first. 4xx → check the request. 5xx → check the server logs.' },
                    { i: '🔐', t: 'Security lives on the server', d: 'Hash passwords, verify JWTs in middleware; React route guards are just UX.' },
                    { i: '🚀', t: 'Production = configuration', d: 'Env variables, CORS origin, migrations, health checks, all set on Render.' }
                ] }
            ]
        }
    ],
    quiz: [
        { q: 'A user clicks <b>Add</b>. The new task only appears after a page refresh. What is the most likely bug?', o: ['The database didn’t save the task', 'React didn’t update state with the POST response', 'A CORS error', 'The API returned the wrong status code'], a: 1, e: 'It appears after a refresh, so the backend and database worked. The frontend never put the returned task into state, so nothing re-rendered.' },
        { q: 'Why does the browser treat <code>localhost:5173</code> calling <code>localhost:4000</code> as cross-origin?', o: ['Because the protocol is HTTP, not HTTPS', 'Because a different port makes a different origin', 'Because Express is not a browser', 'It doesn’t. Same host means same origin'], a: 1, e: 'An origin is protocol + host + <b>port</b>. Change any of the three and it’s cross-origin, so the server must allow it with CORS headers.' },
        { q: 'Where should the rule “a user can’t have more than 100 open tasks” live?', o: ['In the React component', 'In the Express route definition', 'In the service layer on the backend', 'In the Axios instance'], a: 2, e: 'Business rules belong in services: reusable, testable, and enforced no matter which client calls the API. A React check alone can be bypassed.' },
        { q: 'A user with a <b>valid</b> token tries to delete another user’s task. Best status code?', o: ['`401 Unauthorized`', '`403 Forbidden`', '`400 Bad Request`', '`500 Internal Server Error`'], a: 1, e: 'We know who they are (authenticated), but they aren’t allowed (authorization): 403. Some APIs answer 404 to hide that the task exists, which is also acceptable.' },
        { q: 'Why isn’t a <code>ProtectedRoute</code> in React enough to protect users’ tasks?', o: ['React Router has security bugs', 'Anyone can call the API directly with curl or Postman, so the server must verify the token', 'Tokens expire too quickly', 'Because of CORS'], a: 1, e: 'The frontend is fully controlled by the user. Only checks on the backend (the requireAuth middleware + ownership checks) actually protect data.' },
        { q: 'After deploying to Render, the production site still calls <code>http://localhost:4000</code>. Why?', o: ['Render blocks external APIs', '<code>VITE_API_URL</code> wasn’t set when the static site was built', 'The database isn’t migrated', 'CORS is misconfigured'], a: 1, e: 'Vite inlines env variables at build time. Set <code>VITE_API_URL</code> in the Static Site’s environment and rebuild.' },
        { q: 'Which value is safe to put in a <code>VITE_</code> environment variable?', o: ['`JWT_SECRET`', '`DATABASE_URL`', 'The public API URL', 'The admin password'], a: 2, e: 'Everything prefixed with VITE_ ends up in the JavaScript bundle that every visitor downloads. Only public values belong there.' },
        { q: 'The Network tab shows <code>(failed) net::ERR_CONNECTION_REFUSED</code>. What do you check first?', o: ['The Prisma schema', 'Whether the backend is running on the expected host and port', 'The React component’s state', 'The JWT payload'], a: 1, e: 'Connection refused means nothing is listening at that address. The request never reached Express, let alone the database.' },
        { q: 'In which order does a <code>POST /api/tasks</code> pass through the backend?', o: ['Controller → Route → Prisma → Middleware → Service', 'Route → Middleware → Controller → Service → Prisma', 'Middleware → Service → Route → Controller → Prisma', 'Prisma → Service → Controller → Middleware → Route'], a: 1, e: 'The route matches, middleware validates / authenticates, the controller translates HTTP, the service applies rules, Prisma talks to PostgreSQL.' },
        { q: 'An API answers <code>200 { "error": "Task not found" }</code>. What happens in your Axios code?', o: ['The <code>catch</code> block runs with a 404', 'Axios converts it into an error automatically', 'The request counts as a success: the <code>try</code> block continues and the <code>catch</code> never runs', 'The browser shows a CORS error'], a: 2, e: 'Axios only rejects on non-2xx statuses. Use real status codes (404 here) so the frontend’s error handling works.' }
    ]
});

DECK.chapters.push({
    n: 36, level: 9, icon: '🙋', t: ['Q&A'],
    sub: 'Your turn.',
    slides: [
        {
            kind: 'concept', t: 'Questions?',
            b: [
                { html: '<p class="qa-big" aria-hidden="true">?</p><p class="lead" style="text-align:center">Ask anything about integration, APIs, auth, deployment, or your own project.</p>' },
                { h3: 'Questions people often ask' },
                { qa: [
                    { q: 'Should I learn frontend or backend first?', a: 'Pick one and get comfortable (most people start with the frontend because it’s visual), then build one small full stack project, like this Task app, as early as possible. The connection is where you learn the most.' },
                    { q: 'What about Next.js? Do I still need Express?', a: 'Next.js lets you write API routes / server actions in the same project, but the ideas are identical: HTTP, JSON, validation, auth, a database. A separate Express API is still common when several clients (web + mobile) share one backend.' },
                    { q: 'PostgreSQL or MongoDB?', a: 'Both work. PostgreSQL (relational, with Prisma) fits data with clear relations like users → tasks. MongoDB fits flexible documents. The frontend ↔ API integration is exactly the same either way.' },
                    { q: 'Is localStorage safe for the token?', a: 'It’s fine for learning and many apps use it, but any XSS can read it. httpOnly cookies are safer against XSS but need CSRF protection and CORS credentials. Choose consciously, and always keep the real checks on the server.' }
                ] }
            ]
        }
    ]
});
