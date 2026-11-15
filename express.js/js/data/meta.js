/* Deck metadata, levels, intro and closing slides.
   Every human-readable string is an [english, arabic] pair. Code is always plain English strings. */
window.DECK = window.DECK || { chapters: [] };

DECK.meta = {
    id: 'express',
    root: '../',
    title: ['Express.js — Zero to Senior', 'Express.js — من الصفر إلى الاحتراف'],
    short: ['Express.js · Zero → Senior', 'Express.js · من الصفر للاحتراف']
};

DECK.levels = [
    { icon: '🧱', t: ['Prerequisites', 'المتطلبات الأساسية'], sub: ['A quick refresher: the web, modern JavaScript, Node.js and your tools.', 'مراجعة سريعة: الويب، JavaScript الحديثة، Node.js وأدواتك.'] },
    { icon: '🌱', t: ['Beginner', 'المبتدئ'], sub: ['Your first Express server, routing, middleware and a clean project structure.', 'أول خادم Express، التوجيه، الوسائط، وهيكلة نظيفة للمشروع.'] },
    { icon: '🔧', t: ['Intermediate', 'المتوسط'], sub: ['A real REST API: databases, validation, errors, auth, uploads, logging, docs.', 'واجهة REST حقيقية: قواعد بيانات، تحقق، أخطاء، مصادقة، رفع ملفات، سجلات، توثيق.'] },
    { icon: '🚀', t: ['Advanced', 'المتقدم'], sub: ['Security, testing, TypeScript, clean architecture, caching, jobs, real-time, performance.', 'الأمان، الاختبارات، TypeScript، البنية النظيفة، التخزين المؤقت، المهام، الوقت الحقيقي، الأداء.'] },
    { icon: '👑', t: ['Pro / Senior', 'المحترف / Senior'], sub: ['Architecture, API design, Docker, CI/CD, deployment, observability and the capstone.', 'المعمارية، تصميم الواجهات، Docker، CI/CD، النشر، المراقبة، والمشروع الختامي.'] }
];

