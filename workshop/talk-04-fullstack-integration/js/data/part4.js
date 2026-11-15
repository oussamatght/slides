/* Talk 04 — Section 6 (Common integration problems) and Section 7 (Authentication integration) */
window.DECK = window.DECK || { chapters: [] };

/* =====================================================================
   SECTION 6 — Common integration problems
   ===================================================================== */
DECK.chapters.push({
    n: 21, level: 5, icon: '🔎', t: ['The debugging toolkit'],
    sub: 'Find which side is broken before you change any code.',
    slides: [
        {
            kind: 'concept', t: 'Before fixing: find the broken side',
            b: [
                { diagram: 'debug', cap: 'Start every integration bug in the Network tab. The status code tells you which side to investigate.' },
                { best: '<b>Split the problem in half.</b> If the API works from curl / Postman, the bug is in the frontend. If it fails there too, it’s the backend or the database.' }
            ]
        },
        {
            kind: 'concept', t: 'The debugging toolkit',
            b: [
                { cols: [
                    [{ cards: [
                        { i: '🔎', t: 'Network tab', d: 'URL, method, status, request headers, payload, response, timing.' },
                        { i: '🧾', t: 'Browser console', d: 'Frontend exceptions and CORS messages.' },
                        { i: '🖥️', t: 'Backend logs', d: 'Terminal (or Render → Logs): stack traces of every 500.' },
                        { i: '🔷', t: 'Prisma Studio', d: '<code>npx prisma studio</code>: see the real rows in the DB.' }
                    ] }],
                    [{ term: `curl -i -X POST http://localhost:4000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"from curl"}'`, file: '📮 call the API without React (or use Postman)', out: `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":5,"title":"from curl","done":false,...}` },
                     { tip: 'Keep the backend terminal visible next to the browser while you develop. Most 500s explain themselves in the first line of the stack trace.' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 22, level: 5, icon: '🚦', t: ['HTTP errors: 400 · 401 · 403 · 404 · 500'],
    sub: 'What each status means for a full stack developer.',
    slides: [
        {
            kind: 'mistakes', t: 'HTTP errors: what, why, debug, fix',
            b: [{ html: () => Talk.problems('http') }]
        }
    ]
});

DECK.problems.http = [
    {
        k: '400', name: 'Bad Request', c: '#fbbf24',
        sum: 'The server understood the request, but the data is invalid.',
        see: 'The form shows “title is required”, or nothing visible happens. Network tab: a red row with status 400.',
        console: 'POST http://localhost:4000/api/tasks 400 (Bad Request)\nResponse: { "error": "title is required" }',
        why: 'Validation failed: a field is missing, empty, the wrong type or too long. Typical causes: sending <code>{ name }</code> when the API expects <code>{ title }</code>, a number sent as a string, or a fetch call without the JSON header.',
        debug: ['Network → click the request → <b>Payload</b>: what did you <i>actually</i> send?', '<b>Response</b> tab: read the message the API returned.', 'Compare field names and types with the API docs (Swagger / Postman).'],
        fix: 'Send exactly the shape the contract describes, and show the server’s message in the UI.',
        fixCode: { code: `// ❌ wrong field name
await api.post('/tasks', { name: title });

// ✅ matches the API contract
await api.post('/tasks', { title });`, file: 'src/api/tasks.api.ts', hl: '5' }
    },
    {
        k: '401', name: 'Unauthorized', c: '#fb923c',
        sum: '“Who are you?” The request has no valid credentials.',
        see: 'Login works, but every protected request fails right after, or starts failing days later when the token expires.',
        console: 'GET http://localhost:4000/api/tasks 401 (Unauthorized)\nResponse: { "error": "Missing token" }',
        why: 'The <code>Authorization</code> header is missing or malformed (it must be <code>Bearer</code> + space + token), the token expired, or it was signed with a different <code>JWT_SECRET</code> (for example, the secret changed on the server).',
        debug: ['Network → request <b>Headers</b>: is <code>Authorization: Bearer eyJ…</code> there?', 'DevTools → Application → Local Storage: is the token saved?', 'Decode the token’s middle part (it’s just base64) and check <code>exp</code>.'],
        fix: 'Attach the token in one interceptor. On a 401, clear it and send the user back to login.',
        fixCode: { code: `api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});`, file: 'src/api/axios.ts', hl: '3' }
    },
    {
        k: '403', name: 'Forbidden', c: '#f472b6',
        sum: '“I know who you are, but you can’t do this.”',
        see: 'A logged-in user tries to delete someone else’s task, or a normal user calls an admin route.',
        console: 'DELETE http://localhost:4000/api/tasks/12 403 (Forbidden)\nResponse: { "error": "Not your task" }',
        why: '<b>Authentication</b> succeeded (the token is valid), but <b>authorization</b> failed: the user doesn’t own the resource or lacks the role. Usually this is the backend doing its job correctly.',
        debug: ['Is it expected? Check which user the token belongs to (<code>req.user.id</code>).', 'Log the ownership check: <code>task.userId</code> vs <code>req.user.id</code>.', 'Don’t confuse it with 401: logging in again won’t help.'],
        fix: 'Hide actions the user can’t perform in the UI, and <b>keep</b> the check on the server.',
        fixCode: { code: `export async function remove(userId, id) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw httpError(404, 'Task not found');
  if (task.userId !== userId) throw httpError(403, 'Not your task');
  await prisma.task.delete({ where: { id } });
}`, file: 'src/services/tasks.service.js', hl: '4' }
    },
    {
        k: '404', name: 'Not Found', c: '#38bdf8',
        sum: 'The URL matches no route, or the resource doesn’t exist.',
        see: 'Every request fails (a route problem) or only requests for one specific id fail (a resource problem).',
        console: 'GET http://localhost:4000/api/task 404 (Not Found)\nResponse: { "error": "Route not found: GET /api/task" }',
        why: 'Two different 404s. A <b>route</b> 404: a typo, a missing <code>/api</code> prefix, the wrong method, or a router that was never mounted. A <b>resource</b> 404: task 99 was already deleted.',
        debug: ['Copy the exact URL from the Network tab and compare it with the backend routes, character by character.', 'Check the <b>method</b> too: a <code>PUT</code> to a route that only has <code>PATCH</code> is a 404.', 'Read the error body: our API says which route was not found.'],
        fix: 'Fix the path in one place: <code>VITE_API_URL</code> + <code>tasks.api.ts</code>.',
        fixCode: { code: `VITE_API_URL=http://localhost:4000       # ❌ missing /api
VITE_API_URL=http://localhost:4000/api   # ✅`, file: 'frontend/.env', lang: 'env' }
    },
    {
        k: '500', name: 'Internal Server Error', c: '#f87171',
        sum: 'The server crashed while handling the request.',
        see: 'A generic “Internal Server Error” in the UI. The frontend can’t tell you more, and that’s on purpose.',
        console: "POST http://localhost:4000/api/tasks 500 (Internal Server Error)\n\n# backend terminal\nTypeError: Cannot read properties of undefined (reading 'title')\n    at create (src/controllers/tasks.controller.js:2:46)",
        why: 'A bug or unexpected situation in the backend: an undefined variable, an unhandled Prisma error, a missing env variable, a database that’s down. The details are only in the <b>server logs</b>.',
        debug: ['Look at the <b>backend terminal</b> (or Render → Logs), not the browser.', 'Read the stack trace from the top: it gives a file and a line number.', 'Reproduce with curl / Postman to take the frontend out of the picture.'],
        fix: 'Fix the bug. Here <code>req.body</code> was undefined because the JSON parser was registered after the routes.',
        fixCode: { code: `app.use(express.json());              // ✅ BEFORE the routes
app.use('/api/tasks', tasksRouter);`, file: 'src/app.js', hl: '1' }
    }
];

DECK.chapters.push({
    n: 23, level: 5, icon: '🧰', t: ['CORS, URLs, env, network, DB & JSON'],
    sub: 'The setup problems that eat whole afternoons.',
    slides: [
        {
            kind: 'mistakes', t: 'Configuration problems: what, why, debug, fix',
            b: [{ html: () => Talk.problems('setup') }]
        }
    ]
});

DECK.problems.setup = [
    {
        k: 'CORS', name: 'CORS error', c: '#f87171',
        sum: 'The browser blocks your React app from reading the API response.',
        see: 'Works in Postman, fails in the browser. In the Network tab, the status column says “CORS error”.',
        console: "Access to XMLHttpRequest at 'http://localhost:4000/api/tasks' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
        why: 'A different port means a different <b>origin</b>. The browser only lets JavaScript read a cross-origin response if the server allows it with <code>Access-Control-Allow-Origin</code>. Postman isn’t a browser, so it doesn’t enforce this. For JSON requests the browser first sends an <code>OPTIONS</code> “preflight”.',
        debug: ['Read the message: which origin is blocked?', 'Network tab: find the <code>OPTIONS</code> preflight and look at its response headers.', 'Check <code>CLIENT_URL</code>: exact protocol, host and port, and <b>no trailing slash</b>.'],
        fix: 'Fix it on the <b>backend</b>. Adding headers in React can’t help, because the server has to grant permission.',
        fixCode: { code: `import cors from 'cors';

app.use(cors({
  origin: env.clientUrl,     // 'http://localhost:5173'
  credentials: true,         // only if you use cookies
}));`, file: 'src/app.js', hl: '3-4' }
    },
    {
        k: 'URL', name: 'Incorrect API URL', c: '#fbbf24',
        sum: 'Requests go somewhere your API isn’t.',
        see: '404 on everything, requests going to <code>localhost:5173/…</code> (the frontend itself), or to <code>…/undefined/tasks</code>.',
        console: 'GET http://localhost:5173/undefined/tasks 404 (Not Found)',
        why: '<code>VITE_API_URL</code> is undefined (typo, wrong file, missing <code>VITE_</code> prefix, dev server not restarted), so Axios builds a URL relative to the frontend. Or a double slash, or a missing <code>/api</code>.',
        debug: ['Log it once: <code>console.log(import.meta.env.VITE_API_URL)</code>.', 'Read the full <b>Request URL</b> in the Network tab.', 'Restart <code>npm run dev</code> after editing <code>.env</code>.'],
        fix: 'Fail fast with a clear message if the variable is missing.',
        fixCode: { code: `const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) throw new Error('VITE_API_URL is not set. Check frontend/.env');

export const api = axios.create({ baseURL, timeout: 10_000 });`, file: 'src/api/axios.ts', hl: '2' }
    },
    {
        k: 'ENV', name: 'Environment variables', c: '#c084fc',
        sum: 'Works on my machine, breaks everywhere else.',
        see: 'The backend crashes at startup on Render, tokens stop verifying, or the production frontend still calls <code>localhost</code>.',
        console: 'Error: Missing env var: JWT_SECRET\n    at file:///opt/render/project/src/backend/src/config/env.js:5:30',
        why: '<code>.env</code> files are (correctly) not committed, so every environment needs its own values: each teammate, CI, Render. Vite reads <code>VITE_*</code> at <b>build</b> time; Node reads variables at <b>startup</b>.',
        debug: ['Compare with <code>.env.example</code>: what’s missing?', 'On Render: open the <b>Environment</b> tab of each service.', 'Changed a <code>VITE_*</code> value on Render? Trigger a new <b>build</b> of the static site.'],
        fix: 'Validate env variables at startup, so the app crashes immediately with a clear message.',
        fixCode: { code: `import 'dotenv/config';

for (const key of ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL']) {
  if (!process.env[key]) throw new Error(\`Missing env var: \${key}\`);
}`, file: 'src/config/env.js', hl: '3-5' }
    },
    {
        k: 'NET', name: 'Network error', c: '#94a3b8',
        sum: 'No response at all: the request never reached a server.',
        see: 'Status <code>(failed)</code>, an Axios error with no <code>response</code>, message “Network Error”.',
        console: 'GET http://localhost:4000/api/tasks net::ERR_CONNECTION_REFUSED\nAxiosError: Network Error  (code: "ERR_NETWORK")',
        why: 'The backend isn’t running, crashed, or listens on another port; the host is wrong; the user is offline; or a free Render instance is still waking up.',
        debug: ['Is the backend terminal running and showing “API ready on :4000”?', 'Open <code>http://localhost:4000/api/health</code> directly in the browser.', 'Check the port in both <code>.env</code> files.'],
        fix: 'Add a health route, and show a friendly message + Retry instead of a blank page.',
        fixCode: { code: `// backend: a route that needs nothing, to test "is it up?"
app.get('/api/health', (req, res) => res.json({ ok: true }));

// frontend: no err.response → the server never answered
if (axios.isAxiosError(err) && !err.response) {
  return 'Cannot reach the server. Is the API running?';
}`, file: 'health check' }
    },
    {
        k: 'DB', name: 'Database connection', c: '#a78bfa',
        sum: 'The API runs, but it can’t talk to PostgreSQL.',
        see: 'Every route that touches data returns 500, and the server log mentions Prisma.',
        console: "PrismaClientInitializationError: Can't reach database server at `localhost:5432`\nPlease make sure your database server is running at `localhost:5432`.",
        why: 'Postgres isn’t started, <code>DATABASE_URL</code> is wrong (user, password, port, db name), migrations weren’t applied (<code>table "Task" does not exist</code>), or on Render you used the External URL / a different region.',
        debug: ['Can <code>npx prisma studio</code> connect with the same URL?', 'Run <code>npx prisma migrate status</code>.', 'Check the format: <code>postgresql://USER:PASSWORD@HOST:5432/DB</code>.'],
        fix: 'Start the database, fix the URL, apply the migrations.',
        fixCode: { code: `# local development: create + apply migrations
npx prisma migrate dev

# production (Render build command): apply existing ones only
npx prisma migrate deploy`, file: 'terminal', lang: 'bash' }
    },
    {
        k: 'JSON', name: 'JSON parsing', c: '#22d3ee',
        sum: 'One side sends something that isn’t the JSON the other side expects.',
        see: '<code>req.body</code> is <code>undefined</code> on the server, or the frontend crashes with <code>Unexpected token \'&lt;\'</code>.',
        console: 'SyntaxError: Unexpected token \'<\', "<!doctype "... is not valid JSON',
        why: 'Server side: no <code>express.json()</code>, or no <code>Content-Type: application/json</code> header (common with fetch). Client side: the URL hit the frontend dev server or an HTML error page, so you got <b>HTML</b> back instead of JSON.',
        debug: ['Network → <b>Response</b> tab: is it JSON or HTML?', 'Server: log <code>req.headers[\'content-type\']</code> and <code>req.body</code>.', 'With fetch: did you <code>JSON.stringify</code> the body <i>and</i> set the header?'],
        fix: 'Parse JSON on the server, send the right header, and return JSON even for errors.',
        fixCode: { code: `app.use(express.json());   // without it, req.body is undefined

// fetch needs BOTH of these:
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title }),
});`, file: 'server + fetch', hl: '1,6-7' }
    }
];

DECK.chapters.push({
    n: 24, level: 5, icon: '💥', t: ['Break it live'],
    sub: 'Cause each error on purpose and read the symptoms.',
    slides: [
        {
            kind: 'demo', t: 'Live: break the app on purpose',
            b: [
                { p: 'Pick a failure under <b>Break the next request</b>, then add or reload a task. Watch <b>where</b> the pipeline turns red, what the Network log shows, and what the user sees.' },
                { html: () => Talk.demo() },
                { table: { h: ['Break', 'Stops at', 'Network shows', 'User should see'], r: [
                    ['404 wrong URL', 'Express route', '<code>404</code> + route message', 'An error banner, not a blank page'],
                    ['401 no token', 'Middleware', '<code>401</code>', 'A redirect to login'],
                    ['500 server bug', 'Prisma', '<code>500</code> (details only in server logs)', 'A generic error + Retry'],
                    ['API offline / CORS', 'Browser (Axios)', '<code>(failed)</code> / <code>CORS error</code>', '“Cannot reach the server”']
                ] } }
            ]
        }
    ],
    quiz: [
        { q: 'The app works in Postman but the browser says “blocked by CORS policy”. Where is the fix?', o: ['In the Express backend: allow the frontend origin with <code>cors()</code>', 'In React: add an <code>Access-Control-Allow-Origin</code> header to the Axios request', 'Switch from Axios to fetch', 'Install a browser extension that disables CORS'], a: 0, e: 'CORS is the <b>server</b> granting permission to a browser origin. Request headers from React can’t grant it, and an extension only “fixes” your own browser.' },
        { q: 'A request returns <code>500</code>. Where do you look first?', o: ['The browser console', 'The backend terminal / server logs', 'The React component', 'The <code>.gitignore</code> file'], a: 1, e: '5xx = the server failed. The stack trace with the file and line is in the backend logs, and the browser only gets a generic message.' },
        { q: 'The Network tab shows <code>GET http://localhost:5173/undefined/tasks</code>. Most likely cause?', o: ['PostgreSQL is down', 'The JWT expired', '<code>VITE_API_URL</code> is not defined (or the dev server wasn’t restarted)', 'The task id is wrong'], a: 2, e: '“undefined” is literally the value of a missing env variable, and the request went to the frontend’s own origin.' }
    ]
});

/* =====================================================================
   SECTION 7 — Authentication integration
   ===================================================================== */
DECK.chapters.push({
    n: 25, level: 6, icon: '🔐', t: ['The authentication flow'],
    sub: 'How a password becomes a token, and a token becomes access.',
    slides: [
        {
            kind: 'concept', t: 'Authentication lifecycle: login → token → protected requests',
            b: [
                { diagram: 'auth', cap: 'Login happens once. After that, every request proves who the user is by carrying the token.' }
            ]
        },
        {
            kind: 'concept', t: 'Who does what in authentication',
            b: [
                { cols: [
                    [{ table: { h: ['Piece', 'Lives in'], r: [
                        ['Password hashing (bcrypt)', '🚂 Backend service'],
                        ['Signing + verifying JWTs (<code>JWT_SECRET</code>)', '🚂 Backend only'],
                        ['Storing the token', '⚛️ Frontend (localStorage / cookie)'],
                        ['Attaching the token', '⚛️ Axios interceptor'],
                        ['Protecting routes', '🚂 Middleware (security) + ⚛️ route guard (UX)']
                    ] } }],
                    [{ cards: [
                        { i: '🪪', t: 'Authentication → 401', d: '<b>Who are you?</b> No token, or an invalid one.' },
                        { i: '🚧', t: 'Authorization → 403', d: '<b>What may you do?</b> Valid token, but not your task.' }
                    ] },
                     { note: 'A JWT is like a <b>festival wristband</b>. You show your ID once at the entrance (login) and get a wristband (token). After that, guards only check the wristband, and it expires at the end of the day.' }]
                ] },
                { steps: [
                    '<b>Register / login</b>: React sends email + password once, over HTTPS.',
                    '<b>Backend</b> hashes (register) or compares (login) the password, then signs a JWT.',
                    '<b>React</b> stores the token, and Axios attaches it to every request.',
                    '<b>Middleware</b> verifies it on every protected route and sets <code>req.user</code>; services filter data by <code>req.user.id</code>.'
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 26, level: 6, icon: '🗝️', t: ['Backend: hashing, JWT & protected routes'],
    sub: 'Register, login, and a middleware that guards every task route.',
    slides: [
        {
            kind: 'code', t: 'Register & login: hash passwords, issue a token',
            b: [{ cols: [
                [{ code: `+model User {
+  id        Int      @id @default(autoincrement())
+  email     String   @unique
+  password  String              // bcrypt hash, never plain text
+  tasks     Task[]
+  createdAt DateTime @default(now())
+}

 model Task {
   id        Int      @id @default(autoincrement())
   title     String   @db.VarChar(120)
   done      Boolean  @default(false)
+  userId    Int
+  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt
 }`, file: 'prisma/schema.prisma', lang: 'diff' },
                 { p: 'Then: <code>npm install bcrypt jsonwebtoken</code> and <code>npx prisma migrate dev --name add_users</code>.' },
                 { p: '<b>bcrypt</b> turns <code>"secret123"</code> into something like <code>"$2b$12$Qe3x…"</code>: one-way (no way back), salted (same password ≠ same hash) and slow on purpose (to make brute force expensive).' }],
                [{ code: `// imports: bcrypt · jwt (jsonwebtoken) · prisma · env
const httpError = (status, message) => Object.assign(new Error(message), { status });

export async function register(email, password) {
  const hash = await bcrypt.hash(password, 12);   // store the hash only
  const user = await prisma.user.create({ data: { email, password: hash } });
  return issueToken(user);
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw httpError(401, 'Invalid email or password');  // same message for both:
  return issueToken(user);                                     // don’t reveal which emails exist
}

function issueToken(user) {
  const token = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email } };  // never send the hash
}`, file: 'src/services/auth.service.js', hl: '5,12,18' }]
            ] }]
        },
        {
            kind: 'code', t: 'JWT + the Authorization header + protected API routes',
            b: [
                { html: `<div class="jwt"><span class="j1">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span><i>.</i><span class="j2">eyJ1c2VySWQiOjcsImlhdCI6MTc2MzIwMDgwMCwiZXhwIjoxNzYzODA1NjAwfQ</span><i>.</i><span class="j3">QKvTBfArAoJB3KBE_LkrwK8l80f8rHhCiaJnYd0kPuY</span></div>
                    <div class="jwt-parts">
                        <div style="--jc:#f87171"><b>Header</b><pre>{ "alg": "HS256", "typ": "JWT" }</pre><p>How it’s signed.</p></div>
                        <div style="--jc:#c084fc"><b>Payload</b><pre>{ "userId": 7, "iat": 1763200800, "exp": 1763805600 }</pre><p>Base64, <b>not encrypted</b>: no secrets inside!</p></div>
                        <div style="--jc:#22d3ee"><b>Signature</b><pre>HMAC-SHA256(header.payload, JWT_SECRET)</pre><p>Change one character → verification fails.</p></div>
                    </div>` },
                { cols: [
                    [{ code: `// imports: jwt from 'jsonwebtoken', env from '../config/env.js'
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);  // signature + exp
    req.user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}`, file: 'src/middlewares/auth.js', hl: '3,8-9' }],
                    [{ code: `// routes: every task route now needs a token
tasksRouter.use(requireAuth);

// controller: pass the user down
export async function list(req, res) {
  res.json(await taskService.list(req.user.id));
}

// service: only this user's tasks
export const list = (userId) =>
  prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });`, file: 'routes · controller · service', hl: '2,11' }]
                ] }
            ]
        }
    ]
});

DECK.chapters.push({
    n: 27, level: 6, icon: '🛡️', t: ['Frontend: token, header & protected pages'],
    sub: 'Store the token, send it automatically, guard the pages.',
    slides: [
        {
            kind: 'code', t: 'Frontend: login, store the token, attach it everywhere',
            b: [{ cols: [
                [{ code: `import { api } from '../api/axios';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return { token, isLoggedIn: !!token, login, logout };
}`, file: 'src/hooks/useAuth.ts (put it in a Context in a real app)', hl: '7-8' },
                 { warn: '<code>localStorage</code> is simple but readable by any injected script (XSS). <b>httpOnly cookies</b> are a common alternative.' }],
                [{ code: `// 1. every request: add the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// 2. every response: expired token → back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  },
);`, file: 'src/api/axios.ts', hl: '4,13-15' }]
            ] }]
        },
        {
            kind: 'code', t: 'Protected React pages (and why they are not enough)',
            b: [
                { cols: [
                    [{ code: `import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}`, file: 'src/components/ProtectedRoute.tsx', hl: '6' },
                     { code: `<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<TasksPage />} />
  </Route>
</Routes>`, file: 'src/App.tsx', hl: '3' }],
                    [{ code: `async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  try {
    await login(email, password);   // POST /api/auth/login
    navigate('/');                  // → protected page
  } catch (err) {
    setError(getErrorMessage(err)); // "Invalid email or password"
  }
}`, file: 'src/pages/LoginPage.tsx' },
                     { best: 'A protected <b>page</b> is UX: it hides screens from logged-out users. A protected <b>API route</b> is security: anyone can call your API with curl, skipping React entirely. You always need both, and only the backend check actually protects data.' }]
                ] }
            ]
        }
    ]
});
