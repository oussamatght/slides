/* Level 1 — Beginner (chapters 5–12) */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 5, level: 1, icon: '⚡',
    t: ['What is Express.js?', 'ما هو Express.js؟'],
    sub: ['A minimal web framework for Node — and how it compares to the alternatives', 'إطار ويب خفيف لـ Node — ومقارنته بالبدائل'],
    learn: [
        ['Describe what Express adds on top of Node’s http module', 'صف ما يضيفه Express فوق وحدة http في Node'],
        ['Compare Express with Fastify, NestJS and Koa', 'قارن Express مع Fastify و NestJS و Koa'],
        ['Know when Express is the right choice', 'اعرف متى يكون Express الخيار الصحيح']
    ],
    slides: [
        {
            kind: 'concept', t: ['Express = routing + middleware + helpers', 'Express = توجيه + وسائط + أدوات مساعدة'],
            b: [
                { diagram: 'expressflow', cap: ['Every request travels through a pipeline of middleware until a route handler sends the response.', 'كل طلب يمر عبر سلسلة من الوسائط حتى يرسل معالج المسار الاستجابة.'] },
                { cards: [
                    { i: '🧭', t: ['Routing', 'التوجيه'], d: ['<code>app.get(\'/tasks/:id\')</code> — params, query, methods.', '<code>app.get(\'/tasks/:id\')</code> — معاملات، استعلام، طرق.'] },
                    { i: '🧩', t: ['Middleware', 'الوسائط'], d: ['Plug-in functions: JSON parsing, auth, logging, CORS…', 'دوال قابلة للتركيب: قراءة JSON، مصادقة، سجلات، CORS…'] },
                    { i: '🛠️', t: ['Helpers', 'أدوات مساعدة'], d: ['<code>res.json()</code>, <code>res.status()</code>, <code>req.get()</code>, cookies, redirects, static files.', '<code>res.json()</code> و <code>res.status()</code> و <code>req.get()</code> والكوكيز والتحويل والملفات الثابتة.'] },
                    { i: '🌍', t: ['Ecosystem', 'المنظومة'], d: ['Since 2010, the most used Node framework — thousands of middleware packages.', 'منذ 2010، الإطار الأكثر استخدامًا في Node — آلاف حزم الوسائط.'] }
                ] }
            ]
        },
        {
            kind: 'code', t: ['Same server: plain Node vs Express', 'نفس الخادم: Node خام مقابل Express'],
            b: [
                { cols: [
                    [{ code: `import http from 'node:http';

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\\/hello\\/(\\w+)$/);
  if (req.method === 'GET' && m) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ hello: m[1] }));
  }
  res.writeHead(404).end();
}).listen(3000);`, file: 'plain-node.js' }],
                    [{ code: `import express from 'express';

const app = express();

app.get('/hello/:name', (req, res) => {
  res.json({ hello: req.params.name });
});

app.listen(3000);`, file: 'express.js', hl: '5-7' },
                     { term: 'curl localhost:3000/hello/Sara', out: '{"hello":"Sara"}' }]
                ] },
                { tip: ['Express is “unopinionated”: it does not force a folder structure, ORM or style. Freedom — and responsibility. Chapters 12 and 28 give you a proven structure.', 'Express "غير مقيِّد": لا يفرض هيكلة مجلدات أو ORM أو أسلوبًا. حرية — ومسؤولية. الفصلان 12 و 28 يقدمان لك هيكلة مجرّبة.'] }
            ]
        },
        {
            kind: 'concept', t: ['Express vs Fastify vs NestJS vs Koa', 'Express مقابل Fastify و NestJS و Koa'],
            b: [
                { table: { h: ['', 'Express', 'Fastify', 'NestJS', 'Koa'], r: [
                    [['Style', 'الأسلوب'], ['Minimal, flexible', 'خفيف ومرن'], ['Fast, schema-based', 'سريع ويعتمد المخططات'], ['Opinionated, Angular-like, DI', 'مقيِّد، يشبه Angular، حقن التبعيات'], ['Minimal, async-first', 'خفيف، غير متزامن أولًا']],
                    [['Performance', 'الأداء'], ['Good', 'جيد'], ['Excellent', 'ممتاز'], ['Good (runs on Express or Fastify)', 'جيد (يعمل فوق Express أو Fastify)'], ['Good', 'جيد']],
                    [['Learning curve', 'منحنى التعلم'], ['⭐ easy', '⭐ سهل'], ['⭐⭐', '⭐⭐'], ['⭐⭐⭐⭐', '⭐⭐⭐⭐'], ['⭐⭐', '⭐⭐']],
                    [['TypeScript', 'TypeScript'], ['Via @types', 'عبر ‎@types'], ['Built-in types', 'أنواع مدمجة'], ['TS-first', 'TS أولًا'], ['Via @types', 'عبر ‎@types']],
                    [['Best for', 'الأفضل لـ'], ['Learning, MVPs, most APIs', 'التعلم، النماذج الأولى، معظم الواجهات'], ['High-throughput services', 'خدمات عالية الحمل'], ['Large teams, enterprise', 'فرق كبيرة، مؤسسات'], ['Custom lightweight stacks', 'بنى خفيفة مخصصة']]
                ] } },
                { best: ['Learn Express first: its concepts (routing, middleware, req/res) transfer directly to every other Node framework.', 'تعلّم Express أولًا: مفاهيمه (التوجيه، الوسائط، req/res) تنتقل مباشرة إلى كل أطر Node الأخرى.'] }
            ]
        },
        {
            kind: 'exercise', t: ['Your first Express endpoint', 'أول نقطة نهاية في Express'],
            b: [{ tasks: [
                ['Run <code>npm init -y && npm pkg set type=module && npm i express</code>.', 'نفّذ <code>npm init -y && npm pkg set type=module && npm i express</code>.'],
                ['Copy the Express version of the hello server and run it.', 'انسخ نسخة Express من خادم hello وشغّله.'],
                ['Add <code>GET /time</code> returning <code>{ now: new Date().toISOString() }</code>.', 'أضف <code>GET /time</code> يعيد <code>{ now: new Date().toISOString() }</code>.'],
                ['Count the lines saved compared to the plain Node version.', 'احسب عدد الأسطر الموفرة مقارنة بنسخة Node الخام.']
            ], time: 8 }]
        }
    ],
    quiz: [
        { q: ['Express is best described as…', 'أفضل وصف لـ Express هو…'], o: [['A database', 'قاعدة بيانات'], ['A minimal web framework for Node.js', 'إطار ويب خفيف لـ Node.js'], ['A frontend library', 'مكتبة واجهات أمامية'], ['A JavaScript runtime', 'بيئة تشغيل JavaScript']], a: 1, e: ['It sits on top of Node’s http module and adds routing, middleware and helpers.', 'يعمل فوق وحدة http ويضيف التوجيه والوسائط والأدوات المساعدة.'] },
        { tf: true, q: ['Express does not force a specific folder structure or ORM.', 'لا يفرض Express هيكلة مجلدات أو ORM معينًا.'], e: ['It is unopinionated — you choose your architecture.', 'إنه غير مقيِّد — أنت تختار المعمارية.'] },
        { q: ['Which framework is opinionated and uses dependency injection by default?', 'أي إطار مقيِّد ويستخدم حقن التبعيات افتراضيًا؟'], o: ['Express', 'Koa', 'NestJS', 'http'], a: 2, e: ['NestJS provides modules, decorators and DI out of the box.', 'NestJS يوفر الوحدات والمزخرفات وحقن التبعيات جاهزة.'] },
        { out: true, q: ['What does <code>GET /hello/Ali</code> return?', 'ماذا يعيد <code>GET /hello/Ali</code>؟'], code: `app.get('/hello/:name', (req, res) => {\n  res.json({ hi: req.params.name.toUpperCase() });\n});`, o: ['`{"hi":"Ali"}`', '`{"hi":"ALI"}`', '`{"name":"Ali"}`', '`404`'], a: 1, e: ['req.params.name is "Ali", uppercased → "ALI".', 'قيمة req.params.name هي "Ali" وبعد التحويل ← "ALI".'] }
    ]
});