DECK.intro = [
    {
        id: 'start', type: 'title', img: 'img/hero.svg',
        alt: ['Illustration: a laptop sends GET /tasks to an Express server, which answers 200 JSON', 'رسم: حاسوب يرسل GET /tasks إلى خادم Express فيرد بـ 200 JSON'],
        t: ['Express.js — Zero → Senior', 'Express.js — من الصفر إلى الاحتراف'],
        sub: ['Build, secure, test and ship production APIs with Node.js — one chapter, one runnable example, one quiz at a time.', 'ابنِ واجهات API احترافية بـ Node.js وأمّنها واختبرها وانشرها — فصل، مثال قابل للتشغيل، واختبار في كل مرة.'],
        chips: [['43 chapters', '43 فصلًا'], ['5 levels', '5 مستويات'], ['200+ quiz questions', '+200 سؤال'], ['Express 5 · Node 22+', 'Express 5 · Node 22+'], ['AR / EN', 'عربي / EN']]
    },
    {
        id: 'author', t: ['Who made these slides?', 'من صنع هذه الشرائح؟'],
        b: [
            { lead: ['Hi, I\'m <b>Oussama Taright</b> — a full-stack developer and Computer Science student at <b>USTHB</b> (Algiers, Algeria). I build web and mobile apps with React, Next.js, React Native, Node.js and Express, and I made this deck to teach what I use every day.', 'مرحبًا، أنا <b>أسامة تاريت</b> — مطوّر Full-Stack وطالب إعلام آلي في <b>USTHB</b> (الجزائر العاصمة). أبني تطبيقات ويب وموبايل بـ React و Next.js و React Native و Node.js و Express، وصنعت هذه الشرائح لأعلّم ما أستخدمه كل يوم.'] },
            { cols: [
                [{ h3: ['What I\'ve built', 'من أعمالي'] }, { ul: [
                    ['<b>WASSLA</b> — marketplace & delivery platform, live on Google Play and the App Store (Express + MongoDB + Socket.io).', '<b>WASSLA</b> — منصة سوق وتوصيل، متاحة على Google Play و App Store (Express + MongoDB + Socket.io).'],
                    ['<b>Code Souls</b> — gamified frontend learning platform, 🥇 1st place at GDG Hackathon.', '<b>Code Souls</b> — منصة تعليم Frontend بأسلوب الألعاب، 🥇 المركز الأول في GDG Hackathon.'],
                    ['<b>ChoufPrice DZ</b> — community price monitoring across the 58 wilayas.', '<b>ChoufPrice DZ</b> — منصة مجتمعية لمتابعة الأسعار في 58 ولاية.'],
                    ['<b>Sakinah</b> — open-source, offline-first Islamic app (Expo + React Native).', '<b>Sakinah</b> — تطبيق إسلامي مفتوح المصدر يعمل دون اتصال (Expo + React Native).']
                ] }],
                [{ h3: ['Contact me', 'تواصل معي'] }, { cards: [
                    { i: '✉️', t: ['Email', 'البريد'], d: ['<a href="mailto:oussamatght6@gmail.com">oussamatght6@gmail.com</a>', '<a href="mailto:oussamatght6@gmail.com">oussamatght6@gmail.com</a>'] },
                    { i: '💻', t: ['GitHub', 'GitHub'], d: ['<a href="https://github.com/oussamatght" target="_blank" rel="noopener">github.com/oussamatght</a>', '<a href="https://github.com/oussamatght" target="_blank" rel="noopener">github.com/oussamatght</a>'] },
                    { i: '💼', t: ['LinkedIn', 'LinkedIn'], d: ['<a href="https://www.linkedin.com/in/taright-oussama" target="_blank" rel="noopener">in/taright-oussama</a>', '<a href="https://www.linkedin.com/in/taright-oussama" target="_blank" rel="noopener">in/taright-oussama</a>'] },
                    { i: '📸', t: ['Instagram', 'Instagram'], d: ['<a href="https://www.instagram.com/oussama_soul_" target="_blank" rel="noopener">@oussama_soul_</a>', '<a href="https://www.instagram.com/oussama_soul_" target="_blank" rel="noopener">@oussama_soul_</a>'] }
                ] }]
            ] },
            { tip: ['Questions, bugs in the slides, or ideas for new chapters? Message me or open an issue on <a href="https://github.com/oussamatght/slides" target="_blank" rel="noopener">github.com/oussamatght/slides</a>.', 'عندك سؤال، خطأ في الشرائح، أو فكرة لفصل جديد؟ راسلني أو افتح issue على <a href="https://github.com/oussamatght/slides" target="_blank" rel="noopener">github.com/oussamatght/slides</a>.'] }
        ]
    },
    {
        id: 'how-to', t: ['How to use this deck', 'كيف تستخدم هذه الشرائح'],
        b: [
            { cards: [
                { i: '⌨️', t: ['Navigate', 'التنقل'], d: ['<kbd>←</kbd> <kbd>→</kbd> or Space, swipe on phones. <kbd>Esc</kbd> = overview, <kbd>M</kbd> = chapters, <kbd>?</kbd> = all shortcuts.', '<kbd>←</kbd> <kbd>→</kbd> أو المسافة، والسحب على الهاتف. <kbd>Esc</kbd> نظرة عامة، <kbd>M</kbd> الفصول، <kbd>?</kbd> كل الاختصارات.'] },
                { i: '📋', t: ['Copy-paste code', 'انسخ والصق الكود'], d: ['Every block has a <b>Copy</b> button, a file name, and highlighted key lines.', 'كل كتلة كود فيها زر <b>نسخ</b> واسم الملف والأسطر المهمة مظللة.'] },
                { i: '📝', t: ['Quiz every chapter', 'اختبار لكل فصل'], d: ['Instant feedback, explanations, best score saved. Final exam at the end.', 'تصحيح فوري مع شرح، وحفظ أفضل نتيجة. وامتحان نهائي في الختام.'] },
                { i: '🧑‍🏫', t: ['Teacher tools', 'أدوات المدرّس'], d: ['Exercise timers, <kbd>L</kbd> laser pointer, <kbd>B</kbd> black screen, <kbd>A+</kbd> bigger text for projectors, print to PDF.', 'مؤقت للتمارين، <kbd>L</kbd> مؤشر ليزر، <kbd>B</kbd> شاشة سوداء، <kbd>A+</kbd> تكبير الخط للعرض، والطباعة إلى PDF.'] }
            ] },
            { h3: ['Conventions used in every example', 'اصطلاحات كل الأمثلة'] },
            { ul: [
                ['<b>Node.js 22 LTS or newer</b> — check with <code>node -v</code>.', '<b>Node.js 22 LTS أو أحدث</b> — تحقق بـ <code>node -v</code>.'],
                ['<b>ES Modules</b> everywhere: <code>"type": "module"</code> in package.json, <code>import</code> / <code>export</code>.', '<b>ES Modules</b> في كل مكان: <code>"type": "module"</code> في package.json و <code>import</code> / <code>export</code>.'],
                ['<b>Express 5</b> (the current major). Differences from v4 are flagged and summarised in chapter 42.', '<b>Express 5</b> (الإصدار الحالي). الفروق مع v4 موضحة وملخصة في الفصل 42.'],
                ['Code always stays in English and left-to-right, even on Arabic slides.', 'الكود يبقى دائمًا بالإنجليزية ومن اليسار لليمين حتى في الشرائح العربية.']
            ] }
        ]
    },
    {
        id: 'roadmap', type: 'roadmap', t: ['The roadmap', 'خارطة الطريق'],
        before: [{ lead: ['Five levels. Click a level to jump to it. Each chapter follows the same rhythm:', 'خمسة مستويات. اضغط على أي مستوى للانتقال إليه. كل فصل يتبع نفس الإيقاع:'] }],
        b: [{ steps: [
            ['<b>Concept</b> — the idea, with a diagram or analogy.', '<b>مفهوم</b> — الفكرة مع رسم أو تشبيه.'],
            ['<b>Example</b> — complete, runnable, copy-paste code with the expected output.', '<b>مثال</b> — كود كامل قابل للتشغيل والنسخ مع الناتج المتوقع.'],
            ['<b>Try it yourself</b> — a hands-on exercise (with a timer for class).', '<b>جرّب بنفسك</b> — تمرين عملي (مع مؤقت للقسم).'],
            ['<b>Quiz</b> — 4–6 questions with instant feedback.', '<b>اختبار</b> — من 4 إلى 6 أسئلة مع تصحيح فوري.']
        ] }]
    },
    {
        id: 'project', t: ['The running project: Tasky API', 'المشروع المستمر: Tasky API'],
        b: [
            { lead: ['We build <b>one</b> REST API for a team task manager. It starts as 10 lines in chapter 6 and ends as a dockerised, tested, documented, deployed service in chapter 43.', 'نبني واجهة REST <b>واحدة</b> لتطبيق إدارة مهام فريق. تبدأ بـ 10 أسطر في الفصل 6 وتنتهي كخدمة في Docker مختبرة وموثقة ومنشورة في الفصل 43.'] },
            { table: { h: [['Chapter', 'الفصل'], ['What Tasky gains', 'ماذا يضاف إلى Tasky']], r: [
                ['6 – 8', ['Server, first routes, reading <code>req</code> and sending JSON', 'الخادم، أول المسارات، قراءة <code>req</code> وإرسال JSON']],
                ['9 – 12', ['Middleware, routers, routes / controllers / services folders', 'الوسائط، الموجّهات، مجلدات routes / controllers / services']],
                ['13 – 17', ['Full CRUD, MongoDB or PostgreSQL, Zod validation, central error handling', 'CRUD كامل، MongoDB أو PostgreSQL، تحقق Zod، معالجة أخطاء مركزية']],
                ['18 – 24', ['JWT auth, roles, uploads, pagination, logging, Swagger docs', 'مصادقة JWT، الأدوار، رفع الملفات، التصفح، السجلات، توثيق Swagger']],
                ['25 – 33', ['Security, tests, TypeScript, clean architecture, Redis, jobs, sockets', 'الأمان، الاختبارات، TypeScript، البنية النظيفة، Redis، المهام، Sockets']],
                ['34 – 43', ['Docker, CI/CD, Nginx + PM2, monitoring, Express 5 polish, capstone', 'Docker، CI/CD، Nginx + PM2، المراقبة، لمسات Express 5، المشروع الختامي']]
            ] } },
            { note: ['Think of Tasky as a restaurant: routes are the menu, controllers are waiters, services are the chefs, and the database is the pantry. We open a tiny food truck first and grow it into a chain.', 'تخيّل Tasky كمطعم: المسارات هي قائمة الطعام، والمتحكمات هم النُدُل، والخدمات هم الطهاة، وقاعدة البيانات هي المخزن. نبدأ بعربة طعام صغيرة ثم نكبر حتى نصبح سلسلة مطاعم.'] }
        ]
    }
];

