/* Level 3 — Advanced (chapters 25–33). Each chapter ends with a "Mistakes & interview" slide. */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 25, level: 3, icon: '🛡️',
    t: ['Security', 'الأمان'],
    sub: ['helmet, CORS, rate limiting, injections, XSS, CSRF, OWASP Top 10, secrets', 'helmet و CORS وتحديد المعدل والحقن و XSS و CSRF و OWASP Top 10 والأسرار'],
    project: ['Tasky gets security headers, rate limits on auth, and injection-proof queries.', 'يحصل Tasky على ترويسات أمان وتحديد معدل للمصادقة واستعلامات محصنة ضد الحقن.'],
    learn: [
        ['Harden an Express app in 10 lines', 'حصّن تطبيق Express في 10 أسطر'],
        ['Recognise and block NoSQL/SQL injection, XSS and CSRF', 'تعرّف على حقن NoSQL/SQL و XSS و CSRF وامنعها'],
        ['Map your API against the OWASP API Top 10', 'قيّم واجهتك وفق OWASP API Top 10']
    ],
    slides: [
        {
            kind: 'code', t: ['The security middleware stack', 'طبقة وسائط الأمان'],
            b: [{ cols: [
                [{ term: 'npm install helmet express-rate-limit cors' },
                 { code: `import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

app.disable('x-powered-by');                 // don't advertise Express
app.set('trust proxy', 1);                   // real client IP behind Nginx

app.use(helmet());                           // CSP, HSTS, noSniff, frameguard…
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));   // body size limit

// global limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,                  // 15 minutes
  limit: 300,                                // per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));

// strict limiter for brute-force targets
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);`, file: 'src/app.js (security)', lang: 'js', hl: '8,13-18,21' }],
                [{ table: { h: [['helmet sets', 'helmet يضبط'], ['Protects against', 'يحمي من']], r: [
                    ['<code>Content-Security-Policy</code>', ['XSS, injected scripts', 'XSS والسكربتات المحقونة']],
                    ['<code>Strict-Transport-Security</code>', ['HTTPS downgrade', 'الرجوع إلى HTTP']],
                    ['<code>X-Content-Type-Options: nosniff</code>', ['MIME sniffing', 'تخمين نوع الملف']],
                    ['<code>X-Frame-Options</code> / <code>frame-ancestors</code>', ['clickjacking', 'الاختطاف بالنقر']],
                    ['<code>Referrer-Policy</code>', ['leaking URLs', 'تسريب الروابط']]
                ] } },
                 { term: 'curl -I localhost:3000/health', out: `HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';…
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
RateLimit-Policy: "300-in-15min"; q=300; w=900; pk=…
RateLimit: "300-in-15min"; r=299; t=900` },
                 { warn: ['In-memory rate limits reset on restart and are per-process. With several instances, use a shared store (<code>rate-limit-redis</code>).', 'تحديد المعدل في الذاكرة يُعاد ضبطه عند إعادة التشغيل ويعمل لكل عملية. مع عدة نسخ استخدم مخزنًا مشتركًا (<code>rate-limit-redis</code>).'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Injections, XSS & CSRF', 'الحقن و XSS و CSRF'],
            b: [{ cols: [
                [{ code: `// ❌ NoSQL injection: body = { "email": "a@b.c", "password": { "$ne": null } }
const user = await User.findOne({ email: req.body.email, password: req.body.password });

// ✅ 1) validate types (Zod: password must be a string)
// ✅ 2) let Mongoose strip query operators from user input
mongoose.set('sanitizeFilter', true);

// ❌ SQL injection with string concatenation
await pool.query(\`SELECT * FROM users WHERE email = '\${email}'\`);
// ✅ parameterized query (pg) — values never become SQL
await pool.query('SELECT * FROM users WHERE email = $1', [email]);
// ✅ Prisma is parameterized; avoid $queryRawUnsafe with user input`, file: 'injection.js', hl: '1,6,11' },
                 { warn: ['<code>express-mongo-sanitize</code> mutates <code>req.query</code>, which is read-only in Express 5 — it breaks. Prefer schema validation + <code>sanitizeFilter</code>.', '<code>express-mongo-sanitize</code> يعدّل <code>req.query</code> الذي أصبح للقراءة فقط في Express 5 — فيتعطل. فضّل التحقق بالمخططات + <code>sanitizeFilter</code>.'] }],
                [{ ul: [
                    ['<b>XSS</b>: escape output (EJS <code>&lt;%= %&gt;</code>, React does it), set a strict CSP with helmet, sanitize HTML input with <code>sanitize-html</code> if you must accept rich text.', '<b>XSS</b>: هرّب المخرجات (EJS <code>&lt;%= %&gt;</code>، و React يفعل ذلك)، اضبط CSP صارمًا بـ helmet، ونظّف مدخلات HTML بـ <code>sanitize-html</code> إن اضطررت لقبول نص منسق.'],
                    ['<b>CSRF</b> only matters when auth rides on <b>cookies</b>. Defences: <code>SameSite=Strict/Lax</code> cookies, check <code>Origin</code>, and CSRF tokens for form apps (<code>csrf-csrf</code>; <code>csurf</code> is deprecated).', '<b>CSRF</b> مهم فقط عندما تعتمد المصادقة على <b>الكوكيز</b>. الدفاعات: كوكيز <code>SameSite=Strict/Lax</code>، فحص <code>Origin</code>، ورموز CSRF لتطبيقات النماذج (<code>csrf-csrf</code>؛ و <code>csurf</code> ملغاة).'],
                    ['<b>Bearer tokens</b> in the <code>Authorization</code> header are not sent automatically by browsers → not vulnerable to CSRF (but to XSS if stored in localStorage).', '<b>رموز Bearer</b> في ترويسة <code>Authorization</code> لا يرسلها المتصفح تلقائيًا ← ليست عرضة لـ CSRF (لكنها عرضة لـ XSS إذا خُزنت في localStorage).']
                ] },
                 { best: ['<b>Secrets</b>: env vars injected by the platform or a secret manager (AWS Secrets Manager, Vault, Doppler). Different secrets per environment, rotate regularly, scan commits with <code>gitleaks</code>, run <code>npm audit</code> in CI.', '<b>الأسرار</b>: متغيرات بيئة تحقنها المنصة أو مدير أسرار (AWS Secrets Manager و Vault و Doppler). أسرار مختلفة لكل بيئة، بدّلها دوريًا، افحص الـ commits بـ <code>gitleaks</code>، ونفّذ <code>npm audit</code> في CI.'] }]
            ] }]
        },
        {
            kind: 'concept', t: ['OWASP API Security Top 10 — mapped to Tasky', 'OWASP API Security Top 10 — مطبّقة على Tasky'],
            b: [{ table: { h: ['#', ['Risk', 'الخطر'], ['Tasky defence', 'دفاع Tasky']], r: [
                ['API1', ['Broken object level authorization (IDOR)', 'خلل التفويض على مستوى الكائن (IDOR)'], ['ownership check in service (ch. 19)', 'التحقق من الملكية في الخدمة (الفصل 19)']],
                ['API2', ['Broken authentication', 'خلل المصادقة'], ['bcrypt, short JWT, rate-limited login (ch. 18, 25)', 'bcrypt ورموز JWT قصيرة ودخول محدود المعدل (الفصلان 18 و 25)']],
                ['API3', ['Broken object property level authorization', 'خلل التفويض على مستوى الخصائص'], ['strict Zod schemas, toJSON hides password', 'مخططات Zod صارمة، و toJSON يخفي كلمة المرور']],
                ['API4', ['Unrestricted resource consumption', 'استهلاك موارد غير محدود'], ['rate limit, body limit, max page size', 'تحديد المعدل وحد الجسم وحد حجم الصفحة']],
                ['API5', ['Broken function level authorization', 'خلل التفويض على مستوى الوظائف'], ['authorize(\'admin\') on admin routes', 'authorize(\'admin\') على مسارات الإدارة']],
                ['API6', ['Unrestricted access to sensitive business flows', 'وصول غير مقيد لتدفقات العمل الحساسة'], ['limits per user, captcha on signup', 'حدود لكل مستخدم و captcha عند التسجيل']],
                ['API7', ['Server-side request forgery (SSRF)', 'تزوير الطلبات من الخادم (SSRF)'], ['allow-list URLs for webhooks/imports', 'قائمة سماح للروابط في webhooks والاستيراد']],
                ['API8', ['Security misconfiguration', 'سوء الإعداد الأمني'], ['helmet, no stack traces, CORS allow-list', 'helmet، بلا تفاصيل أخطاء، قائمة سماح CORS']],
                ['API9', ['Improper inventory management', 'سوء إدارة الجرد'], ['OpenAPI docs, versioning, remove old endpoints', 'توثيق OpenAPI، الإصدارات، حذف النقاط القديمة']],
                ['API10', ['Unsafe consumption of APIs', 'الاستهلاك غير الآمن للواجهات'], ['validate third-party responses, timeouts', 'التحقق من ردود الأطراف الثالثة، ومهلات']]
            ] } }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Relying on CORS as “security” for your API — it only restricts browsers.', 'الاعتماد على CORS كـ"أمان" لواجهتك — إنه يقيّد المتصفحات فقط.'] },
                 { mistake: ['Rate limiting only by IP behind a proxy without <code>trust proxy</code> → every user shares the proxy IP.', 'تحديد المعدل حسب IP خلف وكيل بدون <code>trust proxy</code> ← كل المستخدمين يتشاركون عنوان الوكيل.'] },
                 { mistake: ['Returning detailed errors (“user exists”, SQL messages, stack) to attackers.', 'إعادة أخطاء مفصلة ("المستخدم موجود"، رسائل SQL، تفاصيل) للمهاجمين.'] },
                 { mistake: ['Outdated dependencies with known CVEs — no <code>npm audit</code>/Dependabot.', 'تبعيات قديمة بثغرات معروفة — بلا <code>npm audit</code> أو Dependabot.'] }],
                [{ qa: [
                    { q: ['How would you prevent brute-force login attacks?', 'كيف تمنع هجمات تخمين كلمة المرور؟'], a: ['Strict rate limit on login (per IP + per account), slow hashing (bcrypt/argon2), account lockout or captcha after N failures, MFA, and alerting on spikes.', 'تحديد معدل صارم على الدخول (لكل IP ولكل حساب)، تجزئة بطيئة (bcrypt/argon2)، قفل الحساب أو captcha بعد N محاولات، مصادقة ثنائية، وتنبيهات عند الارتفاع المفاجئ.'] },
                    { q: ['What is the difference between XSS and CSRF?', 'ما الفرق بين XSS و CSRF؟'], a: ['XSS runs attacker JavaScript in your site’s origin (steals data/tokens). CSRF tricks the browser into sending an authenticated request (cookies) to your site without running code there.', 'XSS يشغّل JavaScript المهاجم داخل مصدر موقعك (يسرق البيانات/الرموز). و CSRF يخدع المتصفح لإرسال طلب مصادق (بالكوكيز) إلى موقعك دون تشغيل كود فيه.'] },
                    { q: ['How do you store secrets in production?', 'كيف تخزن الأسرار في الإنتاج؟'], a: ['Never in code or images. Inject env vars from a secret manager, restrict access per service (least privilege), rotate, and audit access.', 'ليس في الكود أو الصور أبدًا. احقن متغيرات البيئة من مدير أسرار، قيّد الوصول لكل خدمة (أقل صلاحية)، بدّلها، وراقب الوصول.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Pen-test your own API', 'اختبر اختراق واجهتك بنفسك'],
            b: [{ tasks: [
                ['Add helmet, the global limiter and the auth limiter. Hammer <code>/api/auth/login</code> 15 times — when do you get 429?', 'أضف helmet والمحدد العام ومحدد المصادقة. أرسل <code>/api/auth/login</code> 15 مرة — متى تحصل على 429؟'],
                ['Try the NoSQL injection payload <code>{"email":{"$gt":""},"password":"x"}</code>. Which layer stops it?', 'جرّب حمولة حقن NoSQL <code>{"email":{"$gt":""},"password":"x"}</code>. أي طبقة توقفها؟'],
                ['Run <code>npm audit</code> and <code>npx gitleaks detect</code> (or GitHub secret scanning) on your repo.', 'نفّذ <code>npm audit</code> و <code>npx gitleaks detect</code> (أو فحص الأسرار في GitHub) على مستودعك.'],
                ['Fill the OWASP table for your own project: one defence per row.', 'املأ جدول OWASP لمشروعك: دفاع واحد لكل سطر.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['Which package sets security headers such as CSP and HSTS?', 'أي حزمة تضبط ترويسات الأمان مثل CSP و HSTS؟'], o: ['`cors`', '`helmet`', '`morgan`', '`compression`'], a: 1, e: ['helmet() sets about 15 security headers.', 'helmet() يضبط حوالي 15 ترويسة أمان.'] },
        { out: true, q: ['Which payload is a NoSQL injection attempt?', 'أي حمولة تمثل محاولة حقن NoSQL؟'], o: ['`{"email":"a@b.c"}`', '`{"password":{"$ne":null}}`', '`{"page":2}`', '`{"title":"<b>hi</b>"}`'], a: 1, e: ['Query operators sent as values. Validate types and use sanitizeFilter.', 'معاملات استعلام مرسلة كقيم. تحقق من الأنواع واستخدم sanitizeFilter.'] },
        { tf: false, q: ['An API that uses only Bearer tokens in the Authorization header must implement CSRF tokens.', 'واجهة تستخدم رموز Bearer في ترويسة Authorization فقط يجب أن تطبّق رموز CSRF.'], e: ['Browsers do not attach Authorization headers automatically, so CSRF does not apply.', 'المتصفحات لا ترفق ترويسة Authorization تلقائيًا، لذا لا ينطبق CSRF.'] },
        { q: ['Status code when a rate limit is exceeded?', 'رمز الحالة عند تجاوز حد المعدل؟'], o: ['403', '409', '429', '503'], a: 2, e: ['429 Too Many Requests (+ Retry-After / RateLimit headers).', '429 Too Many Requests (+ ترويسات Retry-After / RateLimit).'] },
        { q: ['Safe way to run SQL with user input?', 'الطريقة الآمنة لتنفيذ SQL مع مدخلات المستخدم؟'], o: [['String templates', 'قوالب نصية'], ['Parameterized queries ($1, ?)', 'استعلامات بمعاملات ($1 و ?)'], ['Escaping quotes by hand', 'تهريب علامات التنصيص يدويًا'], ['Base64 the input', 'ترميز المدخل بـ Base64']], a: 1, e: ['The driver sends values separately from SQL.', 'المشغّل يرسل القيم منفصلة عن SQL.'] }
    ]
});

DECK.chapters.push({
    n: 26, level: 3, icon: '🧪',
    t: ['Testing', 'الاختبارات'],
    sub: ['Vitest + Supertest, unit vs integration, mocking, test database, coverage', 'Vitest و Supertest، الوحدة مقابل التكامل، المحاكاة، قاعدة بيانات الاختبار، التغطية'],
    project: ['Tasky gets an automated test suite that runs in seconds and in CI.', 'يحصل Tasky على مجموعة اختبارات آلية تعمل في ثوانٍ وفي CI.'],
    learn: [
        ['Write integration tests against the real Express app', 'اكتب اختبارات تكامل على تطبيق Express الحقيقي'],
        ['Unit-test services with mocks', 'اختبر الخدمات كوحدات باستخدام المحاكاة'],
        ['Use an isolated test database and measure coverage', 'استخدم قاعدة بيانات اختبار معزولة وقِس التغطية']
    ],
    slides: [
        {
            kind: 'concept', t: ['The testing pyramid for APIs', 'هرم الاختبارات للواجهات'],
            b: [{ cols: [
                [{ table: { h: [['Type', 'النوع'], ['Tests', 'يختبر'], ['Speed', 'السرعة'], ['Amount', 'الكمية']], r: [
                    [['Unit', 'وحدة'], ['one function/service, deps mocked', 'دالة/خدمة واحدة مع محاكاة التبعيات'], '⚡⚡⚡', ['many', 'كثيرة']],
                    [['Integration', 'تكامل'], ['HTTP → app → real test DB', 'HTTP ← التطبيق ← قاعدة اختبار حقيقية'], '⚡⚡', ['most valuable for APIs', 'الأكثر قيمة للواجهات']],
                    [['E2E', 'شامل'], ['deployed system, real client', 'النظام المنشور مع عميل حقيقي'], '⚡', ['few', 'قليلة']]
                ] } },
                 { term: `npm install -D vitest supertest mongodb-memory-server @vitest/coverage-v8` }],
                [{ code: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,            // tests share one database
    env: {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
    },
    coverage: { provider: 'v8', reporter: ['text', 'html'], include: ['src/**'] },
  },
});`, file: 'vitest.config.js', x: 'api' },
                 { code: `{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage"
  }
}`, file: 'package.json' }]
            ] }]
        },
        {
            kind: 'code', t: ['Test setup & integration tests', 'إعداد الاختبارات واختبارات التكامل'],
            b: [{ cols: [
                [{ code: `import mongoose from 'mongoose';
import { beforeAll, afterEach, afterAll } from 'vitest';

let mongod;

beforeAll(async () => {
  let uri = process.env.MONGODB_URI_TEST;       // e.g. a CI service container
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create(); // throwaway in-memory MongoDB
    uri = mongod.getUri();
  }
  await mongoose.connect(uri);
});

afterEach(async () => {
  // every test starts with empty collections
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});`, file: 'tests/setup.js', hl: '7-12,18-19', x: 'api' }],
                [{ code: `import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

async function signup(name) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email: \`\${name}@test.dev\`, password: 'supersecret' });
  return res.body.accessToken;
}

describe('Tasks API', () => {
  let sara, omar;
  beforeEach(async () => {
    sara = await signup('sara');
    omar = await signup('omar');
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('creates and lists my tasks', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', \`Bearer \${sara}\`)
      .send({ title: 'Write tests' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ title: 'Write tests', done: false, priority: 'medium' });

    const list = await request(app).get('/api/tasks').set('Authorization', \`Bearer \${sara}\`);
    expect(list.body).toHaveLength(1);
  });

  it('returns 400 with details on invalid input', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', \`Bearer \${sara}\`)
      .send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toMatchObject({ field: 'title' });
  });

  it("hides other users' tasks (404)", async () => {
    const { body: task } = await request(app)
      .post('/api/tasks')
      .set('Authorization', \`Bearer \${sara}\`)
      .send({ title: 'Private' });
    const res = await request(app)
      .get(\`/api/tasks/\${task._id}\`)
      .set('Authorization', \`Bearer \${omar}\`);
    expect(res.status).toBe(404);
  });
});`, file: 'tests/tasks.test.js', hl: '3,26-28', x: 'api' }]
            ] }]
        },
        {
            kind: 'code', t: ['Unit tests with mocks & coverage', 'اختبارات الوحدة مع المحاكاة والتغطية'],
            b: [{ cols: [
                [{ code: `import { describe, it, expect, vi, beforeEach } from 'vitest';

// replace the real model with fakes → no database involved
vi.mock('../src/models/user.model.js', () => ({
  User: { exists: vi.fn(), create: vi.fn() },
}));

import { User } from '../src/models/user.model.js';
import { register } from '../src/services/auth.service.js';

describe('auth.service.register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 409 when the email is taken', async () => {
    User.exists.mockResolvedValue(true);
    await expect(register({ name: 'A', email: 'a@a.io', password: 'supersecret' }))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('hashes the password before saving', async () => {
    User.exists.mockResolvedValue(null);
    User.create.mockImplementation(async (data) => data);
    const user = await register({ name: 'A', email: 'a@a.io', password: 'supersecret' });
    expect(user.password).not.toBe('supersecret');
    expect(user.password).toMatch(/^\\$2[aby]\\$12\\$/);   // bcrypt, cost 12
  });
});`, file: 'tests/auth.service.test.js', hl: '4-6,15', x: 'api' }],
                [{ term: 'npm test', out: ` ✓ tests/auth.service.test.js (2 tests)
 ✓ tests/tasks.test.js (4 tests)

 Test Files  2 passed (2)
      Tests  6 passed (6)` },
                 { best: ['Test <b>behaviour</b> (status + body) not implementation. One assertion idea per test, descriptive names, no shared mutable state between tests.', 'اختبر <b>السلوك</b> (الرمز + الجسم) وليس التنفيذ. فكرة واحدة لكل اختبار، أسماء وصفية، ولا حالة مشتركة قابلة للتغيير بين الاختبارات.'] },
                 { tip: ['Coverage is a flashlight, not a goal: 80% with meaningful auth/ownership tests beats 100% of getters.', 'التغطية مصباح وليست هدفًا: 80% مع اختبارات مصادقة/ملكية مفيدة أفضل من 100% لدوال بسيطة.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Running tests against the development (or production!) database.', 'تشغيل الاختبارات على قاعدة بيانات التطوير (أو الإنتاج!).'] },
                 { mistake: ['Tests that depend on order or on each other’s data → flaky suites.', 'اختبارات تعتمد على الترتيب أو على بيانات بعضها ← مجموعات متذبذبة.'] },
                 { mistake: ['Mocking everything, including the thing under test — the test proves nothing.', 'محاكاة كل شيء بما فيه الشيء المختبَر — الاختبار لا يثبت شيئًا.'] },
                 { mistake: ['Calling <code>app.listen()</code> in the module tests import → “port already in use”.', 'استدعاء <code>app.listen()</code> في الوحدة التي تستوردها الاختبارات ← "المنفذ مستخدم".'] }],
                [{ qa: [
                    { q: ['Unit vs integration test — which do you write more for an API?', 'اختبار الوحدة مقابل التكامل — أيهما تكتب أكثر لواجهة API؟'], a: ['Integration tests through HTTP (Supertest + real test DB) give the most confidence for APIs; unit tests for complex pure logic (pricing, permissions, parsers).', 'اختبارات التكامل عبر HTTP (Supertest + قاعدة اختبار حقيقية) تعطي أكبر ثقة للواجهات؛ واختبارات الوحدة للمنطق الصافي المعقد (التسعير، الصلاحيات، المحللات).'] },
                    { q: ['How do you test code that calls an external API (Stripe, email)?', 'كيف تختبر كودًا يستدعي واجهة خارجية (Stripe، البريد)؟'], a: ['Wrap it behind an interface, inject a fake in tests (or mock the module / intercept HTTP with nock or MSW), and keep a few contract tests against the provider’s sandbox.', 'غلّفه خلف واجهة، احقن نسخة وهمية في الاختبارات (أو حاكِ الوحدة / اعترض HTTP بـ nock أو MSW)، واحتفظ ببعض اختبارات العقد مع بيئة sandbox للمزود.'] },
                    { q: ['What makes a test flaky?', 'ما الذي يجعل الاختبار متذبذبًا؟'], a: ['Shared state, real time/dates, randomness, network, race conditions, order dependence. Fix with isolation, fake timers, seeded data and awaiting properly.', 'الحالة المشتركة، الوقت الحقيقي، العشوائية، الشبكة، حالات السباق، الاعتماد على الترتيب. الحل: العزل، مؤقتات وهمية، بيانات ثابتة، وانتظار صحيح.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Grow the test suite', 'وسّع مجموعة الاختبارات'],
            b: [{ tasks: [
                ['Add tests: PATCH by owner (200), PATCH by other user (404), DELETE (204 then 404).', 'أضف اختبارات: PATCH من المالك (200)، PATCH من مستخدم آخر (404)، DELETE (204 ثم 404).'],
                ['Test auth: duplicate email → 409, wrong password → 401, refresh with cookie → new token.', 'اختبر المصادقة: بريد مكرر ← 409، كلمة مرور خاطئة ← 401، التحديث بالكوكي ← رمز جديد.'],
                ['Run <code>npm run test:cov</code> and open <code>coverage/index.html</code>. Which branches are untested?', 'نفّذ <code>npm run test:cov</code> وافتح <code>coverage/index.html</code>. أي الفروع غير مختبرة؟'],
                ['Write a unit test for <code>errorHandler</code> with fake <code>req/res</code> objects.', 'اكتب اختبار وحدة لـ <code>errorHandler</code> بكائنات <code>req/res</code> وهمية.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['What does Supertest need to call your app without a port?', 'ماذا يحتاج Supertest لاستدعاء تطبيقك دون منفذ؟'], o: [['The running server URL', 'رابط الخادم العامل'], ['The exported Express app', 'تطبيق Express المُصدَّر'], ['A Docker container', 'حاوية Docker'], ['Postman', 'Postman']], a: 1, e: ['request(app) starts an ephemeral server internally.', 'request(app) يشغّل خادمًا مؤقتًا داخليًا.'] },
        { q: ['Why clear collections in <code>afterEach</code>?', 'لماذا نفرّغ المجموعات في <code>afterEach</code>؟'], o: [['Speed', 'السرعة'], ['Test isolation — no leftover data between tests', 'عزل الاختبارات — لا بيانات متبقية بينها'], ['Coverage', 'التغطية'], ['Required by Vitest', 'Vitest يتطلب ذلك']], a: 1, e: ['Each test must be independent and repeatable.', 'كل اختبار يجب أن يكون مستقلًا وقابلًا للتكرار.'] },
        { tf: true, q: ['<code>vi.mock()</code> replaces a module for the whole test file.', '<code>vi.mock()</code> يستبدل وحدة في ملف الاختبار بالكامل.'], e: ['It is hoisted above imports.', 'يُرفع فوق الاستيرادات.'] },
        { q: ['100% coverage guarantees…', 'تغطية 100% تضمن…'], o: [['No bugs', 'عدم وجود أخطاء'], ['Every line ran at least once during tests', 'كل سطر نُفّذ مرة على الأقل أثناء الاختبارات'], ['Good performance', 'أداء جيد'], ['Security', 'الأمان']], a: 1, e: ['Executed ≠ verified. Assertions matter.', 'التنفيذ ≠ التحقق. التأكيدات هي المهمة.'] }
    ]
});

DECK.chapters.push({
    n: 27, level: 3, icon: '🔷',
    t: ['TypeScript with Express', 'TypeScript مع Express'],
    sub: ['tsconfig, typed requests, DTOs from Zod, extending Request, build & run', 'tsconfig، طلبات بأنواع، DTOs من Zod، توسيع Request، البناء والتشغيل'],
    project: ['Tasky is migrated to TypeScript, file by file.', 'يُنقل Tasky إلى TypeScript ملفًا بملف.'],
    learn: [
        ['Set up a modern TS + Express project', 'جهّز مشروع TS + Express حديثًا'],
        ['Type params, body, query and responses', 'حدد أنواع المعاملات والجسم والاستعلام والاستجابات'],
        ['Derive types from Zod so validation and types never drift', 'استنتج الأنواع من Zod لكي لا يختلف التحقق عن الأنواع']
    ],
    slides: [
        {
            kind: 'code', t: ['Setup & tsconfig', 'الإعداد و tsconfig'],
            b: [{ cols: [
                [{ term: `npm install -D typescript tsx @types/express @types/node
npx tsc --init` },
                 { code: `{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"]
}`, file: 'tsconfig.json', hl: '4-5,8' }],
                [{ code: `{
  "type": "module",
  "scripts": {
    "dev": "tsx watch --env-file=.env src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}`, file: 'package.json', hl: '4-6' },
                 { tip: ['With <code>"module": "NodeNext"</code> you still write <code>.js</code> in relative imports inside <code>.ts</code> files (<code>import app from \'./app.js\'</code>) — it refers to the compiled output.', 'مع <code>"module": "NodeNext"</code> تكتب <code>.js</code> في الاستيراد النسبي داخل ملفات <code>.ts</code> (<code>import app from \'./app.js\'</code>) — لأنه يشير إلى الناتج المترجم.'] },
                 { note: ['Recent Node versions can run <code>.ts</code> files directly by stripping types (<code>node src/server.ts</code>). Great for scripts; for apps keep <code>tsc</code> for type-checking in CI.', 'إصدارات Node الحديثة تستطيع تشغيل ملفات <code>.ts</code> مباشرة بحذف الأنواع (<code>node src/server.ts</code>). ممتاز للسكربتات؛ وللتطبيقات أبقِ <code>tsc</code> لفحص الأنواع في CI.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Typed handlers, DTOs & req.user', 'معالجات بأنواع و DTOs و req.user'],
            b: [{ cols: [
                [{ code: `import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// the DTO type is derived from the schema → one source of truth
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
// { title: string; priority: 'low' | 'medium' | 'high' }`, file: 'src/schemas/task.schema.ts', hl: '9' },
                 { code: `// teach TypeScript about req.user (set by authenticate)
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'user' | 'admin' };
    }
  }
}
export {};`, file: 'src/types/express.d.ts' }],
                [{ code: `import type { Request, Response } from 'express';
import type { CreateTaskDto } from '../schemas/task.schema.js';
import * as service from '../services/tasks.service.js';

interface TaskParams { id: string }
interface TaskDto { id: string; title: string; done: boolean; priority: string }

//                        Request<Params, ResBody, ReqBody, Query>
export async function create(req: Request<{}, TaskDto, CreateTaskDto>, res: Response<TaskDto>) {
  const task = await service.createTask(req.user!, req.body);
  res.status(201).json(task);
}

export async function getOne(req: Request<TaskParams>, res: Response<TaskDto>) {
  const task = await service.getTask(req.user!, req.params.id); // id: string ✅
  res.json(task);
}`, file: 'src/controllers/tasks.controller.ts', hl: '8-9' },
                 { best: ['Type the boundaries (DTOs, service signatures, env config). Let inference do the rest. Ban <code>any</code> with ESLint (<code>@typescript-eslint/no-explicit-any</code>).', 'حدد أنواع الحدود (DTOs، تواقيع الخدمات، إعداد البيئة). ودع الاستنتاج يفعل الباقي. امنع <code>any</code> بـ ESLint (<code>@typescript-eslint/no-explicit-any</code>).'] },
                 { warn: ['Types disappear at runtime: <code>req.body</code> typed as <code>CreateTaskDto</code> is still unvalidated JSON. Always validate with Zod first.', 'الأنواع تختفي وقت التشغيل: <code>req.body</code> المحدد كـ <code>CreateTaskDto</code> يبقى JSON غير متحقق منه. تحقق دائمًا بـ Zod أولًا.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Sprinkling <code>as any</code> / <code>!</code> to silence errors instead of fixing types.', 'نثر <code>as any</code> / <code>!</code> لإسكات الأخطاء بدل إصلاح الأنواع.'] },
                 { mistake: ['Shipping <code>tsx</code>/<code>ts-node</code> to production instead of compiled JS.', 'نشر <code>tsx</code>/<code>ts-node</code> في الإنتاج بدل JavaScript المترجم.'] },
                 { mistake: ['Duplicating interfaces and validation schemas by hand — they drift.', 'تكرار الواجهات ومخططات التحقق يدويًا — فتختلف مع الوقت.'] }],
                [{ qa: [
                    { q: ['How do you add a custom property to Express’s Request type?', 'كيف تضيف خاصية مخصصة لنوع Request في Express؟'], a: ['Declaration merging: <code>declare global { namespace Express { interface Request { user?: … } } }</code> in a .d.ts included by tsconfig.', 'دمج التصريحات: <code>declare global { namespace Express { interface Request { user?: … } } }</code> في ملف .d.ts يشمله tsconfig.'] },
                    { q: ['What is the difference between <code>type</code> and <code>interface</code>?', 'ما الفرق بين <code>type</code> و <code>interface</code>؟'], a: ['Both describe shapes. Interfaces can be merged/extended (good for public contracts); types support unions, mapped and conditional types. Pick one convention per codebase.', 'كلاهما يصف الأشكال. الواجهات يمكن دمجها وتوسيعها (جيدة للعقود العامة)؛ والأنواع تدعم الاتحادات والأنواع المحوّلة والشرطية. اختر اصطلاحًا واحدًا لكل مشروع.'] },
                    { q: ['Does TypeScript validate API input?', 'هل يتحقق TypeScript من مدخلات الواجهة؟'], a: ['No — types are erased at compile time. Runtime validation (Zod) is still required; derive types from the schema with z.infer.', 'لا — الأنواع تُحذف عند الترجمة. التحقق وقت التشغيل (Zod) يبقى ضروريًا؛ واستنتج الأنواع من المخطط بـ z.infer.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Migrate Tasky to TypeScript', 'انقل Tasky إلى TypeScript'],
            b: [{ tasks: [
                ['Add tsconfig, rename <code>server.js</code> → <code>server.ts</code>, run with <code>tsx watch</code>.', 'أضف tsconfig، أعد تسمية <code>server.js</code> ← <code>server.ts</code>، وشغّله بـ <code>tsx watch</code>.'],
                ['Type <code>validate()</code> generically so <code>req.valid.body</code> gets the schema type.', 'حدد أنواع <code>validate()</code> بشكل عام لكي يأخذ <code>req.valid.body</code> نوع المخطط.'],
                ['Add <code>express.d.ts</code> for <code>req.user</code>; remove all <code>any</code>.', 'أضف <code>express.d.ts</code> لـ <code>req.user</code>؛ واحذف كل <code>any</code>.'],
                ['<code>npm run build && npm start</code> — run the compiled app.', '<code>npm run build && npm start</code> — شغّل التطبيق المترجم.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { q: ['In <code>Request&lt;P, ResBody, ReqBody, Q&gt;</code>, which generic types <code>req.body</code>?', 'في <code>Request&lt;P, ResBody, ReqBody, Q&gt;</code>، أي نوع عام يحدد <code>req.body</code>؟'], o: ['P', 'ResBody', 'ReqBody', 'Q'], a: 2, e: ['Order: Params, ResBody, ReqBody, Query.', 'الترتيب: Params و ResBody و ReqBody و Query.'] },
        { tf: false, q: ['If <code>req.body</code> is typed, you no longer need runtime validation.', 'إذا حُدد نوع <code>req.body</code> فلن تحتاج إلى تحقق وقت التشغيل.'], e: ['Types are erased; clients can send anything.', 'الأنواع تُحذف؛ والعملاء يستطيعون إرسال أي شيء.'] },
        { q: ['What gives you a type from a Zod schema?', 'ما الذي يعطيك نوعًا من مخطط Zod؟'], o: ['`typeof schema`', '`z.infer<typeof schema>`', '`schema.type`', '`z.typeOf(schema)`'], a: 1, e: ['z.infer extracts the output type.', 'z.infer يستخرج نوع الناتج.'] },
        { q: ['What should run in production?', 'ما الذي يجب تشغيله في الإنتاج؟'], o: ['`tsx src/server.ts`', '`node dist/server.js` (compiled)', '`ts-node`', '`tsc --watch`'], a: 1, e: ['Compile in CI/Docker, run plain JS.', 'ترجم في CI/Docker وشغّل JavaScript عاديًا.'] }
    ]
});

DECK.chapters.push({
    n: 28, level: 3, icon: '🧅',
    t: ['Clean architecture', 'البنية النظيفة'],
    sub: ['Layered design, dependency injection, repository pattern, SOLID', 'تصميم بطبقات، حقن التبعيات، نمط المستودع، و SOLID'],
    learn: [
        ['Keep business logic independent of Express and the database', 'اجعل منطق العمل مستقلًا عن Express وقاعدة البيانات'],
        ['Inject dependencies through a composition root', 'احقن التبعيات عبر نقطة تركيب واحدة'],
        ['Apply SOLID pragmatically in Node', 'طبّق SOLID بشكل عملي في Node']
    ],
    slides: [
        {
            kind: 'concept', t: ['Dependencies point inward', 'التبعيات تتجه للداخل'],
            b: [
                { diagram: 'onion', cap: ['Express, Mongoose and Redis are details at the edge. Services (use cases) only know interfaces.', 'Express و Mongoose و Redis تفاصيل على الحافة. والخدمات (حالات الاستخدام) لا تعرف إلا الواجهات.'] },
                { tip: ['You do not need four folders on day one. Start with routes/controllers/services/models (chapter 12) and add repositories + DI when you feel the pain (testing, swapping a DB, many features).', 'لا تحتاج أربعة مجلدات من اليوم الأول. ابدأ بـ routes/controllers/services/models (الفصل 12) وأضف المستودعات وحقن التبعيات عندما تشعر بالحاجة (الاختبار، تغيير قاعدة البيانات، كثرة الميزات).'] }
            ]
        },
        {
            kind: 'code', t: ['Repository pattern + dependency injection', 'نمط المستودع وحقن التبعيات'],
            b: [{ cols: [
                [{ code: `/**
 * @typedef {object} TaskRepository
 * @property {(id: string) => Promise<Task|null>} findById
 * @property {(data: object) => Promise<Task>} create
 * @property {(ownerId: string) => Promise<number>} countOpenByOwner
 */

// use case: knows NOTHING about Express or Mongoose
export function makeTaskService({ taskRepo, clock = () => new Date() }) {
  return {
    async createTask(user, data) {
      if ((await taskRepo.countOpenByOwner(user.id)) >= 100) {
        throw AppError.conflict('Open task limit reached');
      }
      if (data.dueDate && data.dueDate < clock()) {
        throw AppError.badRequest('Due date is in the past');
      }
      return taskRepo.create({ ...data, owner: user.id });
    },
  };
}`, file: 'src/modules/tasks/task.service.js', hl: '9' },
                 { code: `import { Task } from './task.model.js';

export const mongoTaskRepo = {
  findById: (id) => Task.findById(id).lean(),
  create: (data) => Task.create(data),
  countOpenByOwner: (ownerId) => Task.countDocuments({ owner: ownerId, done: false }),
};`, file: 'src/modules/tasks/task.repo.mongo.js' }],
                [{ code: `// composition root: the ONLY place that wires concrete classes
import { mongoTaskRepo } from './modules/tasks/task.repo.mongo.js';
import { makeTaskService } from './modules/tasks/task.service.js';
import { makeTaskController } from './modules/tasks/task.controller.js';

const taskService = makeTaskService({ taskRepo: mongoTaskRepo });
export const taskController = makeTaskController({ taskService });`, file: 'src/container.js' },
                 { code: `// unit test: inject a fake repo — no DB, no mocks library
const fakeRepo = { countOpenByOwner: async () => 100, create: async (d) => d };
const service = makeTaskService({ taskRepo: fakeRepo });

await expect(service.createTask({ id: 'u1' }, { title: 'x' }))
  .rejects.toMatchObject({ statusCode: 409 });`, file: 'task.service.test.js' },
                 { table: { h: ['SOLID', ['In an Express API', 'في واجهة Express']], r: [
                     ['<b>S</b>RP', ['controller = HTTP, service = rules, repo = data', 'المتحكم = HTTP، الخدمة = القواعد، المستودع = البيانات']],
                     ['<b>O</b>CP', ['add a payment provider without editing checkout', 'أضف مزود دفع دون تعديل الدفع']],
                     ['<b>L</b>SP', ['any TaskRepository (Mongo/Prisma/fake) works', 'أي TaskRepository (Mongo/Prisma/وهمي) يعمل']],
                     ['<b>I</b>SP', ['small focused interfaces (Mailer, Clock)', 'واجهات صغيرة مركّزة (Mailer و Clock)']],
                     ['<b>D</b>IP', ['services depend on interfaces, injected', 'الخدمات تعتمد على واجهات محقونة']]
                 ] } }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['“Enterprise” over-engineering: 6 layers and 20 interfaces for a CRUD with 3 endpoints.', 'هندسة "مؤسسية" مبالغ فيها: 6 طبقات و20 واجهة لـ CRUD بثلاث نقاط.'] },
                 { mistake: ['Fat controllers with business rules and DB queries inline.', 'متحكمات ضخمة فيها قواعد العمل واستعلامات قاعدة البيانات مباشرة.'] },
                 { mistake: ['Services importing <code>req</code>/<code>res</code> or Mongoose documents leaking to HTTP responses.', 'خدمات تستورد <code>req</code>/<code>res</code> أو مستندات Mongoose تتسرب إلى استجابات HTTP.'] }],
                [{ qa: [
                    { q: ['What is dependency injection and why use it in Node?', 'ما هو حقن التبعيات ولماذا نستخدمه في Node؟'], a: ['Passing collaborators (repo, mailer, clock) into a module instead of importing them inside. It makes code testable with fakes and lets you swap implementations. In JS a factory function is often enough; containers like awilix help at scale.', 'تمرير المتعاونين (المستودع، البريد، الساعة) إلى الوحدة بدل استيرادهم داخلها. يجعل الكود قابلًا للاختبار بنسخ وهمية ويسمح بتبديل التنفيذ. في JS تكفي دالة مصنع غالبًا؛ وحاويات مثل awilix تساعد عند التوسع.'] },
                    { q: ['Explain the repository pattern.', 'اشرح نمط المستودع.'], a: ['An abstraction over data access exposing domain-friendly methods (findOpenByOwner). Services depend on it, not on the ORM, so storage can change and tests can use in-memory repos.', 'تجريد فوق الوصول للبيانات يعرض دوالًا بلغة المجال (findOpenByOwner). الخدمات تعتمد عليه لا على ORM، فيمكن تغيير التخزين واستخدام مستودعات في الذاكرة للاختبار.'] },
                    { q: ['Folder by layer or by feature?', 'المجلدات حسب الطبقة أم حسب الميزة؟'], a: ['By feature (modules/tasks/*) scales better: related code stays together and teams can own modules. Layers still exist inside each module.', 'حسب الميزة (modules/tasks/*) يتوسع أفضل: الكود المترابط يبقى معًا وتستطيع الفرق امتلاك الوحدات. والطبقات تبقى موجودة داخل كل وحدة.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Refactor one module', 'أعد هيكلة وحدة واحدة'],
            b: [{ tasks: [
                ['Move tasks into <code>src/modules/tasks/</code> with service factory + Mongo repository.', 'انقل المهام إلى <code>src/modules/tasks/</code> مع مصنع للخدمة ومستودع Mongo.'],
                ['Create <code>container.js</code> and use it in the routes.', 'أنشئ <code>container.js</code> واستخدمه في المسارات.'],
                ['Write an in-memory repository and unit-test the 100-open-tasks rule without MongoDB.', 'اكتب مستودعًا في الذاكرة واختبر قاعدة الـ 100 مهمة مفتوحة دون MongoDB.'],
                ['Discuss in pairs: which SOLID principle did each change apply?', 'ناقشوا في أزواج: أي مبدأ من SOLID طبّقه كل تغيير؟']
            ], time: 30 }]
        }
    ],
    quiz: [
        { q: ['In clean architecture, which layer may import Express?', 'في البنية النظيفة، أي طبقة يمكنها استيراد Express؟'], o: [['Entities', 'الكيانات'], ['Use cases', 'حالات الاستخدام'], ['The outer frameworks/adapters layer', 'طبقة الأطر/المحوّلات الخارجية'], ['All of them', 'كلها']], a: 2, e: ['Dependencies point inward; frameworks are details at the edge.', 'التبعيات تتجه للداخل؛ والأطر تفاصيل على الحافة.'] },
        { q: ['Main benefit of injecting a repository into a service?', 'الفائدة الأساسية من حقن مستودع في خدمة؟'], o: [['Faster queries', 'استعلامات أسرع'], ['Testability and swappable storage', 'قابلية الاختبار وإمكانية تبديل التخزين'], ['Fewer files', 'ملفات أقل'], ['Security', 'الأمان']], a: 1, e: ['Fakes in tests, Prisma or Mongo in prod.', 'نسخ وهمية في الاختبار، و Prisma أو Mongo في الإنتاج.'] },
        { tf: true, q: ['The “D” in SOLID means high-level modules depend on abstractions, not concrete implementations.', 'حرف "D" في SOLID يعني أن الوحدات العليا تعتمد على تجريدات وليس على تنفيذات محددة.'], e: ['Dependency Inversion Principle.', 'مبدأ عكس التبعية.'] },
        { q: ['Where are concrete implementations wired together?', 'أين تُربط التنفيذات المحددة معًا؟'], o: [['In every service', 'في كل خدمة'], ['In a composition root (container)', 'في نقطة تركيب (حاوية)'], ['In the database', 'في قاعدة البيانات'], ['In tests only', 'في الاختبارات فقط']], a: 1, e: ['One place knows the concrete classes.', 'مكان واحد يعرف الأصناف المحددة.'] }
    ]
});

DECK.chapters.push({
    n: 29, level: 3, icon: '⚡',
    t: ['Caching', 'التخزين المؤقت'],
    sub: ['Redis cache-aside, HTTP caching, ETags and cache invalidation', 'Redis بنمط cache-aside، تخزين HTTP المؤقت، ETags وإبطال الذاكرة المؤقتة'],
    project: ['Tasky caches expensive stats in Redis and lets browsers revalidate lists with ETags.', 'يخزن Tasky الإحصاءات المكلفة في Redis ويسمح للمتصفحات بإعادة التحقق من القوائم بـ ETags.'],
    learn: [
        ['Implement cache-aside with Redis and TTLs', 'نفّذ cache-aside مع Redis ومدد الصلاحية'],
        ['Use Cache-Control, ETag and 304 responses', 'استخدم Cache-Control و ETag واستجابات 304'],
        ['Invalidate correctly when data changes', 'أبطل الذاكرة المؤقتة بشكل صحيح عند تغير البيانات']
    ],
    slides: [
        {
            kind: 'code', t: ['Cache-aside with Redis', 'نمط cache-aside مع Redis'],
            b: [
                { diagram: 'cache', cap: ['Read: try Redis → on miss, query the DB and store the result with a TTL. Write: update the DB, then delete the key.', 'القراءة: جرّب Redis ← عند عدم الوجود استعلم قاعدة البيانات واحفظ النتيجة بمدة صلاحية. الكتابة: حدّث قاعدة البيانات ثم احذف المفتاح.'] },
                { cols: [
                    [{ code: `import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
redis.on('error', (err) => console.error('Redis error', err));
await redis.connect();

export async function cached(key, ttlSeconds, loader) {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);                       // ⚡ cache hit
  const value = await loader();                          // 🐢 miss → DB
  await redis.set(key, JSON.stringify(value), { expiration: { type: 'EX', value: ttlSeconds } });
  return value;
}`, file: 'src/config/cache.js', hl: '9,11' }],
                    [{ code: `export const getStats = (user) =>
  cached(\`stats:\${user.id}\`, 60, () =>
    Task.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(user.id) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]));

export async function createTask(user, data) {
  const task = await Task.create({ ...data, owner: user.id });
  await redis.del(\`stats:\${user.id}\`);                 // invalidate
  return task;
}`, file: 'src/services/tasks.service.js', hl: '2,10' },
                     { term: `docker run -d --name redis -p 6379:6379 redis:8
npm install redis` }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['HTTP caching: Cache-Control & ETag', 'تخزين HTTP المؤقت: Cache-Control و ETag'],
            b: [{ cols: [
                [{ code: `// static assets: cache for a year (file names contain a hash)
app.use('/assets', express.static('dist/assets', { maxAge: '1y', immutable: true }));

// public, rarely changing data
app.get('/api/plans', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');      // 5 minutes
  res.json(plans);
});

// private data: browser may store it but must revalidate
app.get('/api/tasks', authenticate, async (req, res) => {
  res.set('Cache-Control', 'private, no-cache');
  res.json(await service.listTasks(req.user, req.valid.query));
});
// Express adds a weak ETag to res.json/res.send automatically.
// If the client sends If-None-Match with the same ETag → 304, empty body.`, file: 'http-cache.js', hl: '2,6,12' }],
                [{ term: `curl -i localhost:3000/api/plans
curl -i localhost:3000/api/plans -H 'If-None-Match: W/"1d-3XQ…"'`, out: `HTTP/1.1 200 OK
Cache-Control: public, max-age=300
ETag: W/"1d-3XQ…"

HTTP/1.1 304 Not Modified` },
                 { table: { h: [['Directive', 'التوجيه'], ['Meaning', 'المعنى']], r: [
                     ['<code>public / private</code>', ['shared caches (CDN) allowed or not', 'السماح للذاكرات المشتركة (CDN) أو لا']],
                     ['<code>max-age=N</code>', ['fresh for N seconds', 'صالحة لمدة N ثانية']],
                     ['<code>no-cache</code>', ['store, but revalidate every time', 'خزّن لكن أعد التحقق كل مرة']],
                     ['<code>no-store</code>', ['never store (sensitive data)', 'لا تخزن أبدًا (بيانات حساسة)']]
                 ] } },
                 { note: ['“There are only two hard things in computer science: cache invalidation and naming things.” — Phil Karlton', '"في علوم الحاسوب أمران صعبان فقط: إبطال الذاكرة المؤقتة وتسمية الأشياء." — Phil Karlton'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Caching per-user data under a shared key (<code>stats</code>) → users see each other’s data.', 'تخزين بيانات خاصة بكل مستخدم تحت مفتاح مشترك (<code>stats</code>) ← يرى المستخدمون بيانات بعضهم.'] },
                 { mistake: ['No TTL → stale data forever and unbounded memory.', 'بلا مدة صلاحية ← بيانات قديمة للأبد وذاكرة غير محدودة.'] },
                 { mistake: ['<b>Cache stampede</b>: a hot key expires and 1,000 requests hit the DB at once. Use jittered TTLs, locks or stale-while-revalidate.', '<b>تدافع الذاكرة المؤقتة</b>: ينتهي مفتاح مطلوب بكثرة فتضرب 1000 طلب قاعدة البيانات معًا. استخدم مددًا عشوائية أو أقفالًا أو stale-while-revalidate.'] },
                 { mistake: ['<code>Cache-Control: public</code> on authenticated responses → a CDN serves one user’s data to others.', '<code>Cache-Control: public</code> على استجابات مصادق عليها ← يقدم CDN بيانات مستخدم لآخرين.'] }],
                [{ qa: [
                    { q: ['Explain cache-aside vs write-through.', 'اشرح cache-aside مقابل write-through.'], a: ['Cache-aside: app reads cache, on miss loads DB and fills cache; writes go to DB and invalidate. Write-through: every write updates DB and cache together — fresher reads, slower writes.', 'cache-aside: التطبيق يقرأ الذاكرة المؤقتة، وعند عدم الوجود يحمّل من قاعدة البيانات ويملأ الذاكرة؛ والكتابة تذهب لقاعدة البيانات وتبطل المفتاح. write-through: كل كتابة تحدث قاعدة البيانات والذاكرة معًا — قراءات أحدث وكتابة أبطأ.'] },
                    { q: ['How does an ETag work?', 'كيف يعمل ETag؟'], a: ['Server sends a fingerprint of the response. Client sends it back in If-None-Match; if unchanged the server answers 304 with no body, saving bandwidth.', 'يرسل الخادم بصمة للاستجابة. ويعيدها العميل في If-None-Match؛ إذا لم تتغير يرد الخادم بـ 304 بلا جسم، فيوفر عرض النطاق.'] },
                    { q: ['What would you cache in a task app?', 'ماذا تخزن مؤقتًا في تطبيق مهام؟'], a: ['Expensive aggregates (dashboards), public reference data, sessions/rate-limit counters; not frequently-changing per-item data unless invalidation is simple.', 'التجميعات المكلفة (لوحات المعلومات)، البيانات المرجعية العامة، الجلسات وعدادات تحديد المعدل؛ وليس البيانات المتغيرة باستمرار إلا إذا كان الإبطال بسيطًا.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Cache Tasky stats', 'خزّن إحصاءات Tasky مؤقتًا'],
            b: [{ tasks: [
                ['Run Redis in Docker and add <code>cached()</code>.', 'شغّل Redis في Docker وأضف <code>cached()</code>.'],
                ['Cache <code>GET /api/tasks/stats</code> for 60 s per user; log HIT/MISS.', 'خزّن <code>GET /api/tasks/stats</code> لمدة 60 ثانية لكل مستخدم؛ وسجّل HIT/MISS.'],
                ['Invalidate on create/update/delete. Prove it with requests.', 'أبطل عند الإنشاء/التعديل/الحذف. أثبت ذلك بطلبات.'],
                ['Benchmark with <code>npx autocannon -c 50 -d 10 URL</code> before/after.', 'قِس الأداء بـ <code>npx autocannon -c 50 -d 10 URL</code> قبل وبعد.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['In cache-aside, what happens on a cache miss?', 'في cache-aside ماذا يحدث عند عدم وجود البيانات في الذاكرة المؤقتة؟'], o: [['Return 404', 'إعادة 404'], ['Load from DB, store in cache with TTL, return', 'التحميل من قاعدة البيانات والتخزين بمدة صلاحية ثم الإعادة'], ['Wait for the cache', 'انتظار الذاكرة'], ['Throw an error', 'رمي خطأ']], a: 1, e: ['The application fills the cache lazily.', 'التطبيق يملأ الذاكرة عند الحاجة.'] },
        { out: true, q: ['Client sends <code>If-None-Match</code> equal to the current ETag. Response?', 'العميل يرسل <code>If-None-Match</code> مساويًا لـ ETag الحالي. الاستجابة؟'], o: ['200 + body', '304, no body', '412', '204'], a: 1, e: ['Not Modified — reuse the cached copy.', 'لم يتغير — أعد استخدام النسخة المخزنة.'] },
        { q: ['Which header forbids storing a response anywhere?', 'أي ترويسة تمنع تخزين الاستجابة في أي مكان؟'], o: ['`Cache-Control: no-cache`', '`Cache-Control: no-store`', '`Cache-Control: private`', '`ETag: none`'], a: 1, e: ['no-cache still stores (but revalidates); no-store does not.', 'no-cache يخزن (مع إعادة التحقق)؛ و no-store لا يخزن.'] },
        { tf: true, q: ['After updating a task you should delete (or update) related cache keys.', 'بعد تعديل مهمة يجب حذف (أو تحديث) مفاتيح الذاكرة المؤقتة المرتبطة.'], e: ['Otherwise clients read stale data until TTL expires.', 'وإلا سيقرأ العملاء بيانات قديمة حتى انتهاء المدة.'] }
    ]
});

DECK.chapters.push({
    n: 30, level: 3, icon: '📬',
    t: ['Background jobs & queues', 'المهام الخلفية والطوابير'],
    sub: ['BullMQ queues and workers, retries, cron schedules, emails with Nodemailer', 'طوابير وعمال BullMQ، إعادة المحاولة، جدولة cron، والبريد مع Nodemailer'],
    project: ['Tasky sends welcome emails and daily due-date reminders in the background.', 'يرسل Tasky رسائل ترحيب وتذكيرات يومية بمواعيد الاستحقاق في الخلفية.'],
    learn: [
        ['Move slow work out of the request/response cycle', 'انقل العمل البطيء خارج دورة الطلب/الاستجابة'],
        ['Run reliable jobs with retries and backoff', 'نفّذ مهام موثوقة مع إعادة المحاولة والتأخير المتزايد'],
        ['Schedule recurring tasks', 'جدول المهام المتكررة']
    ],
    slides: [
        {
            kind: 'code', t: ['Queue + worker with BullMQ', 'طابور وعامل مع BullMQ'],
            b: [
                { diagram: 'queue', cap: ['The API adds a job and answers immediately. Workers (separate processes) pick jobs from Redis and retry on failure.', 'تضيف الواجهة مهمة وترد فورًا. والعمال (عمليات منفصلة) يأخذون المهام من Redis ويعيدون المحاولة عند الفشل.'] },
                { cols: [
                    [{ code: `import { Queue } from 'bullmq';

const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };
export const emailQueue = new Queue('emails', { connection });

// in auth.controller after register:
await emailQueue.add(
  'welcome',
  { userId: user.id, email: user.email, name: user.name },
  {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },   // 2s, 4s, 8s…
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
);`, file: 'src/queues/email.queue.js', hl: '6-14' }],
                    [{ code: `import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const worker = new Worker('emails', async (job) => {
  if (job.name === 'welcome') {
    await transporter.sendMail({
      from: '"Tasky" <no-reply@tasky.dev>',
      to: job.data.email,
      subject: 'Welcome to Tasky 🎉',
      html: \`<h1>Hi \${job.data.name}!</h1><p>Your account is ready.</p>\`,
    });
  }
}, { connection: { url: process.env.REDIS_URL }, concurrency: 5 });

worker.on('failed', (job, err) => console.error(\`Job \${job?.id} failed: \${err.message}\`));`, file: 'src/workers/email.worker.js', hl: '10,19' },
                     { term: `npm install bullmq nodemailer
node src/workers/email.worker.js     # separate process from the API` }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Recurring jobs: BullMQ schedulers & node-cron', 'المهام المتكررة: جدولة BullMQ و node-cron'],
            b: [{ cols: [
                [{ code: `// BullMQ: repeatable job, stored in Redis (safe with many API instances)
await remindersQueue.upsertJobScheduler(
  'daily-due-reminders',
  { pattern: '0 8 * * *', tz: 'Africa/Algiers' },   // every day 08:00
  { name: 'due-today', data: {} },
);`, file: 'src/queues/reminders.js' },
                 { code: `import cron from 'node-cron';

// simple in-process schedule (runs in EVERY instance!)
cron.schedule('*/15 * * * *', async () => {
  await Session.deleteMany({ expiresAt: { $lt: new Date() } });
  console.log('expired sessions cleaned');
});`, file: 'src/cron.js' },
                 { code: `┌──────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌──── day of month (1-31)
│ │ │ ┌── month (1-12)
│ │ │ │ ┌ day of week (0-6, Sun=0)
0 8 * * 1-5   → 08:00 Monday–Friday`, file: 'cron syntax', lang: 'text', nonum: true }],
                [{ table: { h: [['Use a queue for…', 'استخدم طابورًا لـ…'], ['Why', 'لماذا']], r: [
                    [['Emails, SMS, push', 'البريد، الرسائل، الإشعارات'], ['slow third-party calls, retries', 'استدعاءات خارجية بطيئة مع إعادة المحاولة']],
                    [['Image/video processing, PDFs', 'معالجة الصور/الفيديو، ملفات PDF'], ['CPU heavy — keeps the event loop free', 'ثقيلة على المعالج — تبقي حلقة الأحداث حرة']],
                    [['Webhooks to customers', 'webhooks للعملاء'], ['their server may be down', 'قد يكون خادمهم متوقفًا']],
                    [['Reports, exports, imports', 'التقارير، التصدير، الاستيراد'], ['minutes long', 'تستغرق دقائق']]
                ] } },
                 { best: ['Make jobs <b>idempotent</b>: a retried job must not send two emails or charge twice. Store a “sentAt” flag or use the job id as an idempotency key.', 'اجعل المهام <b>متساوية الأثر</b>: المهمة المعادة يجب ألا ترسل بريدين أو تخصم مرتين. خزّن علامة "sentAt" أو استخدم معرّف المهمة كمفتاح.'] },
                 { tip: ['In development use <b>Ethereal</b> or <b>Mailpit</b> as a fake SMTP server to see emails without sending them.', 'في التطوير استخدم <b>Ethereal</b> أو <b>Mailpit</b> كخادم SMTP وهمي لرؤية الرسائل دون إرسالها.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Sending emails inside the request: signup takes 3 s and fails if SMTP is down.', 'إرسال البريد داخل الطلب: يستغرق التسجيل 3 ثوانٍ ويفشل إذا توقف SMTP.'] },
                 { mistake: ['<code>node-cron</code> in an app running 4 instances → the job runs 4 times.', '<code>node-cron</code> في تطبيق يعمل بأربع نسخ ← تعمل المهمة 4 مرات.'] },
                 { mistake: ['Putting huge payloads in jobs — store an id and load data in the worker.', 'وضع حمولات ضخمة في المهام — خزّن معرّفًا وحمّل البيانات في العامل.'] },
                 { mistake: ['No dead-letter strategy / monitoring for failed jobs (use Bull Board).', 'بلا استراتيجية للمهام الفاشلة أو مراقبتها (استخدم Bull Board).'] }],
                [{ qa: [
                    { q: ['Why use a message queue in a web API?', 'لماذا نستخدم طابور رسائل في واجهة ويب؟'], a: ['To respond fast, absorb traffic spikes, retry failures, and process CPU/slow work in separate scalable workers.', 'للرد بسرعة، امتصاص ذروات الحركة، إعادة المحاولة عند الفشل، ومعالجة العمل البطيء/الثقيل في عمال منفصلين قابلين للتوسع.'] },
                    { q: ['What is exponential backoff?', 'ما هو التأخير الأسي (exponential backoff)؟'], a: ['Waiting longer between each retry (1s, 2s, 4s…), often with jitter, so a struggling dependency can recover instead of being hammered.', 'الانتظار مدة أطول بين كل محاولة (1، 2، 4 ثوانٍ…) غالبًا مع عشوائية، لكي تتعافى الخدمة المتعثرة بدل إغراقها.'] },
                    { q: ['At-least-once vs exactly-once delivery?', 'التسليم مرة واحدة على الأقل مقابل مرة واحدة بالضبط؟'], a: ['Most queues guarantee at-least-once: a job can run twice. Achieve effectively-once with idempotent handlers.', 'معظم الطوابير تضمن مرة واحدة على الأقل: قد تعمل المهمة مرتين. حقق "مرة واحدة فعليًا" بمعالجات متساوية الأثر.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Welcome emails', 'رسائل الترحيب'],
            b: [{ tasks: [
                ['Run Redis + Mailpit (<code>docker run -p 8025:8025 -p 1025:1025 axllent/mailpit</code>).', 'شغّل Redis و Mailpit (<code>docker run -p 8025:8025 -p 1025:1025 axllent/mailpit</code>).'],
                ['Queue a welcome email on register; run the worker; see the email at <code>localhost:8025</code>.', 'أضف بريد ترحيب إلى الطابور عند التسجيل؛ شغّل العامل؛ وشاهد البريد على <code>localhost:8025</code>.'],
                ['Stop Mailpit, register again, watch the retries, restart Mailpit and watch it succeed.', 'أوقف Mailpit، سجّل مجددًا، راقب إعادة المحاولات، ثم أعد تشغيل Mailpit وشاهد النجاح.'],
                ['Add the daily reminder scheduler for tasks due today.', 'أضف جدولة التذكير اليومي للمهام المستحقة اليوم.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['Why move email sending to a queue?', 'لماذا ننقل إرسال البريد إلى طابور؟'], o: [['Emails become free', 'يصبح البريد مجانيًا'], ['Fast responses + automatic retries', 'استجابات سريعة + إعادة محاولة تلقائية'], ['Required by SMTP', 'مطلوب من SMTP'], ['Better HTML', 'HTML أفضل']], a: 1, e: ['The request is not blocked by a slow/unreliable provider.', 'الطلب لا يتعطل بسبب مزود بطيء أو غير موثوق.'] },
        { out: true, q: ['When does this cron run? <code>0 8 * * 1-5</code>', 'متى يعمل هذا الـ cron؟ <code>0 8 * * 1-5</code>'], o: [['Every 8 minutes', 'كل 8 دقائق'], ['08:00 Monday to Friday', '08:00 من الإثنين إلى الجمعة'], ['8th of every month', 'اليوم 8 من كل شهر'], ['Every hour on weekdays', 'كل ساعة في أيام العمل']], a: 1, e: ['minute 0, hour 8, weekdays 1–5.', 'الدقيقة 0، الساعة 8، أيام 1–5.'] },
        { tf: true, q: ['Jobs should be idempotent because they may run more than once.', 'يجب أن تكون المهام متساوية الأثر لأنها قد تعمل أكثر من مرة.'], e: ['At-least-once delivery + retries.', 'تسليم مرة على الأقل + إعادة المحاولة.'] },
        { q: ['Your API runs 3 instances. Which scheduler runs a daily job only once?', 'واجهتك تعمل بثلاث نسخ. أي جدولة تشغّل مهمة يومية مرة واحدة فقط؟'], o: [['node-cron in the API', 'node-cron داخل الواجهة'], ['BullMQ job scheduler (Redis)', 'جدولة مهام BullMQ (Redis)'], ['setInterval', 'setInterval'], ['setTimeout', 'setTimeout']], a: 1, e: ['A shared Redis-backed scheduler coordinates instances.', 'جدولة مشتركة مبنية على Redis تنسق بين النسخ.'] }
    ]
});

DECK.chapters.push({
    n: 31, level: 3, icon: '📡',
    t: ['Real-time: WebSockets & SSE', 'الوقت الحقيقي: WebSockets و SSE'],
    sub: ['Socket.IO with Express, rooms and auth, and Server-Sent Events', 'Socket.IO مع Express، الغرف والمصادقة، والأحداث المرسلة من الخادم'],
    project: ['Team members see task changes live without refreshing.', 'يرى أعضاء الفريق تغييرات المهام مباشرة دون تحديث الصفحة.'],
    learn: [
        ['Choose between polling, SSE and WebSockets', 'اختر بين الاستطلاع و SSE و WebSockets'],
        ['Run Socket.IO on the same server as Express', 'شغّل Socket.IO على نفس خادم Express'],
        ['Authenticate sockets and broadcast to rooms', 'صادق على الاتصالات وابث إلى الغرف']
    ],
    slides: [
        {
            kind: 'concept', t: ['Polling vs SSE vs WebSocket', 'الاستطلاع مقابل SSE مقابل WebSocket'],
            b: [
                { diagram: 'realtime' },
                { table: { h: ['', 'Polling', 'SSE', 'WebSocket'], r: [
                    [['Direction', 'الاتجاه'], ['client asks', 'العميل يسأل'], ['server → client', 'الخادم ← العميل'], ['both ways', 'الاتجاهين']],
                    [['Protocol', 'البروتوكول'], 'HTTP', ['HTTP (text/event-stream)', 'HTTP (text/event-stream)'], ['ws:// upgrade', 'ترقية ws://']],
                    [['Auto-reconnect', 'إعادة اتصال تلقائية'], '—', ['✅ built in', '✅ مدمجة'], ['Socket.IO ✅', 'Socket.IO ✅']],
                    [['Use for', 'الاستخدام'], ['rare updates', 'تحديثات نادرة'], ['notifications, live feeds, AI streaming', 'الإشعارات، الخلاصات الحية، بث الذكاء الاصطناعي'], ['chat, collaboration, games', 'الدردشة، التعاون، الألعاب']]
                ] } }
            ]
        },
        {
            kind: 'code', t: ['Socket.IO with Express + JWT auth', 'Socket.IO مع Express ومصادقة JWT'],
            b: [{ cols: [
                [{ code: `import { createServer } from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import { verifyAccessToken } from './utils/tokens.js';

const httpServer = createServer(app);          // ONE server for HTTP + WS
export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// authenticate every socket connection
io.use((socket, next) => {
  try {
    const payload = verifyAccessToken(socket.handshake.auth.token);
    socket.data.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(\`user:\${socket.data.user.id}\`);     // private room
  socket.on('team:join', (teamId) => socket.join(\`team:\${teamId}\`));
  socket.on('disconnect', (reason) => console.log('bye', reason));
});

httpServer.listen(process.env.PORT ?? 3000);`, file: 'src/server.js', hl: '6,12-20,23' }],
                [{ code: `// emit from the service after a change
import { io } from '../server.js';

export async function updateTask(user, id, changes) {
  const task = await findAccessible(user, id);
  task.set(changes);
  await task.save();
  io.to(\`user:\${user.id}\`).emit('task:updated', task);   // live update
  return task;
}`, file: 'src/services/tasks.service.js' },
                 { code: `import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { auth: { token: accessToken } });
socket.on('connect', () => console.log('connected', socket.id));
socket.on('task:updated', (task) => renderTask(task));
socket.on('connect_error', (err) => console.log(err.message)); // "Unauthorized"`, file: 'client.js' },
                 { tip: ['Importing <code>io</code> into services creates a cycle. Cleaner: emit domain events (<code>EventEmitter</code>) from services and let a socket module subscribe.', 'استيراد <code>io</code> في الخدمات ينشئ دورة. الأنظف: أطلق أحداث المجال (<code>EventEmitter</code>) من الخدمات ودع وحدة الـ socket تشترك فيها.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Server-Sent Events in 20 lines', 'الأحداث المرسلة من الخادم في 20 سطرًا'],
            b: [{ cols: [
                [{ code: `import { EventEmitter } from 'node:events';
export const bus = new EventEmitter();

app.get('/api/events', authenticate, (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const send = (event, data) => res.write(\`event: \${event}\\ndata: \${JSON.stringify(data)}\\n\\n\`);
  const onTask = (task) => { if (String(task.owner) === req.user.id) send('task', task); };

  bus.on('task:changed', onTask);
  const ping = setInterval(() => res.write(': ping\\n\\n'), 25000);  // keep proxies happy

  req.on('close', () => {                           // client left → clean up!
    clearInterval(ping);
    bus.off('task:changed', onTask);
  });
});

// in the service: bus.emit('task:changed', task);`, file: 'sse.js', hl: '6,12,18-21' }],
                [{ code: `const es = new EventSource('/api/events', { withCredentials: true });
es.addEventListener('task', (e) => renderTask(JSON.parse(e.data)));
es.onerror = () => console.log('reconnecting…');   // automatic`, file: 'browser.js' },
                 { warn: ['<code>EventSource</code> cannot send an Authorization header — use a cookie-based session, a short-lived token in the query string, or <code>fetch()</code> streaming.', '<code>EventSource</code> لا يستطيع إرسال ترويسة Authorization — استخدم جلسة بالكوكيز، أو رمزًا قصير العمر في سلسلة الاستعلام، أو البث عبر <code>fetch()</code>.'] },
                 { best: ['Scaling WebSockets to several servers needs sticky sessions + the <b>Redis adapter</b> (<code>@socket.io/redis-adapter</code>) so a message emitted on server A reaches clients on server B.', 'توسيع WebSockets لعدة خوادم يحتاج جلسات لاصقة + <b>محوّل Redis</b> (<code>@socket.io/redis-adapter</code>) لكي تصل الرسالة المرسلة من الخادم A إلى عملاء الخادم B.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Calling <code>app.listen()</code> and creating a second server for Socket.IO — use one <code>http.createServer(app)</code>.', 'استدعاء <code>app.listen()</code> وإنشاء خادم ثانٍ لـ Socket.IO — استخدم <code>http.createServer(app)</code> واحدًا.'] },
                 { mistake: ['Trusting data sent over sockets without validation or auth checks per event.', 'الوثوق بالبيانات المرسلة عبر الـ sockets دون تحقق أو فحص صلاحيات لكل حدث.'] },
                 { mistake: ['Memory leaks: listeners not removed when an SSE/WS client disconnects.', 'تسرب الذاكرة: عدم إزالة المستمعين عند قطع اتصال عميل SSE/WS.'] }],
                [{ qa: [
                    { q: ['When would you choose SSE over WebSockets?', 'متى تختار SSE بدل WebSockets؟'], a: ['When updates flow only server → client (notifications, progress, AI token streaming). SSE is plain HTTP, works through proxies, and auto-reconnects.', 'عندما تتدفق التحديثات من الخادم للعميل فقط (إشعارات، تقدم، بث رموز الذكاء الاصطناعي). SSE هو HTTP عادي، يعمل عبر الوكلاء، ويعيد الاتصال تلقائيًا.'] },
                    { q: ['How do you scale Socket.IO horizontally?', 'كيف توسّع Socket.IO أفقيًا؟'], a: ['Sticky sessions at the load balancer + a pub/sub adapter (Redis) so all instances share rooms and broadcasts.', 'جلسات لاصقة في موازن الحمل + محوّل نشر/اشتراك (Redis) لكي تتشارك كل النسخ الغرف والبث.'] },
                    { q: ['What are Socket.IO rooms?', 'ما هي غرف Socket.IO؟'], a: ['Server-side groups of sockets; io.to(room).emit() sends to everyone in it — e.g. one room per user or per team.', 'مجموعات من الاتصالات على الخادم؛ و io.to(room).emit() يرسل لكل من فيها — مثل غرفة لكل مستخدم أو فريق.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Live Tasky', 'Tasky المباشر'],
            b: [{ tasks: [
                ['Add Socket.IO with JWT auth; join <code>user:&lt;id&gt;</code> rooms.', 'أضف Socket.IO مع مصادقة JWT؛ وانضم إلى غرف <code>user:&lt;id&gt;</code>.'],
                ['Emit <code>task:created / updated / deleted</code> and show them in a small HTML page.', 'أطلق <code>task:created / updated / deleted</code> واعرضها في صفحة HTML صغيرة.'],
                ['Implement the SSE endpoint and compare the two in DevTools → Network.', 'نفّذ نقطة SSE وقارن بين الطريقتين في أدوات المطور ← Network.'],
                ['Open two browsers as different users — confirm they do not see each other’s events.', 'افتح متصفحين بمستخدمين مختلفين — تأكد أنهما لا يريان أحداث بعضهما.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['Which technology is one-way server → client over plain HTTP?', 'أي تقنية باتجاه واحد من الخادم للعميل عبر HTTP عادي؟'], o: ['WebSocket', 'SSE', 'gRPC', 'Polling'], a: 1, e: ['Server-Sent Events (text/event-stream).', 'Server-Sent Events (text/event-stream).'] },
        { q: ['How do you send an event to all sockets of one user?', 'كيف ترسل حدثًا لكل اتصالات مستخدم واحد؟'], o: ["`io.emit('x')`", "`io.to('user:42').emit('x')`", "`socket.broadcast('x')`", "`res.emit('x')`"], a: 1, e: ['Rooms group sockets; emit to the room.', 'الغرف تجمع الاتصالات؛ أرسل إلى الغرفة.'] },
        { tf: false, q: ['Socket.IO needs a separate port from your Express API.', 'يحتاج Socket.IO منفذًا منفصلًا عن واجهة Express.'], e: ['Share one http server; WS upgrades the HTTP connection.', 'شارك خادم http واحدًا؛ و WS يرقّي اتصال HTTP.'] },
        { q: ['What must you do when an SSE client disconnects?', 'ماذا يجب أن تفعل عندما يقطع عميل SSE الاتصال؟'], o: [['Nothing', 'لا شيء'], ['Remove listeners and timers (req.on("close"))', 'إزالة المستمعين والمؤقتات (req.on("close"))'], ['Restart the server', 'إعادة تشغيل الخادم'], ['Send 500', 'إرسال 500']], a: 1, e: ['Otherwise you leak memory with every connection.', 'وإلا ستسرب الذاكرة مع كل اتصال.'] }
    ]
});

DECK.chapters.push({
    n: 32, level: 3, icon: '🏎️',
    t: ['Performance', 'الأداء'],
    sub: ['Compression, clustering, streams, profiling, N+1 queries, connection pooling', 'الضغط، التجميع (cluster)، التدفقات، التحليل، استعلامات N+1، تجميع الاتصالات'],
    learn: [
        ['Measure first: load testing and profiling', 'قِس أولًا: اختبار الحمل والتحليل'],
        ['Use every CPU core and stream large responses', 'استخدم كل أنوية المعالج وابث الاستجابات الكبيرة'],
        ['Fix the database: N+1, indexes, pools', 'أصلح قاعدة البيانات: N+1، الفهارس، تجميع الاتصالات']
    ],
    slides: [
        {
            kind: 'code', t: ['Measure, then optimise', 'قِس ثم حسّن'],
            b: [{ cols: [
                [{ term: `# load test: 100 connections for 15 s
npx autocannon -c 100 -d 15 http://localhost:3000/api/tasks
# CPU profile → open the .cpuprofile in Chrome DevTools
node --cpu-prof src/server.js
# live debugging / heap snapshots
node --inspect src/server.js     # then chrome://inspect`, out: `Latency  p50 12 ms  p97.5 41 ms  p99 63 ms
Req/Sec  avg 7,850
118k requests in 15.02s, 41.3 MB read` },
                 { best: ['Watch <b>p95/p99 latency</b>, not the average. Optimise the slowest real endpoints first (profiling + DB explain), not what you guess.', 'راقب <b>زمن الاستجابة p95/p99</b> وليس المتوسط. حسّن أبطأ النقاط الحقيقية أولًا (التحليل + explain لقاعدة البيانات) وليس ما تخمنه.'] }],
                [{ code: `import compression from 'compression';

app.use(compression({ threshold: 1024 }));   // gzip/brotli bodies > 1 KB

// stream a big CSV export instead of building it in memory
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

app.get('/api/tasks/export.csv', authenticate, async (req, res) => {
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="tasks.csv"' });
  res.write('title,done,priority\\n');
  const cursor = Task.find({ owner: req.user.id }).lean().cursor();   // one doc at a time
  const toCsv = new Transform({
    objectMode: true,
    transform(t, _enc, cb) { cb(null, \`"\${t.title.replaceAll('"', '""')}",\${t.done},\${t.priority}\\n\`); },
  });
  await pipeline(cursor, toCsv, res);          // handles backpressure + errors
});`, file: 'perf.js', hl: '3,12,17' },
                 { tip: ['In production, let Nginx or the CDN compress (and cache) — it is faster than doing it in Node.', 'في الإنتاج دع Nginx أو CDN يقوم بالضغط (والتخزين المؤقت) — أسرع من القيام به في Node.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['All CPU cores: cluster & PM2', 'كل أنوية المعالج: cluster و PM2'],
            b: [{ cols: [
                [{ diagram: 'cluster' },
                 { code: `import cluster from 'node:cluster';
import os from 'node:os';

if (cluster.isPrimary) {
  const n = os.availableParallelism();
  console.log(\`Primary \${process.pid} starting \${n} workers\`);
  for (let i = 0; i < n; i++) cluster.fork();
  cluster.on('exit', (worker) => {
    console.log(\`worker \${worker.process.pid} died → restarting\`);
    cluster.fork();
  });
} else {
  await import('./server.js');                 // each worker runs the app
}`, file: 'src/cluster.js', hl: '5,7,13' }],
                [{ code: `// ❌ N+1: 1 query for tasks + 1 query PER task for its owner
const tasks = await Task.find().lean();
for (const t of tasks) t.owner = await User.findById(t.owner).lean();

// ✅ 2 queries total
const tasks2 = await Task.find().populate('owner', 'name').lean();

// ✅ SQL / Prisma: one JOIN
await prisma.task.findMany({ include: { owner: { select: { name: true } } } });

// connection pools: reuse connections, cap them
await mongoose.connect(uri, { maxPoolSize: 20 });
const pool = new pg.Pool({ connectionString, max: 20, idleTimeoutMillis: 30000 });`, file: 'db-perf.js', hl: '3,6,12-13' },
                 { warn: ['Each cluster worker has its own memory: in-memory caches, sessions and rate limits are <b>not shared</b>. Move them to Redis. Pool size × workers × instances must stay under the DB’s max connections.', 'لكل عامل في cluster ذاكرته الخاصة: الذاكرة المؤقتة والجلسات وحدود المعدل في الذاكرة <b>غير مشتركة</b>. انقلها إلى Redis. وحجم التجميع × العمال × النسخ يجب أن يبقى أقل من الحد الأقصى لاتصالات قاعدة البيانات.'] },
                 { tip: ['<code>pm2 start src/server.js -i max</code> does clustering, restarts and zero-downtime reloads for you (chapter 38). In Kubernetes, prefer 1 process per container and scale pods.', '<code>pm2 start src/server.js -i max</code> يقوم بالتجميع وإعادة التشغيل والتحديث بدون توقف (الفصل 38). وفي Kubernetes فضّل عملية واحدة لكل حاوية ووسّع الـ pods.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Sync APIs in handlers: <code>fs.readFileSync</code>, <code>bcrypt.hashSync</code>, huge <code>JSON.parse</code> → the whole server stalls.', 'واجهات متزامنة في المعالجات: <code>fs.readFileSync</code> و <code>bcrypt.hashSync</code> و <code>JSON.parse</code> ضخم ← يتوقف الخادم كله.'] },
                 { mistake: ['Loading 100k rows to send JSON — paginate or stream.', 'تحميل 100 ألف صف لإرسال JSON — قسّم أو ابث.'] },
                 { mistake: ['Optimising without measuring; micro-optimising JS while the DB has no index.', 'التحسين دون قياس؛ وتحسين JS الدقيق بينما قاعدة البيانات بلا فهرس.'] }],
                [{ qa: [
                    { q: ['What is the N+1 query problem?', 'ما هي مشكلة استعلامات N+1؟'], a: ['Fetching a list (1 query) then one extra query per item (N). Fix with joins/populate/IN queries or a DataLoader to batch.', 'جلب قائمة (استعلام واحد) ثم استعلام إضافي لكل عنصر (N). الحل: الربط أو populate أو استعلامات IN أو DataLoader للتجميع.'] },
                    { q: ['How does Node use multiple cores?', 'كيف يستخدم Node عدة أنوية؟'], a: ['Multiple processes (cluster, PM2, containers) behind a load balancer for I/O-bound APIs; worker_threads for CPU-heavy tasks inside one process.', 'عمليات متعددة (cluster أو PM2 أو حاويات) خلف موازن حمل للواجهات كثيرة الإدخال/الإخراج؛ و worker_threads للمهام الثقيلة داخل عملية واحدة.'] },
                    { q: ['What is backpressure in streams?', 'ما هو الضغط العكسي (backpressure) في التدفقات؟'], a: ['When the consumer is slower than the producer, write() returns false and the producer must pause; pipeline() handles it automatically to keep memory flat.', 'عندما يكون المستهلك أبطأ من المنتج، تعيد write() القيمة false ويجب أن يتوقف المنتج مؤقتًا؛ و pipeline() يتعامل مع ذلك تلقائيًا لإبقاء الذاكرة ثابتة.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Make it fast', 'اجعله سريعًا'],
            b: [{ tasks: [
                ['Seed 50k tasks (a small script with <code>insertMany</code>). Benchmark <code>GET /api/tasks</code>.', 'أضف 50 ألف مهمة (سكربت صغير بـ <code>insertMany</code>). وقِس أداء <code>GET /api/tasks</code>.'],
                ['Remove and re-add the compound index — compare p99 and <code>explain()</code>.', 'احذف الفهرس المركّب ثم أعده — قارن p99 و <code>explain()</code>.'],
                ['Implement the CSV streaming export and watch memory in Task Manager / <code>htop</code>.', 'نفّذ التصدير المتدفق CSV وراقب الذاكرة في مدير المهام / <code>htop</code>.'],
                ['Run with <code>pm2 -i max</code> and benchmark again.', 'شغّل بـ <code>pm2 -i max</code> وقِس مجددًا.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { q: ['Which metric best reflects user-perceived slowness?', 'أي مقياس يعكس البطء الذي يشعر به المستخدم أفضل؟'], o: [['Average latency', 'متوسط زمن الاستجابة'], ['p95/p99 latency', 'زمن الاستجابة p95/p99'], ['CPU %', 'نسبة المعالج'], ['Lines of code', 'عدد الأسطر']], a: 1, e: ['Tail latency shows what the slowest users experience.', 'زمن الذيل يوضح تجربة أبطأ المستخدمين.'] },
        { out: true, q: ['How many DB queries does this run for 50 tasks?', 'كم استعلامًا ينفذ هذا لـ 50 مهمة؟'], code: `const tasks = await Task.find().lean();\nfor (const t of tasks) t.owner = await User.findById(t.owner);`, o: ['1', '2', '50', '51'], a: 3, e: ['1 + N = 51 → the N+1 problem.', '1 + N = 51 ← مشكلة N+1.'] },
        { tf: true, q: ['With cluster mode, in-memory rate limits are per worker, not global.', 'في وضع cluster تكون حدود المعدل في الذاكرة لكل عامل وليست عامة.'], e: ['Each worker is a separate process. Use Redis.', 'كل عامل عملية منفصلة. استخدم Redis.'] },
        { q: ['Best way to send a 2 GB export?', 'أفضل طريقة لإرسال ملف تصدير بحجم 2GB؟'], o: [['Build a string then res.send', 'بناء نص ثم res.send'], ['Stream with pipeline()', 'البث باستخدام pipeline()'], ['JSON.stringify everything', 'JSON.stringify لكل شيء'], ['Increase RAM', 'زيادة الذاكرة']], a: 1, e: ['Streams keep memory constant and respect backpressure.', 'التدفقات تبقي الذاكرة ثابتة وتحترم الضغط العكسي.'] }
    ]
});

DECK.chapters.push({
    n: 33, level: 3, icon: '⚙️',
    t: ['Config, environments & graceful shutdown', 'الإعدادات والبيئات والإيقاف الآمن'],
    sub: ['Validated config, dev/staging/prod, health checks, SIGTERM handling', 'إعدادات متحقق منها، تطوير/تجريب/إنتاج، فحوص الصحة، والتعامل مع SIGTERM'],
    project: ['Tasky refuses to start with bad config and shuts down without dropping requests.', 'يرفض Tasky الإقلاع بإعدادات خاطئة ويتوقف دون إسقاط الطلبات.'],
    learn: [
        ['Validate all environment variables at startup', 'تحقق من كل متغيرات البيئة عند الإقلاع'],
        ['Expose liveness and readiness endpoints', 'وفّر نقاط فحص الحياة (liveness) والجاهزية (readiness)'],
        ['Shut down gracefully on SIGTERM', 'توقف بأمان عند SIGTERM']
    ],
    slides: [
        {
            kind: 'code', t: ['One validated config module', 'وحدة إعدادات واحدة متحقق منها'],
            b: [{ cols: [
                [{ code: `import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().startsWith('mongodb'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:5173')
    .transform((s) => s.split(',').map((o) => o.trim())),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(z.prettifyError(parsed.error));
  process.exit(1);                          // fail fast, never run half-configured
}

export const config = Object.freeze({
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
});`, file: 'src/config/index.js', hl: '15,19-20', x: 'api' }],
                [{ term: 'JWT_ACCESS_SECRET=short node src/server.js', out: `❌ Invalid environment configuration:
✖ Invalid input: expected string, received undefined
  → at MONGODB_URI
✖ JWT_ACCESS_SECRET must be at least 32 chars
  → at JWT_ACCESS_SECRET
✖ Invalid input: expected string, received undefined
  → at JWT_REFRESH_SECRET` },
                 { table: { h: [['Env', 'البيئة'], ['Purpose', 'الغرض'], ['Data', 'البيانات']], r: [
                     ['development', ['your laptop, verbose logs', 'جهازك، سجلات مفصلة'], ['fake / seed', 'وهمية / تجريبية']],
                     ['test', ['CI, isolated DB', 'CI، قاعدة معزولة'], ['throwaway', 'مؤقتة']],
                     ['staging', ['prod copy for QA/demos', 'نسخة من الإنتاج للاختبار والعرض'], ['anonymised', 'مجهولة الهوية']],
                     ['production', ['real users', 'المستخدمون الحقيقيون'], ['real, backed up', 'حقيقية مع نسخ احتياطي']]
                 ] } },
                 { best: ['Same code, same Docker image in every environment — only the <b>config</b> changes (12-factor app).', 'نفس الكود ونفس صورة Docker في كل بيئة — فقط <b>الإعدادات</b> تتغير (تطبيق 12 عاملًا).'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Health checks & graceful shutdown', 'فحوص الصحة والإيقاف الآمن'],
            b: [{ cols: [
                [{ code: `import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import app from './app.js';
import { connectDB } from './config/db.js';

let shuttingDown = false;
const root = express();          // process-level endpoints in front of the app

// liveness: is the process alive?  readiness: can it serve traffic?
root.get('/health/live', (req, res) => res.json({ status: 'ok' }));
root.get('/health/ready', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  if (shuttingDown || !dbUp) return res.status(503).json({ status: 'unavailable', dbUp });
  res.json({ status: 'ready', dbUp, uptime: process.uptime() });
});
root.use(app);                   // everything else → the Tasky app

await connectDB(config.MONGODB_URI);
const server = root.listen(config.PORT, () => console.log(\`🚀 Tasky on :\${config.PORT}\`));

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(\`\${signal} received: closing gracefully…\`);
  setTimeout(() => process.exit(1), 10_000).unref();   // hard deadline

  server.close(async () => {          // stop accepting, finish in-flight requests
    await mongoose.disconnect();
    console.log('bye 👋');
    process.exit(0);
  });
  server.closeIdleConnections();      // drop idle keep-alive sockets now
}

process.on('SIGTERM', shutdown);      // Docker / Kubernetes / PM2
process.on('SIGINT', shutdown);       // Ctrl+C
process.on('unhandledRejection', (err) => { console.error(err); shutdown('unhandledRejection'); });`, file: 'src/server.js', hl: '8,11-12,17,26-31,37', x: 'api' }],
                [{ ul: [
                    ['<b>Liveness</b> fails → the orchestrator restarts the container. Keep it trivial.', '<b>فحص الحياة</b> يفشل ← يعيد المنسق تشغيل الحاوية. اجعله بسيطًا.'],
                    ['<b>Readiness</b> fails → the load balancer stops sending traffic (DB down, warming up, shutting down).', '<b>فحص الجاهزية</b> يفشل ← يتوقف موازن الحمل عن إرسال الحركة (قاعدة متوقفة، إحماء، إيقاف).'],
                    ['On deploy, the platform sends <b>SIGTERM</b>, waits (e.g. 30 s), then <b>SIGKILL</b>. Finish requests and close DB/Redis/queues inside that window.', 'عند النشر ترسل المنصة <b>SIGTERM</b> ثم تنتظر (مثل 30 ثانية) ثم <b>SIGKILL</b>. أنهِ الطلبات وأغلق قاعدة البيانات/Redis/الطوابير خلال هذه المهلة.']
                ] },
                 { term: `node src/server.js
# in another terminal
curl localhost:3000/health/ready
# Ctrl+C in the first terminal`, out: `🚀 Tasky on :3000
{"status":"ready","dbUp":true,"uptime":3.21}
SIGINT received: closing gracefully…
bye 👋` },
                 { warn: ['In Docker, use <code>CMD ["node", "src/server.js"]</code> (exec form). <code>npm start</code> or shell form may not forward SIGTERM to Node.', 'في Docker استخدم <code>CMD ["node", "src/server.js"]</code> (صيغة exec). فـ <code>npm start</code> أو صيغة shell قد لا تمرر SIGTERM إلى Node.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['<code>process.env.X</code> scattered in 40 files with different defaults.', '<code>process.env.X</code> مبعثر في 40 ملفًا بقيم افتراضية مختلفة.'] },
                 { mistake: ['Killing the process on deploy → users get connection resets mid-request.', 'قتل العملية عند النشر ← يحصل المستخدمون على قطع اتصال في منتصف الطلب.'] },
                 { mistake: ['A health check that queries 5 services: one slow dependency restarts your whole fleet.', 'فحص صحة يستعلم 5 خدمات: تبعية بطيئة واحدة تعيد تشغيل كل الخوادم.'] }],
                [{ qa: [
                    { q: ['What is a graceful shutdown?', 'ما هو الإيقاف الآمن؟'], a: ['On SIGTERM: stop accepting new connections, mark not-ready, finish in-flight requests and jobs, close DB/queue connections, then exit — with a hard timeout.', 'عند SIGTERM: توقف عن قبول اتصالات جديدة، علّم أنك غير جاهز، أنهِ الطلبات والمهام الجارية، أغلق اتصالات قاعدة البيانات/الطوابير ثم اخرج — مع مهلة قصوى.'] },
                    { q: ['Liveness vs readiness?', 'فحص الحياة مقابل الجاهزية؟'], a: ['Liveness: should I be restarted? Readiness: should I receive traffic right now? A DB outage should fail readiness, not liveness.', 'الحياة: هل يجب إعادة تشغيلي؟ الجاهزية: هل يجب أن أستقبل الحركة الآن؟ انقطاع قاعدة البيانات يجب أن يُفشل الجاهزية وليس الحياة.'] },
                    { q: ['What is the 12-factor app?', 'ما هو تطبيق الـ 12 عاملًا؟'], a: ['A methodology: config in env, stateless processes, backing services as attached resources, logs to stdout, dev/prod parity, disposability (fast start, graceful stop)…', 'منهجية: الإعدادات في البيئة، عمليات عديمة الحالة، الخدمات الداعمة كموارد ملحقة، السجلات إلى stdout، تكافؤ التطوير/الإنتاج، قابلية التخلص (إقلاع سريع وإيقاف آمن)…'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Production-ready boot', 'إقلاع جاهز للإنتاج'],
            b: [{ tasks: [
                ['Create <code>config/index.js</code>; replace every <code>process.env</code> in the codebase with <code>config</code>.', 'أنشئ <code>config/index.js</code>؛ واستبدل كل <code>process.env</code> في الكود بـ <code>config</code>.'],
                ['Start with a missing secret — you should see a clear error and exit code 1.', 'شغّل مع سر ناقص — يجب أن ترى خطأ واضحًا ورمز خروج 1.'],
                ['Add live/ready endpoints and graceful shutdown. Start a slow request (<code>setTimeout</code> 5 s), press Ctrl+C: it must complete.', 'أضف نقاط live/ready والإيقاف الآمن. ابدأ طلبًا بطيئًا (<code>setTimeout</code> 5 ثوانٍ) واضغط Ctrl+C: يجب أن يكتمل.'],
                ['Stop MongoDB — <code>/health/ready</code> must return 503 while <code>/health/live</code> stays 200.', 'أوقف MongoDB — يجب أن يعيد <code>/health/ready</code> الرمز 503 بينما يبقى <code>/health/live</code> 200.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['What should happen if a required env var is missing at startup?', 'ماذا يجب أن يحدث إذا نقص متغير بيئة مطلوب عند الإقلاع؟'], o: [['Use a random default', 'استخدام قيمة عشوائية'], ['Log a clear error and exit(1)', 'تسجيل خطأ واضح والخروج exit(1)'], ['Ignore it', 'تجاهله'], ['Ask the user', 'سؤال المستخدم']], a: 1, e: ['Fail fast — never run half-configured.', 'افشل مبكرًا — لا تعمل بإعدادات ناقصة أبدًا.'] },
        { q: ['Which signal do Docker/Kubernetes send to stop a container?', 'أي إشارة يرسلها Docker/Kubernetes لإيقاف حاوية؟'], o: ['SIGKILL', 'SIGTERM', 'SIGHUP', 'SIGUSR1'], a: 1, e: ['SIGTERM first, then SIGKILL after the grace period.', 'SIGTERM أولًا ثم SIGKILL بعد مهلة السماح.'] },
        { tf: false, q: ['A database outage should make the liveness probe fail.', 'انقطاع قاعدة البيانات يجب أن يُفشل فحص الحياة.'], e: ['Restarting will not fix the DB; fail readiness instead.', 'إعادة التشغيل لن تصلح قاعدة البيانات؛ أفشِل الجاهزية بدلًا من ذلك.'] },
        { q: ['What does <code>server.close(cb)</code> do?', 'ماذا يفعل <code>server.close(cb)</code>؟'], o: [['Kills all requests', 'يقتل كل الطلبات'], ['Stops new connections and calls cb when existing ones finish', 'يوقف الاتصالات الجديدة ويستدعي cb عندما تنتهي الحالية'], ['Restarts the server', 'يعيد تشغيل الخادم'], ['Closes MongoDB', 'يغلق MongoDB']], a: 1, e: ['That is why we close the DB inside its callback.', 'لهذا نغلق قاعدة البيانات داخل دالة الاستدعاء.'] }
    ]
});