DECK.chapters.push({
    n: 6, level: 1, icon: '🛠️',
    t: ['Setup & first server', 'الإعداد وأول خادم'],
    sub: ['express(), app.listen, auto-restart with nodemon / node --watch, .env with dotenv', 'express() و app.listen وإعادة التشغيل التلقائي بـ nodemon / node --watch و ‎.env مع dotenv'],
    project: ['Tasky is born: a server on port 3000 that reads its config from <code>.env</code>.', 'وُلد Tasky: خادم على المنفذ 3000 يقرأ إعداداته من <code>.env</code>.'],
    learn: [
        ['Scaffold a professional Express project', 'أنشئ مشروع Express احترافيًا'],
        ['Restart automatically on save', 'أعد التشغيل تلقائيًا عند الحفظ'],
        ['Keep configuration and secrets in environment variables', 'احفظ الإعدادات والأسرار في متغيرات البيئة']
    ],
    slides: [
        {
            kind: 'code', t: ['Create the Tasky project', 'أنشئ مشروع Tasky'],
            b: [
                { cols: [
                    [{ term: `mkdir tasky-api && cd tasky-api
npm init -y
npm pkg set type=module
npm install express dotenv
npm install -D nodemon` },
                     { tree: `tasky-api/
├── src/
│   └── server.js
├── .env            # never committed
├── .env.example    # committed, no real secrets
├── .gitignore
└── package.json` }],
                    [{ code: `import 'dotenv/config';            // loads .env into process.env
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Tasky API is running 🚀');
});

app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});`, file: 'src/server.js', hl: '1,5,11-13', x: 'setup' },
                     { code: `PORT=3000
NODE_ENV=development
APP_NAME=Tasky`, file: '.env' }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Scripts: nodemon or node --watch', 'السكربتات: nodemon أو node --watch'],
            b: [
                { cols: [
                    [{ code: `{
  "name": "tasky-api",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "dev:native": "node --watch --env-file=.env src/server.js"
  },
  "dependencies": {
    "dotenv": "^17.0.0",
    "express": "^5.1.0"
  },
  "devDependencies": { "nodemon": "^3.1.0" }
}`, file: 'package.json', hl: '5-7' }],
                    [{ term: 'npm run dev', out: `[nodemon] starting \`node src/server.js\`
Server listening on http://localhost:3000` },
                     { term: 'curl localhost:3000', out: 'Tasky API is running 🚀' },
                     { tip: ['Modern Node can do both jobs alone: <code>--watch</code> restarts on change and <code>--env-file=.env</code> loads variables — zero dependencies. Use <code>dotenv</code> when you need to support older setups.', 'Node الحديث يقوم بالمهمتين وحده: <code>--watch</code> يعيد التشغيل عند التغيير و <code>--env-file=.env</code> يحمّل المتغيرات — بلا تبعيات. استخدم <code>dotenv</code> لدعم البيئات القديمة.'] }]
                ] }
            ]
        },
        {
            kind: 'concept', t: ['Environment variables done right', 'متغيرات البيئة بالطريقة الصحيحة'],
            b: [
                { cols: [
                    [{ ul: [
                        ['Config that changes between machines (port, DB URL, secrets) lives in the <b>environment</b>, not in code.', 'الإعدادات التي تتغير بين الأجهزة (المنفذ، رابط قاعدة البيانات، الأسرار) تعيش في <b>البيئة</b> وليس في الكود.'],
                        ['<code>.env</code> is for local development only. In production, the platform injects variables.', '<code>.env</code> للتطوير المحلي فقط. في الإنتاج تقوم المنصة بحقن المتغيرات.'],
                        ['All values are <b>strings</b>: <code>Number(process.env.PORT)</code>, <code>process.env.DEBUG === \'true\'</code>.', 'كل القيم <b>نصوص</b>: <code>Number(process.env.PORT)</code> و <code>process.env.DEBUG === \'true\'</code>.']
                    ] }],
                    [{ code: `# copy to .env and fill in real values
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tasky
JWT_SECRET=change-me`, file: '.env.example' },
                     { mistake: ['Committing <code>.env</code> or hard-coding <code>const SECRET = "abc123"</code>. Bots scan GitHub for leaked keys within minutes.', 'حفظ <code>.env</code> في Git أو كتابة <code>const SECRET = "abc123"</code> في الكود. الروبوتات تفحص GitHub بحثًا عن المفاتيح المسربة خلال دقائق.'] }]
                ] },
                { best: ['Validate env vars at startup and crash early if one is missing — chapter 33 shows a Zod-validated <code>config.js</code>.', 'تحقق من متغيرات البيئة عند الإقلاع وأوقف التطبيق مبكرًا إن نقص أحدها — الفصل 33 يعرض <code>config.js</code> متحققًا بـ Zod.'] }
            ]
        },
        {
            kind: 'exercise', t: ['Boot Tasky', 'شغّل Tasky'],
            b: [{ tasks: [
                ['Create the project exactly as shown and run <code>npm run dev</code>.', 'أنشئ المشروع كما هو موضح وشغّل <code>npm run dev</code>.'],
                ['Change the message, save, and watch the automatic restart.', 'غيّر الرسالة، احفظ، ولاحظ إعادة التشغيل التلقائية.'],
                ['Add <code>GET /info</code> returning <code>{ app: process.env.APP_NAME, env: process.env.NODE_ENV }</code>.', 'أضف <code>GET /info</code> يعيد <code>{ app: process.env.APP_NAME, env: process.env.NODE_ENV }</code>.'],
                ['Set <code>PORT=4000</code> in <code>.env</code>, restart, and confirm the new port. Then create <code>.env.example</code> and commit.', 'اضبط <code>PORT=4000</code> في <code>.env</code>، أعد التشغيل وتأكد من المنفذ الجديد. ثم أنشئ <code>.env.example</code> واحفظه.']
            ], time: 10, hint: ['Port already in use (<code>EADDRINUSE</code>)? Another server is still running — stop it or change the port.', 'المنفذ مستخدم (<code>EADDRINUSE</code>)؟ هناك خادم آخر يعمل — أوقفه أو غيّر المنفذ.'] }]
        }
    ],
    quiz: [
        { q: ['What does <code>import \'dotenv/config\'</code> do?', 'ماذا يفعل <code>import \'dotenv/config\'</code>؟'], o: [['Creates a .env file', 'ينشئ ملف ‎.env'], ['Loads .env values into process.env', 'يحمّل قيم ‎.env إلى process.env'], ['Encrypts secrets', 'يشفّر الأسرار'], ['Starts the server', 'يشغّل الخادم']], a: 1, e: ['It reads the file and copies each KEY=value into process.env.', 'يقرأ الملف وينسخ كل KEY=value إلى process.env.'] },
        { out: true, q: ['With <code>PORT=4000</code> in .env, what is printed?', 'مع <code>PORT=4000</code> في ‎.env، ماذا يُطبع؟'], code: `console.log(typeof process.env.PORT, process.env.PORT + 1);`, o: ['`number 4001`', '`string 40001`', '`string 4001`', '`undefined NaN`'], a: 1, e: ['Env values are always strings: "4000" + 1 = "40001".', 'قيم البيئة دائمًا نصوص: "4000" + 1 = "40001".'] },
        { tf: false, q: ['It is fine to commit <code>.env</code> if the repo is private.', 'لا بأس بحفظ <code>.env</code> إذا كان المستودع خاصًا.'], e: ['Private repos get cloned, forked, leaked. Commit only .env.example.', 'المستودعات الخاصة تُستنسخ وتتسرب. احفظ ‎.env.example فقط.'] },
        { q: ['Which built-in Node flag restarts the app on file changes?', 'أي خيار مدمج في Node يعيد تشغيل التطبيق عند تغيير الملفات؟'], o: ['`--inspect`', '`--watch`', '`--env-file`', '`--reload`'], a: 1, e: ['node --watch restarts the process when imported files change.', 'node --watch يعيد تشغيل العملية عند تغير الملفات المستوردة.'] }
    ]
});

DECK.chapters.push({
    n: 7, level: 1, icon: '🧭',
    t: ['Routing', 'التوجيه'],
    sub: ['Methods, route params, query strings, app.route and route order', 'الطرق، معاملات المسار، سلاسل الاستعلام، app.route وترتيب المسارات'],
    project: ['Tasky gets <code>GET /tasks</code> (with <code>?done=</code> filter) and <code>GET /tasks/:id</code>.', 'يحصل Tasky على <code>GET /tasks</code> (مع فلتر <code>?done=</code>) و <code>GET /tasks/:id</code>.'],
    learn: [
        ['Map HTTP methods + paths to handlers', 'اربط طرق HTTP والمسارات بالمعالجات'],
        ['Read route params and query strings', 'اقرأ معاملات المسار وسلاسل الاستعلام'],
        ['Avoid the classic route-order bug', 'تجنّب خطأ ترتيب المسارات الشهير']
    ],
    slides: [
        {
            kind: 'code', t: ['Params vs query strings', 'معاملات المسار مقابل سلسلة الاستعلام'],
            b: [
                { cols: [
                    [{ code: `import express from 'express';

const app = express();
const tasks = [
  { id: 1, title: 'Learn routing', done: false },
  { id: 2, title: 'Drink water', done: true },
];

// GET /tasks?done=true   → query string (optional filters)
app.get('/tasks', (req, res) => {
  const { done } = req.query;
  const result = done === undefined
    ? tasks
    : tasks.filter((t) => String(t.done) === done);
  res.json(result);
});

// GET /tasks/2   → route param (identifies ONE resource)
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// several params
app.get('/users/:userId/tasks/:taskId', (req, res) => {
  res.json(req.params);
});

app.listen(3000, () => console.log('http://localhost:3000'));`, file: 'routing.js', hl: '11,20-21,27', x: 'routing' }],
                    [{ term: `curl "localhost:3000/tasks?done=true"
curl localhost:3000/tasks/1
curl localhost:3000/tasks/99
curl localhost:3000/users/7/tasks/3`, out: `[{"id":2,"title":"Drink water","done":true}]
{"id":1,"title":"Learn routing","done":false}
{"error":"Task not found"}
{"userId":"7","taskId":"3"}` },
                     { warn: ['Params and query values are always <b>strings</b>: <code>"7"</code>, not <code>7</code>. Convert (and validate — chapter 16) before comparing.', 'المعاملات وقيم الاستعلام دائمًا <b>نصوص</b>: <code>"7"</code> وليس <code>7</code>. حوّلها (وتحقق منها — الفصل 16) قبل المقارنة.'] },
                     { tip: ['<b>Param</b> = which resource (<code>/tasks/2</code>). <b>Query</b> = how to filter/sort/page a list (<code>?done=true&page=2</code>).', '<b>المعامل</b> = أي مورد (<code>/tasks/2</code>). <b>الاستعلام</b> = كيف نفلتر/نرتب/نقسم القائمة (<code>?done=true&page=2</code>).'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['All methods, app.route and route order', 'كل الطرق و app.route وترتيب المسارات'],
            b: [
                { cols: [
                    [{ code: `// ❌ wrong order: "/tasks/stats" is caught by "/tasks/:id"
app.get('/tasks/:id', getTask);      // id = "stats" → 404
app.get('/tasks/stats', getStats);   // never reached

// ✅ specific routes first
app.get('/tasks/stats', getStats);
app.get('/tasks/:id', getTask);

// group handlers for the same path
app.route('/tasks/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

app.all('/health', (req, res) => res.send('ok'));  // any method`, file: 'order.js', hl: '6-7,10-13' }],
                    [{ table: { h: [['Express 5 path syntax', 'صياغة المسارات في Express 5'], ['Matches', 'يطابق']], r: [
                        ['<code>/tasks/:id</code>', '<code>/tasks/42</code> → <code>{ id: "42" }</code>'],
                        ['<code>/files{/:name}</code>', ['<code>/files</code> and <code>/files/a</code> (optional)', '<code>/files</code> و <code>/files/a</code> (اختياري)']],
                        ['<code>/docs/*path</code>', ['<code>/docs/a/b</code> → <code>{ path: ["a","b"] }</code>', '<code>/docs/a/b</code> ← <code>{ path: ["a","b"] }</code>']],
                        ['<code>/:file.:ext</code>', '<code>/logo.png</code> → <code>{ file, ext }</code>']
                    ] } },
                     { warn: ['Express 5 changed wildcards: write <code>/*splat</code> (named), not <code>*</code>. Regex characters like <code>?</code> and <code>+</code> in paths are no longer supported.', 'غيّر Express 5 صياغة الرموز البديلة: اكتب <code>/*splat</code> (مسمّى) وليس <code>*</code>. ولم تعد رموز regex مثل <code>?</code> و <code>+</code> مدعومة في المسارات.'] }]
                ] }
            ]
        },
        {
            kind: 'exercise', t: ['Route the Tasky list', 'وجّه قائمة مهام Tasky'],
            b: [{ tasks: [
                ['Copy <code>routing.js</code>, run it, and test every curl command.', 'انسخ <code>routing.js</code>، شغّله، واختبر كل أوامر curl.'],
                ['Add <code>GET /tasks/stats</code> returning <code>{ total, done, open }</code>. Put it in the right place!', 'أضف <code>GET /tasks/stats</code> يعيد <code>{ total, done, open }</code>. ضعه في المكان الصحيح!'],
                ['Support <code>?q=water</code> to search titles (case-insensitive).', 'ادعم <code>?q=water</code> للبحث في العناوين (دون حساسية لحالة الأحرف).'],
                ['Add a catch-all <code>app.get(\'/*splat\')</code> at the very end returning a friendly 404 JSON.', 'أضف مسارًا شاملًا <code>app.get(\'/*splat\')</code> في النهاية تمامًا يعيد 404 بصيغة JSON.']
            ], time: 12, solution: { code: `app.get('/tasks/stats', (req, res) => {
  const done = tasks.filter((t) => t.done).length;
  res.json({ total: tasks.length, done, open: tasks.length - done });
});

app.get('/tasks', (req, res) => {
  const { done, q } = req.query;
  let result = tasks;
  if (done !== undefined) result = result.filter((t) => String(t.done) === done);
  if (q) result = result.filter((t) => t.title.toLowerCase().includes(String(q).toLowerCase()));
  res.json(result);
});

app.get('/*splat', (req, res) => res.status(404).json({ error: \`No route for \${req.originalUrl}\` }));`, file: 'solution.js' } }]
        }
    ],
    quiz: [
        { out: true, q: ['Request: <code>GET /users/5?sort=name</code>. What is logged?', 'الطلب: <code>GET /users/5?sort=name</code>. ماذا يُسجَّل؟'], code: `app.get('/users/:id', (req, res) => {\n  console.log(req.params.id, req.query.sort);\n  res.end();\n});`, o: ['`5 name`', '`undefined name`', '`5 undefined`', '`{id:5} sort`'], a: 0, e: ['params comes from the path, query from after the “?”.', 'params يأتي من المسار، و query مما بعد "?".'] },
        { out: true, q: ['What does this print for <code>GET /tasks/3</code>?', 'ماذا يُطبع عند <code>GET /tasks/3</code>؟'], code: `app.get('/tasks/:id', (req, res) => {\n  res.send(String(req.params.id === 3));\n});`, o: ['`true`', '`false`', '`3`', '`error`'], a: 1, e: ['req.params.id is the string "3"; "3" === 3 is false.', 'قيمة req.params.id هي النص "3"، و "3" === 3 خطأ.'] },
        { q: ['<code>/tasks/:id</code> is declared before <code>/tasks/stats</code>. What happens on <code>GET /tasks/stats</code>?', '<code>/tasks/:id</code> معرّف قبل <code>/tasks/stats</code>. ماذا يحدث عند <code>GET /tasks/stats</code>؟'], o: [['The stats handler runs', 'يعمل معالج stats'], ['The :id handler runs with id = "stats"', 'يعمل معالج ‎:id مع id = "stats"'], ['Express throws an error', 'يرمي Express خطأ'], ['Both run', 'يعمل الاثنان']], a: 1, e: ['Express matches routes in declaration order.', 'يطابق Express المسارات حسب ترتيب تعريفها.'] },
        { tf: true, q: ['In Express 5, a wildcard must be named, e.g. <code>/*splat</code>.', 'في Express 5 يجب تسمية الرمز البديل، مثل <code>/*splat</code>.'], e: ['path-to-regexp v8 requires named wildcards.', 'تتطلب path-to-regexp v8 تسمية الرموز البديلة.'] },
        { q: ['Best URL to get page 2 of finished tasks?', 'أفضل رابط لجلب الصفحة 2 من المهام المنجزة؟'], o: ['`/tasks/done/2`', '`/tasks?done=true&page=2`', '`/getDoneTasks?p=2`', '`/tasks/:done/:page`'], a: 1, e: ['Filters and pagination belong in the query string.', 'الفلاتر والتصفح مكانها سلسلة الاستعلام.'] }
    ]
});

DECK.chapters.push({
    n: 8, level: 1, icon: '📨',
    t: ['Request & Response objects', 'كائنا الطلب والاستجابة'],
    sub: ['req.body / params / query / headers — res.send / json / status / redirect / sendFile', 'req.body / params / query / headers — res.send / json / status / redirect / sendFile'],
    project: ['Tasky can create tasks: <code>POST /tasks</code> reads <code>req.body</code> and answers 201.', 'يستطيع Tasky إنشاء المهام: <code>POST /tasks</code> يقرأ <code>req.body</code> ويرد بـ 201.'],
    learn: [
        ['Read everything the client sent', 'اقرأ كل ما أرسله العميل'],
        ['Send the right kind of response with the right status', 'أرسل النوع الصحيح من الاستجابة بالرمز الصحيح'],
        ['Avoid “headers already sent” errors', 'تجنّب خطأ "headers already sent"']
    ],
    slides: [
        {
            kind: 'concept', t: ['The request object (req)', 'كائن الطلب (req)'],
            b: [{ cols: [
                [{ table: { h: [['Property', 'الخاصية'], ['Example', 'مثال']], r: [
                    ['<code>req.params</code>', '<code>/tasks/:id</code> → <code>{ id: "7" }</code>'],
                    ['<code>req.query</code>', '<code>?page=2</code> → <code>{ page: "2" }</code>'],
                    ['<code>req.body</code>', ['JSON / form data (needs a parser)', 'بيانات JSON / نموذج (يحتاج محللًا)']],
                    ['<code>req.headers</code> · <code>req.get(\'x\')</code>', ['all headers / one (case-insensitive)', 'كل الترويسات / واحدة (دون حساسية للحالة)']],
                    ['<code>req.method</code> · <code>req.path</code> · <code>req.originalUrl</code>', '<code>GET</code> · <code>/tasks</code> · <code>/api/tasks?x=1</code>'],
                    ['<code>req.ip</code> · <code>req.protocol</code> · <code>req.hostname</code>', ['client info (see trust proxy, ch. 38)', 'معلومات العميل (انظر trust proxy، الفصل 38)']],
                    ['<code>req.cookies</code>', ['needs cookie-parser', 'يحتاج cookie-parser']]
                ] } }],
                [{ warn: ['Express 5: <code>req.body</code> is <code>undefined</code> until you add a body parser like <code>express.json()</code>. In Express 4 it was <code>{}</code>.', 'Express 5: قيمة <code>req.body</code> هي <code>undefined</code> حتى تضيف محللًا مثل <code>express.json()</code>. في Express 4 كانت <code>{}</code>.'] },
                 { warn: ['Express 5: <code>req.query</code> is a read-only getter. Do not assign to it — store parsed values elsewhere (e.g. <code>res.locals</code>).', 'Express 5: <code>req.query</code> أصبح للقراءة فقط. لا تُسند إليه — احفظ القيم المحللة في مكان آخر (مثل <code>res.locals</code>).'] },
                 { note: ['<code>req</code> is the envelope you received (address, stamps, letter). <code>res</code> is the blank envelope you fill and send back — exactly once.', '<code>req</code> هو الظرف الذي استلمته (العنوان، الطوابع، الرسالة). و <code>res</code> هو الظرف الفارغ الذي تملؤه وترسله — مرة واحدة فقط.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['req & res in action', 'req و res عمليًا'],
            b: [
                { cols: [
                    [{ code: `import express from 'express';
import path from 'node:path';

const app = express();
app.use(express.json());            // fills req.body (chapter 10)

const tasks = [];

app.post('/tasks', (req, res) => {
  const { title } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const task = { id: tasks.length + 1, title, done: false };
  tasks.push(task);
  res.status(201).location(\`/tasks/\${task.id}\`).json(task);
});

app.get('/echo/:id', (req, res) => {
  res.set('X-Powered-By-Tasky', 'yes').json({
    params: req.params,
    query: req.query,
    agent: req.get('user-agent'),
  });
});

app.get('/old-tasks', (req, res) => res.redirect(301, '/tasks'));
app.delete('/tasks', (req, res) => { tasks.length = 0; res.sendStatus(204); });
app.get('/logo', (req, res) => {
  res.sendFile(path.join(import.meta.dirname, 'public', 'logo.svg'));
});

app.listen(3000);`, file: 'reqres.js', hl: '10-11,14', x: 'reqres' }],
                    [{ term: `curl -i -X POST localhost:3000/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Read docs"}'`, out: `HTTP/1.1 201 Created
Location: /tasks/1
Content-Type: application/json; charset=utf-8

{"id":1,"title":"Read docs","done":false}` },
                     { table: { h: [['Method', 'الدالة'], ['Use', 'الاستخدام']], r: [
                         ['<code>res.json(obj)</code>', ['JSON + correct Content-Type', 'JSON مع Content-Type صحيح']],
                         ['<code>res.status(n)</code>', ['set code (chainable)', 'تحديد الرمز (قابل للسلسلة)']],
                         ['<code>res.send(x)</code>', ['text / HTML / Buffer', 'نص / HTML / Buffer']],
                         ['<code>res.sendStatus(204)</code>', ['status only', 'الرمز فقط']],
                         ['<code>res.redirect(301, url)</code>', ['redirect', 'تحويل']],
                         ['<code>res.sendFile(abs)</code>', ['file (absolute path)', 'ملف (مسار مطلق)']]
                     ] } }]
                ] }
            ]
        },
        {
            kind: 'mistakes', t: ['“Cannot set headers after they are sent”', '"Cannot set headers after they are sent"'],
            b: [
                { cols: [
                    [{ code: `app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    res.status(404).json({ error: 'Not found' });
    // ❌ missing return → code continues!
  }
  res.json(task);   // 💥 second response
});`, file: 'bug.js', hl: '5,7' }],
                    [{ code: `app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Not found' }); // ✅
  }
  res.json(task);
});`, file: 'fixed.js', hl: '4' }]
                ] },
                { best: ['Rule: <b>one request → exactly one response</b>. Use <code>return res...</code> for early exits, and never forget to respond (or the client hangs until timeout).', 'القاعدة: <b>طلب واحد ← استجابة واحدة بالضبط</b>. استخدم <code>return res...</code> للخروج المبكر، ولا تنسَ الرد أبدًا (وإلا سينتظر العميل حتى انتهاء المهلة).'] }
            ]
        },
        {
            kind: 'exercise', t: ['Build an echo & create endpoint', 'ابنِ نقطة echo وإنشاء'],
            b: [{ tasks: [
                ['Run <code>reqres.js</code>. Create 2 tasks with curl and check the <code>Location</code> header.', 'شغّل <code>reqres.js</code>. أنشئ مهمتين بـ curl وتحقق من ترويسة <code>Location</code>.'],
                ['POST without a title → you must get 400. Remove <code>app.use(express.json())</code> and observe what <code>req.body</code> becomes.', 'أرسل POST بدون عنوان ← يجب أن تحصل على 400. احذف <code>app.use(express.json())</code> ولاحظ ماذا يصبح <code>req.body</code>.'],
                ['Add <code>GET /whoami</code> returning <code>{ ip: req.ip, method: req.method, lang: req.get(\'accept-language\') }</code>.', 'أضف <code>GET /whoami</code> يعيد <code>{ ip: req.ip, method: req.method, lang: req.get(\'accept-language\') }</code>.'],
                ['Make <code>GET /download</code> send a file with <code>res.download()</code>.', 'اجعل <code>GET /download</code> يرسل ملفًا باستخدام <code>res.download()</code>.']
            ], time: 12 }]
        }
    ],
    quiz: [
        { q: ['Where do you read <code>{"title":"x"}</code> sent in a POST body?', 'أين تقرأ <code>{"title":"x"}</code> المرسل في جسم POST؟'], o: ['`req.params`', '`req.query`', '`req.body`', '`req.headers`'], a: 2, e: ['The parsed body is in req.body (after express.json()).', 'الجسم المحلل موجود في req.body (بعد express.json()).'] },
        { out: true, q: ['Express 5, no body parser. What does POST /x log?', 'Express 5 بدون محلل جسم. ماذا يسجّل POST /x؟'], code: `app.post('/x', (req, res) => {\n  console.log(req.body);\n  res.end();\n});`, o: ['`{}`', '`undefined`', '`null`', ['the raw JSON string', 'نص JSON الخام']], a: 1, e: ['In Express 5 req.body is undefined until a parser runs.', 'في Express 5 تبقى req.body غير معرفة حتى يعمل محلل.'] },
        { q: ['Best response after successfully creating a resource?', 'أفضل استجابة بعد إنشاء مورد بنجاح؟'], o: ['`res.send("ok")`', '`res.status(201).json(task)`', '`res.status(200).end()`', '`res.redirect("/")`'], a: 1, e: ['201 Created + the created resource (and ideally a Location header).', '201 Created مع المورد المنشأ (ويفضل ترويسة Location).'] },
        { tf: true, q: ['Calling <code>res.json()</code> twice in one request causes “headers already sent”.', 'استدعاء <code>res.json()</code> مرتين في نفس الطلب يسبب "headers already sent".'], e: ['Only one response per request. Use return for early exits.', 'استجابة واحدة لكل طلب. استخدم return للخروج المبكر.'] },
        { q: ['Which returns a header value case-insensitively?', 'أيها يعيد قيمة ترويسة دون حساسية لحالة الأحرف؟'], o: ['`req.get("Content-Type")`', '`req.header["Content-Type"]`', '`req.body.headers`', '`res.get()`'], a: 0, e: ['req.get(name) (alias req.header) is case-insensitive.', 'الدالة req.get(name) (أو req.header) لا تهتم بحالة الأحرف.'] }
    ]
});

DECK.chapters.push({
    n: 9, level: 1, icon: '🧩',
    t: ['Middleware fundamentals', 'أساسيات الوسائط (Middleware)'],
    sub: ['next(), app-level vs route-level, and the order of execution', 'next() والمستوى العام مقابل مستوى المسار، وترتيب التنفيذ'],
    project: ['Tasky logs every request with its duration and protects admin routes with an API key.', 'يسجل Tasky كل طلب مع مدته ويحمي مسارات الإدارة بمفتاح API.'],
    learn: [
        ['Write middleware with (req, res, next)', 'اكتب وسيطًا بالشكل (req, res, next)'],
        ['Apply it globally, per router or per route', 'طبّقه بشكل عام، أو لكل موجّه، أو لكل مسار'],
        ['Predict the execution order', 'توقع ترتيب التنفيذ']
    ],
    slides: [
        {
            kind: 'concept', t: ['A pipeline of functions', 'سلسلة من الدوال'],
            b: [
                { diagram: 'middleware', cap: ['Each middleware either ends the response or calls next(). next(err) jumps straight to the error handler.', 'كل وسيط إما ينهي الاستجابة أو يستدعي next(). و next(err) يقفز مباشرة إلى معالج الأخطاء.'] },
                { cols: [
                    [{ ul: [
                        ['Signature: <code>(req, res, next) => {}</code>. Error middleware: <code>(err, req, res, next)</code> — 4 args.', 'الشكل: <code>(req, res, next) => {}</code>. وسيط الأخطاء: <code>(err, req, res, next)</code> — 4 معاملات.'],
                        ['A middleware can: read/modify <code>req</code> & <code>res</code>, end the cycle, or call <code>next()</code>.', 'يستطيع الوسيط: قراءة/تعديل <code>req</code> و <code>res</code>، إنهاء الدورة، أو استدعاء <code>next()</code>.']
                    ] }],
                    [{ note: ['Airport security: check-in → passport → security → gate. Any checkpoint can stop you (401); otherwise you move to the next one.', 'أمن المطار: تسجيل ← جواز ← تفتيش ← بوابة. أي نقطة تستطيع إيقافك (401)؛ وإلا تنتقل إلى التالية.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Logger, auth guard & middleware factory', 'مسجّل، حارس مصادقة ومصنع وسائط'],
            b: [
                { cols: [
                    [{ code: `import express from 'express';
const app = express();

// 1) app-level: runs for every request
function logger(req, res, next) {
  const start = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} \${ms}ms\`);
  });
  next();                                   // ⬅ pass control on
}

// 2) route-level guard
function requireApiKey(req, res, next) {
  if (req.get('x-api-key') !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

// 3) factory: middleware with options
const addHeader = (name, value) => (req, res, next) => {
  res.set(name, value);
  next();
};

app.use(logger);
app.use(addHeader('X-App', 'Tasky'));

app.get('/public', (req, res) => res.json({ msg: 'hello everyone' }));
app.get('/admin', requireApiKey, (req, res) => res.json({ msg: 'hello admin' }));

app.listen(3000);`, file: 'middleware.js', hl: '11,16-18,32', x: 'middleware' }],
                    [{ term: `API_KEY=s3cret node middleware.js
curl localhost:3000/public
curl localhost:3000/admin
curl localhost:3000/admin -H "x-api-key: s3cret"`, out: `{"msg":"hello everyone"}
{"error":"Invalid API key"}
{"msg":"hello admin"}

# server console:
GET /public 200 1.2ms
GET /admin 401 0.4ms
GET /admin 200 0.3ms` },
                     { tip: ['Share data between middleware with <code>req.user = …</code> (per request) or <code>res.locals</code> (also visible to templates).', 'شارك البيانات بين الوسائط عبر <code>req.user = …</code> (لكل طلب) أو <code>res.locals</code> (مرئي للقوالب أيضًا).'] },
                     { p: ['On Windows PowerShell: <code>$env:API_KEY="s3cret"; node middleware.js</code>', 'في PowerShell على ويندوز: <code>$env:API_KEY="s3cret"; node middleware.js</code>'] }]
                ] }
            ]
        },
        {
            kind: 'mistakes', t: ['Order matters — common middleware bugs', 'الترتيب مهم — أخطاء شائعة في الوسائط'],
            b: [
                { code: `app.get('/tasks', listTasks);       // ❌ runs before logger & json
app.use(logger);
app.use(express.json());

app.use((req, res, next) => {
  if (!req.get('authorization')) res.status(401).json({ error: 'No token' });
  next();                            // ❌ called even after responding
});

app.use((req, res, next) => {
  doSomething();                      // ❌ forgot next() → request hangs forever
});`, file: 'bugs.js', hl: '1,7,11' },
                { cols: [
                    [{ mistake: ['<b>Hanging requests</b>: a middleware that neither responds nor calls <code>next()</code>.', '<b>طلبات معلّقة</b>: وسيط لا يرد ولا يستدعي <code>next()</code>.'] }],
                    [{ best: ['Global order: <b>security → parsers → logging → routes → 404 → error handler</b>.', 'الترتيب العام: <b>الأمان ← المحللات ← السجلات ← المسارات ← 404 ← معالج الأخطاء</b>.'] }]
                ] }
            ]
        },
        {
            kind: 'exercise', t: ['Write three middleware', 'اكتب ثلاثة وسائط'],
            b: [{ tasks: [
                ['<code>requestId</code>: set <code>req.id = crypto.randomUUID()</code> and the header <code>X-Request-Id</code>.', '<code>requestId</code>: اضبط <code>req.id = crypto.randomUUID()</code> والترويسة <code>X-Request-Id</code>.'],
                ['<code>maintenance</code>: if <code>process.env.MAINTENANCE === \'true\'</code>, answer 503 for every request.', '<code>maintenance</code>: إذا كان <code>process.env.MAINTENANCE === \'true\'</code> فأجب بـ 503 لكل الطلبات.'],
                ['<code>timing</code>: add the <code>X-Response-Time</code> header (hint: set it before the body is sent, or use the logger approach).', '<code>timing</code>: أضف ترويسة <code>X-Response-Time</code> (تلميح: اضبطها قبل إرسال الجسم، أو استخدم أسلوب المسجّل).'],
                ['Log the order: add <code>console.log(\'A\')</code>, <code>\'B\'</code>, <code>\'C\'</code> in three middleware and predict the output first.', 'سجّل الترتيب: أضف <code>console.log(\'A\')</code> و <code>\'B\'</code> و <code>\'C\'</code> في ثلاثة وسائط وتوقع الناتج أولًا.']
            ], time: 15, hint: ['<code>import crypto from \'node:crypto\';</code>', '<code>import crypto from \'node:crypto\';</code>'] }]
        }
    ],
    quiz: [
        { out: true, q: ['What is logged for <code>GET /x</code>?', 'ماذا يُسجَّل عند <code>GET /x</code>؟'], code: `app.use((req, res, next) => { console.log('A'); next(); });\napp.get('/x', (req, res, next) => { console.log('B'); next(); });\napp.use((req, res) => { console.log('C'); res.end(); });`, o: ['`A`', '`A B`', '`A B C`', '`B A C`'], a: 2, e: ['Each calls next(), so all three run in declaration order.', 'كل واحد يستدعي next() فتعمل الثلاثة حسب ترتيب التعريف.'] },
        { q: ['What happens if a middleware never calls next() and never responds?', 'ماذا يحدث إذا لم يستدعِ الوسيط next() ولم يرد أبدًا؟'], o: [['Express auto-responds 200', 'يرد Express تلقائيًا بـ 200'], ['The request hangs until timeout', 'يتعلق الطلب حتى انتهاء المهلة'], ['Express throws', 'يرمي Express خطأ'], ['The next middleware runs anyway', 'يعمل الوسيط التالي على أي حال']], a: 1, e: ['Nothing moves the request forward or ends it.', 'لا شيء يدفع الطلب للأمام أو ينهيه.'] },
        { q: ['How does Express recognise an error-handling middleware?', 'كيف يتعرف Express على وسيط معالجة الأخطاء؟'], o: [['Its name starts with error', 'اسمه يبدأ بـ error'], ['It has exactly 4 parameters', 'له 4 معاملات بالضبط'], ['It is registered first', 'يُسجَّل أولًا'], ['It uses try/catch', 'يستخدم try/catch']], a: 1, e: ['(err, req, res, next) — the arity (4) is what matters.', '(err, req, res, next) — عدد المعاملات (4) هو المهم.'] },
        { tf: true, q: ['<code>app.get(\'/admin\', requireApiKey, handler)</code> runs requireApiKey only for that route.', '<code>app.get(\'/admin\', requireApiKey, handler)</code> يشغّل requireApiKey لهذا المسار فقط.'], e: ['Route-level middleware applies only to that route.', 'وسيط مستوى المسار يُطبَّق على ذلك المسار فقط.'] },
        { q: ['Where should the global error handler be registered?', 'أين يجب تسجيل معالج الأخطاء العام؟'], o: [['First', 'أولًا'], ['Before express.json()', 'قبل express.json()'], ['After all routes', 'بعد كل المسارات'], ['Anywhere', 'في أي مكان']], a: 2, e: ['It must come last so errors from all routes reach it.', 'يجب أن يكون الأخير لتصل إليه أخطاء كل المسارات.'] }
    ]
});

DECK.chapters.push({
    n: 10, level: 1, icon: '📦',
    t: ['Built-in middleware', 'الوسائط المدمجة'],
    sub: ['express.json, express.urlencoded and express.static', 'express.json و express.urlencoded و express.static'],
    project: ['Tasky parses JSON with a size limit and serves a small landing page from <code>public/</code>.', 'يحلل Tasky JSON بحد أقصى للحجم ويقدم صفحة بسيطة من <code>public/</code>.'],
    learn: [
        ['Parse JSON and HTML-form bodies safely', 'حلّل أجسام JSON ونماذج HTML بأمان'],
        ['Serve static files (HTML, CSS, images)', 'قدّم الملفات الثابتة (HTML و CSS والصور)'],
        ['Know the Express 5 defaults', 'اعرف القيم الافتراضية في Express 5']
    ],
    slides: [
        {
            kind: 'code', t: ['Body parsers & static files', 'محللات الجسم والملفات الثابتة'],
            b: [
                { cols: [
                    [{ code: `import express from 'express';
import path from 'node:path';

const app = express();

app.use(express.json({ limit: '100kb' }));          // application/json
app.use(express.urlencoded({ extended: false }));   // HTML <form>
app.use(express.static(path.join(import.meta.dirname, 'public'), {
  maxAge: '1d',                                       // browser cache
}));

app.post('/api/tasks', (req, res) => {
  res.status(201).json({ received: req.body });
});

app.post('/contact', (req, res) => {
  res.send(\`Thanks \${req.body.name}, we got your message!\`);
});

app.listen(3000);`, file: 'server.js', hl: '6-8' },
                     { code: `<!doctype html>
<form method="post" action="/contact">
  <input name="name" placeholder="Your name">
  <button>Send</button>
</form>`, file: 'public/index.html' }],
                    [{ term: `curl -X POST localhost:3000/api/tasks \\
  -H "Content-Type: application/json" -d '{"title":"x"}'
curl -X POST localhost:3000/contact -d "name=Sara"
curl -X POST localhost:3000/api/tasks \\
  -H "Content-Type: application/json" -d '{bad json'`, out: `{"received":{"title":"x"}}
Thanks Sara, we got your message!
400 Bad Request  (entity.parse.failed: Expected property name or '}' in JSON)` },
                     { table: { h: [['Middleware', 'الوسيط'], ['Parses', 'يحلل']], r: [
                         ['<code>express.json()</code>', '<code>application/json</code>'],
                         ['<code>express.urlencoded()</code>', '<code>application/x-www-form-urlencoded</code>'],
                         ['<code>express.text()</code>', '<code>text/plain</code>'],
                         ['<code>express.raw()</code>', ['Buffer (webhooks signatures, ch. 40)', 'Buffer (توقيعات webhooks، الفصل 40)']],
                         ['<code>express.static()</code>', ['serves files from a folder', 'يقدم الملفات من مجلد']]
                     ] } }]
                ] },
                { tip: ['Parsers only run when the <code>Content-Type</code> matches. Forgot the header in curl? <code>req.body</code> stays <code>undefined</code>.', 'المحللات تعمل فقط عندما يتطابق <code>Content-Type</code>. نسيت الترويسة في curl؟ تبقى <code>req.body</code> غير معرفة.'] }
            ]
        },
        {
            kind: 'concept', t: ['Defaults, limits & security', 'القيم الافتراضية والحدود والأمان'],
            b: [{ cols: [
                [{ ul: [
                    ['<code>limit</code> defaults to <b>100kb</b>. Bigger payload → <b>413 Payload Too Large</b>. Raise it only where needed.', 'الحد الافتراضي <code>limit</code> هو <b>100kb</b>. حمولة أكبر ← <b>413 Payload Too Large</b>. ارفعه فقط حيث يلزم.'],
                    ['Express 5: <code>urlencoded</code> uses <code>extended: false</code> by default (simple <code>querystring</code> parsing, safer).', 'Express 5: يستخدم <code>urlencoded</code> القيمة <code>extended: false</code> افتراضيًا (تحليل بسيط وأكثر أمانًا).'],
                    ['Malformed JSON → automatic <b>400</b> passed to your error handler (we format it in chapter 17).', 'JSON مشوّه ← <b>400</b> تلقائيًا يُمرر إلى معالج الأخطاء (ننسقه في الفصل 17).'],
                    ['<code>express.static</code> sets ETag/Last-Modified for free and never serves files outside the folder.', '<code>express.static</code> يضبط ETag/Last-Modified مجانًا ولا يقدم ملفات خارج المجلد أبدًا.']
                ] }],
                [{ code: `// mount static files under a prefix
app.use('/assets', express.static('public'));
// → /assets/logo.png serves public/logo.png

// bigger limit only for one route
app.post('/import', express.json({ limit: '5mb' }), importTasks);`, file: 'tips.js' },
                 { mistake: ['Relative paths like <code>express.static(\'public\')</code> depend on the folder you start Node from. Prefer <code>path.join(import.meta.dirname, \'public\')</code>.', 'المسارات النسبية مثل <code>express.static(\'public\')</code> تعتمد على المجلد الذي تشغّل منه Node. فضّل <code>path.join(import.meta.dirname, \'public\')</code>.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Serve a mini front-end', 'قدّم واجهة أمامية صغيرة'],
            b: [{ tasks: [
                ['Create <code>public/index.html</code> with a form that POSTs <code>title</code> to <code>/tasks-form</code>.', 'أنشئ <code>public/index.html</code> فيه نموذج يرسل <code>title</code> إلى <code>/tasks-form</code>.'],
                ['Handle it with <code>express.urlencoded</code>, store the task, then <code>res.redirect(\'/\')</code>.', 'عالجه بـ <code>express.urlencoded</code>، احفظ المهمة، ثم <code>res.redirect(\'/\')</code>.'],
                ['Add <code>public/app.js</code> that <code>fetch</code>es <code>/api/tasks</code> and renders the list.', 'أضف <code>public/app.js</code> يجلب <code>/api/tasks</code> بـ <code>fetch</code> ويعرض القائمة.'],
                ['Send a 200 kb JSON body and observe the 413. Then raise the limit for that route only.', 'أرسل جسم JSON بحجم 200kb ولاحظ 413. ثم ارفع الحد لهذا المسار فقط.']
            ], time: 15 }]
        }
    ],
    quiz: [
        { q: ['Which middleware fills <code>req.body</code> from an HTML form?', 'أي وسيط يملأ <code>req.body</code> من نموذج HTML؟'], o: ['`express.json()`', '`express.urlencoded()`', '`express.static()`', '`express.Router()`'], a: 1, e: ['HTML forms send application/x-www-form-urlencoded by default.', 'نماذج HTML ترسل application/x-www-form-urlencoded افتراضيًا.'] },
        { q: ['A client sends a 2 MB JSON body with default settings. Result?', 'عميل يرسل جسم JSON بحجم 2MB مع الإعدادات الافتراضية. النتيجة؟'], o: ['200', '400', '413', '500'], a: 2, e: ['Default limit is 100kb → 413 Payload Too Large.', 'الحد الافتراضي 100kb ← 413 Payload Too Large.'] },
        { tf: false, q: ['<code>express.json()</code> parses the body no matter which Content-Type is sent.', '<code>express.json()</code> يحلل الجسم بغض النظر عن Content-Type المرسل.'], e: ['It only parses when Content-Type matches application/json.', 'يحلل فقط عندما يطابق Content-Type القيمة application/json.'] },
        { out: true, q: ['With <code>app.use(\'/assets\', express.static(\'public\'))</code>, which URL serves <code>public/css/app.css</code>?', 'مع <code>app.use(\'/assets\', express.static(\'public\'))</code>، أي رابط يقدّم <code>public/css/app.css</code>؟'], o: ['`/public/css/app.css`', '`/css/app.css`', '`/assets/css/app.css`', '`/assets/public/css/app.css`'], a: 2, e: ['The mount path replaces the folder name.', 'مسار التركيب يحل محل اسم المجلد.'] }
    ]
});

DECK.chapters.push({
    n: 11, level: 1, icon: '🗂️',
    t: ['Express Router', 'موجّه Express'],
    sub: ['Modular routes, route prefixes, router-level middleware, nested routers', 'مسارات معيارية، بادئات، وسائط على مستوى الموجّه، موجّهات متداخلة'],
    project: ['Tasky moves its routes into <code>src/routes/tasks.routes.js</code>, mounted at <code>/api/tasks</code>.', 'ينقل Tasky مساراته إلى <code>src/routes/tasks.routes.js</code> ويركّبها على <code>/api/tasks</code>.'],
    learn: [
        ['Split routes into files with express.Router()', 'قسّم المسارات إلى ملفات باستخدام express.Router()'],
        ['Mount routers under a prefix', 'ركّب الموجّهات تحت بادئة'],
        ['Use mergeParams for nested resources', 'استخدم mergeParams للموارد المتداخلة']
    ],
    slides: [
        {
            kind: 'concept', t: ['One app, many mini-apps', 'تطبيق واحد، تطبيقات صغيرة كثيرة'],
            b: [
                { diagram: 'router', cap: ['A Router is a mini Express app with its own routes and middleware, mounted at a path prefix.', 'الموجّه تطبيق Express مصغّر بمساراته ووسائطه، يُركّب على بادئة مسار.'] },
                { tip: ['Inside the router you write <code>/</code> and <code>/:id</code>; the prefix <code>/api/tasks</code> is added once, in <code>app.js</code>. Renaming the URL = changing one line.', 'داخل الموجّه تكتب <code>/</code> و <code>/:id</code>؛ والبادئة <code>/api/tasks</code> تُضاف مرة واحدة في <code>app.js</code>. تغيير الرابط = تعديل سطر واحد.'] }
            ]
        },
        {
            kind: 'code', t: ['tasks.routes.js + app.js', 'tasks.routes.js و app.js'],
            b: [{ cols: [
                [{ code: `import { Router } from 'express';

const router = Router();
const tasks = [{ id: 1, title: 'Use routers', done: false }];

// router-level middleware: only for /api/tasks/*
router.use((req, res, next) => {
  res.set('X-Resource', 'tasks');
  next();
});

router.get('/', (req, res) => res.json(tasks));

router.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/', (req, res) => {
  const task = { id: tasks.length + 1, title: req.body.title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

export default router;`, file: 'src/routes/tasks.routes.js', hl: '3,7,26', x: 'router' }],
                [{ code: `import express from 'express';
import tasksRouter from './routes/tasks.routes.js';
import commentsRouter from './routes/comments.routes.js';

const app = express();
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/tasks/:taskId/comments', commentsRouter);

app.listen(3000, () => console.log('http://localhost:3000'));`, file: 'src/app.js', hl: '8-9', x: 'router' },
                 { code: `import { Router } from 'express';

// mergeParams: see :taskId from the parent path
const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  res.json({ taskId: req.params.taskId, comments: [] });
});

export default router;`, file: 'src/routes/comments.routes.js', hl: '4', x: 'router' },
                 { term: `curl localhost:3000/api/tasks/1
curl localhost:3000/api/tasks/1/comments`, out: `{"id":1,"title":"Use routers","done":false}
{"taskId":"1","comments":[]}` }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Add a users router', 'أضف موجّه المستخدمين'],
            b: [{ tasks: [
                ['Create <code>src/routes/users.routes.js</code> with <code>GET /</code> and <code>GET /:id</code> (in-memory array).', 'أنشئ <code>src/routes/users.routes.js</code> مع <code>GET /</code> و <code>GET /:id</code> (مصفوفة في الذاكرة).'],
                ['Mount it at <code>/api/users</code>.', 'ركّبه على <code>/api/users</code>.'],
                ['Create <code>src/routes/index.js</code> that mounts all routers, then use it with <code>app.use(\'/api\', routes)</code>.', 'أنشئ <code>src/routes/index.js</code> يركّب كل الموجّهات، ثم استخدمه بـ <code>app.use(\'/api\', routes)</code>.'],
                ['Bonus: version your API by mounting the same router at <code>/api/v1</code>.', 'إضافي: أضف رقم إصدار للواجهة بتركيب نفس الموجّه على <code>/api/v1</code>.']
            ], time: 12 }]
        }
    ],
    quiz: [
        { out: true, q: ['Router mounted with <code>app.use(\'/api/tasks\', router)</code>. Which URL hits <code>router.get(\'/:id\')</code>?', 'موجّه مركّب بـ <code>app.use(\'/api/tasks\', router)</code>. أي رابط يصل إلى <code>router.get(\'/:id\')</code>؟'], o: ['`/:id`', '`/tasks/5`', '`/api/tasks/5`', '`/api/5`'], a: 2, e: ['Mount prefix + router path = /api/tasks/5.', 'بادئة التركيب + مسار الموجّه = ‎/api/tasks/5.'] },
        { q: ['Why use <code>Router({ mergeParams: true })</code>?', 'لماذا نستخدم <code>Router({ mergeParams: true })</code>؟'], o: [['To merge two routers', 'لدمج موجّهين'], ['To access params from the parent mount path', 'للوصول إلى معاملات مسار التركيب الأب'], ['To merge req.body and req.query', 'لدمج req.body و req.query'], ['For performance', 'للأداء']], a: 1, e: ['Without it, :taskId from the parent path is not visible in the child router.', 'بدونه لا يظهر ‎:taskId من المسار الأب داخل الموجّه الابن.'] },
        { tf: true, q: ['Middleware added with <code>router.use()</code> only runs for that router’s routes.', 'الوسيط المضاف بـ <code>router.use()</code> يعمل فقط لمسارات ذلك الموجّه.'], e: ['Router-level middleware is scoped to the router.', 'وسيط مستوى الموجّه محصور فيه.'] },
        { q: ['Main benefit of routers?', 'الفائدة الأساسية من الموجّهات؟'], o: [['Faster responses', 'استجابات أسرع'], ['Modular, organised code per resource', 'كود منظم ومعياري لكل مورد'], ['Automatic validation', 'تحقق تلقائي'], ['Database access', 'الوصول لقاعدة البيانات']], a: 1, e: ['One file per resource keeps large apps maintainable.', 'ملف لكل مورد يجعل التطبيقات الكبيرة سهلة الصيانة.'] }
    ]
});

DECK.chapters.push({
    n: 12, level: 1, icon: '🏗️',
    t: ['Project structure', 'هيكلة المشروع'],
    sub: ['Routes → controllers → services → models, and app.js vs server.js', 'المسارات ← المتحكمات ← الخدمات ← النماذج، و app.js مقابل server.js'],
    project: ['Tasky gets its final folder layout — every later chapter plugs into it.', 'يحصل Tasky على هيكلة مجلداته النهائية — كل الفصول اللاحقة تُبنى عليها.'],
    learn: [
        ['Separate HTTP, business logic and data access', 'افصل HTTP ومنطق العمل والوصول للبيانات'],
        ['Split app.js (the app) from server.js (the process)', 'افصل app.js (التطبيق) عن server.js (العملية)'],
        ['Organise by feature as the project grows', 'نظّم حسب الميزة عندما يكبر المشروع']
    ],
    slides: [
        {
            kind: 'concept', t: ['Layers & responsibilities', 'الطبقات والمسؤوليات'],
            b: [
                { diagram: 'layers', cap: ['Each layer talks only to the one below it. Controllers never touch the database; services never touch req/res.', 'كل طبقة تتحدث فقط مع التي تحتها. المتحكمات لا تلمس قاعدة البيانات، والخدمات لا تلمس req/res.'] },
                { table: { h: [['Layer', 'الطبقة'], ['Job', 'المهمة'], ['Knows about', 'تعرف عن']], r: [
                    [['Route', 'المسار'], ['URL + method → controller, attach middleware', 'رابط + طريقة ← متحكم، وإرفاق الوسائط'], 'Express'],
                    [['Controller', 'المتحكم'], ['Read req, call service, send res', 'قراءة req، استدعاء الخدمة، إرسال res'], ['Express + service', 'Express + الخدمة']],
                    [['Service', 'الخدمة'], ['Business rules (“a done task can’t be edited”)', 'قواعد العمل ("المهمة المنجزة لا تُعدَّل")'], ['models only', 'النماذج فقط']],
                    [['Model / repo', 'النموذج / المستودع'], ['Read/write data', 'قراءة/كتابة البيانات'], ['DB driver / ORM', 'مشغّل قاعدة البيانات / ORM']]
                ] } }
            ]
        },
        {
            kind: 'code', t: ['The Tasky folder tree', 'شجرة مجلدات Tasky'],
            b: [{ cols: [
                [{ tree: `tasky-api/
├── src/
│   ├── app.js                # builds the express app (no listen)
│   ├── server.js             # starts the HTTP server
│   ├── config/
│   │   └── index.js          # env vars in one place
│   ├── routes/
│   │   ├── index.js          # mounts all routers
│   │   └── tasks.routes.js
│   ├── controllers/
│   │   └── tasks.controller.js
│   ├── services/
│   │   └── tasks.service.js
│   ├── models/
│   │   └── task.model.js
│   ├── middlewares/
│   │   ├── error.js
│   │   └── notFound.js
│   └── utils/
│       └── AppError.js
├── tests/
├── .env.example
└── package.json` }],
                [{ code: `import express from 'express';
import routes from './routes/index.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

export default app;          // ⬅ importable by tests`, file: 'src/app.js', hl: '8' },
                 { code: `import app from './app.js';

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(\`Tasky on :\${PORT}\`));`, file: 'src/server.js' },
                 { best: ['<code>app.js</code> without <code>listen()</code> lets Supertest call your app in memory (chapter 26) — no port, no flakiness.', '<code>app.js</code> بدون <code>listen()</code> يسمح لـ Supertest باستدعاء تطبيقك في الذاكرة (الفصل 26) — بلا منفذ وبلا تذبذب.'] },
                 { tip: ['Big project? Group by <b>feature</b>: <code>src/modules/tasks/{routes,controller,service,model}.js</code>. Same layers, easier navigation.', 'مشروع كبير؟ جمّع حسب <b>الميزة</b>: <code>src/modules/tasks/{routes,controller,service,model}.js</code>. نفس الطبقات وتنقل أسهل.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Controller vs service in practice', 'المتحكم مقابل الخدمة عمليًا'],
            b: [{ cols: [
                [{ code: `import * as tasksService from '../services/tasks.service.js';

export async function list(req, res) {
  const tasks = await tasksService.listTasks();
  res.json(tasks);
}

export async function getOne(req, res) {
  const task = await tasksService.getTask(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}`, file: 'src/controllers/tasks.controller.js', hl: '4,9' },
                 { code: `import { Router } from 'express';
import * as ctrl from '../controllers/tasks.controller.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
export default router;`, file: 'src/routes/tasks.routes.js' }],
                [{ code: `import * as Task from '../models/task.model.js';

export async function listTasks() {
  return Task.findAll();
}

export async function getTask(id) {
  return Task.findById(id);
}`, file: 'src/services/tasks.service.js' },
                 { code: `// in-memory for now; MongoDB/Prisma in chapters 14–15
const tasks = [{ id: 1, title: 'Structure the project', done: false }];

export const findAll = async () => tasks;
export const findById = async (id) => tasks.find((t) => t.id === id) ?? null;`, file: 'src/models/task.model.js' },
                 { note: ['Waiter (controller) takes the order, chef (service) decides how to cook, pantry (model) stores ingredients. The waiter never cooks.', 'النادل (المتحكم) يأخذ الطلب، والطاهي (الخدمة) يقرر طريقة الطبخ، والمخزن (النموذج) يحفظ المكونات. النادل لا يطبخ أبدًا.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Refactor Tasky into layers', 'أعد هيكلة Tasky إلى طبقات'],
            b: [{ tasks: [
                ['Create the folder tree and move your chapter 11 code into routes / controllers / services / models.', 'أنشئ شجرة المجلدات وانقل كود الفصل 11 إلى routes / controllers / services / models.'],
                ['Split <code>app.js</code> and <code>server.js</code>; <code>npm run dev</code> should start <code>server.js</code>.', 'افصل <code>app.js</code> و <code>server.js</code>؛ يجب أن يشغّل <code>npm run dev</code> الملف <code>server.js</code>.'],
                ['Add a business rule in the service: titles must be unique (case-insensitive).', 'أضف قاعدة عمل في الخدمة: يجب أن تكون العناوين فريدة (دون حساسية للحالة).'],
                ['Check: does any file outside <code>controllers/</code> and <code>routes/</code> import Express? It should not.', 'تحقق: هل يستورد أي ملف خارج <code>controllers/</code> و <code>routes/</code> مكتبة Express؟ يجب ألا يحدث.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['Where does “a task title must be unique” belong?', 'أين تنتمي قاعدة "عنوان المهمة يجب أن يكون فريدًا"؟'], o: [['Route', 'المسار'], ['Controller', 'المتحكم'], ['Service', 'الخدمة'], ['server.js', 'server.js']], a: 2, e: ['Business rules live in the service layer.', 'قواعد العمل تعيش في طبقة الخدمات.'] },
        { q: ['Why separate app.js from server.js?', 'لماذا نفصل app.js عن server.js؟'], o: [['Express requires it', 'Express يتطلب ذلك'], ['So tests can import the app without opening a port', 'لكي تستورد الاختبارات التطبيق دون فتح منفذ'], ['It is faster', 'أسرع'], ['For CSS', 'من أجل CSS']], a: 1, e: ['Supertest can call the exported app directly.', 'يستطيع Supertest استدعاء التطبيق المُصدَّر مباشرة.'] },
        { tf: false, q: ['A service function should receive <code>req</code> and <code>res</code> as parameters.', 'يجب أن تستقبل دالة الخدمة <code>req</code> و <code>res</code> كمعاملات.'], e: ['Services receive plain data so they are reusable (CLI, jobs, tests).', 'الخدمات تستقبل بيانات بسيطة لتكون قابلة لإعادة الاستخدام (CLI، مهام، اختبارات).'] },
        { q: ['Which layer talks directly to the database?', 'أي طبقة تتحدث مباشرة مع قاعدة البيانات؟'], o: [['Controller', 'المتحكم'], ['Model / repository', 'النموذج / المستودع'], ['Route', 'المسار'], ['Middleware', 'الوسيط']], a: 1, e: ['Only the data layer knows about the DB driver/ORM.', 'طبقة البيانات فقط تعرف مشغّل قاعدة البيانات/ORM.'] }
    ]
});