DECK.outro = [
    { id: 'exam', type: 'exam', t: ['Final exam', 'الامتحان النهائي'] },
    { id: 'dashboard', type: 'dashboard', t: ['Your progress', 'تقدّمك'], b: [
        { tip: ['Scores are stored only in this browser (localStorage). Click a chapter to retake its quiz.', 'النتائج محفوظة في هذا المتصفح فقط (localStorage). اضغط على فصل لإعادة اختباره.'] }
    ] },
    {
        id: 'glossary', t: ['Glossary — English ↔ Arabic', 'المصطلحات — إنجليزي ↔ عربي'],
        b: [{ table: { h: [['Term', 'المصطلح'], ['Arabic', 'بالعربية'], ['Meaning', 'المعنى']], r: [
            ['Request / Response', 'الطلب / الاستجابة', ['What the client sends / what the server returns', 'ما يرسله العميل / ما يعيده الخادم']],
            ['Route', 'المسار', ['HTTP method + path → handler', 'طريقة HTTP + مسار ← معالج']],
            ['Middleware', 'الوسيط (البرمجية الوسيطة)', ['Function that runs between request and response', 'دالة تعمل بين الطلب والاستجابة']],
            ['Handler / Controller', 'المعالج / المتحكم', ['Function that answers a route', 'الدالة التي ترد على المسار']],
            ['Payload / Body', 'الحمولة / جسم الطلب', ['Data sent inside the request', 'البيانات المرسلة داخل الطلب']],
            ['Status code', 'رمز الحالة', ['3-digit result: 200, 201, 400, 404, 500…', 'نتيجة من 3 أرقام: 200، 201، 400، 404، 500…']],
            ['Schema / Model', 'المخطط / النموذج', ['Shape of the data + DB access object', 'شكل البيانات + كائن الوصول لقاعدة البيانات']],
            ['Validation', 'التحقق', ['Rejecting bad input early', 'رفض المدخلات الخاطئة مبكرًا']],
            ['Authentication / Authorization', 'المصادقة / التفويض', ['Who are you? / What may you do?', 'من أنت؟ / ماذا يحق لك؟']],
            ['Token (JWT)', 'رمز الوصول', ['Signed proof of identity', 'دليل هوية موقّع']],
            ['Hashing', 'التجزئة', ['One-way transform (passwords)', 'تحويل باتجاه واحد (كلمات المرور)']],
            ['Rate limiting', 'تحديد المعدل', ['Max requests per time window', 'حد أقصى للطلبات في فترة زمنية']],
            ['Cache', 'الذاكرة المؤقتة', ['Fast copy of data', 'نسخة سريعة من البيانات']],
            ['Queue / Worker', 'الطابور / العامل', ['Background job list / process that runs jobs', 'قائمة مهام خلفية / عملية تنفذها']],
            ['Deployment', 'النشر', ['Running the app on a server for users', 'تشغيل التطبيق على خادم للمستخدمين']],
            ['Observability', 'قابلية المراقبة', ['Logs, metrics and traces', 'السجلات والمقاييس والتتبع']],
            ['Idempotent', 'متساوي الأثر', ['Same request twice = same result', 'نفس الطلب مرتين = نفس النتيجة']]
        ] } }]
    },
    {
        id: 'cheatsheet', t: ['Express cheat sheet', 'ملخص Express السريع'],
        b: [{ cols: [
            [{ code: `import express from 'express';
const app = express();

app.use(express.json());              // parse JSON body
app.use(express.static('public'));    // serve files

app.get('/tasks', list);              // read all
app.get('/tasks/:id', getOne);        // req.params.id
app.post('/tasks', create);           // req.body
app.patch('/tasks/:id', update);
app.delete('/tasks/:id', remove);

const router = express.Router();
app.use('/api/v1', router);           // prefix

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => res.status(err.status ?? 500).json({ error: err.message }));

app.listen(3000);`, file: 'cheatsheet.js' }],
            [{ table: { h: ['req', 'res'], r: [
                ['<code>req.params</code>', '<code>res.status(201)</code>'],
                ['<code>req.query</code>', '<code>res.json(obj)</code>'],
                ['<code>req.body</code>', '<code>res.send(text)</code>'],
                ['<code>req.headers</code> · <code>req.get()</code>', '<code>res.set(name, v)</code>'],
                ['<code>req.cookies</code>*', '<code>res.cookie(n, v, opts)</code>'],
                ['<code>req.ip</code> · <code>req.method</code>', '<code>res.redirect(301, url)</code>'],
                ['<code>req.originalUrl</code>', '<code>res.sendFile(absPath)</code>'],
                ['<code>req.user</code>**', '<code>res.sendStatus(204)</code>']
            ] } },
            { p: ['* needs <code>cookie-parser</code> · ** set by your auth middleware', '* يحتاج <code>cookie-parser</code> · ** يضيفه وسيط المصادقة لديك'] },
            { table: { h: [['Status', 'الرمز'], ['Use', 'الاستخدام']], r: [
                ['200 / 201 / 204', ['OK / Created / No content', 'نجاح / تم الإنشاء / بدون محتوى']],
                ['400 / 401 / 403', ['Bad input / Not logged in / Not allowed', 'مدخل خاطئ / غير مسجل / غير مسموح']],
                ['404 / 409 / 422', ['Not found / Conflict / Invalid', 'غير موجود / تعارض / غير صالح']],
                ['429 / 500 / 503', ['Too many / Server bug / Unavailable', 'طلبات كثيرة / خطأ خادم / غير متاح']]
            ] } }]
        ] }]
    },
    {
        id: 'credits', t: ['Credits & resources', 'المصادر والشكر'],
        b: [{ cols: [
            [{ h3: ['Visuals', 'المرئيات'] }, { ul: [
                ['All diagrams, icons and illustrations (<code>img/*.svg</code>, animated SVG diagrams) are original artwork made for this deck — free to reuse in your classes.', 'كل الرسوم والأيقونات والرسومات (<code>img/*.svg</code> والمخططات المتحركة) أصلية صُممت لهذه الشرائح — يمكنك استخدامها في دروسك.'],
                ['Emoji are rendered by your operating system font.', 'الرموز التعبيرية تُعرض بخط نظام التشغيل لديك.'],
                ['Fonts: Space Grotesk, JetBrains Mono, Cairo — SIL Open Font License, via Google Fonts (system fonts are used offline).', 'الخطوط: Space Grotesk و JetBrains Mono و Cairo — رخصة SIL المفتوحة عبر Google Fonts (تُستخدم خطوط النظام دون اتصال).']
            ] }],
            [{ h3: ['Official docs', 'التوثيق الرسمي'] }, { ul: [
                ['<a href="https://expressjs.com/" target="_blank" rel="noopener">expressjs.com</a> — guide, API 5.x, migration guide', '<a href="https://expressjs.com/" target="_blank" rel="noopener">expressjs.com</a> — الدليل، API 5.x، دليل الترحيل'],
                ['<a href="https://nodejs.org/docs/latest/api/" target="_blank" rel="noopener">nodejs.org/docs</a> — Node.js API', '<a href="https://nodejs.org/docs/latest/api/" target="_blank" rel="noopener">nodejs.org/docs</a> — واجهة Node.js'],
                ['<a href="https://developer.mozilla.org/docs/Web/HTTP" target="_blank" rel="noopener">MDN HTTP</a> — methods, headers, status codes', '<a href="https://developer.mozilla.org/docs/Web/HTTP" target="_blank" rel="noopener">MDN HTTP</a> — الطرق، الترويسات، رموز الحالة'],
                ['<a href="https://owasp.org/API-Security/" target="_blank" rel="noopener">OWASP API Security Top 10</a>', '<a href="https://owasp.org/API-Security/" target="_blank" rel="noopener">OWASP API Security Top 10</a>'],
                ['Library docs: Mongoose, Prisma, Zod, Vitest, Supertest, Pino, BullMQ, Socket.IO, Docker, GitHub Actions', 'توثيق المكتبات: Mongoose و Prisma و Zod و Vitest و Supertest و Pino و BullMQ و Socket.IO و Docker و GitHub Actions']
            ] }]
        ] }]
    },
    {
        id: 'thanks', center: true, narrow: true, t: ['You made it! 🎉', 'وصلت إلى النهاية! 🎉'],
        sub: ['From <code>app.listen</code> to production. Now build something real, ship it, and teach someone else.', 'من <code>app.listen</code> إلى بيئة الإنتاج. الآن ابنِ شيئًا حقيقيًا، انشره، وعلّم غيرك.'],
        b: [{ img: 'img/trophy.svg', alt: ['Trophy with a rocket', 'كأس مع صاروخ'] }]
    }
];
