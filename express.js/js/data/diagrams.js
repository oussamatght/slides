/* Express deck diagrams (specs only — renderers live in assets/deck/diagrams.js) */
(function () {
    'use strict';
    const D = {};

    D.http = { type: 'flow', w: 860, h: 230, seq: true, nodes: [
        { id: 'c', x: 110, y: 115, w: 170, h: 84, i: '💻', t: ['Client', 'العميل'], s: ['browser / app', 'متصفح / تطبيق'] },
        { id: 's', x: 430, y: 115, w: 190, h: 84, i: '🖥️', t: ['Express server', 'خادم Express'], s: 'Node.js', c: 'accent' },
        { id: 'd', x: 750, y: 115, w: 170, h: 84, i: '🗄️', t: ['Database', 'قاعدة البيانات'], s: 'MongoDB / SQL' }
    ], edges: [
        { a: 'c', b: 's', off: -16, t: 'GET /api/tasks', flow: true, step: 0 },
        { a: 's', b: 'd', off: -16, t: ['query', 'استعلام'], step: 1 },
        { a: 'd', b: 's', off: 16, t: ['rows', 'النتائج'], step: 2, color: 'warm' },
        { a: 's', b: 'c', off: 16, t: '200 OK · JSON', step: 3, color: 'warm' }
    ] };

    D.eventloop = { type: 'flow', w: 860, h: 320, seq: true, nodes: [
        { id: 'st', x: 160, y: 80, w: 220, h: 80, i: '📚', t: ['Call stack', 'مكدس الاستدعاء'], s: ['your JS runs here', 'هنا يُنفَّذ كودك'], c: 'cyan' },
        { id: 'api', x: 700, y: 80, w: 220, h: 80, i: '⚙️', t: 'libuv / OS', s: 'fs · net · timers' },
        { id: 'q', x: 700, y: 245, w: 220, h: 80, i: '📥', t: ['Callback queue', 'طابور الاستدعاءات'], s: ['finished tasks', 'المهام المنتهية'] },
        { id: 'el', x: 160, y: 245, w: 220, h: 80, i: '🔁', t: ['Event loop', 'حلقة الأحداث'], s: ['stack empty? → push', 'المكدس فارغ؟ ← ادفع'], c: 'accent' }
    ], edges: [
        { a: 'st', b: 'api', t: ['async call (readFile, fetch)', 'استدعاء غير متزامن'], flow: true, step: 0 },
        { a: 'api', b: 'q', t: ['done → callback', 'انتهى ← callback'], step: 1, lo: [70, 0] },
        { a: 'q', b: 'el', t: ['next task', 'المهمة التالية'], step: 2 },
        { a: 'el', b: 'st', t: ['run callback', 'نفّذ callback'], step: 3, color: 'warm', lo: [-62, 0] }
    ] };

    D.expressflow = { type: 'flow', w: 860, h: 260, seq: true, zones: [{ x: 205, y: 62, w: 630, h: 120, t: ['Express app', 'تطبيق Express'] }], nodes: [
        { id: 'c', x: 95, y: 128, w: 140, h: 70, i: '💻', t: ['Client', 'العميل'] },
        { id: 'm', x: 320, y: 128, w: 190, h: 70, i: '🧩', t: ['Middleware', 'الوسائط'], s: 'json · cors · auth' },
        { id: 'r', x: 530, y: 128, w: 170, h: 70, i: '🧭', t: ['Router', 'الموجّه'], s: 'GET /tasks' },
        { id: 'h', x: 735, y: 128, w: 170, h: 70, i: '⚡', t: ['Handler', 'المعالج'], s: '(req, res) => {}', c: 'accent' }
    ], edges: [
        { a: 'c', b: 'm', t: 'request', flow: true, step: 0 },
        { a: 'm', b: 'r', step: 1 },
        { a: 'r', b: 'h', step: 2 },
        { a: 'h', b: 'c', pts: [[735, 163], [735, 225], [95, 225], [95, 163]], t: 'res.json(data)', step: 3, color: 'warm' }
    ] };

    D.middleware = { type: 'flow', w: 860, h: 300, seq: true, nodes: [
        { id: 'rq', x: 70, y: 100, w: 110, h: 60, t: ['Request', 'الطلب'], c: 'cyan' },
        { id: 'lg', x: 230, y: 100, w: 140, h: 60, t: 'logger', s: 'next()' },
        { id: 'js', x: 400, y: 100, w: 150, h: 60, t: 'express.json()', s: 'next()' },
        { id: 'au', x: 570, y: 100, w: 140, h: 60, t: 'auth', s: 'next() | 401' },
        { id: 'hd', x: 755, y: 100, w: 170, h: 60, t: ['Route handler', 'معالج المسار'], s: 'res.json()', c: 'accent' },
        { id: 'rs', x: 755, y: 240, w: 170, h: 60, t: ['Response', 'الاستجابة'], c: 'cyan' },
        { id: 'er', x: 400, y: 240, w: 230, h: 60, t: ['Error handler', 'معالج الأخطاء'], s: '(err, req, res, next)', c: 'red' }
    ], edges: [
        { a: 'rq', b: 'lg', step: 0, flow: true },
        { a: 'lg', b: 'js', step: 1, flow: true },
        { a: 'js', b: 'au', step: 2, flow: true },
        { a: 'au', b: 'hd', step: 3, flow: true },
        { a: 'hd', b: 'rs', step: 4, color: 'warm' },
        { a: 'au', b: 'er', cls: 'dashed red', t: 'next(err)', dot: false, lo: [30, 0] },
        { a: 'er', b: 'rs', cls: 'red', t: '500 / 4xx', dot: false }
    ] };

    D.router = { type: 'flow', w: 860, h: 310, nodes: [
        { id: 'app', x: 110, y: 160, w: 160, h: 80, i: '🚀', t: 'app', s: 'app.js', c: 'accent' },
        { id: 'tr', x: 390, y: 90, w: 190, h: 64, t: '/api/tasks', s: 'tasksRouter', c: 'cyan' },
        { id: 'ur', x: 390, y: 235, w: 190, h: 64, t: '/api/users', s: 'usersRouter', c: 'violet' },
        { id: 'a', x: 700, y: 35, w: 210, h: 40, t: 'GET    /' },
        { id: 'b', x: 700, y: 90, w: 210, h: 40, t: 'POST   /' },
        { id: 'c', x: 700, y: 145, w: 210, h: 40, t: 'GET    /:id' },
        { id: 'd', x: 700, y: 210, w: 210, h: 40, t: 'POST   /register' },
        { id: 'e', x: 700, y: 265, w: 210, h: 40, t: 'GET    /me' }
    ], edges: [
        { a: 'app', b: 'tr', flow: true, t: 'app.use()', dur: 2 },
        { a: 'app', b: 'ur', flow: true, dur: 2, delay: 1 },
        { a: 'tr', b: 'a', dot: false }, { a: 'tr', b: 'b', dot: false }, { a: 'tr', b: 'c', dot: false },
        { a: 'ur', b: 'd', dot: false }, { a: 'ur', b: 'e', dot: false }
    ] };

    D.layers = { type: 'flow', w: 860, h: 400, seq: true, nodes: [
        { id: 'r', x: 430, y: 40, w: 320, h: 54, t: ['Routes', 'المسارات'], s: 'URL + method → controller', c: 'cyan' },
        { id: 'c', x: 430, y: 120, w: 320, h: 54, t: ['Controllers', 'المتحكمات'], s: 'req/res ↔ plain data' },
        { id: 's', x: 430, y: 200, w: 320, h: 54, t: ['Services', 'الخدمات'], s: ['business rules', 'قواعد العمل'], c: 'accent' },
        { id: 'm', x: 430, y: 280, w: 320, h: 54, t: ['Models / Repositories', 'النماذج / المستودعات'], s: ['data access', 'الوصول للبيانات'] },
        { id: 'd', x: 430, y: 360, w: 320, h: 54, i: '🗄️', t: ['Database', 'قاعدة البيانات'], c: 'violet' },
        { id: 'l1', x: 740, y: 80, w: 170, h: 40, t: ['HTTP layer', 'طبقة HTTP'] },
        { id: 'l2', x: 740, y: 200, w: 170, h: 40, t: ['Business layer', 'طبقة المنطق'] },
        { id: 'l3', x: 740, y: 320, w: 170, h: 40, t: ['Data layer', 'طبقة البيانات'] }
    ], edges: [
        { a: 'r', b: 'c', step: 0, flow: true }, { a: 'c', b: 's', step: 1, flow: true },
        { a: 's', b: 'm', step: 2, flow: true }, { a: 'm', b: 'd', step: 3, flow: true },
        { a: 'd', b: 'r', pts: [[270, 360], [190, 360], [190, 40], [270, 40]], t: ['result', 'النتيجة'], step: 4, color: 'warm' }
    ] };

    D.mvc = { type: 'flow', w: 860, h: 300, seq: true, nodes: [
        { id: 'b', x: 100, y: 150, w: 160, h: 80, i: '🌐', t: ['Browser', 'المتصفح'] },
        { id: 'c', x: 380, y: 150, w: 190, h: 80, i: '🎛️', t: ['Controller', 'المتحكم'], s: 'routes/tasks.js', c: 'accent' },
        { id: 'm', x: 690, y: 65, w: 190, h: 74, i: '📦', t: ['Model', 'النموذج'], s: 'Task.find()' },
        { id: 'v', x: 690, y: 235, w: 190, h: 74, i: '🎨', t: ['View', 'العرض'], s: 'views/tasks.ejs', c: 'violet' }
    ], edges: [
        { a: 'b', b: 'c', t: 'GET /tasks', step: 0, flow: true },
        { a: 'c', b: 'm', off: -8, t: ['query', 'استعلام'], step: 1 },
        { a: 'm', b: 'c', off: 8, step: 2, color: 'warm' },
        { a: 'c', b: 'v', t: 'res.render()', step: 3 },
        { a: 'v', b: 'b', curve: -60, t: 'HTML', step: 4, color: 'warm' }
    ] };

    D.auth = { type: 'seq', gap: 35, actors: [
        { t: ['Client', 'العميل'], i: '💻' }, { t: 'Express API', i: '🛡️', c: 'accent' }, { t: ['Database', 'قاعدة البيانات'], i: '🗄️' }
    ], msgs: [
        { a: 0, b: 1, t: 'POST /auth/login {email, password}' },
        { a: 1, b: 2, t: ['find user by email', 'ابحث عن المستخدم'] },
        { a: 2, b: 1, t: 'user + passwordHash', back: true },
        { a: 1, b: 1, t: 'bcrypt.compare ✓ → sign JWTs' },
        { a: 1, b: 0, t: '200 { accessToken } + Set-Cookie: refresh (httpOnly)', back: true },
        { a: 0, b: 1, t: 'GET /tasks · Authorization: Bearer <access>' },
        { a: 1, b: 1, t: 'jwt.verify ✓' },
        { a: 1, b: 0, t: '200 [ tasks ]', back: true },
        { a: 0, b: 1, t: ['POST /auth/refresh (cookie) · after 15 min', 'POST /auth/refresh (cookie) · بعد 15 دقيقة'] },
        { a: 1, b: 0, t: '200 { new accessToken }', back: true }
    ] };

    D.cache = { type: 'flow', w: 860, h: 300, seq: true, nodes: [
        { id: 'c', x: 90, y: 150, w: 140, h: 70, i: '💻', t: ['Client', 'العميل'] },
        { id: 'a', x: 340, y: 150, w: 170, h: 80, i: '⚡', t: 'Express API', c: 'accent' },
        { id: 'r', x: 680, y: 60, w: 200, h: 74, i: '🧠', t: 'Redis', s: ['cache (TTL)', 'ذاكرة مؤقتة'], c: 'pink' },
        { id: 'd', x: 680, y: 240, w: 200, h: 74, i: '🗄️', t: ['Database', 'قاعدة البيانات'] }
    ], edges: [
        { a: 'c', b: 'a', off: -10, t: 'GET /tasks', step: 0, flow: true },
        { a: 'a', b: 'r', off: -10, t: 'GET key', step: 1 },
        { a: 'r', b: 'a', off: 10, t: ['miss', 'غير موجود'], step: 2, color: 'red' },
        { a: 'a', b: 'd', off: -10, t: ['query', 'استعلام'], step: 3 },
        { a: 'd', b: 'a', off: 10, t: ['rows', 'النتائج'], step: 4, color: 'warm' },
        { a: 'a', b: 'r', curve: 50, t: 'SET key EX 60', step: 5 },
        { a: 'a', b: 'c', off: 10, t: '200', step: 6, color: 'warm' }
    ] };

    D.queue = { type: 'flow', w: 860, h: 300, seq: true, nodes: [
        { id: 'a', x: 100, y: 150, w: 170, h: 84, i: '⚡', t: 'API', s: ['202 Accepted (fast)', '202 بسرعة'], c: 'accent' },
        { id: 'q', x: 360, y: 150, w: 180, h: 84, i: '📬', t: ['Queue', 'الطابور'], s: 'BullMQ · Redis', c: 'pink' },
        { id: 'w1', x: 590, y: 75, w: 150, h: 60, t: 'Worker 1' },
        { id: 'w2', x: 590, y: 225, w: 150, h: 60, t: 'Worker 2' },
        { id: 'm', x: 780, y: 150, w: 130, h: 84, i: '✉️', t: 'SMTP', s: ['emails', 'رسائل'], c: 'violet' }
    ], edges: [
        { a: 'a', b: 'q', t: 'queue.add()', step: 0, flow: true },
        { a: 'q', b: 'w1', step: 1 }, { a: 'q', b: 'w2', step: 1 },
        { a: 'w1', b: 'm', step: 2, color: 'warm' }, { a: 'w2', b: 'm', step: 2, color: 'warm' }
    ] };

    D.realtime = { type: 'flow', w: 860, h: 330, zones: [
        { x: 10, y: 8, w: 840, h: 92, t: 'Polling' }, { x: 10, y: 118, w: 840, h: 92, t: 'SSE' }, { x: 10, y: 228, w: 840, h: 92, t: 'WebSocket' }
    ], nodes: [
        { id: 'c1', x: 130, y: 58, w: 150, h: 50, t: ['Client', 'العميل'] }, { id: 's1', x: 730, y: 58, w: 150, h: 50, t: ['Server', 'الخادم'] },
        { id: 'c2', x: 130, y: 168, w: 150, h: 50, t: ['Client', 'العميل'] }, { id: 's2', x: 730, y: 168, w: 150, h: 50, t: ['Server', 'الخادم'], c: 'accent' },
        { id: 'c3', x: 130, y: 278, w: 150, h: 50, t: ['Client', 'العميل'] }, { id: 's3', x: 730, y: 278, w: 150, h: 50, t: ['Server', 'الخادم'], c: 'violet' }
    ], edges: [
        { a: 'c1', b: 's1', off: -9, t: ['GET /updates every 5s', 'GET كل 5 ثوانٍ'], dur: 2.6 },
        { a: 's1', b: 'c1', off: 9, t: ['"nothing new"', '"لا جديد"'], dur: 2.6, delay: 1.3, color: 'warm' },
        { a: 's2', b: 'c2', t: ['one-way stream: data: …', 'تدفق باتجاه واحد'], dur: 1.4, flow: true, color: 'warm' },
        { a: 'c3', b: 's3', off: -9, t: 'emit("chat")', dur: 1.6, flow: true },
        { a: 's3', b: 'c3', off: 9, t: ['two-way, full duplex', 'اتجاهين في نفس الوقت'], dur: 1.6, delay: .8, flow: true, color: 'warm' }
    ] };

    D.cluster = { type: 'flow', w: 860, h: 330, nodes: [
        { id: 'p', x: 140, y: 165, w: 200, h: 84, i: '👑', t: ['Primary', 'العملية الرئيسية'], s: 'node:cluster', c: 'violet' },
        { id: 'w1', x: 450, y: 45, w: 170, h: 52, t: 'Worker 1', s: ':3000' },
        { id: 'w2', x: 450, y: 125, w: 170, h: 52, t: 'Worker 2', s: ':3000' },
        { id: 'w3', x: 450, y: 205, w: 170, h: 52, t: 'Worker 3', s: ':3000' },
        { id: 'w4', x: 450, y: 285, w: 170, h: 52, t: 'Worker 4', s: ':3000' },
        { id: 'rq', x: 745, y: 165, w: 180, h: 84, i: '🌍', t: ['Requests', 'الطلبات'], s: ['shared port', 'منفذ مشترك'], c: 'cyan' }
    ], edges: [
        { a: 'p', b: 'w1', cls: 'dashed', dot: false, t: 'fork()' }, { a: 'p', b: 'w2', cls: 'dashed', dot: false },
        { a: 'p', b: 'w3', cls: 'dashed', dot: false }, { a: 'p', b: 'w4', cls: 'dashed', dot: false },
        { a: 'rq', b: 'w1', dur: 1.8 }, { a: 'rq', b: 'w2', dur: 1.8, delay: .45 }, { a: 'rq', b: 'w3', dur: 1.8, delay: .9 }, { a: 'rq', b: 'w4', dur: 1.8, delay: 1.35 }
    ] };

    D.micro = { type: 'flow', w: 860, h: 340, nodes: [
        { id: 'c', x: 75, y: 170, w: 120, h: 70, i: '📱', t: ['Clients', 'العملاء'] },
        { id: 'g', x: 270, y: 170, w: 190, h: 90, i: '🚪', t: 'API Gateway', s: 'auth · rate limit · routing', c: 'accent' },
        { id: 'u', x: 510, y: 55, w: 170, h: 60, t: 'users-service' },
        { id: 't', x: 510, y: 170, w: 170, h: 60, t: 'tasks-service', c: 'cyan' },
        { id: 'n', x: 510, y: 285, w: 170, h: 60, t: 'notify-service', c: 'violet' },
        { id: 'udb', x: 755, y: 55, w: 150, h: 50, i: '🗄️', t: 'users DB' },
        { id: 'b', x: 755, y: 228, w: 150, h: 84, i: '📨', t: ['Broker', 'الوسيط'], s: 'RabbitMQ / Kafka', c: 'pink' }
    ], edges: [
        { a: 'c', b: 'g', flow: true, dur: 1.8 },
        { a: 'g', b: 'u', dur: 2.2 }, { a: 'g', b: 't', dur: 2.2, delay: .7 },
        { a: 'u', b: 'udb', dot: false },
        { a: 't', b: 'b', t: 'task.created', dur: 2.2, delay: 1.2, color: 'warm' },
        { a: 'b', b: 'n', t: ['consume', 'استهلاك'], dur: 2.2, delay: 2, color: 'warm' }
    ] };

    D.docker = { type: 'flow', w: 860, h: 360, seq: true, zones: [
        { x: 20, y: 10, w: 360, h: 330, t: ['Stage 1 · build', 'المرحلة 1 · البناء'] },
        { x: 480, y: 10, w: 360, h: 330, t: ['Stage 2 · runtime (shipped)', 'المرحلة 2 · التشغيل (المنشورة)'] }
    ], nodes: [
        { id: 'a1', x: 200, y: 80, w: 260, h: 50, t: 'FROM node:22-alpine AS build' },
        { id: 'a2', x: 200, y: 160, w: 260, h: 50, t: 'npm ci  (+ devDeps)' },
        { id: 'a3', x: 200, y: 240, w: 260, h: 50, t: 'npm run build → dist/' },
        { id: 'b1', x: 660, y: 80, w: 260, h: 50, t: 'FROM node:22-alpine' },
        { id: 'b2', x: 660, y: 160, w: 260, h: 50, t: 'npm ci --omit=dev' },
        { id: 'b3', x: 660, y: 240, w: 260, h: 50, t: 'COPY --from=build dist', c: 'accent' },
        { id: 'img', x: 660, y: 310, w: 260, h: 40, t: ['🐳 small, secure image', '🐳 صورة صغيرة وآمنة'], c: 'cyan' }
    ], edges: [
        { a: 'a1', b: 'a2', step: 0 }, { a: 'a2', b: 'a3', step: 1 },
        { a: 'b1', b: 'b2', step: 0 },
        { a: 'a3', b: 'b3', t: 'dist/', step: 2, flow: true, color: 'warm' },
        { a: 'b3', b: 'img', step: 3 }
    ] };

    D.cicd = { type: 'flow', w: 860, h: 230, seq: true, zones: [{ x: 150, y: 30, w: 700, h: 110, t: 'GitHub Actions' }], nodes: [
        { id: 'p', x: 75, y: 85, w: 120, h: 60, i: '⬆️', t: 'git push' },
        { id: 'l', x: 225, y: 85, w: 115, h: 60, t: 'lint', s: 'eslint' },
        { id: 't', x: 360, y: 85, w: 115, h: 60, t: 'test', s: 'vitest', c: 'accent' },
        { id: 'b', x: 495, y: 85, w: 115, h: 60, t: 'build', s: 'tsc' },
        { id: 'i', x: 640, y: 85, w: 135, h: 60, t: 'docker push', s: 'ghcr.io', c: 'cyan' },
        { id: 'd', x: 785, y: 85, w: 110, h: 60, t: 'deploy', s: '🚀', c: 'violet' },
        { id: 'x', x: 360, y: 195, w: 200, h: 44, t: ['❌ PR blocked', '❌ إيقاف الدمج'], c: 'red' }
    ], edges: [
        { a: 'p', b: 'l', step: 0, flow: true }, { a: 'l', b: 't', step: 1, flow: true }, { a: 't', b: 'b', step: 2, flow: true },
        { a: 'b', b: 'i', step: 3, flow: true }, { a: 'i', b: 'd', step: 4, flow: true },
        { a: 't', b: 'x', cls: 'dashed red', dot: false, t: ['fail', 'فشل'], lo: [26, 0] }
    ] };

    D.deploy = { type: 'flow', w: 860, h: 320, seq: true, zones: [{ x: 440, y: 18, w: 200, h: 290, t: 'PM2' }], nodes: [
        { id: 'u', x: 75, y: 160, w: 120, h: 80, i: '👩‍💻', t: ['Users', 'المستخدمون'] },
        { id: 'n', x: 290, y: 160, w: 180, h: 90, i: '🛡️', t: 'Nginx', s: ':443 TLS · proxy', c: 'accent' },
        { id: 'a', x: 540, y: 80, w: 160, h: 50, t: 'node :3000' },
        { id: 'b', x: 540, y: 160, w: 160, h: 50, t: 'node :3001' },
        { id: 'c', x: 540, y: 240, w: 160, h: 50, t: 'node :3002' },
        { id: 'pg', x: 765, y: 100, w: 150, h: 64, i: '🐘', t: 'PostgreSQL', c: 'violet' },
        { id: 'rd', x: 765, y: 225, w: 150, h: 64, i: '🧠', t: 'Redis', c: 'pink' }
    ], edges: [
        { a: 'u', b: 'n', t: 'HTTPS', step: 0, flow: true },
        { a: 'n', b: 'a', step: 1 }, { a: 'n', b: 'b', step: 1, t: 'proxy_pass' }, { a: 'n', b: 'c', step: 1 },
        { a: 'b', b: 'pg', step: 2, color: 'warm' }, { a: 'b', b: 'rd', step: 2, color: 'warm' }
    ] };

    D.observe = { type: 'flow', w: 860, h: 340, seq: true, nodes: [
        { id: 'a', x: 130, y: 170, w: 210, h: 90, i: '⚡', t: ['Express app', 'تطبيق Express'], s: 'pino · prom-client · OTel', c: 'accent' },
        { id: 'l', x: 470, y: 45, w: 210, h: 54, t: ['📜 Logs', '📜 السجلات'], s: 'Loki / ELK' },
        { id: 'm', x: 470, y: 130, w: 210, h: 54, t: ['📈 Metrics', '📈 المقاييس'], s: 'Prometheus' },
        { id: 't', x: 470, y: 215, w: 210, h: 54, t: ['🧵 Traces', '🧵 التتبع'], s: 'OTel → Tempo / Jaeger' },
        { id: 'e', x: 470, y: 300, w: 210, h: 54, t: ['🐞 Errors', '🐞 الأخطاء'], s: 'Sentry', c: 'red' },
        { id: 'g', x: 765, y: 150, w: 160, h: 90, i: '📊', t: 'Grafana', s: ['dashboards · alerts', 'لوحات · تنبيهات'], c: 'violet' }
    ], edges: [
        { a: 'a', b: 'l', step: 0 }, { a: 'a', b: 'm', step: 0 }, { a: 'a', b: 't', step: 0 }, { a: 'a', b: 'e', step: 0 },
        { a: 'l', b: 'g', step: 1, color: 'warm' }, { a: 'm', b: 'g', step: 1, color: 'warm' }, { a: 't', b: 'g', step: 1, color: 'warm' }
    ] };

    D.oauth = { type: 'seq', gap: 34, actors: [
        { t: ['Browser', 'المتصفح'], i: '🌐' }, { t: ['Your API', 'خادمك'], i: '⚡', c: 'accent' }, { t: 'Google (IdP)', i: '🔐', c: 'violet' }
    ], msgs: [
        { a: 0, b: 1, t: 'GET /auth/google' },
        { a: 1, b: 0, t: '302 → Google (client_id, state, PKCE challenge)', back: true },
        { a: 0, b: 2, t: ['user signs in + consents', 'المستخدم يسجّل ويوافق'] },
        { a: 2, b: 0, t: '302 → /auth/google/callback?code&state', back: true },
        { a: 0, b: 1, t: 'GET /callback?code=…' },
        { a: 1, b: 2, t: 'POST /token (code + verifier)' },
        { a: 2, b: 1, t: 'id_token + access_token', back: true },
        { a: 1, b: 1, t: ['verify id_token · upsert user', 'تحقق · أنشئ المستخدم'] },
        { a: 1, b: 0, t: ['session cookie / JWT ✓', 'جلسة / JWT ✓'], back: true }
    ] };

    D.circuit = { type: 'flow', w: 860, h: 350, nodes: [
        { id: 'c', x: 150, y: 120, w: 200, h: 84, i: '✅', t: ['Closed', 'مغلق'], s: ['requests pass', 'الطلبات تمر'], c: 'accent' },
        { id: 'o', x: 710, y: 120, w: 200, h: 84, i: '⛔', t: ['Open', 'مفتوح'], s: ['fail fast', 'فشل فوري'], c: 'red' },
        { id: 'h', x: 430, y: 285, w: 220, h: 84, i: '🧪', t: ['Half-open', 'نصف مفتوح'], s: ['one trial request', 'طلب تجريبي واحد'], c: 'warm' }
    ], edges: [
        { a: 'c', b: 'o', curve: 50, t: ['failures ≥ threshold', 'الأخطاء ≥ الحد'], dur: 3, color: 'red' },
        { a: 'o', b: 'h', t: ['after resetTimeout', 'بعد المهلة'], dur: 3, delay: 1 },
        { a: 'h', b: 'c', t: ['success', 'نجاح'], dur: 3, delay: 2 },
        { a: 'h', b: 'o', curve: 40, cls: 'red', t: ['failure', 'فشل'], dot: false }
    ] };

    D.onion = { type: 'onion', rings: [
        { t: ['Frameworks & drivers', 'الأطر والمشغلات'], s: 'Express · Mongoose · Redis' },
        { t: ['Interface adapters', 'المحوّلات'], s: 'controllers · repositories' },
        { t: ['Use cases', 'حالات الاستخدام'], s: 'services' },
        { t: ['Entities', 'الكيانات'], s: ['domain rules', 'قواعد المجال'] }
    ], inward: ['Dependencies point inward', 'التبعيات تتجه للداخل'], notes: [
        ['Inner layers never import Express', 'الطبقات الداخلية لا تستورد Express'],
        ['Swap DB without touching services', 'غيّر قاعدة البيانات دون لمس الخدمات'],
        ['Test use cases with fake repos', 'اختبر الحالات بمستودعات وهمية'],
        ['Composition root wires everything', 'نقطة التركيب تربط كل شيء']
    ] };

    D.capstone = { type: 'flow', w: 860, h: 380, zones: [{ x: 175, y: 14, w: 675, h: 356, t: 'docker compose' }], nodes: [
        { id: 'c', x: 80, y: 190, w: 130, h: 80, i: '📱', t: ['Clients', 'العملاء'] },
        { id: 'n', x: 270, y: 190, w: 130, h: 80, i: '🛡️', t: 'Nginx', s: 'TLS', c: 'cyan' },
        { id: 'a', x: 480, y: 190, w: 200, h: 100, i: '⚡', t: 'Tasky API', s: 'Express 5 · TS · Zod', c: 'accent' },
        { id: 'p', x: 750, y: 60, w: 160, h: 56, t: '🐘 PostgreSQL', c: 'violet' },
        { id: 'r', x: 750, y: 145, w: 160, h: 56, t: '🧠 Redis', c: 'pink' },
        { id: 'w', x: 750, y: 230, w: 160, h: 56, t: ['⚙️ Worker', '⚙️ عامل'], s: 'BullMQ' },
        { id: 'o', x: 750, y: 320, w: 160, h: 56, t: ['📊 Observability', '📊 المراقبة'], s: 'pino · OTel · Sentry' }
    ], edges: [
        { a: 'c', b: 'n', flow: true, dur: 1.6 }, { a: 'n', b: 'a', flow: true, dur: 1.6, delay: .5 },
        { a: 'a', b: 'p', dur: 2, delay: 1 }, { a: 'a', b: 'r', dur: 2, delay: 1.2 },
        { a: 'r', b: 'w', dot: false, cls: 'dashed', t: ['jobs', 'مهام'] }, { a: 'a', b: 'o', dot: false, cls: 'dashed' }
    ] };

    window.Diagrams.define(D);
})();
