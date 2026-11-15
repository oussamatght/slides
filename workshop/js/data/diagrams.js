/* Talk 04 diagrams — specs only; the animated SVG renderers live in express.js/deck/diagrams.js.
   flow: boxes + arrows (seq: true → one moving dot per step) · seq: sequence diagram. */
(function () {
    'use strict';
    const D = {};

    // Section 1 — the three parts of every web app
    D.trio = { type: 'flow', w: 860, h: 240, seq: true, nodes: [
        { id: 'f', x: 120, y: 120, w: 210, h: 100, i: '🖥️', t: 'Frontend', s: 'React · what users see', c: 'cyan' },
        { id: 'b', x: 430, y: 120, w: 210, h: 100, i: '⚙️', t: 'Backend', s: 'Express · rules & security', c: 'green' },
        { id: 'd', x: 740, y: 120, w: 210, h: 100, i: '🗄️', t: 'Database', s: 'PostgreSQL · memory', c: 'violet' }
    ], edges: [
        { a: 'f', b: 'b', off: -18, t: 'HTTP request', flow: true, step: 0, lo: [0, -46] },
        { a: 'b', b: 'd', off: -18, t: 'SQL (via Prisma)', step: 1, lo: [0, -46] },
        { a: 'd', b: 'b', off: 18, t: 'rows', step: 2, color: 'warm', lo: [0, 46] },
        { a: 'b', b: 'f', off: 18, t: 'JSON response', step: 3, color: 'warm', lo: [0, 46] }
    ] };

    // Section 2 — the full architecture with zones
    D.arch = { type: 'flow', w: 860, h: 310, seq: true, zones: [
        { x: 12, y: 30, w: 170, h: 255, t: 'Browser' },
        { x: 232, y: 30, w: 418, h: 255, t: 'Server (Node.js)' },
        { x: 700, y: 30, w: 150, h: 255, t: 'Database server' }
    ], nodes: [
        { id: 'r', x: 97, y: 160, w: 140, h: 86, i: '⚛️', t: 'React', s: 'UI + Axios', c: 'cyan' },
        { id: 'e', x: 325, y: 160, w: 150, h: 86, i: '🚂', t: 'Express API', s: 'routes · logic', c: 'green' },
        { id: 'p', x: 557, y: 160, w: 150, h: 86, i: '🔷', t: 'Prisma ORM', s: 'JS ↔ SQL' },
        { id: 'g', x: 775, y: 160, w: 120, h: 86, i: '🐘', t: 'PostgreSQL', s: 'tables', c: 'violet' }
    ], edges: [
        { a: 'r', b: 'e', off: -18, t: 'GET /api/tasks', flow: true, step: 0, lo: [0, -50] },
        { a: 'e', b: 'p', off: -18, t: 'task.findMany()', step: 1, lo: [0, -50] },
        { a: 'p', b: 'g', off: -18, t: 'SELECT …', step: 2, lo: [0, -50] },
        { a: 'g', b: 'p', off: 18, t: 'rows', step: 3, color: 'warm', lo: [0, 50] },
        { a: 'p', b: 'e', off: 18, t: 'Task[] objects', step: 4, color: 'warm', lo: [0, 50] },
        { a: 'e', b: 'r', off: 18, t: '200 · JSON', step: 5, color: 'warm', lo: [0, 50] }
    ] };

    // Section 2 — request / response lifecycle
    D.lifecycle = { type: 'seq', w: 860, gap: 37, actors: [
        { t: 'User', i: '🧑' }, { t: 'React + Axios', i: '⚛️', c: 'cyan' }, { t: 'Express', i: '🚂', c: 'green' }, { t: 'PostgreSQL', i: '🐘', c: 'violet' }
    ], msgs: [
        { a: 0, b: 1, t: 'clicks “Add task”' },
        { a: 1, b: 1, t: 'status = "saving"' },
        { a: 1, b: 2, t: 'POST /api/tasks {title}' },
        { a: 2, b: 2, t: 'middleware → controller → service' },
        { a: 2, b: 3, t: 'INSERT INTO "Task"' },
        { a: 3, b: 2, t: 'new row', back: true },
        { a: 2, b: 1, t: '201 Created + JSON', back: true },
        { a: 1, b: 1, t: 'setTasks([task, ...tasks])' },
        { a: 1, b: 0, t: 'UI re-renders ✓', back: true }
    ] };

    // Section 3 — UI states of an async request
    D.states = { type: 'flow', w: 860, h: 270, nodes: [
        { id: 'i', x: 95, y: 135, w: 150, h: 70, i: '💤', t: 'idle', s: 'nothing asked yet' },
        { id: 'l', x: 345, y: 135, w: 170, h: 70, i: '⏳', t: 'loading', s: 'spinner · disable buttons', c: 'warm' },
        { id: 's', x: 650, y: 55, w: 220, h: 70, i: '✅', t: 'success', s: 'render the data', c: 'green' },
        { id: 'e', x: 650, y: 215, w: 220, h: 70, i: '⚠️', t: 'error', s: 'message + Retry', c: 'red' }
    ], edges: [
        { a: 'i', b: 'l', t: 'request sent', flow: true, dur: 2.4 },
        { a: 'l', b: 's', t: '2xx', flow: true, dur: 2.4, delay: 1.2 },
        { a: 'l', b: 'e', t: '4xx · 5xx · offline', cls: 'red', dur: 2.4, delay: 1.8 },
        { a: 'e', b: 'l', t: 'retry', cls: 'dashed', curve: -60, dot: false, lo: [10, 18] }
    ] };

    // Section 4 — backend layers
    D.layers = { type: 'flow', w: 860, h: 410, seq: true, nodes: [
        { id: 'r', x: 360, y: 38, w: 330, h: 52, t: 'routes/', s: 'URL + method → which controller', c: 'cyan' },
        { id: 'm', x: 360, y: 114, w: 330, h: 52, t: 'middlewares/', s: 'validate · auth · errors' },
        { id: 'c', x: 360, y: 190, w: 330, h: 52, t: 'controllers/', s: 'read req → call service → send res' },
        { id: 's', x: 360, y: 266, w: 330, h: 52, t: 'services/', s: 'business rules', c: 'green' },
        { id: 'p', x: 360, y: 342, w: 330, h: 52, t: 'prisma/client.js', s: 'one PrismaClient → PostgreSQL', c: 'violet' },
        { id: 'h1', x: 720, y: 76, w: 210, h: 40, t: 'HTTP layer' },
        { id: 'h2', x: 720, y: 228, w: 210, h: 40, t: 'Business layer' },
        { id: 'h3', x: 720, y: 342, w: 210, h: 40, t: 'Data layer' }
    ], edges: [
        { a: 'r', b: 'm', step: 0, flow: true }, { a: 'm', b: 'c', step: 1, flow: true },
        { a: 'c', b: 's', step: 2, flow: true }, { a: 's', b: 'p', step: 3, flow: true },
        { a: 'p', b: 'r', pts: [[195, 342], [120, 342], [120, 38], [195, 38]], t: 'result → JSON', step: 4, color: 'warm', lo: [-40, 0] }
    ] };

    // Section 5 — the complete loop for "Add a task"
    const top = 72, bot = 232, W = 140;
    D.loop = { type: 'flow', w: 860, h: 300, seq: true, nodes: [
        { id: 'f', x: 90, y: top, w: W, h: 66, i: '📝', t: 'React form', c: 'cyan' },
        { id: 'a', x: 260, y: top, w: W, h: 66, i: '📡', t: 'Axios POST', c: 'cyan' },
        { id: 'r', x: 430, y: top, w: W, h: 66, i: '🧭', t: 'Route', c: 'green' },
        { id: 'm', x: 600, y: top, w: W, h: 66, i: '🧩', t: 'Middleware', c: 'green' },
        { id: 'c', x: 770, y: top, w: W, h: 66, i: '🎛️', t: 'Controller', c: 'green' },
        { id: 's', x: 770, y: bot, w: W, h: 66, i: '🧠', t: 'Service', c: 'green' },
        { id: 'p', x: 600, y: bot, w: W, h: 66, i: '🔷', t: 'Prisma', c: 'violet' },
        { id: 'g', x: 430, y: bot, w: W, h: 66, i: '🐘', t: 'PostgreSQL', c: 'violet' },
        { id: 'j', x: 260, y: bot, w: W, h: 66, i: '📦', t: 'JSON 201', c: 'warm' },
        { id: 'u', x: 90, y: bot, w: W, h: 66, i: '✨', t: 'UI update', c: 'cyan' }
    ], edges: [
        { a: 'f', b: 'a', step: 0, flow: true }, { a: 'a', b: 'r', step: 1, flow: true }, { a: 'r', b: 'm', step: 2, flow: true },
        { a: 'm', b: 'c', step: 3, flow: true }, { a: 'c', b: 's', step: 4, flow: true }, { a: 's', b: 'p', step: 5, flow: true },
        { a: 'p', b: 'g', step: 6, flow: true }, { a: 'g', b: 'j', step: 7, color: 'warm' }, { a: 'j', b: 'u', step: 8, color: 'warm' }
    ] };

    // Section 6 — where is the bug?
    D.debug = { type: 'flow', w: 860, h: 300, nodes: [
        { id: 'x', x: 95, y: 150, w: 160, h: 80, i: '💥', t: 'It doesn’t work', s: 'start here', c: 'red' },
        { id: 'n', x: 340, y: 150, w: 190, h: 80, i: '🔎', t: 'DevTools → Network', s: 'find the request', c: 'cyan' },
        { id: 'a', x: 690, y: 50, w: 290, h: 64, t: 'No request / (failed) / CORS', s: 'URL · server down · CORS config', c: 'red' },
        { id: 'b', x: 690, y: 150, w: 290, h: 64, t: '4xx — the request is wrong', s: 'compare with the API contract', c: 'warm' },
        { id: 'c', x: 690, y: 250, w: 290, h: 64, t: '5xx — the server crashed', s: 'read the backend terminal / logs', c: 'violet' }
    ], edges: [
        { a: 'x', b: 'n', flow: true, dur: 2 },
        { a: 'n', b: 'a', dur: 2.4, delay: .4, cls: 'red' },
        { a: 'n', b: 'b', dur: 2.4, delay: .8 },
        { a: 'n', b: 'c', dur: 2.4, delay: 1.2 }
    ] };

    // Section 7 — authentication lifecycle
    D.auth = { type: 'seq', w: 860, gap: 37, actors: [
        { t: 'User', i: '🧑' }, { t: 'React', i: '⚛️', c: 'cyan' }, { t: 'Express', i: '🚂', c: 'green' }, { t: 'PostgreSQL', i: '🐘', c: 'violet' }
    ], msgs: [
        { a: 0, b: 1, t: 'email + password' },
        { a: 1, b: 2, t: 'POST /api/auth/login' },
        { a: 2, b: 3, t: 'find user by email' },
        { a: 3, b: 2, t: 'user + password hash', back: true },
        { a: 2, b: 2, t: 'bcrypt.compare ✓ → jwt.sign' },
        { a: 2, b: 1, t: '200 { token, user }', back: true },
        { a: 1, b: 1, t: 'save token → go to /tasks' },
        { a: 1, b: 2, t: 'GET /api/tasks + Bearer token' },
        { a: 2, b: 2, t: 'requireAuth: jwt.verify ✓' },
        { a: 2, b: 3, t: 'tasks WHERE userId = 7' },
        { a: 3, b: 2, t: 'rows', back: true },
        { a: 2, b: 1, t: '200 [ …only my tasks ]', back: true }
    ] };

    // Section 8 — deployment on Render
    D.deploy = { type: 'flow', w: 860, h: 320, zones: [
        { x: 215, y: 102, w: 635, h: 210, t: 'Render' }
    ], nodes: [
        { id: 'lap', x: 95, y: 48, w: 150, h: 70, i: '💻', t: 'Your laptop', s: 'git push' },
        { id: 'gh', x: 95, y: 250, w: 150, h: 70, i: '🐙', t: 'GitHub', s: 'main branch' },
        { id: 'us', x: 560, y: 40, w: 170, h: 66, i: '🌍', t: 'Users', s: 'any browser' },
        { id: 'st', x: 345, y: 165, w: 170, h: 74, i: '🌐', t: 'Static Site', s: 'React build (dist/)', c: 'cyan' },
        { id: 'ws', x: 560, y: 165, w: 170, h: 74, i: '⚙️', t: 'Web Service', s: 'Express API', c: 'green' },
        { id: 'pg', x: 760, y: 165, w: 150, h: 74, i: '🐘', t: 'PostgreSQL', s: 'Render Postgres', c: 'violet' }
    ], edges: [
        { a: 'lap', b: 'gh', t: 'git push', flow: true, dur: 2.2, lo: [38, 0] },
        { a: 'gh', b: 'st', pts: [[170, 235], [345, 235], [345, 202]], t: 'auto-deploy', dur: 2.6, delay: .6, lo: [-128, 0] },
        { a: 'gh', b: 'ws', pts: [[170, 268], [560, 268], [560, 202]], dur: 2.6, delay: 1 },
        { a: 'us', b: 'st', t: 'HTML + JS', dur: 2.4, delay: .2 },
        { a: 'us', b: 'ws', t: 'API calls', flow: true, dur: 2.4, delay: 1.2, lo: [44, 0] },
        { a: 'ws', b: 'pg', t: 'DATABASE_URL', dur: 2, delay: .5, lo: [0, 58] }
    ] };

    // Section 9 — team git flow
    D.git = { type: 'flow', w: 860, h: 290, seq: true, nodes: [
        { id: 'm1', x: 90, y: 145, w: 140, h: 70, i: '🌿', t: 'main', s: 'always deployable' },
        { id: 'fe', x: 320, y: 60, w: 210, h: 70, i: '🖥️', t: 'feature/tasks-ui', s: 'frontend dev', c: 'cyan' },
        { id: 'be', x: 320, y: 230, w: 210, h: 70, i: '⚙️', t: 'feature/tasks-api', s: 'backend dev', c: 'green' },
        { id: 'pr', x: 565, y: 145, w: 180, h: 70, i: '🔍', t: 'Pull Request', s: 'review + checks', c: 'warm' },
        { id: 'm2', x: 770, y: 145, w: 150, h: 70, i: '🚀', t: 'main', s: 'Render deploys', c: 'violet' }
    ], edges: [
        { a: 'm1', b: 'fe', step: 0, t: 'branch' }, { a: 'm1', b: 'be', step: 0, t: 'branch' },
        { a: 'fe', b: 'pr', step: 1, t: 'push' }, { a: 'be', b: 'pr', step: 1, t: 'push' },
        { a: 'pr', b: 'm2', step: 2, t: 'merge', flow: true }
    ] };

    window.Diagrams.define(D);
})();
