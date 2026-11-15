/* Level 0 — Prerequisites (chapters 1–4) */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 1, level: 0, icon: '🌐',
    t: ['How the web works', 'كيف يعمل الويب'],
    sub: ['HTTP, requests & responses, methods, status codes, headers and JSON', 'HTTP، الطلبات والاستجابات، الطرق، رموز الحالة، الترويسات و JSON'],
    learn: [
        ['Follow one request from the browser to the server and back', 'تتبّع طلبًا واحدًا من المتصفح إلى الخادم والعودة'],
        ['Pick the right HTTP method and status code', 'اختر طريقة HTTP ورمز الحالة المناسبين'],
        ['Read raw HTTP messages, headers and JSON', 'اقرأ رسائل HTTP الخام والترويسات و JSON']
    ],
    slides: [
        {
            kind: 'concept', t: ['The request / response cycle', 'دورة الطلب والاستجابة'],
            b: [
                { diagram: 'http', cap: ['One request in, exactly one response out. HTTP is stateless: every request carries everything the server needs.', 'طلب واحد يدخل واستجابة واحدة تخرج. HTTP عديم الحالة: كل طلب يحمل كل ما يحتاجه الخادم.'] },
                { cols: [
                    [{ ul: [
                        ['<b>Client</b> — browser, mobile app, curl, another server.', '<b>العميل</b> — متصفح، تطبيق جوال، curl، أو خادم آخر.'],
                        ['<b>Server</b> — a program listening on a port (e.g. 3000) that answers requests.', '<b>الخادم</b> — برنامج يستمع على منفذ (مثل 3000) ويرد على الطلبات.'],
                        ['<b>API</b> — the contract: which URLs exist, what they accept, what they return.', '<b>API</b> — العقد: ما المسارات الموجودة، ماذا تقبل وماذا تعيد.']
                    ] }],
                    [{ code: `https://api.tasky.dev:443/v1/tasks?done=true&page=2
└─┬──┘   └─────┬─────┘└┬┘└───┬───┘└────────┬────────┘
protocol      host    port  path         query string`, file: 'URL anatomy', lang: 'text', nonum: true },
                     { note: ['HTTP is like ordering at a counter: you give a clear order (request), the cashier gives you a tray and a receipt with a code (response + status).', 'HTTP يشبه الطلب من الكاشير: تعطي طلبًا واضحًا (طلب)، فيعطيك صينية وإيصالًا عليه رمز (استجابة + حالة).'] }]
                ] }
            ]
        },
        {
            kind: 'concept', t: ['Methods & status codes', 'الطرق ورموز الحالة'],
            b: [{ cols: [
                [{ table: { h: [['Method', 'الطريقة'], ['Meaning', 'المعنى'], ['Idempotent?', 'متساوي الأثر؟']], r: [
                    ['<code>GET</code>', ['Read data', 'قراءة البيانات'], '✅'],
                    ['<code>POST</code>', ['Create / trigger action', 'إنشاء / تنفيذ إجراء'], '❌'],
                    ['<code>PUT</code>', ['Replace the whole resource', 'استبدال المورد كاملًا'], '✅'],
                    ['<code>PATCH</code>', ['Update some fields', 'تعديل بعض الحقول'], ['⚠️ usually', '⚠️ غالبًا']],
                    ['<code>DELETE</code>', ['Remove', 'حذف'], '✅']
                ] } },
                 { tip: ['<b>Idempotent</b> = sending it twice has the same effect as once. That is why browsers and proxies may safely retry GET/PUT/DELETE, but never POST.', '<b>متساوي الأثر</b> = إرساله مرتين له نفس أثر المرة الواحدة. لهذا يمكن إعادة GET/PUT/DELETE بأمان، لكن ليس POST.'] }],
                [{ table: { h: [['Class', 'الفئة'], ['Common codes', 'الرموز الشائعة']], r: [
                    ['<b>2xx</b> ✅', ['200 OK · 201 Created · 204 No Content', '200 نجاح · 201 تم الإنشاء · 204 بدون محتوى']],
                    ['<b>3xx</b> ↪️', ['301 Moved · 304 Not Modified', '301 نُقل · 304 لم يتغير']],
                    ['<b>4xx</b> 🙋', ['400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 · 429', '400 طلب خاطئ · 401 غير مصادق · 403 ممنوع · 404 غير موجود · 409 تعارض · 422 · 429']],
                    ['<b>5xx</b> 💥', ['500 Internal Error · 502 Bad Gateway · 503 Unavailable', '500 خطأ داخلي · 502 بوابة سيئة · 503 غير متاح']]
                ] } },
                 { best: ['4xx = the <b>client</b> made a mistake. 5xx = the <b>server</b> made a mistake. Never answer a validation error with 500.', '4xx = خطأ من <b>العميل</b>. 5xx = خطأ من <b>الخادم</b>. لا ترد أبدًا على خطأ تحقق بـ 500.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Raw HTTP messages, headers & JSON', 'رسائل HTTP الخام، الترويسات و JSON'],
            b: [
                { cols: [
                    [{ code: `POST /v1/tasks HTTP/1.1
Host: api.tasky.dev
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Accept: application/json

{ "title": "Learn HTTP", "done": false }`, file: 'request.http', lang: 'http', hl: '1,3' }],
                    [{ code: `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /v1/tasks/42
Content-Length: 52

{ "id": 42, "title": "Learn HTTP", "done": false }`, file: 'response.http', lang: 'http', hl: '1,3' }]
                ] },
                { ul: [
                    ['<b>Start line</b> → method + path (request) or status (response). <b>Headers</b> → metadata. Blank line. <b>Body</b> → the data.', '<b>السطر الأول</b> ← الطريقة + المسار (طلب) أو الحالة (استجابة). <b>الترويسات</b> ← بيانات وصفية. سطر فارغ. <b>الجسم</b> ← البيانات.'],
                    ['<code>Content-Type</code> says what the body is. <code>Authorization</code> carries credentials. <code>Accept</code> says what the client wants back.', '<code>Content-Type</code> يحدد نوع الجسم. <code>Authorization</code> يحمل بيانات الدخول. <code>Accept</code> يحدد ما يريده العميل.']
                ] },
                { mistake: ['JSON is stricter than JavaScript: keys need <b>double quotes</b>, no trailing commas, no comments, no <code>undefined</code>.', 'JSON أصرم من JavaScript: المفاتيح تحتاج <b>علامات تنصيص مزدوجة</b>، بلا فواصل زائدة في النهاية، بلا تعليقات، وبلا <code>undefined</code>.'] }
            ]
        },
        {
            kind: 'exercise', t: ['Talk HTTP with curl', 'تحدث HTTP باستخدام curl'],
            b: [
                { term: `curl -i https://jsonplaceholder.typicode.com/todos/1`, out: `HTTP/2 200
content-type: application/json; charset=utf-8
...
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}` },
                { tasks: [
                    ['Run the command. Find the <b>status code</b> and the <code>content-type</code> header.', 'نفّذ الأمر. جد <b>رمز الحالة</b> وترويسة <code>content-type</code>.'],
                    ['Request <code>/todos/99999</code>. Which status do you get? Is it the client’s or server’s fault?', 'اطلب <code>/todos/99999</code>. ما الرمز الذي تحصل عليه؟ هل هو خطأ العميل أم الخادم؟'],
                    ['Send a POST: <code>curl -i -X POST -H "Content-Type: application/json" -d "{\\"title\\":\\"hi\\"}" https://jsonplaceholder.typicode.com/posts</code> — note the 201 and the new <code>id</code>.', 'أرسل POST: <code>curl -i -X POST -H "Content-Type: application/json" -d "{\\"title\\":\\"hi\\"}" https://jsonplaceholder.typicode.com/posts</code> — لاحظ 201 و <code>id</code> الجديد.'],
                    ['Open DevTools → Network on any website and inspect one request’s headers.', 'افتح أدوات المطور ← Network في أي موقع وافحص ترويسات طلب واحد.']
                ], time: 8, hint: ['On Windows PowerShell use <code>curl.exe</code> (plain <code>curl</code> is an alias of Invoke-WebRequest).', 'في PowerShell على ويندوز استخدم <code>curl.exe</code> (لأن <code>curl</code> اسم بديل لـ Invoke-WebRequest).'] }
            ]
        }
    ],
    quiz: [
        { q: ['Which method should create a new task?', 'ما الطريقة المناسبة لإنشاء مهمة جديدة؟'], o: ['`GET`', '`POST`', '`PUT`', '`DELETE`'], a: 1, e: ['POST creates a new resource; the server chooses its id and usually answers 201 Created.', 'POST ينشئ موردًا جديدًا؛ الخادم يختار المعرّف ويرد عادة بـ 201 Created.'] },
        { q: ['A user sends an invalid email in a sign-up form. Best status code?', 'أرسل مستخدم بريدًا غير صالح في نموذج التسجيل. ما أفضل رمز حالة؟'], o: ['500', '200', '400', '301'], a: 2, e: ['It is a client mistake → 4xx. 400 (or 422) with a helpful error message.', 'إنه خطأ من العميل ← 4xx. نستخدم 400 (أو 422) مع رسالة خطأ مفيدة.'] },
        { tf: false, q: ['HTTP remembers who you are between two requests automatically.', 'يتذكر HTTP هويتك بين طلبين تلقائيًا.'], e: ['HTTP is stateless. Identity travels with each request (cookie, token, API key).', 'HTTP عديم الحالة. الهوية تُرسل مع كل طلب (كوكي، رمز، مفتاح API).'] },
        { q: ['Which header tells the server the body is JSON?', 'أي ترويسة تخبر الخادم أن الجسم بصيغة JSON؟'], o: ['`Accept: application/json`', '`Content-Type: application/json`', '`Authorization: json`', '`Host: json`'], a: 1, e: ['Content-Type describes the body you send. Accept describes what you want back.', 'Content-Type يصف الجسم المرسل. Accept يصف ما تريد استلامه.'] },
        { out: true, q: ['Which of these is valid JSON?', 'أي مما يلي JSON صالح؟'], o: ['`{ name: "Ali" }`', "`{ 'name': 'Ali' }`", '`{ "name": "Ali", }`', '`{ "name": "Ali" }`'], a: 3, e: ['Only double-quoted keys and strings, no trailing comma.', 'فقط مفاتيح ونصوص بعلامات مزدوجة وبدون فاصلة زائدة.'] }
    ]
});

DECK.chapters.push({
    n: 2, level: 0, icon: '🟨',
    t: ['JavaScript essentials', 'أساسيات JavaScript'],
    sub: ['ES6+, Promises, async/await, and modules (ESM vs CommonJS)', 'ES6+، الوعود، async/await، والوحدات (ESM مقابل CommonJS)'],
    learn: [
        ['Write modern syntax: destructuring, spread, arrow functions, optional chaining', 'اكتب صياغة حديثة: التفكيك، النشر، الدوال السهمية، التسلسل الاختياري'],
        ['Understand Promises and async/await (and the order things run)', 'افهم الوعود و async/await (وترتيب التنفيذ)'],
        ['Know the difference between ESM and CommonJS', 'اعرف الفرق بين ESM و CommonJS']
    ],
    slides: [
        {
            kind: 'code', t: ['Modern syntax you will use every day', 'صياغة حديثة ستستخدمها يوميًا'],
            b: [
                { code: `const task = { id: 1, title: 'Learn JS', tags: ['js'], owner: { name: 'Sara' } };

// destructuring + default value + rename
const { title, done = false, owner: { name: ownerName } } = task;

// spread: copy & override (never mutate the original)
const updated = { ...task, done: true };
const tags = [...task.tags, 'node'];

// arrow function + template literal
const label = (t) => \`#\${t.id} \${t.title}\`;

// optional chaining + nullish coalescing
const city = task.owner?.address?.city ?? 'unknown';

// array methods
const tasks = [updated, { id: 2, title: 'Learn Node', done: false }];
const open = tasks.filter((t) => !t.done).map(label);

console.log(title, done, ownerName, city, tags, open);`, file: 'syntax.js', hl: '4,7,14' },
                { term: 'node syntax.js', out: `Learn JS false Sara unknown [ 'js', 'node' ] [ '#2 Learn Node' ]` },
                { tip: ['<code>??</code> only falls back on <code>null</code>/<code>undefined</code>; <code>||</code> also replaces <code>0</code>, <code>""</code> and <code>false</code>. Use <code>??</code> for defaults like <code>page ?? 1</code>.', '<code>??</code> يستبدل فقط <code>null</code>/<code>undefined</code>؛ أما <code>||</code> فيستبدل أيضًا <code>0</code> و <code>""</code> و <code>false</code>. استخدم <code>??</code> للقيم الافتراضية مثل <code>page ?? 1</code>.'] }
            ]
        },
        {
            kind: 'code', t: ['Promises & async / await', 'الوعود و async / await'],
            b: [
                { cols: [
                    [{ code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUser(id) {
  await sleep(100);                 // pretend DB call
  if (id <= 0) throw new Error('Invalid id');
  return { id, name: 'Sara' };
}

async function main() {
  try {
    const user = await fetchUser(1);
    console.log('user:', user.name);

    // run in parallel, not one after another
    const [a, b] = await Promise.all([fetchUser(2), fetchUser(3)]);
    console.log('parallel:', a.id, b.id);

    await fetchUser(0);
  } catch (err) {
    console.log('caught:', err.message);
  }
}

main();`, file: 'async.js', hl: '11,15,19-20' }],
                    [{ term: 'node async.js', out: `user: Sara
parallel: 2 3
caught: Invalid id` },
                     { code: `console.log('1 sync');
setTimeout(() => console.log('4 timer'), 0);
Promise.resolve().then(() => console.log('3 microtask'));
console.log('2 sync');`, file: 'order.js', hl: '3' },
                     { p: ['Output: <code>1 sync</code> → <code>2 sync</code> → <code>3 microtask</code> → <code>4 timer</code>. Synchronous code first, then Promise callbacks (microtasks), then timers.', 'الناتج: <code>1 sync</code> ← <code>2 sync</code> ← <code>3 microtask</code> ← <code>4 timer</code>. الكود المتزامن أولًا، ثم ردود الوعود (microtasks)، ثم المؤقتات.'] }]
                ] },
                { mistake: ['Forgetting <code>await</code>: <code>const user = fetchUser(1)</code> gives you a <i>Promise</i>, not a user. <code>user.name</code> is <code>undefined</code>.', 'نسيان <code>await</code>: <code>const user = fetchUser(1)</code> يعطيك <i>Promise</i> وليس مستخدمًا. و <code>user.name</code> يصبح <code>undefined</code>.'] }
            ]
        },
        {
            kind: 'concept', t: ['Modules: ESM vs CommonJS', 'الوحدات: ESM مقابل CommonJS'],
            b: [
                { cols: [
                    [{ code: `// math.js
export const add = (a, b) => a + b;
export default function mul(a, b) { return a * b; }

// app.js
import mul, { add } from './math.js';   // .js extension required
import fs from 'node:fs/promises';
console.log(add(2, 3), mul(2, 3));        // 5 6
console.log(import.meta.dirname);          // folder of this file`, file: 'ESM  (package.json → "type": "module")', lang: 'js', hl: '6' }],
                    [{ code: `// math.cjs
const add = (a, b) => a + b;
module.exports = { add };

// app.cjs
const { add } = require('./math.cjs');
const fs = require('node:fs');
console.log(add(2, 3));                    // 5
console.log(__dirname);                    // folder of this file`, file: 'CommonJS (legacy default)', lang: 'js', hl: '6' }]
                ] },
                { table: { h: ['', 'ESM', 'CommonJS'], r: [
                    [['Syntax', 'الصياغة'], '<code>import / export</code>', '<code>require / module.exports</code>'],
                    [['Loading', 'التحميل'], ['async, static (tree-shaking)', 'غير متزامن وثابت'], ['sync, dynamic', 'متزامن وديناميكي']],
                    [['Top-level await', 'await في المستوى الأعلى'], '✅', '❌'],
                    [['Standard', 'معيار'], ['Browsers + Node (the future)', 'المتصفحات + Node (المستقبل)'], ['Node only', 'Node فقط']]
                ] } },
                { best: ['This course uses <b>ESM</b>. Add <code>"type": "module"</code> to <code>package.json</code> and always write the file extension in relative imports.', 'هذه الدورة تستخدم <b>ESM</b>. أضف <code>"type": "module"</code> إلى <code>package.json</code> واكتب دائمًا امتداد الملف في الاستيراد النسبي.'] }
            ]
        },
        {
            kind: 'exercise', t: ['Practice: async data pipeline', 'تمرين: معالجة بيانات غير متزامنة'],
            b: [{ tasks: [
                ['Create <code>users.js</code> exporting <code>getUsers()</code> that resolves after 200 ms with 3 users <code>{ id, name, active }</code>.', 'أنشئ <code>users.js</code> يصدّر <code>getUsers()</code> تُرجع بعد 200 ملي ثانية 3 مستخدمين <code>{ id, name, active }</code>.'],
                ['In <code>main.js</code>, <code>import</code> it, <code>await</code> it, and print only active users’ names in uppercase.', 'في <code>main.js</code> استورده وانتظره واطبع أسماء المستخدمين النشطين فقط بأحرف كبيرة.'],
                ['Make <code>getUsers(true)</code> reject with an error and handle it with <code>try/catch</code>.', 'اجعل <code>getUsers(true)</code> ترفض بخطأ وعالجه بـ <code>try/catch</code>.']
            ], time: 10, hint: ['Use top-level await in ESM: <code>const users = await getUsers();</code>', 'استخدم await في المستوى الأعلى مع ESM: <code>const users = await getUsers();</code>'],
            solution: { code: `// users.js
export const getUsers = (fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('DB down')) : resolve([
      { id: 1, name: 'sara', active: true },
      { id: 2, name: 'omar', active: false },
      { id: 3, name: 'lina', active: true },
    ])), 200));

// main.js
import { getUsers } from './users.js';
const users = await getUsers();
console.log(users.filter((u) => u.active).map((u) => u.name.toUpperCase())); // [ 'SARA', 'LINA' ]
try { await getUsers(true); } catch (e) { console.log('Error:', e.message); } // Error: DB down`, file: 'solution.js' } }]
        }
    ],
    quiz: [
        { out: true, q: ['What is printed?', 'ماذا يُطبع؟'], code: `const { a = 1, b = 2 } = { a: undefined, b: null };\nconsole.log(a, b);`, o: ['`1 2`', '`1 null`', '`undefined null`', '`undefined 2`'], a: 1, e: ['Defaults apply only for <code>undefined</code>, not <code>null</code>.', 'القيم الافتراضية تُطبق فقط عند <code>undefined</code> وليس <code>null</code>.'] },
        { out: true, q: ['In what order are the letters printed?', 'بأي ترتيب تُطبع الحروف؟'], code: `setTimeout(() => console.log('A'), 0);\nPromise.resolve().then(() => console.log('B'));\nconsole.log('C');`, o: ['`A B C`', '`C A B`', '`C B A`', '`B C A`'], a: 2, e: ['Sync first (C), then microtasks (B), then timers (A).', 'المتزامن أولًا (C)، ثم microtasks (B)، ثم المؤقتات (A).'] },
        { q: ['Fastest way to run three independent async calls?', 'ما أسرع طريقة لتنفيذ ثلاث عمليات غير متزامنة مستقلة؟'], o: [['await them one by one', 'انتظارها واحدة تلو الأخرى'], '`Promise.all([...])`', '`setTimeout`', ['a for loop with await', 'حلقة for مع await']], a: 1, e: ['Promise.all runs them concurrently and waits for all.', 'Promise.all ينفذها بالتوازي وينتظرها جميعًا.'] },
        { tf: true, q: ['In ESM, relative imports must include the file extension (e.g. <code>./db.js</code>).', 'في ESM يجب أن يتضمن الاستيراد النسبي امتداد الملف (مثل <code>./db.js</code>).'], e: ['Node’s ESM resolver does not guess extensions.', 'محلّل ESM في Node لا يخمّن الامتدادات.'] },
        { out: true, q: ['What is printed?', 'ماذا يُطبع؟'], code: `const n = 0;\nconsole.log(n || 10, n ?? 10);`, o: ['`10 10`', '`0 0`', '`10 0`', '`0 10`'], a: 2, e: ['|| treats 0 as falsy; ?? only replaces null/undefined.', '|| يعتبر 0 قيمة خاطئة؛ و ?? يستبدل null/undefined فقط.'] }
    ]
});

DECK.chapters.push({
    n: 3, level: 0, icon: '🟩',
    t: ['Node.js basics', 'أساسيات Node.js'],
    sub: ['The runtime, the event loop, npm, package.json, scripts and the http module', 'بيئة التشغيل، حلقة الأحداث، npm، package.json، السكربتات ووحدة http'],
    learn: [
        ['Explain how one thread serves thousands of connections', 'اشرح كيف يخدم خيط واحد آلاف الاتصالات'],
        ['Create a project with npm and scripts', 'أنشئ مشروعًا بـ npm مع سكربتات'],
        ['Build a raw HTTP server — and feel why Express exists', 'ابنِ خادم HTTP خام — وافهم لماذا وُجد Express']
    ],
    slides: [
        {
            kind: 'concept', t: ['Node.js = V8 + libuv + event loop', 'Node.js = V8 + libuv + حلقة الأحداث'],
            b: [
                { diagram: 'eventloop', cap: ['Slow I/O (disk, network, DB) is handed to libuv. Your JavaScript keeps running; callbacks come back through the event loop.', 'عمليات الإدخال/الإخراج البطيئة تُسلَّم لـ libuv. يستمر كودك بالعمل؛ وتعود الاستدعاءات عبر حلقة الأحداث.'] },
                { cols: [
                    [{ ul: [
                        ['<b>V8</b>: Chrome’s JS engine, compiles JS to machine code.', '<b>V8</b>: محرك JavaScript من Chrome يحوّل الكود إلى لغة الآلة.'],
                        ['<b>libuv</b>: async I/O + a small thread pool (fs, crypto, dns).', '<b>libuv</b>: إدخال/إخراج غير متزامن + مجموعة خيوط صغيرة (fs، crypto، dns).'],
                        ['<b>Single JS thread</b>: great for I/O-heavy APIs, bad for heavy CPU work.', '<b>خيط JavaScript واحد</b>: ممتاز للواجهات كثيرة الإدخال/الإخراج، سيئ للحسابات الثقيلة.']
                    ] }],
                    [{ warn: ['A long loop (e.g. hashing in pure JS, huge JSON.parse) <b>blocks every user</b>. Offload CPU work to worker threads or a queue (chapter 30).', 'حلقة طويلة (مثل تجزئة بـ JS خالص أو JSON.parse ضخم) <b>توقف كل المستخدمين</b>. انقل العمل الثقيل إلى worker threads أو طابور (الفصل 30).'] },
                     { note: ['One waiter (thread) takes orders from many tables and hands them to the kitchen (libuv). He never stands still waiting for one dish.', 'نادل واحد (خيط) يأخذ الطلبات من طاولات كثيرة ويسلمها للمطبخ (libuv). لا يقف أبدًا منتظرًا طبقًا واحدًا.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['npm, package.json & scripts', 'npm و package.json والسكربتات'],
            b: [
                { cols: [
                    [{ term: `mkdir hello-node && cd hello-node
npm init -y
npm pkg set type=module
npm install dayjs          # dependency
npm install -D eslint      # dev dependency` },
                     { table: { h: [['Range', 'المدى'], ['Accepts', 'يقبل']], r: [
                         ['<code>^5.1.0</code>', ['5.x.x (minor + patch)', '5.x.x (ثانوي + تصحيح)']],
                         ['<code>~5.1.0</code>', ['5.1.x (patch only)', '5.1.x (تصحيح فقط)']],
                         ['<code>5.1.0</code>', ['exactly 5.1.0', '5.1.0 بالضبط']]
                     ] } }],
                    [{ code: `{
  "name": "hello-node",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "lint": "eslint ."
  },
  "dependencies": { "dayjs": "^1.11.13" },
  "devDependencies": { "eslint": "^9.0.0" },
  "engines": { "node": ">=22" }
}`, file: 'package.json', hl: '4,6-7' }]
                ] },
                { best: ['Commit <code>package-lock.json</code> (reproducible installs), never commit <code>node_modules/</code>. In CI use <code>npm ci</code>.', 'احفظ <code>package-lock.json</code> في Git (تثبيت قابل للتكرار) ولا تحفظ <code>node_modules/</code> أبدًا. في CI استخدم <code>npm ci</code>.'] }
            ]
        },
        {
            kind: 'code', t: ['A server with only the http module', 'خادم بوحدة http فقط'],
            b: [
                { cols: [
                    [{ code: `import http from 'node:http';

const tasks = [{ id: 1, title: 'Learn Node', done: false }];

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/tasks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(tasks));
  }
  if (req.method === 'POST' && req.url === '/tasks') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const task = { id: tasks.length + 1, ...JSON.parse(body), done: false };
      tasks.push(task);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('http://localhost:3000'));`, file: 'server.js', hl: '6,10-13', x: 'raw-http' }],
                    [{ term: `node server.js
curl localhost:3000/tasks
curl -X POST localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Try Express"}'`, out: `[{"id":1,"title":"Learn Node","done":false}]
{"id":2,"title":"Try Express","done":false}` },
                     { warn: ['Manual URL matching, manual body parsing, no params, no error handling, invalid JSON crashes the server… Express solves exactly this.', 'مطابقة المسارات يدويًا، قراءة الجسم يدويًا، بلا معاملات، بلا معالجة أخطاء، و JSON خاطئ يُسقط الخادم… Express يحل هذا بالضبط.'] }]
                ] }
            ]
        },
        {
            kind: 'exercise', t: ['Extend the raw server', 'وسّع الخادم الخام'],
            b: [{ tasks: [
                ['Add <code>GET /health</code> returning <code>{ "status": "ok", "uptime": process.uptime() }</code>.', 'أضف <code>GET /health</code> يعيد <code>{ "status": "ok", "uptime": process.uptime() }</code>.'],
                ['Add <code>GET /tasks/1</code> — parse the id from <code>req.url</code> and return 404 if not found.', 'أضف <code>GET /tasks/1</code> — استخرج المعرّف من <code>req.url</code> وأعد 404 إن لم يوجد.'],
                ['Send invalid JSON in the POST. What happens? Wrap <code>JSON.parse</code> in <code>try/catch</code> and return 400.', 'أرسل JSON غير صالح في POST. ماذا يحدث؟ ضع <code>JSON.parse</code> داخل <code>try/catch</code> وأعد 400.'],
                ['Add a <code>"dev"</code> script using <code>node --watch</code> and see the server restart on save.', 'أضف سكربت <code>"dev"</code> باستخدام <code>node --watch</code> ولاحظ إعادة التشغيل عند الحفظ.']
            ], time: 12, hint: ['<code>const match = req.url.match(/^\\/tasks\\/(\\d+)$/)</code> gives you the id in <code>match[1]</code>.', '<code>const match = req.url.match(/^\\/tasks\\/(\\d+)$/)</code> يعطيك المعرّف في <code>match[1]</code>.'] }]
        }
    ],
    quiz: [
        { q: ['Why can Node handle many concurrent connections with one JS thread?', 'لماذا يستطيع Node التعامل مع اتصالات كثيرة بخيط JavaScript واحد؟'], o: [['It creates one thread per request', 'ينشئ خيطًا لكل طلب'], ['Non-blocking I/O + event loop', 'إدخال/إخراج غير حاجب + حلقة أحداث'], ['It caches every response', 'يخزن كل استجابة مؤقتًا'], ['It compiles to C++', 'يُترجم إلى C++']], a: 1, e: ['I/O waits happen outside the JS thread; the loop dispatches callbacks when ready.', 'الانتظار يحدث خارج خيط JS؛ والحلقة توزع الاستدعاءات عند الجاهزية.'] },
        { tf: false, q: ['You should commit <code>node_modules</code> to Git so teammates do not need to install.', 'يجب حفظ <code>node_modules</code> في Git حتى لا يحتاج الزملاء إلى التثبيت.'], e: ['Commit package.json + package-lock.json; run npm ci to reproduce.', 'احفظ package.json و package-lock.json؛ ونفّذ npm ci لإعادة البناء.'] },
        { q: ['<code>"express": "^5.1.0"</code> allows which update?', '<code>"express": "^5.1.0"</code> يسمح بأي تحديث؟'], o: ['`6.0.0`', '`5.2.3`', '`4.21.0`', ['none', 'لا شيء']], a: 1, e: ['Caret allows minor and patch updates within the same major.', 'الرمز ^ يسمح بالتحديثات الثانوية والتصحيحية ضمن نفس الإصدار الرئيسي.'] },
        { q: ['Which command installs exactly what the lockfile says (ideal for CI)?', 'أي أمر يثبّت بالضبط ما في ملف القفل (مثالي لـ CI)؟'], o: ['`npm install`', '`npm ci`', '`npm update`', '`npx install`'], a: 1, e: ['npm ci deletes node_modules and installs from package-lock.json strictly.', 'npm ci يحذف node_modules ويثبت من package-lock.json بدقة.'] },
        { q: ['What blocks the event loop?', 'ما الذي يحجب حلقة الأحداث؟'], o: ['`await fetch(url)`', '`fs.promises.readFile()`', ['A CPU-heavy synchronous loop', 'حلقة متزامنة ثقيلة على المعالج'], '`setTimeout(fn, 1000)`'], a: 2, e: ['Synchronous CPU work runs on the only JS thread and freezes everything else.', 'العمل المتزامن الثقيل يعمل على خيط JS الوحيد ويجمّد كل شيء آخر.'] }
    ]
});

DECK.chapters.push({
    n: 4, level: 0, icon: '🧰',
    t: ['Tools of the trade', 'أدوات العمل'],
    sub: ['VS Code, Postman / Thunder Client / curl, and Git basics', 'VS Code و Postman / Thunder Client / curl وأساسيات Git'],
    learn: [
        ['Set up VS Code for Node development', 'جهّز VS Code لتطوير Node'],
        ['Test any API with curl, a GUI client or a .http file', 'اختبر أي API بـ curl أو أداة رسومية أو ملف .http'],
        ['Use Git daily: commit, branch, push, ignore secrets', 'استخدم Git يوميًا: حفظ، فروع، دفع، وتجاهل الأسرار']
    ],
    slides: [
        {
            kind: 'concept', t: ['Your toolbox', 'صندوق أدواتك'],
            b: [{ cards: [
                { i: '🧑‍💻', t: 'VS Code', d: ['Extensions: ESLint, Prettier, REST Client or Thunder Client, DotENV, GitLens, Error Lens.', 'إضافات: ESLint و Prettier و REST Client أو Thunder Client و DotENV و GitLens و Error Lens.'] },
                { i: '🧪', t: ['API clients', 'أدوات اختبار API'], d: ['Postman / Insomnia (full apps), Thunder Client (inside VS Code), Bruno (git-friendly files).', 'Postman / Insomnia (تطبيقات كاملة)، Thunder Client (داخل VS Code)، Bruno (ملفات مناسبة لـ Git).'] },
                { i: '⌨️', t: 'curl', d: ['Always available, scriptable, perfect for docs and CI. <code>-i</code> shows headers.', 'متوفر دائمًا، قابل للبرمجة، مثالي للتوثيق و CI. الخيار <code>-i</code> يعرض الترويسات.'] },
                { i: '🌿', t: 'Git + GitHub', d: ['History, branches, pull requests, code review, CI/CD.', 'السجل، الفروع، طلبات الدمج، مراجعة الكود، CI/CD.'] },
                { i: '🔢', t: ['Node version manager', 'مدير إصدارات Node'], d: ['<code>nvm</code> / <code>fnm</code> / <code>volta</code> — switch Node versions per project.', '<code>nvm</code> / <code>fnm</code> / <code>volta</code> — بدّل إصدار Node لكل مشروع.'] },
                { i: '🐞', t: ['Debugger', 'المصحح'], d: ['<code>node --inspect</code> or VS Code “JavaScript Debug Terminal”: breakpoints instead of console.log.', '<code>node --inspect</code> أو "JavaScript Debug Terminal" في VS Code: نقاط توقف بدل console.log.'] }
            ] }]
        },
        {
            kind: 'code', t: ['curl & .http files', 'curl وملفات .http'],
            b: [{ cols: [
                [{ term: `# GET with headers shown
curl -i http://localhost:3000/tasks

# POST JSON
curl -X POST http://localhost:3000/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Buy milk"}'

# auth header + pretty print (needs jq)
curl -s http://localhost:3000/me \\
  -H "Authorization: Bearer $TOKEN" | jq` }],
                [{ code: `@base = http://localhost:3000

### List tasks
GET {{base}}/tasks

### Create a task
POST {{base}}/tasks
Content-Type: application/json

{ "title": "Buy milk" }`, file: 'requests.http', lang: 'http' },
                 { tip: ['With the <b>REST Client</b> extension a “Send Request” link appears above each <code>###</code>. Commit the file — it is living documentation for your API.', 'مع إضافة <b>REST Client</b> يظهر رابط "Send Request" فوق كل <code>###</code>. احفظ الملف في Git — إنه توثيق حي لواجهتك.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Git in 10 commands', 'Git في 10 أوامر'],
            b: [{ cols: [
                [{ term: `git init
git switch -c feature/tasks     # new branch
git status
git add .
git commit -m "feat: add tasks route"
git log --oneline
git remote add origin git@github.com:you/tasky.git
git push -u origin feature/tasks
git pull --rebase
git diff` }],
                [{ code: `node_modules/
.env
.env.*
!.env.example
coverage/
dist/
*.log
.DS_Store`, file: '.gitignore', lang: 'text' },
                 { warn: ['Leaked a secret in a commit? Deleting the file is not enough — it stays in history. <b>Rotate the secret immediately.</b>', 'سرّبت سرًا في commit؟ حذف الملف لا يكفي — يبقى في السجل. <b>غيّر السر فورًا.</b>'] },
                 { best: ['Use Conventional Commits: <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>, <code>test:</code> — it enables automatic changelogs (chapter 37).', 'استخدم Conventional Commits: <code>feat:</code> و <code>fix:</code> و <code>docs:</code> و <code>refactor:</code> و <code>test:</code> — يسمح بإنشاء سجل التغييرات تلقائيًا (الفصل 37).'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Set up your workstation', 'جهّز محطة عملك'],
            b: [{ tasks: [
                ['Check <code>node -v</code> (≥ 22) and <code>npm -v</code>. Install <code>fnm</code> or <code>nvm</code> if needed.', 'تحقق من <code>node -v</code> (≥ 22) و <code>npm -v</code>. ثبّت <code>fnm</code> أو <code>nvm</code> عند الحاجة.'],
                ['Create a GitHub repo <code>tasky-api</code>, clone it, add the <code>.gitignore</code> above, make your first commit.', 'أنشئ مستودع GitHub باسم <code>tasky-api</code>، استنسخه، أضف <code>.gitignore</code> أعلاه، واعمل أول commit.'],
                ['Install REST Client or Thunder Client and send a request to the raw server from chapter 3.', 'ثبّت REST Client أو Thunder Client وأرسل طلبًا إلى الخادم الخام من الفصل 3.'],
                ['Put a breakpoint inside the request handler and inspect <code>req.method</code> in the debugger.', 'ضع نقطة توقف داخل معالج الطلب وافحص <code>req.method</code> في المصحح.']
            ], time: 15 }]
        }
    ],
    quiz: [
        { q: ['Which file prevents <code>.env</code> from being committed?', 'أي ملف يمنع حفظ <code>.env</code> في Git؟'], o: ['`package.json`', '`.gitignore`', '`.npmrc`', '`.env.example`'], a: 1, e: ['Patterns listed in .gitignore are not tracked.', 'الأنماط المذكورة في ‎.gitignore لا يتتبعها Git.'] },
        { q: ['Which curl flag prints the response headers?', 'أي خيار في curl يطبع ترويسات الاستجابة؟'], o: ['`-d`', '`-X`', '`-i`', '`-H`'], a: 2, e: ['-i includes headers; -H sets a request header; -d sends a body; -X sets the method.', '-i يعرض الترويسات؛ -H يضبط ترويسة طلب؛ -d يرسل جسمًا؛ -X يحدد الطريقة.'] },
        { tf: false, q: ['Deleting a committed secret in a new commit makes it safe again.', 'حذف سر محفوظ في commit جديد يجعله آمنًا مرة أخرى.'], e: ['Git history keeps it forever. Rotate the secret.', 'سجل Git يحتفظ به للأبد. غيّر السر.'] },
        { q: ['Best commit message?', 'ما أفضل رسالة commit؟'], o: ['`update`', '`fix stuff`', '`feat: add POST /tasks endpoint`', '`asdf`'], a: 2, e: ['Clear, conventional, describes the change.', 'واضحة، تتبع الاصطلاح، وتصف التغيير.'] }
    ]
});
