/* Level 4 — Pro / Senior (chapters 34–43) */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 34, level: 4, icon: '🏛️',
    t: ['Scalable architecture', 'المعمارية القابلة للتوسع'],
    sub: ['Monolith vs modular monolith vs microservices, API gateway, message brokers', 'المونوليث مقابل المونوليث المعياري مقابل الخدمات المصغرة، بوابة API، ووسطاء الرسائل'],
    learn: [
        ['Pick an architecture that fits the team and the problem', 'اختر معمارية تناسب الفريق والمشكلة'],
        ['Route traffic through an API gateway', 'وجّه الحركة عبر بوابة API'],
        ['Decouple services with events (RabbitMQ / Kafka)', 'افصل الخدمات بالأحداث (RabbitMQ / Kafka)']
    ],
    slides: [
        {
            kind: 'concept', t: ['Three ways to grow', 'ثلاث طرق للنمو'],
            b: [
                { table: { h: ['', ['Monolith', 'المونوليث'], ['Modular monolith', 'المونوليث المعياري'], ['Microservices', 'الخدمات المصغرة']], r: [
                    [['Deploy', 'النشر'], ['one unit', 'وحدة واحدة'], ['one unit', 'وحدة واحدة'], ['many independent units', 'وحدات مستقلة كثيرة']],
                    [['Boundaries', 'الحدود'], ['folders (often blurry)', 'مجلدات (غالبًا ضبابية)'], ['enforced modules + public APIs', 'وحدات مفروضة + واجهات عامة'], ['network + separate DBs', 'الشبكة + قواعد بيانات منفصلة']],
                    [['Complexity', 'التعقيد'], ['low', 'منخفض'], ['medium', 'متوسط'], ['high (network, ops, data consistency)', 'عالٍ (الشبكة، التشغيل، اتساق البيانات)']],
                    [['Team size', 'حجم الفريق'], ['1–8', '1–8'], ['5–40', '5–40'], ['many teams', 'فرق كثيرة']],
                    [['Start here?', 'تبدأ هنا؟'], ['✅ MVP', '✅ MVP'], ['✅ most products', '✅ معظم المنتجات'], ['only when you must', 'فقط عند الضرورة']]
                ] } },
                { cols: [
                    [{ best: ['Start with a <b>modular monolith</b> (modules/tasks, modules/billing…) with clear public interfaces. Extract a service only when a module needs independent scaling, deployment or ownership.', 'ابدأ بـ <b>مونوليث معياري</b> (modules/tasks و modules/billing…) بواجهات عامة واضحة. واستخرج خدمة فقط عندما تحتاج وحدة إلى توسع أو نشر أو ملكية مستقلة.'] }],
                    [{ mistake: ['“Microservices from day one” with one team → a <b>distributed monolith</b>: all the pain of the network, none of the independence.', '"خدمات مصغرة من اليوم الأول" بفريق واحد ← <b>مونوليث موزع</b>: كل ألم الشبكة بلا أي استقلالية.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['API gateway & message broker', 'بوابة API ووسيط الرسائل'],
            b: [
                { diagram: 'micro', cap: ['The gateway is the single entry point. Services talk asynchronously through a broker so one being down does not break the others.', 'البوابة هي نقطة الدخول الوحيدة. والخدمات تتواصل بشكل غير متزامن عبر وسيط لكي لا يعطل توقف إحداها الأخرى.'] },
                { cols: [
                    [{ code: `import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from './auth.js';

const gw = express();
gw.use(rateLimit({ windowMs: 60_000, limit: 600 }));

const proxy = (pathFilter, target) =>
  createProxyMiddleware({ pathFilter, target, changeOrigin: true });

gw.use(proxy('/api/auth', 'http://users-service:3001'));        // public
gw.use('/api', authenticate);                                   // JWT once, at the edge
gw.use(proxy('/api/users', 'http://users-service:3001'));
gw.use(proxy('/api/tasks', 'http://tasks-service:3002'));

gw.listen(8080);`, file: 'gateway/src/server.js', hl: '10,13' }],
                    [{ code: `import amqp from 'amqplib';

const conn = await amqp.connect(process.env.AMQP_URL);   // amqp://localhost
const ch = await conn.createChannel();
await ch.assertExchange('tasky.events', 'topic', { durable: true });

// tasks-service: publish an event after saving
export function publish(type, payload) {
  ch.publish('tasky.events', type, Buffer.from(JSON.stringify(payload)), { persistent: true });
}
publish('task.created', { taskId: '665…', ownerId: '664…' });

// notify-service: consume
const { queue } = await ch.assertQueue('notify.task-created', { durable: true });
await ch.bindQueue(queue, 'tasky.events', 'task.created');
ch.consume(queue, async (msg) => {
  const event = JSON.parse(msg.content.toString());
  await sendPush(event.ownerId, 'New task created');
  ch.ack(msg);                       // only after success
});`, file: 'events.js', hl: '9,19' },
                     { tip: ['<b>RabbitMQ</b> = smart broker, routing, task queues. <b>Kafka</b> = durable event log, replay, very high throughput, stream processing.', '<b>RabbitMQ</b> = وسيط ذكي، توجيه، طوابير مهام. و <b>Kafka</b> = سجل أحداث دائم، إعادة تشغيل، إنتاجية عالية جدًا، معالجة تدفقات.'] }]
                ] }
            ]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Services sharing one database → hidden coupling; you cannot change a table without breaking another team.', 'خدمات تتشارك قاعدة بيانات واحدة ← اقتران خفي؛ لا تستطيع تغيير جدول دون كسر فريق آخر.'] },
                 { mistake: ['Long chains of synchronous HTTP calls between services (A→B→C→D): latency adds up, one failure cascades.', 'سلاسل طويلة من استدعاءات HTTP المتزامنة بين الخدمات (A←B←C←D): يتراكم التأخير وينتشر الفشل.'] },
                 { mistake: ['Publishing an event and saving to the DB in two steps without the outbox pattern → lost or phantom events.', 'نشر حدث والحفظ في قاعدة البيانات في خطوتين دون نمط outbox ← أحداث مفقودة أو وهمية.'] }],
                [{ qa: [
                    { q: ['When would you split a monolith into microservices?', 'متى تقسم المونوليث إلى خدمات مصغرة؟'], a: ['When a module has a clear bounded context and needs independent scaling, deploys or team ownership — and you have the ops maturity (CI/CD, observability, on-call). Not to “be modern”.', 'عندما يكون للوحدة سياق محدد واضح وتحتاج توسعًا أو نشرًا أو ملكية فريق مستقلة — ولديك نضج تشغيلي (CI/CD، مراقبة، مناوبة). وليس لـ"مواكبة الموضة".'] },
                    { q: ['What does an API gateway do?', 'ماذا تفعل بوابة API؟'], a: ['Single entry point: routing, authentication, rate limiting, TLS, request aggregation, caching, logging — so services stay simple.', 'نقطة دخول واحدة: التوجيه، المصادقة، تحديد المعدل، TLS، تجميع الطلبات، التخزين المؤقت، السجلات — لتبقى الخدمات بسيطة.'] },
                    { q: ['What is eventual consistency?', 'ما هو الاتساق النهائي؟'], a: ['After an update, other services see it after a short delay (via events) instead of instantly. You design UX and compensating actions (sagas) around it.', 'بعد التحديث ترى الخدمات الأخرى التغيير بعد تأخير قصير (عبر الأحداث) وليس فورًا. وتصمم تجربة المستخدم وإجراءات التعويض (sagas) على هذا الأساس.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Design session', 'جلسة تصميم'],
            b: [{ tasks: [
                ['In groups: draw Tasky as a modular monolith (modules + their public functions).', 'في مجموعات: ارسموا Tasky كمونوليث معياري (الوحدات + دوالها العامة).'],
                ['Identify one module that might become a service later. Why?', 'حددوا وحدة قد تصبح خدمة لاحقًا. لماذا؟'],
                ['Run RabbitMQ in Docker and publish/consume a <code>task.created</code> event between two Node scripts.', 'شغّلوا RabbitMQ في Docker وانشروا/استهلكوا حدث <code>task.created</code> بين سكربتين في Node.'],
                ['Present the trade-offs in 3 minutes.', 'اعرضوا المفاضلات في 3 دقائق.']
            ], time: 30, hint: ['<code>docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:4-management</code> → UI at localhost:15672 (guest/guest).', '<code>docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:4-management</code> ← الواجهة على localhost:15672 (guest/guest).'] }]
        }
    ],
    quiz: [
        { q: ['Best default architecture for a new product with one small team?', 'أفضل معمارية افتراضية لمنتج جديد بفريق صغير واحد؟'], o: [['Microservices', 'خدمات مصغرة'], ['Modular monolith', 'مونوليث معياري'], ['Serverless functions per endpoint', 'دالة serverless لكل نقطة'], ['Kafka everywhere', 'Kafka في كل مكان']], a: 1, e: ['Simple to run, clear boundaries, easy to split later.', 'سهل التشغيل، حدود واضحة، وسهل التقسيم لاحقًا.'] },
        { tf: false, q: ['Microservices should share one database to keep data consistent.', 'يجب أن تتشارك الخدمات المصغرة قاعدة بيانات واحدة لإبقاء البيانات متسقة.'], e: ['Database per service; share data via APIs/events.', 'قاعدة بيانات لكل خدمة؛ وشارك البيانات عبر الواجهات/الأحداث.'] },
        { q: ['Why call <code>ch.ack(msg)</code> only after processing succeeds?', 'لماذا نستدعي <code>ch.ack(msg)</code> فقط بعد نجاح المعالجة؟'], o: [['Speed', 'السرعة'], ['So the broker redelivers the message if the consumer crashes', 'لكي يعيد الوسيط إرسال الرسالة إذا انهار المستهلك'], ['RabbitMQ requires JSON', 'RabbitMQ يتطلب JSON'], ['To delete the queue', 'لحذف الطابور']], a: 1, e: ['Unacked messages are requeued → at-least-once processing.', 'الرسائل غير المؤكدة تعاد للطابور ← معالجة مرة على الأقل.'] },
        { q: ['Which component typically centralises auth and rate limiting for many services?', 'أي مكوّن يجمع عادة المصادقة وتحديد المعدل لخدمات كثيرة؟'], o: [['The database', 'قاعدة البيانات'], ['API gateway', 'بوابة API'], ['The browser', 'المتصفح'], ['The broker', 'الوسيط']], a: 1, e: ['Cross-cutting concerns at the edge.', 'الاهتمامات المشتركة على الحافة.'] }
    ]
});

DECK.chapters.push({
    n: 35, level: 4, icon: '📐',
    t: ['API design', 'تصميم الواجهات'],
    sub: ['REST best practices, versioning, idempotency, HATEOAS, GraphQL & gRPC intro', 'أفضل ممارسات REST، الإصدارات، تساوي الأثر، HATEOAS، ومقدمة GraphQL و gRPC'],
    learn: [
        ['Design consistent, evolvable REST APIs', 'صمّم واجهات REST متسقة وقابلة للتطور'],
        ['Make POST safe to retry with idempotency keys', 'اجعل POST آمنًا لإعادة المحاولة بمفاتيح تساوي الأثر'],
        ['Know when GraphQL or gRPC fit better', 'اعرف متى يناسب GraphQL أو gRPC أكثر']
    ],
    slides: [
        {
            kind: 'concept', t: ['REST checklist & versioning', 'قائمة REST والإصدارات'],
            b: [{ cols: [
                [{ ul: [
                    ['Plural nouns, nesting max 1 level: <code>/teams/:id/tasks</code>.', 'أسماء جمع، تداخل بمستوى واحد كحد أقصى: <code>/teams/:id/tasks</code>.'],
                    ['Consistent casing (<code>camelCase</code> JSON), ISO-8601 dates in UTC, ids as strings.', 'تنسيق ثابت (<code>camelCase</code> في JSON)، تواريخ ISO-8601 بتوقيت UTC، والمعرفات كنصوص.'],
                    ['One error shape everywhere: <code>{ error, details?, requestId }</code> — or RFC 9457 <code>application/problem+json</code>.', 'شكل خطأ واحد في كل مكان: <code>{ error, details?, requestId }</code> — أو RFC 9457 <code>application/problem+json</code>.'],
                    ['Lists are always paginated and return <code>meta</code>.', 'القوائم دائمًا مقسمة إلى صفحات وتعيد <code>meta</code>.'],
                    ['Never break clients: add fields, do not rename/remove them. Deprecate with headers (<code>Deprecation</code>, <code>Sunset</code>).', 'لا تكسر العملاء أبدًا: أضف حقولًا ولا تعدّل أسماءها أو تحذفها. وألغِ تدريجيًا بالترويسات (<code>Deprecation</code> و <code>Sunset</code>).']
                ] }],
                [{ code: `// URL versioning — simplest, cache-friendly, visible
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// header versioning — clean URLs
app.use('/api', (req, res, next) => {
  req.apiVersion = req.get('Accept-Version') ?? '1';
  next();
});

// HATEOAS: responses tell the client what it can do next
{
  "id": "665f…", "title": "Ship v2", "done": false,
  "_links": {
    "self":     { "href": "/api/v1/tasks/665f…" },
    "complete": { "href": "/api/v1/tasks/665f…", "method": "PATCH" },
    "owner":    { "href": "/api/v1/users/664a…" }
  }
}`, file: 'versioning.js', lang: 'js' }]
            ] }]
        },
        {
            kind: 'code', t: ['Idempotency keys', 'مفاتيح تساوي الأثر'],
            b: [{ cols: [
                [{ code: `import { redis } from '../config/cache.js';

// Client sends: Idempotency-Key: 3f2c…  (a UUID per logical operation)
export function idempotent(ttlSeconds = 24 * 3600) {
  return async (req, res, next) => {
    const key = req.get('Idempotency-Key');
    if (!key) return next();
    const cacheKey = \`idem:\${req.user.id}:\${key}\`;

    const saved = await redis.get(cacheKey);
    if (saved) {                                   // replay → same answer
      const { status, body } = JSON.parse(saved);
      return res.status(status).set('Idempotent-Replayed', 'true').json(body);
    }

    // lock so two parallel retries do not both run
    const locked = await redis.set(cacheKey, JSON.stringify({ status: 409, body: { error: 'In progress' } }),
      { condition: 'NX', expiration: { type: 'EX', value: 60 } });
    if (!locked) return res.status(409).json({ error: 'Request already in progress' });

    const json = res.json.bind(res);
    res.json = (body) => {
      redis.set(cacheKey, JSON.stringify({ status: res.statusCode, body }),
        { expiration: { type: 'EX', value: ttlSeconds } });
      return json(body);
    };
    next();
  };
}

router.post('/payments', authenticate, idempotent(), ctrl.createPayment);`, file: 'src/middlewares/idempotency.js', hl: '11-14,17-18' }],
                [{ p: ['Networks fail <i>after</i> the server did the work. The client retries… and the customer is charged twice. With an idempotency key the retry returns the <b>original</b> response.', 'الشبكات تفشل <i>بعد</i> أن ينفذ الخادم العمل. فيعيد العميل المحاولة… ويُخصم المبلغ مرتين. مع مفتاح تساوي الأثر تعيد المحاولة الاستجابة <b>الأصلية</b>.'] },
                 { term: `curl -X POST localhost:3000/api/payments -H "Idempotency-Key: 7d1e…" -d '{"amount":10}' …
curl -X POST localhost:3000/api/payments -H "Idempotency-Key: 7d1e…" -d '{"amount":10}' …`, out: `201 {"id":"pay_1","amount":10}
201 {"id":"pay_1","amount":10}   Idempotent-Replayed: true` },
                 { best: ['Stripe, PayPal and most payment APIs work this way. Use it for every non-idempotent operation with side effects (payments, orders, emails).', 'Stripe و PayPal ومعظم واجهات الدفع تعمل بهذه الطريقة. استخدمه لكل عملية غير متساوية الأثر لها آثار جانبية (مدفوعات، طلبات، رسائل).'] }]
            ] }]
        },
        {
            kind: 'code', t: ['GraphQL & gRPC in one slide', 'GraphQL و gRPC في شريحة واحدة'],
            b: [{ cols: [
                [{ code: `import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';

const schema = buildSchema(\`
  type Task { id: ID!, title: String!, done: Boolean!, owner: User! }
  type User { id: ID!, name: String! }
  type Query { tasks(done: Boolean): [Task!]! }
  type Mutation { completeTask(id: ID!): Task! }
\`);

const rootValue = {
  tasks: ({ done }, ctx) => taskService.listTasks(ctx.user, { done }),
  completeTask: ({ id }, ctx) => taskService.updateTask(ctx.user, id, { done: true }),
};

app.all('/graphql', authenticate, createHandler({ schema, rootValue, context: (req) => ({ user: req.raw.user }) }));`, file: 'graphql.js', hl: '4-9' },
                 { code: `query { tasks(done: false) { title owner { name } } }`, file: 'client query', lang: 'graphql' }],
                [{ code: `syntax = "proto3";
package tasky;

service Tasks {
  rpc GetTask (GetTaskRequest) returns (Task);
  rpc WatchTasks (WatchRequest) returns (stream Task);
}
message GetTaskRequest { string id = 1; }
message WatchRequest { string owner_id = 1; }
message Task { string id = 1; string title = 2; bool done = 3; }`, file: 'tasks.proto', lang: 'graphql' },
                 { table: { h: ['', 'REST', 'GraphQL', 'gRPC'], r: [
                     [['Best for', 'الأفضل لـ'], ['public APIs, caching', 'الواجهات العامة، التخزين المؤقت'], ['many clients needing different shapes', 'عملاء كثيرون بأشكال مختلفة'], ['service-to-service, streaming', 'بين الخدمات، البث']],
                     [['Format', 'الصيغة'], 'JSON', 'JSON', ['Protobuf (binary)', 'Protobuf (ثنائي)']],
                     [['Over/under-fetching', 'جلب زائد/ناقص'], ['common', 'شائع'], ['solved', 'محلول'], ['typed contract', 'عقد بأنواع']],
                     [['Watch out', 'انتبه'], ['versioning', 'الإصدارات'], ['N+1 (use DataLoader), query cost limits', 'N+1 (استخدم DataLoader)، حدود تكلفة الاستعلام'], ['browser support (needs proxy)', 'دعم المتصفح (يحتاج وسيطًا)']]
                 ] } }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Breaking changes without a version bump (renaming <code>done</code> → <code>completed</code>).', 'تغييرات كاسرة دون رفع الإصدار (إعادة تسمية <code>done</code> ← <code>completed</code>).'] },
                 { mistake: ['200 OK with <code>{ success: false }</code> for errors — clients and monitors cannot tell.', '200 OK مع <code>{ success: false }</code> للأخطاء — لا يستطيع العملاء والمراقبة التمييز.'] },
                 { mistake: ['GraphQL without depth/complexity limits → one query can take down the server.', 'GraphQL بلا حدود للعمق/التعقيد ← استعلام واحد قد يسقط الخادم.'] }],
                [{ qa: [
                    { q: ['What makes an operation idempotent? Is PATCH idempotent?', 'ما الذي يجعل العملية متساوية الأثر؟ هل PATCH متساوي الأثر؟'], a: ['Repeating it leaves the same server state. GET/PUT/DELETE are by definition. PATCH can be (set done=true) or not (increment counter) — depends on the operation.', 'تكرارها يترك نفس حالة الخادم. GET/PUT/DELETE كذلك بالتعريف. و PATCH قد يكون (اضبط done=true) أو لا (زِد العداد) — حسب العملية.'] },
                    { q: ['REST vs GraphQL — how do you choose?', 'REST مقابل GraphQL — كيف تختار؟'], a: ['REST for simple resource APIs, public APIs and HTTP caching. GraphQL when many clients need different data shapes from many sources and you can invest in tooling (DataLoader, persisted queries, cost limits).', 'REST للواجهات البسيطة والعامة والتخزين المؤقت عبر HTTP. و GraphQL عندما يحتاج عملاء كثيرون أشكالًا مختلفة من مصادر كثيرة وتستطيع الاستثمار في الأدوات (DataLoader، استعلامات محفوظة، حدود التكلفة).'] },
                    { q: ['How do you version an API?', 'كيف تضع إصدارات للواجهة؟'], a: ['URL (/v1) is the most common and explicit; headers keep URLs clean. Prefer additive changes, deprecate with Sunset headers and communicate timelines.', 'الرابط (/v1) الأكثر شيوعًا ووضوحًا؛ والترويسات تبقي الروابط نظيفة. فضّل التغييرات الإضافية، وألغِ تدريجيًا بترويسة Sunset وأعلن الجداول الزمنية.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Design review', 'مراجعة تصميم'],
            b: [{ tasks: [
                ['Write an API style guide (1 page) for Tasky: naming, errors, pagination, dates, versioning.', 'اكتب دليل أسلوب للواجهة (صفحة واحدة) لـ Tasky: التسمية، الأخطاء، التصفح، التواريخ، الإصدارات.'],
                ['Add the idempotency middleware to <code>POST /api/tasks</code> and prove a retry does not create a duplicate.', 'أضف وسيط تساوي الأثر إلى <code>POST /api/tasks</code> وأثبت أن إعادة المحاولة لا تنشئ نسخة مكررة.'],
                ['Expose <code>/graphql</code> with <code>tasks</code> and <code>completeTask</code> using the existing service.', 'وفّر <code>/graphql</code> مع <code>tasks</code> و <code>completeTask</code> باستخدام الخدمة الحالية.'],
                ['Bonus: add <code>_links</code> to task responses.', 'إضافي: أضف <code>_links</code> إلى استجابات المهام.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { q: ['What does an Idempotency-Key protect against?', 'مما يحمي مفتاح تساوي الأثر؟'], o: [['XSS', 'XSS'], ['Duplicate side effects when a client retries', 'تكرار الآثار الجانبية عند إعادة العميل للمحاولة'], ['Slow queries', 'الاستعلامات البطيئة'], ['CORS errors', 'أخطاء CORS']], a: 1, e: ['Same key → same stored response, no second charge.', 'نفس المفتاح ← نفس الاستجابة المحفوظة، بلا خصم ثانٍ.'] },
        { tf: true, q: ['Adding a new optional field to a response is a non-breaking change.', 'إضافة حقل اختياري جديد إلى الاستجابة تغيير غير كاسر.'], e: ['Well-behaved clients ignore unknown fields.', 'العملاء الجيدون يتجاهلون الحقول غير المعروفة.'] },
        { q: ['GraphQL mainly solves…', 'GraphQL يحل أساسًا…'], o: [['Authentication', 'المصادقة'], ['Over- and under-fetching for varied clients', 'الجلب الزائد والناقص لعملاء متنوعين'], ['Database indexing', 'فهرسة قاعدة البيانات'], ['Deployment', 'النشر']], a: 1, e: ['Clients ask for exactly the fields they need.', 'العملاء يطلبون الحقول التي يحتاجونها بالضبط.'] },
        { q: ['Which is best for high-performance service-to-service calls with streaming?', 'أيها الأفضل لاستدعاءات عالية الأداء بين الخدمات مع البث؟'], o: ['REST + XML', 'gRPC', 'SOAP', 'GraphQL'], a: 1, e: ['HTTP/2 + Protobuf + bidirectional streaming.', 'HTTP/2 + Protobuf + بث ثنائي الاتجاه.'] }
    ]
});

DECK.chapters.push({
    n: 36, level: 4, icon: '🐳',
    t: ['Docker & docker compose', 'Docker و docker compose'],
    sub: ['Images, multi-stage builds, .dockerignore, compose with MongoDB & Redis', 'الصور، البناء متعدد المراحل، ‎.dockerignore، و compose مع MongoDB و Redis'],
    project: ['<code>docker compose up</code> starts Tasky + MongoDB + Redis on any machine.', '<code>docker compose up</code> يشغّل Tasky و MongoDB و Redis على أي جهاز.'],
    learn: [
        ['Write a small, secure, production Dockerfile', 'اكتب Dockerfile إنتاجيًا صغيرًا وآمنًا'],
        ['Use multi-stage builds for TypeScript', 'استخدم البناء متعدد المراحل لـ TypeScript'],
        ['Run the whole stack locally with compose', 'شغّل البنية كاملة محليًا باستخدام compose']
    ],
    slides: [
        {
            kind: 'code', t: ['A production Dockerfile', 'Dockerfile للإنتاج'],
            b: [
                { diagram: 'docker', cap: ['Build tools and devDependencies stay in stage 1; only the compiled app and prod deps ship.', 'أدوات البناء وتبعيات التطوير تبقى في المرحلة 1؛ ولا يُشحن إلا التطبيق المترجم وتبعيات الإنتاج.'] },
                { cols: [
                    [{ code: `# ---------- stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                          # incl. devDependencies (tsc)
COPY . .
RUN npm run build                   # → dist/

# ---------- stage 2: runtime ----------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node                           # never run as root
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:3000/health/live || exit 1
CMD ["node", "dist/server.js"]`, file: 'Dockerfile', hl: '2,10,14-16,20' }],
                    [{ code: `node_modules
npm-debug.log
dist
coverage
.git
.env
.env.*
Dockerfile
docker-compose*.yml`, file: '.dockerignore', lang: 'text' },
                     { term: `docker build -t tasky-api:1.0.0 .
docker run --rm -p 3000:3000 --env-file .env tasky-api:1.0.0
docker images tasky-api`, out: `REPOSITORY   TAG     SIZE
tasky-api    1.0.0   ~180MB   (vs ~1.1GB with node:22 + devDeps)` },
                     { tip: ['Plain JS project (no build step)? Use a single stage: copy <code>package*.json</code> → <code>npm ci --omit=dev</code> → copy <code>src/</code> → <code>CMD ["node","src/server.js"]</code>.', 'مشروع JS بدون مرحلة بناء؟ استخدم مرحلة واحدة: انسخ <code>package*.json</code> ← <code>npm ci --omit=dev</code> ← انسخ <code>src/</code> ← <code>CMD ["node","src/server.js"]</code>.'] },
                     { best: ['Copy <code>package*.json</code> and install <b>before</b> copying source: Docker caches that layer, so rebuilds after code changes take seconds.', 'انسخ <code>package*.json</code> وثبّت <b>قبل</b> نسخ الكود: يخزّن Docker هذه الطبقة، فتستغرق إعادة البناء بعد تعديل الكود ثوانٍ.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['docker compose: the whole stack', 'docker compose: البنية كاملة'],
            b: [{ cols: [
                [{ code: `services:
  api:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    environment:
      MONGODB_URI: mongodb://mongo:27017/tasky     # service name = hostname
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo: { condition: service_healthy }
      redis: { condition: service_started }
    restart: unless-stopped

  worker:
    build: .
    command: ["node", "dist/workers/email.worker.js"]
    env_file: .env
    environment:
      REDIS_URL: redis://redis:6379
    depends_on: [redis]

  mongo:
    image: mongo:8
    volumes: [mongo-data:/data/db]
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s

  redis:
    image: redis:8-alpine

volumes:
  mongo-data:`, file: 'docker-compose.yml', hl: '7,9-10,24' }],
                [{ term: `docker compose up -d --build
docker compose ps
docker compose logs -f api
docker compose exec mongo mongosh tasky
docker compose down          # add -v to delete volumes`, out: `NAME            SERVICE   STATUS
tasky-api-1     api       Up (healthy)
tasky-worker-1  worker    Up
tasky-mongo-1   mongo     Up (healthy)
tasky-redis-1   redis     Up` },
                 { mistake: ['Using <code>localhost</code> inside a container to reach another container. Use the <b>service name</b> (<code>mongo</code>, <code>redis</code>).', 'استخدام <code>localhost</code> داخل حاوية للوصول إلى حاوية أخرى. استخدم <b>اسم الخدمة</b> (<code>mongo</code> و <code>redis</code>).'] },
                 { warn: ['Images are public artefacts once pushed: never <code>COPY .env</code> or bake secrets with <code>ENV</code>. Pass them at runtime.', 'الصور تصبح ملفات منشورة بعد دفعها: لا تستخدم <code>COPY .env</code> ولا تضع الأسرار بـ <code>ENV</code>. مررها وقت التشغيل.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['<code>FROM node:latest</code> — builds change silently. Pin a major (and ideally a digest).', '<code>FROM node:latest</code> — يتغير البناء بصمت. ثبّت الإصدار الرئيسي (ويفضل digest).'] },
                 { mistake: ['<code>CMD npm start</code> (shell form) → SIGTERM never reaches Node, no graceful shutdown.', '<code>CMD npm start</code> (صيغة shell) ← لا تصل SIGTERM إلى Node، ولا إيقاف آمن.'] },
                 { mistake: ['Storing data inside the container filesystem (uploads, SQLite) without a volume.', 'تخزين البيانات داخل نظام ملفات الحاوية (رفع ملفات، SQLite) دون volume.'] }],
                [{ qa: [
                    { q: ['Image vs container?', 'الصورة مقابل الحاوية؟'], a: ['An image is an immutable template (layers). A container is a running instance of an image with its own writable layer, network and process.', 'الصورة قالب غير قابل للتغيير (طبقات). والحاوية نسخة عاملة من الصورة لها طبقة كتابة وشبكة وعملية خاصة بها.'] },
                    { q: ['Why multi-stage builds?', 'لماذا البناء متعدد المراحل؟'], a: ['Keep compilers, devDependencies and source out of the final image: smaller, faster to pull, smaller attack surface.', 'لإبقاء المترجمات وتبعيات التطوير والكود المصدري خارج الصورة النهائية: أصغر، أسرع في التنزيل، وسطح هجوم أصغر.'] },
                    { q: ['How do you make Docker builds fast?', 'كيف تجعل بناء Docker سريعًا؟'], a: ['Order layers from least to most frequently changing, copy lockfile and install before source, use .dockerignore, BuildKit cache mounts, and CI layer caching.', 'رتّب الطبقات من الأقل تغيرًا إلى الأكثر، انسخ ملف القفل وثبّت قبل الكود، استخدم ‎.dockerignore، وذاكرة BuildKit، وذاكرة الطبقات في CI.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Containerise Tasky', 'ضع Tasky في حاوية'],
            b: [{ tasks: [
                ['Write the Dockerfile + .dockerignore; build and run with <code>--env-file</code>.', 'اكتب Dockerfile و ‎.dockerignore؛ ابنِ وشغّل مع <code>--env-file</code>.'],
                ['Create docker-compose.yml with api, worker, mongo, redis. <code>docker compose up</code>.', 'أنشئ docker-compose.yml فيه api و worker و mongo و redis. ثم <code>docker compose up</code>.'],
                ['Run <code>docker compose stop api</code> and check your graceful shutdown logs.', 'نفّذ <code>docker compose stop api</code> وتحقق من سجلات الإيقاف الآمن.'],
                ['Compare image sizes: <code>node:22</code> vs <code>node:22-alpine</code> vs multi-stage.', 'قارن أحجام الصور: <code>node:22</code> مقابل <code>node:22-alpine</code> مقابل متعدد المراحل.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['Inside the api container, how do you reach MongoDB from compose?', 'داخل حاوية api، كيف تصل إلى MongoDB في compose؟'], o: ['`localhost:27017`', '`mongo:27017`', '`127.0.0.1:27017`', '`host.docker:27017`'], a: 1, e: ['Compose creates DNS names from service names.', 'compose ينشئ أسماء DNS من أسماء الخدمات.'] },
        { tf: true, q: ['Copying package.json and running npm ci before copying the source improves build caching.', 'نسخ package.json وتنفيذ npm ci قبل نسخ الكود يحسّن ذاكرة البناء المؤقتة.'], e: ['The install layer is reused until dependencies change.', 'طبقة التثبيت يعاد استخدامها حتى تتغير التبعيات.'] },
        { q: ['Why <code>USER node</code>?', 'لماذا <code>USER node</code>؟'], o: [['Faster', 'أسرع'], ['Do not run the app as root (least privilege)', 'لا تشغّل التطبيق كمدير النظام (أقل صلاحية)'], ['Required by npm', 'مطلوب من npm'], ['Smaller image', 'صورة أصغر']], a: 1, e: ['Limits damage if the app is compromised.', 'يحد من الضرر إذا اختُرق التطبيق.'] },
        { q: ['Which CMD form forwards signals to Node correctly?', 'أي صيغة CMD تمرر الإشارات إلى Node بشكل صحيح؟'], o: ['`CMD npm start`', '`CMD node dist/server.js`', '`CMD ["node", "dist/server.js"]`', '`RUN node dist/server.js`'], a: 2, e: ['Exec form: Node is PID 1 and receives SIGTERM.', 'صيغة exec: يكون Node هو PID 1 ويستقبل SIGTERM.'] }
    ]
});

DECK.chapters.push({
    n: 37, level: 4, icon: '🔄',
    t: ['CI/CD & code quality', 'CI/CD وجودة الكود'],
    sub: ['GitHub Actions, ESLint + Prettier, pre-commit hooks, semantic versioning', 'GitHub Actions و ESLint + Prettier وخطافات ما قبل الحفظ والإصدارات الدلالية'],
    project: ['Every push runs lint + tests; merges to main build and publish a Docker image.', 'كل دفع يشغّل الفحص والاختبارات؛ والدمج في main يبني وينشر صورة Docker.'],
    learn: [
        ['Automate lint, test and build on every pull request', 'أتمت الفحص والاختبار والبناء في كل طلب دمج'],
        ['Enforce style before commits with hooks', 'افرض الأسلوب قبل الحفظ بالخطافات'],
        ['Version and release with SemVer + Conventional Commits', 'أصدر الإصدارات بـ SemVer و Conventional Commits']
    ],
    slides: [
        {
            kind: 'code', t: ['A GitHub Actions pipeline', 'خط إنتاج GitHub Actions'],
            b: [
                { diagram: 'cicd' },
                { cols: [
                    [{ code: `name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:8
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
        env:
          MONGODB_URI_TEST: mongodb://localhost:27017/tasky_test
      - run: npm audit --audit-level=high

  docker:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: \${{ github.actor }}, password: \${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}`, file: '.github/workflows/ci.yml', hl: '10-13,22,26-27' }],
                    [{ best: ['Protect <code>main</code>: require the CI check to pass and at least one review before merging. Deploy only artefacts that passed CI (the image tagged with the commit SHA).', 'احمِ <code>main</code>: اشترط نجاح فحص CI ومراجعة واحدة على الأقل قبل الدمج. وانشر فقط الملفات التي نجحت في CI (الصورة الموسومة بـ SHA الـ commit).'] },
                     { tip: ['Add a <code>deploy</code> job that SSHes to the server (or calls Render/Fly/Railway) after <code>docker</code> — with a manual approval <code>environment: production</code>.', 'أضف مهمة <code>deploy</code> تتصل بالخادم عبر SSH (أو تستدعي Render/Fly/Railway) بعد <code>docker</code> — مع موافقة يدوية <code>environment: production</code>.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['ESLint, Prettier & pre-commit hooks', 'ESLint و Prettier وخطافات ما قبل الحفظ'],
            b: [{ cols: [
                [{ term: `npm install -D eslint @eslint/js globals prettier eslint-config-prettier husky lint-staged
npx husky init` },
                 { code: `import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|next' }],
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['error'] }],
    },
  },
  prettier,                                   // turn off rules Prettier handles
];`, file: 'eslint.config.js' }],
                [{ code: `{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all" }`, file: '.prettierrc', lang: 'json' },
                 { code: `{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}`, file: 'package.json' },
                 { code: `npx lint-staged`, file: '.husky/pre-commit', lang: 'bash' },
                 { table: { h: ['SemVer', ['When', 'متى'], ['Commit type', 'نوع الـ commit']], r: [
                     ['MAJOR 2.0.0', ['breaking API change', 'تغيير كاسر للواجهة'], '<code>feat!:</code> / <code>BREAKING CHANGE</code>'],
                     ['MINOR 1.3.0', ['new backwards-compatible feature', 'ميزة جديدة متوافقة'], '<code>feat:</code>'],
                     ['PATCH 1.2.4', ['bug fix', 'إصلاح خطأ'], '<code>fix:</code>']
                 ] } },
                 { tip: ['<code>release-please</code> or <code>semantic-release</code> read Conventional Commits, bump the version, write the CHANGELOG and tag the release automatically.', '<code>release-please</code> أو <code>semantic-release</code> يقرآن Conventional Commits ويرفعان الإصدار ويكتبان سجل التغييرات ويوسمان الإصدار تلقائيًا.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Flaky tests that everyone re-runs until green — CI loses all meaning.', 'اختبارات متذبذبة يعيد الجميع تشغيلها حتى تنجح — يفقد CI كل معناه.'] },
                 { mistake: ['Secrets printed in CI logs or committed in workflow files. Use encrypted <code>secrets.*</code>.', 'أسرار تُطبع في سجلات CI أو تُحفظ في ملفات العمل. استخدم <code>secrets.*</code> المشفرة.'] },
                 { mistake: ['Deploying from a laptop (“works on my machine”) instead of from the pipeline.', 'النشر من الحاسوب المحمول ("يعمل على جهازي") بدل خط الإنتاج.'] }],
                [{ qa: [
                    { q: ['CI vs CD vs continuous deployment?', 'CI مقابل CD مقابل النشر المستمر؟'], a: ['CI: every change is built and tested automatically. Continuous delivery: every green build is releasable (manual button). Continuous deployment: every green build goes to production automatically.', 'CI: كل تغيير يُبنى ويُختبر تلقائيًا. التسليم المستمر: كل بناء ناجح قابل للإصدار (بزر يدوي). النشر المستمر: كل بناء ناجح يذهب للإنتاج تلقائيًا.'] },
                    { q: ['How do you roll back a bad deploy?', 'كيف تتراجع عن نشر سيئ؟'], a: ['Redeploy the previous immutable image tag (fast), use blue-green or canary releases, keep DB migrations backwards-compatible (expand → migrate → contract), and use feature flags.', 'أعد نشر وسم الصورة السابق الثابت (سريع)، استخدم إصدارات blue-green أو canary، اجعل ترحيلات قاعدة البيانات متوافقة للخلف (توسيع ← ترحيل ← تقليص)، واستخدم أعلام الميزات.'] },
                    { q: ['What runs in a pre-commit hook vs in CI?', 'ماذا يعمل في خطاف ما قبل الحفظ مقابل CI؟'], a: ['Pre-commit: fast checks on staged files (format, lint). CI: everything authoritative (full lint, all tests, audit, build) — hooks can be skipped, CI cannot.', 'ما قبل الحفظ: فحوص سريعة على الملفات المجهزة (التنسيق، الفحص). و CI: كل شيء رسمي (فحص كامل، كل الاختبارات، التدقيق، البناء) — الخطافات يمكن تجاوزها و CI لا.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Automate Tasky', 'أتمت Tasky'],
            b: [{ tasks: [
                ['Add ESLint + Prettier + husky + lint-staged. Make a messy commit and watch it get fixed.', 'أضف ESLint و Prettier و husky و lint-staged. اعمل commit فوضويًا وشاهده يُصلح.'],
                ['Push the CI workflow; open a PR with a failing test and see the red check.', 'ادفع ملف CI؛ افتح PR باختبار فاشل وشاهد العلامة الحمراء.'],
                ['Enable branch protection on <code>main</code> requiring the check.', 'فعّل حماية الفرع <code>main</code> مع اشتراط الفحص.'],
                ['Publish the Docker image to GHCR on merge.', 'انشر صورة Docker إلى GHCR عند الدمج.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { out: true, q: ['Current version 1.4.2. You fix a bug. Next version?', 'الإصدار الحالي 1.4.2. أصلحت خطأ. الإصدار التالي؟'], o: ['`2.0.0`', '`1.5.0`', '`1.4.3`', '`1.4.2-1`'], a: 2, e: ['Bug fix → PATCH.', 'إصلاح خطأ ← PATCH.'] },
        { q: ['What does lint-staged do?', 'ماذا يفعل lint-staged؟'], o: [['Runs all tests', 'يشغّل كل الاختبارات'], ['Runs linters only on files staged for commit', 'يشغّل أدوات الفحص فقط على الملفات المجهزة للحفظ'], ['Deploys code', 'ينشر الكود'], ['Creates branches', 'ينشئ الفروع']], a: 1, e: ['Fast feedback before each commit.', 'تغذية راجعة سريعة قبل كل حفظ.'] },
        { tf: true, q: ['A commit message <code>feat!: drop v1 endpoints</code> signals a MAJOR version bump.', 'رسالة <code>feat!: drop v1 endpoints</code> تشير إلى رفع الإصدار الرئيسي MAJOR.'], e: ['The ! marks a breaking change.', 'علامة ! تعني تغييرًا كاسرًا.'] },
        { q: ['Why <code>eslint-config-prettier</code>?', 'لماذا <code>eslint-config-prettier</code>؟'], o: [['To run Prettier', 'لتشغيل Prettier'], ['To disable ESLint style rules that conflict with Prettier', 'لتعطيل قواعد أسلوب ESLint المتعارضة مع Prettier'], ['For TypeScript', 'لـ TypeScript'], ['For tests', 'للاختبارات']], a: 1, e: ['ESLint = bugs, Prettier = formatting.', 'ESLint = الأخطاء، و Prettier = التنسيق.'] }
    ]
});

DECK.chapters.push({
    n: 38, level: 4, icon: '🚀',
    t: ['Deployment', 'النشر'],
    sub: ['VPS + Nginx + PM2, reverse proxy, HTTPS, cloud platforms, serverless', 'خادم VPS مع Nginx و PM2، الوكيل العكسي، HTTPS، المنصات السحابية، و serverless'],
    project: ['Tasky is live at <code>https://api.tasky.dev</code>.', 'Tasky متاح على <code>https://api.tasky.dev</code>.'],
    learn: [
        ['Deploy on a Linux VPS with PM2 and Nginx', 'انشر على خادم Linux VPS باستخدام PM2 و Nginx'],
        ['Add free HTTPS with Let’s Encrypt', 'أضف HTTPS مجانيًا مع Let’s Encrypt'],
        ['Compare PaaS, containers and serverless', 'قارن بين PaaS والحاويات و serverless']
    ],
    slides: [
        {
            kind: 'code', t: ['VPS: PM2 + Nginx + HTTPS', 'VPS: PM2 و Nginx و HTTPS'],
            b: [
                { diagram: 'deploy' },
                { cols: [
                    [{ term: `ssh deploy@203.0.113.10
curl -fsSL https://fnm.vercel.app/install | bash && fnm install 22
git clone https://github.com/you/tasky-api.git && cd tasky-api
npm ci --omit=dev
npm install -g pm2
pm2 start ecosystem.config.cjs --env production
pm2 save && pm2 startup          # restart on reboot
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d api.tasky.dev` },
                     { code: `module.exports = {
  apps: [{
    name: 'tasky-api',
    script: 'src/server.js',
    instances: 'max',            // one per CPU core (cluster mode)
    exec_mode: 'cluster',
    max_memory_restart: '400M',
    kill_timeout: 10000,         // time for graceful shutdown
    env_production: { NODE_ENV: 'production', PORT: 3000 },
  }],
};`, file: 'ecosystem.config.cjs', hl: '5-6,8' }],
                    [{ code: `server {
    listen 80;
    server_name api.tasky.dev;
    return 301 https://$host$request_uri;          # force HTTPS
}

server {
    listen 443 ssl http2;
    server_name api.tasky.dev;
    ssl_certificate     /etc/letsencrypt/live/api.tasky.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tasky.dev/privkey.pem;

    client_max_body_size 10m;
    gzip on;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;     # WebSockets
        proxy_set_header Connection "upgrade";
    }
}`, file: '/etc/nginx/sites-available/tasky', lang: 'nginx', hl: '17,21-22' },
                     { warn: ['Behind Nginx, add <code>app.set(\'trust proxy\', 1)</code> — otherwise <code>req.ip</code> is always 127.0.0.1 (rate limiting breaks) and <code>req.secure</code> is false (secure cookies are not set).', 'خلف Nginx أضف <code>app.set(\'trust proxy\', 1)</code> — وإلا سيكون <code>req.ip</code> دائمًا 127.0.0.1 (يتعطل تحديد المعدل) و <code>req.secure</code> خطأ (لا تُضبط الكوكيز الآمنة).'] }]
                ] }
            ]
        },
        {
            kind: 'concept', t: ['Where to host? PaaS, containers, serverless', 'أين تستضيف؟ PaaS أو حاويات أو serverless'],
            b: [
                { table: { h: [['Option', 'الخيار'], ['Examples', 'أمثلة'], ['Pros', 'المزايا'], ['Cons', 'العيوب']], r: [
                    ['VPS', 'Hetzner, DigitalOcean, OVH', ['cheap, full control, great for learning', 'رخيص، تحكم كامل، ممتاز للتعلم'], ['you patch, monitor, back up', 'أنت من يحدّث ويراقب وينسخ احتياطيًا']],
                    ['PaaS', 'Render, Railway, Fly.io, Heroku', ['git push → live, HTTPS, logs', 'git push ← يعمل مباشرة، HTTPS، سجلات'], ['cost grows, less control', 'التكلفة تزداد، تحكم أقل']],
                    [['Containers', 'الحاويات'], 'AWS ECS/App Runner, Google Cloud Run, Kubernetes', ['scales, same image everywhere', 'يتوسع، نفس الصورة في كل مكان'], ['more moving parts', 'أجزاء متحركة أكثر']],
                    ['Serverless', 'AWS Lambda, Vercel Functions', ['pay per request, scales to zero', 'ادفع لكل طلب، يتقلص للصفر'], ['cold starts, DB connection limits, time limits', 'بدء بارد، حدود اتصالات قاعدة البيانات، حدود الوقت']]
                ] } },
                { cols: [
                    [{ code: `// Express on AWS Lambda
import serverless from 'serverless-http';
import app from './app.js';

export const handler = serverless(app);`, file: 'lambda.js' }],
                    [{ best: ['Learn on a VPS (you understand every layer), ship real products on a PaaS or containers, and reach for serverless for spiky, event-driven workloads.', 'تعلّم على VPS (تفهم كل طبقة)، وانشر المنتجات الحقيقية على PaaS أو حاويات، واستخدم serverless للأحمال المتقطعة والمعتمدة على الأحداث.'] }]
                ] }
            ]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Exposing port 3000 and MongoDB 27017 to the internet. Firewall (ufw): only 22, 80, 443.', 'فتح المنفذ 3000 و MongoDB 27017 للإنترنت. الجدار الناري (ufw): فقط 22 و 80 و 443.'] },
                 { mistake: ['Running Node as root, SSH with passwords, no automatic security updates.', 'تشغيل Node كمدير النظام، و SSH بكلمات مرور، وبلا تحديثات أمنية تلقائية.'] },
                 { mistake: ['No backups — or backups never tested by restoring them.', 'بلا نسخ احتياطي — أو نسخ لم تُختبر باستعادتها أبدًا.'] }],
                [{ qa: [
                    { q: ['Why put Nginx in front of Node?', 'لماذا نضع Nginx أمام Node؟'], a: ['TLS termination, HTTP/2, compression, static files, buffering slow clients, rate limiting, load balancing across instances, and hiding the app port.', 'إنهاء TLS، و HTTP/2، والضغط، والملفات الثابتة، وتخزين العملاء البطيئين مؤقتًا، وتحديد المعدل، وموازنة الحمل بين النسخ، وإخفاء منفذ التطبيق.'] },
                    { q: ['What is a zero-downtime deploy?', 'ما هو النشر بدون توقف؟'], a: ['New instances start and pass readiness before old ones get SIGTERM and drain (pm2 reload, rolling updates, blue-green). Users never see errors.', 'تبدأ النسخ الجديدة وتنجح في فحص الجاهزية قبل أن تتلقى القديمة SIGTERM وتفرغ طلباتها (pm2 reload، تحديثات متدرجة، blue-green). لا يرى المستخدمون أي أخطاء.'] },
                    { q: ['What does trust proxy do?', 'ماذا يفعل trust proxy؟'], a: ['Tells Express to read client IP/protocol from X-Forwarded-* headers set by your proxy. Set it to the exact number of proxies to avoid IP spoofing.', 'يخبر Express بقراءة IP العميل والبروتوكول من ترويسات X-Forwarded-* التي يضبطها الوكيل. اضبطه على عدد الوكلاء بالضبط لتجنب انتحال IP.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Go live', 'انشر على الإنترنت'],
            b: [{ tasks: [
                ['Option A: deploy the Docker image to Render/Railway/Fly with MongoDB Atlas.', 'الخيار أ: انشر صورة Docker على Render أو Railway أو Fly مع MongoDB Atlas.'],
                ['Option B: rent a small VPS, follow the PM2 + Nginx + certbot steps.', 'الخيار ب: استأجر VPS صغيرًا واتبع خطوات PM2 و Nginx و certbot.'],
                ['Check <code>https://…/health/ready</code>, security headers (securityheaders.com) and SSL grade (ssllabs.com).', 'تحقق من <code>https://…/health/ready</code> وترويسات الأمان (securityheaders.com) ودرجة SSL (ssllabs.com).'],
                ['Do a <code>pm2 reload tasky-api</code> while running autocannon — zero failed requests?', 'نفّذ <code>pm2 reload tasky-api</code> أثناء تشغيل autocannon — هل هناك طلبات فاشلة؟']
            ], time: 45 }]
        }
    ],
    quiz: [
        { q: ['Which Nginx headers are needed for WebSockets?', 'أي ترويسات Nginx مطلوبة لـ WebSockets؟'], o: [['Host only', 'Host فقط'], ['Upgrade and Connection: upgrade', 'Upgrade و Connection: upgrade'], ['X-Powered-By', 'X-Powered-By'], ['Cache-Control', 'Cache-Control']], a: 1, e: ['WS starts as an HTTP Upgrade request.', 'يبدأ WS كطلب ترقية HTTP.'] },
        { tf: true, q: ['Without <code>trust proxy</code> behind Nginx, every request seems to come from 127.0.0.1.', 'بدون <code>trust proxy</code> خلف Nginx يبدو أن كل طلب يأتي من 127.0.0.1.'], e: ['Express sees the proxy connection, not the client.', 'يرى Express اتصال الوكيل وليس العميل.'] },
        { q: ['What does <code>pm2 startup</code> + <code>pm2 save</code> give you?', 'ماذا يعطيك <code>pm2 startup</code> و <code>pm2 save</code>؟'], o: [['HTTPS', 'HTTPS'], ['Apps restart automatically after a server reboot', 'إعادة تشغيل التطبيقات تلقائيًا بعد إعادة تشغيل الخادم'], ['Docker images', 'صور Docker'], ['Database backups', 'نسخ احتياطي لقاعدة البيانات']], a: 1, e: ['It registers PM2 as a system service.', 'يسجّل PM2 كخدمة نظام.'] },
        { q: ['A main drawback of serverless for Express + MongoDB?', 'عيب أساسي لـ serverless مع Express و MongoDB؟'], o: [['No HTTPS', 'بلا HTTPS'], ['Cold starts and many short-lived DB connections', 'البدء البارد واتصالات قاعدة بيانات كثيرة قصيرة العمر'], ['Cannot use JSON', 'لا يمكن استخدام JSON'], ['No logs', 'بلا سجلات']], a: 1, e: ['Reuse connections across invocations or use a data proxy.', 'أعد استخدام الاتصالات بين الاستدعاءات أو استخدم وسيط بيانات.'] }
    ]
});

DECK.chapters.push({
    n: 39, level: 4, icon: '🔭',
    t: ['Observability', 'قابلية المراقبة'],
    sub: ['Structured logs, Prometheus metrics, OpenTelemetry tracing, Sentry error tracking', 'سجلات منظمة، مقاييس Prometheus، تتبع OpenTelemetry، وتتبع الأخطاء بـ Sentry'],
    project: ['Tasky exposes <code>/metrics</code>, sends traces and reports exceptions to Sentry.', 'يوفر Tasky نقطة <code>/metrics</code> ويرسل التتبع ويبلغ عن الاستثناءات إلى Sentry.'],
    learn: [
        ['Know the three pillars: logs, metrics, traces', 'اعرف الركائز الثلاث: السجلات، المقاييس، التتبع'],
        ['Expose RED metrics with prom-client', 'وفّر مقاييس RED باستخدام prom-client'],
        ['Auto-instrument with OpenTelemetry and capture errors with Sentry', 'استخدم القياس التلقائي مع OpenTelemetry والتقط الأخطاء بـ Sentry']
    ],
    slides: [
        {
            kind: 'code', t: ['Metrics with Prometheus', 'المقاييس مع Prometheus'],
            b: [
                { diagram: 'observe' },
                { cols: [
                    [{ code: `import client from 'prom-client';

client.collectDefaultMetrics();            // CPU, memory, event-loop lag, GC

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export function metricsMiddleware(req, res, next) {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    // use the route PATTERN (/api/tasks/:id), never the raw URL (cardinality!)
    const route = req.route ? req.baseUrl + req.route.path : 'unmatched';
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
}

export async function metricsHandler(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
}`, file: 'src/observability/metrics.js', hl: '3,16' }],
                    [{ code: `app.use(metricsMiddleware);
app.get('/metrics', metricsHandler);   // protect it: internal network / basic auth`, file: 'src/app.js' },
                     { code: `# HELP http_request_duration_seconds HTTP request duration
http_request_duration_seconds_bucket{le="0.1",method="GET",route="/api/tasks/:id",status="200"} 1473
http_request_duration_seconds_count{method="GET",route="/api/tasks/:id",status="200"} 1502
nodejs_eventloop_lag_seconds 0.0021`, file: 'GET /metrics', lang: 'text' },
                     { table: { h: [['RED method', 'طريقة RED'], ['Question', 'السؤال']], r: [
                         [['<b>R</b>ate', '<b>R</b> المعدل'], ['How many requests per second?', 'كم طلبًا في الثانية؟']],
                         [['<b>E</b>rrors', '<b>E</b> الأخطاء'], ['How many fail (5xx)?', 'كم منها يفشل (5xx)؟']],
                         [['<b>D</b>uration', '<b>D</b> المدة'], ['How long do they take (p95/p99)?', 'كم تستغرق (p95/p99)؟']]
                     ] } }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Tracing (OpenTelemetry) & errors (Sentry)', 'التتبع (OpenTelemetry) والأخطاء (Sentry)'],
            b: [{ cols: [
                [{ code: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  serviceName: 'tasky-api',
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],   // http, express, mongodb, redis…
});
sdk.start();
process.on('SIGTERM', () => sdk.shutdown());`, file: 'src/instrumentation.js' },
                 { term: `# load instrumentation BEFORE the app so it can patch modules
node --import ./src/instrumentation.js src/server.js` },
                 { p: ['A trace shows one request as a tree of spans: <code>GET /api/tasks</code> → <code>mongodb.find</code> 18 ms → <code>redis.get</code> 1 ms. Perfect for finding where time goes across services.', 'يعرض التتبع طلبًا واحدًا كشجرة من الامتدادات: <code>GET /api/tasks</code> ← <code>mongodb.find</code> 18ms ← <code>redis.get</code> 1ms. مثالي لمعرفة أين يذهب الوقت عبر الخدمات.'] }],
                [{ code: `import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,
  tracesSampleRate: 0.1,              // 10% of requests traced
});`, file: 'src/instrument.js (import first)', lang: 'js' },
                 { code: `import './instrument.js';               // must be the first import
import * as Sentry from '@sentry/node';
// … routes …
Sentry.setupExpressErrorHandler(app);   // after routes, before your errorHandler
app.use(errorHandler);`, file: 'src/app.js' },
                 { best: ['Alert on <b>symptoms users feel</b> (error rate > 1%, p99 > 1 s, readiness failing) — not on every CPU spike. Define SLOs (e.g. 99.9% of requests < 500 ms per month).', 'نبّه على <b>الأعراض التي يشعر بها المستخدمون</b> (نسبة أخطاء > 1%، p99 > 1 ثانية، فشل الجاهزية) — وليس على كل ارتفاع في المعالج. عرّف أهداف SLO (مثل 99.9% من الطلبات < 500ms شهريًا).'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Using raw URLs or user ids as metric labels → millions of time series (cardinality explosion).', 'استخدام الروابط الخام أو معرفات المستخدمين كتسميات مقاييس ← ملايين السلاسل الزمنية (انفجار التعدد).'] },
                 { mistake: ['Logs without request ids, traces without propagation between services.', 'سجلات بلا معرّفات طلبات، وتتبع بلا انتقال بين الخدمات.'] },
                 { mistake: ['Alert fatigue: 200 noisy alerts a day, so the real one is ignored.', 'إرهاق التنبيهات: 200 تنبيه مزعج يوميًا فيُتجاهل التنبيه الحقيقي.'] }],
                [{ qa: [
                    { q: ['Logs vs metrics vs traces?', 'السجلات مقابل المقاييس مقابل التتبع؟'], a: ['Metrics: cheap aggregated numbers for dashboards/alerts (is something wrong?). Traces: follow one request across services (where?). Logs: detailed events (why?).', 'المقاييس: أرقام مجمعة رخيصة للوحات والتنبيهات (هل هناك مشكلة؟). التتبع: تتبع طلب واحد عبر الخدمات (أين؟). السجلات: أحداث مفصلة (لماذا؟).'] },
                    { q: ['What is an SLO / SLA / SLI?', 'ما هو SLO / SLA / SLI؟'], a: ['SLI: a measured indicator (p99 latency). SLO: the internal target (99.9% < 500 ms). SLA: the contract with customers, with penalties.', 'SLI: مؤشر مقاس (زمن p99). و SLO: الهدف الداخلي (99.9% أقل من 500ms). و SLA: العقد مع العملاء مع غرامات.'] },
                    { q: ['How would you debug “the API is slow sometimes”?', 'كيف تصحح مشكلة "الواجهة بطيئة أحيانًا"؟'], a: ['Check p99 per route in metrics, open slow traces to find the span (DB? external API?), correlate with logs by request id, check event-loop lag and DB explain plans.', 'افحص p99 لكل مسار في المقاييس، افتح التتبعات البطيئة لإيجاد الامتداد (قاعدة البيانات؟ واجهة خارجية؟)، اربط بالسجلات بمعرّف الطلب، وافحص تأخر حلقة الأحداث وخطط explain.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Dashboards for Tasky', 'لوحات معلومات لـ Tasky'],
            b: [{ tasks: [
                ['Add prom-client and <code>/metrics</code>. Generate traffic with autocannon.', 'أضف prom-client ونقطة <code>/metrics</code>. وولّد حركة بـ autocannon.'],
                ['Run Prometheus + Grafana with docker compose and graph p95 latency per route.', 'شغّل Prometheus و Grafana بـ docker compose وارسم زمن p95 لكل مسار.'],
                ['Create a free Sentry project, throw an error in a route, see the stack trace and request data.', 'أنشئ مشروع Sentry مجانيًا، ارمِ خطأ في مسار، وشاهد التفاصيل وبيانات الطلب.'],
                ['Bonus: run Jaeger (<code>jaegertracing/all-in-one</code>) and view an OpenTelemetry trace.', 'إضافي: شغّل Jaeger (<code>jaegertracing/all-in-one</code>) وشاهد تتبع OpenTelemetry.']
            ], time: 40 }]
        }
    ],
    quiz: [
        { q: ['Which label is SAFE for an HTTP metric?', 'أي تسمية آمنة لمقياس HTTP؟'], o: ['`url="/api/tasks/665f…"`', '`userId="42"`', '`route="/api/tasks/:id"`', '`token="eyJ…"`'], a: 2, e: ['Route patterns have low cardinality.', 'أنماط المسارات ذات تعدد منخفض.'] },
        { q: ['Which pillar answers “where did the time go in this request across services?”', 'أي ركيزة تجيب "أين ذهب الوقت في هذا الطلب عبر الخدمات؟"'], o: ['Logs', 'Metrics', 'Traces', 'Backups'], a: 2, e: ['Distributed tracing with spans.', 'التتبع الموزع بالامتدادات.'] },
        { tf: true, q: ['OpenTelemetry instrumentation must be loaded before the modules it patches.', 'يجب تحميل قياس OpenTelemetry قبل الوحدات التي يعدّلها.'], e: ['Hence node --import ./instrumentation.js.', 'لهذا نستخدم node --import ./instrumentation.js.'] },
        { q: ['RED stands for…', 'RED تعني…'], o: [['Redis, Express, Docker', 'Redis و Express و Docker'], ['Rate, Errors, Duration', 'المعدل والأخطاء والمدة'], ['Read, Edit, Delete', 'قراءة وتعديل وحذف'], ['Retry, Escalate, Deploy', 'إعادة وتصعيد ونشر']], a: 1, e: ['The three key service metrics.', 'المقاييس الثلاثة الأساسية للخدمة.'] }
    ]
});

DECK.chapters.push({
    n: 40, level: 4, icon: '🔑',
    t: ['Advanced security & reliability', 'أمان وموثوقية متقدمة'],
    sub: ['OAuth2/OIDC social login, 2FA, API keys, webhooks, retries, circuit breakers', 'تسجيل الدخول الاجتماعي OAuth2/OIDC، المصادقة الثنائية، مفاتيح API، webhooks، إعادة المحاولة، وقواطع الدوائر'],
    learn: [
        ['Add “Sign in with Google” using OAuth2 / OIDC', 'أضف "الدخول بحساب Google" باستخدام OAuth2 / OIDC'],
        ['Protect accounts with TOTP 2FA and machines with API keys', 'احمِ الحسابات بمصادقة TOTP الثنائية والأجهزة بمفاتيح API'],
        ['Survive failing dependencies: timeouts, retries, circuit breakers', 'انجُ من فشل التبعيات: المهلات، إعادة المحاولة، قواطع الدوائر']
    ],
    slides: [
        {
            kind: 'code', t: ['OAuth2 / OIDC: Sign in with Google', 'OAuth2 / OIDC: الدخول بحساب Google'],
            b: [
                { diagram: 'oauth', cap: ['Authorization Code flow with PKCE: your server never sees the Google password; it gets a verified identity (id_token).', 'تدفق رمز التفويض مع PKCE: خادمك لا يرى كلمة مرور Google أبدًا؛ بل يحصل على هوية متحقق منها (id_token).'] },
                { cols: [
                    [{ code: `import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      { name: profile.displayName, email: profile.emails?.[0]?.value },
      { upsert: true, returnDocument: 'after' },
    );
    done(null, user);
  },
));`, file: 'src/auth/google.js' }],
                    [{ code: `app.use(passport.initialize());

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // same token logic as chapter 18
    res.cookie('refreshToken', signRefreshToken(req.user), refreshCookie);
    res.redirect(\`\${process.env.CLIENT_URL}/auth/success\`);
  });`, file: 'src/routes/auth.routes.js' },
                     { tip: ['<b>OAuth2</b> = delegated authorization (“let this app read my calendar”). <b>OIDC</b> = identity layer on top (“who is this user?”, the <code>id_token</code>). Social login uses OIDC.', '<b>OAuth2</b> = تفويض مُوكَل ("اسمح لهذا التطبيق بقراءة تقويمي"). و <b>OIDC</b> = طبقة هوية فوقه ("من هذا المستخدم؟"، أي <code>id_token</code>). والدخول الاجتماعي يستخدم OIDC.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['2FA (TOTP), API keys & webhooks', 'المصادقة الثنائية (TOTP) ومفاتيح API و webhooks'],
            b: [{ cols: [
                [{ code: `import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

// 1) enable: show a QR code to scan with Google Authenticator / Authy
const secret = generateSecret();
const uri = generateURI({ issuer: 'Tasky', label: user.email, secret });
const qr = await QRCode.toDataURL(uri);          // <img src={qr}>
await User.updateOne({ _id: user.id }, { totpSecret: encrypt(secret) });

// 2) login step 2: check the 6-digit code
const { valid } = await verify({ secret: decrypt(user.totpSecret), token: req.body.code });
if (!valid) throw AppError.unauthorized('Invalid 2FA code');`, file: 'twofa.js', hl: '11' },
                 { code: `import crypto from 'node:crypto';

// create: show the key ONCE, store only its hash
export function createApiKey() {
  const key = \`tsk_live_\${crypto.randomBytes(24).toString('base64url')}\`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, hash, prefix: key.slice(0, 12) };
}

export async function apiKeyAuth(req, res, next) {
  const key = req.get('x-api-key');
  if (!key) throw AppError.unauthorized('Missing API key');
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const record = await ApiKey.findOne({ hash, revokedAt: null });
  if (!record) throw AppError.unauthorized('Invalid API key');
  req.user = { id: String(record.owner), role: 'service' };
  next();
}`, file: 'apiKeys.js', hl: '5-6,13' }],
                [{ code: `import crypto from 'node:crypto';

// Stripe/GitHub style: HMAC-SHA256 of the RAW body with a shared secret
app.post('/webhooks/payments', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.get('x-signature') ?? '';
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)                               // Buffer, not parsed JSON!
    .digest('hex');

  const ok = signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!ok) return res.status(401).send('Bad signature');

  const event = JSON.parse(req.body);
  queue.add('payment-event', event, { jobId: event.id });   // idempotent by event id
  res.sendStatus(200);                                       // answer fast, work later
});`, file: 'webhooks.js', hl: '4,8,11' },
                 { warn: ['Register the webhook route <b>before</b> <code>app.use(express.json())</code> (or exclude it): the signature must be computed on the exact raw bytes.', 'سجّل مسار الـ webhook <b>قبل</b> <code>app.use(express.json())</code> (أو استثنه): يجب حساب التوقيع على البايتات الخام بالضبط.'] },
                 { best: ['Use <code>crypto.timingSafeEqual</code> for secrets comparison (no timing attacks). Encrypt TOTP secrets at rest. Rate-limit 2FA attempts.', 'استخدم <code>crypto.timingSafeEqual</code> لمقارنة الأسرار (بلا هجمات توقيت). شفّر أسرار TOTP عند التخزين. وحدد معدل محاولات المصادقة الثنائية.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Reliability: timeouts, retries, circuit breakers', 'الموثوقية: المهلات وإعادة المحاولة وقواطع الدوائر'],
            b: [{ cols: [
                [{ diagram: 'circuit' },
                 { code: `// every outgoing call needs a timeout
const res = await fetch(url, { signal: AbortSignal.timeout(3000) });

// retry with exponential backoff + jitter (only idempotent calls!)
export async function retry(fn, { attempts = 3, base = 200 } = {}) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts - 1) throw err;
      const delay = base * 2 ** i + Math.random() * 100;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}`, file: 'retry.js', hl: '2,11' }],
                [{ code: `import CircuitBreaker from 'opossum';

async function getExchangeRate(currency) {
  const res = await fetch(\`https://rates.example.com/\${currency}\`, { signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error(\`Rates API \${res.status}\`);
  return res.json();
}

const breaker = new CircuitBreaker(getExchangeRate, {
  timeout: 3000,                  // count slow calls as failures
  errorThresholdPercentage: 50,   // open when ≥ 50% fail…
  volumeThreshold: 10,            // …over at least 10 calls
  resetTimeout: 30000,            // try again (half-open) after 30 s
});
breaker.fallback(() => ({ rate: null, stale: true }));    // degrade gracefully
breaker.on('open', () => logger.warn('rates circuit OPEN'));

app.get('/api/rates/:cur', async (req, res) => {
  res.json(await breaker.fire(req.params.cur));
});`, file: 'breaker.js', hl: '9-14,15' },
                 { note: ['A circuit breaker is the fuse box of your house: when a device keeps short-circuiting, the fuse trips so the whole house does not burn — then you test it again later.', 'قاطع الدائرة مثل صندوق المصهرات في بيتك: عندما يتكرر قصر جهاز ما ينقطع المصهر لكي لا يحترق البيت كله — ثم تختبره مجددًا لاحقًا.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Storing API keys in plain text in the DB — a DB leak becomes full account access.', 'تخزين مفاتيح API كنص عادي في قاعدة البيانات — تسريب القاعدة يصبح وصولًا كاملًا للحسابات.'] },
                 { mistake: ['Verifying webhook signatures on re-serialised JSON (signature never matches) — or not at all.', 'التحقق من توقيعات webhook على JSON معاد تسلسله (لن يتطابق التوقيع أبدًا) — أو عدم التحقق إطلاقًا.'] },
                 { mistake: ['Retrying non-idempotent calls (payments) or retrying instantly in tight loops → retry storms.', 'إعادة محاولة الاستدعاءات غير متساوية الأثر (المدفوعات) أو إعادتها فورًا في حلقات ضيقة ← عواصف إعادة المحاولة.'] }],
                [{ qa: [
                    { q: ['Explain the OAuth2 Authorization Code flow with PKCE.', 'اشرح تدفق رمز التفويض OAuth2 مع PKCE.'], a: ['App redirects to the provider with a code_challenge; user logs in; provider redirects back with a short-lived code; the server exchanges code + code_verifier for tokens. PKCE stops stolen codes from being used.', 'يحوّل التطبيق إلى المزود مع code_challenge؛ يسجّل المستخدم دخوله؛ يعيد المزود التحويل مع رمز قصير العمر؛ يبادل الخادم الرمز + code_verifier بالرموز. و PKCE يمنع استخدام الرموز المسروقة.'] },
                    { q: ['What is a circuit breaker?', 'ما هو قاطع الدائرة؟'], a: ['A wrapper that stops calling a failing dependency after a threshold (open), fails fast or uses a fallback, then lets a trial call through (half-open) to recover (closed).', 'غلاف يوقف استدعاء تبعية فاشلة بعد حد معين (مفتوح)، فيفشل فورًا أو يستخدم بديلًا، ثم يسمح باستدعاء تجريبي (نصف مفتوح) للتعافي (مغلق).'] },
                    { q: ['How do you secure incoming webhooks?', 'كيف تؤمّن الـ webhooks الواردة؟'], a: ['Verify an HMAC signature on the raw body with timingSafeEqual, check a timestamp to block replays, process idempotently by event id, and respond 2xx quickly then work async.', 'تحقق من توقيع HMAC على الجسم الخام بـ timingSafeEqual، افحص طابعًا زمنيًا لمنع إعادة الإرسال، عالج بتساوي الأثر حسب معرّف الحدث، ورد بـ 2xx بسرعة ثم اعمل بشكل غير متزامن.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Harden Tasky', 'حصّن Tasky'],
            b: [{ tasks: [
                ['Create Google OAuth credentials and add “Sign in with Google”.', 'أنشئ بيانات Google OAuth وأضف "الدخول بحساب Google".'],
                ['Add optional TOTP 2FA (enable → QR → verify on login).', 'أضف مصادقة TOTP ثنائية اختيارية (تفعيل ← QR ← تحقق عند الدخول).'],
                ['Add API keys for integrations: create, list (prefix only), revoke.', 'أضف مفاتيح API للتكاملات: إنشاء، عرض (البادئة فقط)، إلغاء.'],
                ['Wrap a fake flaky external API with opossum and watch the circuit open/close in logs.', 'غلّف واجهة خارجية وهمية متذبذبة بـ opossum وشاهد القاطع يفتح ويغلق في السجلات.']
            ], time: 45 }]
        }
    ],
    quiz: [
        { q: ['How should API keys be stored?', 'كيف يجب تخزين مفاتيح API؟'], o: [['Plain text', 'نص عادي'], ['Hashed (e.g. SHA-256), shown to the user only once', 'مجزأة (مثل SHA-256) وتُعرض للمستخدم مرة واحدة فقط'], ['In the JWT', 'داخل JWT'], ['In localStorage', 'في localStorage']], a: 1, e: ['Like passwords: a DB leak should not leak usable keys.', 'مثل كلمات المرور: تسريب القاعدة يجب ألا يسرّب مفاتيح قابلة للاستخدام.'] },
        { q: ['Why <code>express.raw()</code> on a webhook route?', 'لماذا <code>express.raw()</code> على مسار webhook؟'], o: [['Speed', 'السرعة'], ['The HMAC signature is computed on the exact raw bytes', 'توقيع HMAC يُحسب على البايتات الخام بالضبط'], ['Webhooks are XML', 'الـ webhooks بصيغة XML'], ['To enable CORS', 'لتفعيل CORS']], a: 1, e: ['Parsing and re-serialising changes the bytes.', 'التحليل وإعادة التسلسل يغيران البايتات.'] },
        { q: ['A circuit breaker in the OPEN state…', 'قاطع الدائرة في الحالة المفتوحة…'], o: [['Sends all requests', 'يرسل كل الطلبات'], ['Fails fast / returns the fallback without calling the dependency', 'يفشل فورًا / يعيد البديل دون استدعاء التبعية'], ['Restarts the server', 'يعيد تشغيل الخادم'], ['Deletes the cache', 'يحذف الذاكرة المؤقتة']], a: 1, e: ['It protects both you and the struggling dependency.', 'يحميك ويحمي التبعية المتعثرة.'] },
        { tf: true, q: ['OIDC adds an identity layer (id_token) on top of OAuth2.', 'يضيف OIDC طبقة هوية (id_token) فوق OAuth2.'], e: ['OAuth2 alone is about authorization, not identity.', 'OAuth2 وحده يتعلق بالتفويض وليس الهوية.'] }
    ]
});

DECK.chapters.push({
    n: 41, level: 4, icon: '🧹',
    t: ['Code review & maintainability', 'مراجعة الكود وقابلية الصيانة'],
    sub: ['Review checklists, documentation, ADRs, monorepos (Turborepo / Nx)', 'قوائم المراجعة، التوثيق، سجلات القرارات (ADR)، والمستودعات الموحدة (Turborepo / Nx)'],
    learn: [
        ['Review (and get reviewed) like a senior', 'راجِع (وتلقَّ المراجعة) كـ Senior'],
        ['Document decisions with ADRs and a great README', 'وثّق القرارات بـ ADR وملف README ممتاز'],
        ['Organise many apps and packages in a monorepo', 'نظّم تطبيقات وحزمًا كثيرة في مستودع موحد']
    ],
    slides: [
        {
            kind: 'concept', t: ['The senior review checklist', 'قائمة المراجعة الخاصة بالـ Senior'],
            b: [
                { cards: [
                    { i: '✅', t: ['Correctness', 'الصحة'], d: ['Does it do what the ticket says? Edge cases: empty, null, huge, concurrent, unauthorised?', 'هل يفعل ما تطلبه المهمة؟ الحالات الحدية: فارغ، null، ضخم، متزامن، غير مصرح؟'] },
                    { i: '🛡️', t: ['Security', 'الأمان'], d: ['Validation, ownership checks, no secrets/logged tokens, safe queries.', 'التحقق، فحص الملكية، بلا أسرار أو رموز في السجلات، استعلامات آمنة.'] },
                    { i: '🧪', t: ['Tests', 'الاختبارات'], d: ['Behaviour covered, including the failure path? Would the test fail without the fix?', 'هل السلوك مغطى بما فيه مسار الفشل؟ هل سيفشل الاختبار بدون الإصلاح؟'] },
                    { i: '📖', t: ['Readability', 'القابلية للقراءة'], d: ['Names, small functions, no clever tricks, comments explain <i>why</i>.', 'الأسماء، دوال صغيرة، بلا حيل ذكية، والتعليقات تشرح <i>لماذا</i>.'] },
                    { i: '⚡', t: ['Performance', 'الأداء'], d: ['N+1, missing index, unbounded list, sync I/O in handlers?', 'N+1، فهرس ناقص، قائمة غير محدودة، إدخال/إخراج متزامن في المعالجات؟'] },
                    { i: '🔁', t: ['Operability', 'قابلية التشغيل'], d: ['Logs, metrics, backwards-compatible migration, feature flag, rollback plan.', 'السجلات، المقاييس، ترحيل متوافق للخلف، علم ميزة، خطة تراجع.'] }
                ] },
                { cols: [
                    [{ best: ['Small PRs (< 400 lines), one purpose, a clear description (what / why / how to test / screenshots). Review within 24 h.', 'طلبات دمج صغيرة (< 400 سطر)، غرض واحد، ووصف واضح (ماذا / لماذا / كيف تختبر / لقطات). وراجِع خلال 24 ساعة.'] }],
                    [{ tip: ['Comment on the code, not the person. Prefix: <b>nit:</b> (optional), <b>question:</b>, <b>blocking:</b>. Praise good solutions too.', 'علّق على الكود لا على الشخص. استخدم بادئات: <b>nit:</b> (اختياري)، <b>question:</b>، <b>blocking:</b>. وامدح الحلول الجيدة أيضًا.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['ADRs, PR templates & monorepos', 'سجلات القرارات وقوالب طلبات الدمج والمستودعات الموحدة'],
            b: [{ cols: [
                [{ code: `# ADR 0007: Use PostgreSQL instead of MongoDB for billing

- Status: Accepted
- Date: 2026-11-15
- Deciders: @backend-team

## Context
Billing needs multi-row transactions, strict schemas and SQL reporting.

## Decision
Billing module uses PostgreSQL + Prisma. Tasks stay on MongoDB.

## Consequences
+ ACID transactions, easy reporting for finance
- Two databases to operate and back up
- Cross-module joins go through service APIs`, file: 'docs/adr/0007-postgres-for-billing.md', lang: 'text' },
                 { code: `## What & why
Closes #123 — adds due-date reminders.

## How to test
1. \`npm test\`
2. Create a task due today, run the worker, check Mailpit.

## Checklist
- [ ] Tests added   - [ ] Docs/OpenAPI updated   - [ ] No secrets`, file: '.github/pull_request_template.md', lang: 'text' }],
                [{ tree: `tasky/                      # npm workspaces + Turborepo
├── apps/
│   ├── api/                # Express API
│   ├── worker/             # BullMQ workers
│   └── web/                # React frontend
├── packages/
│   ├── schemas/            # shared Zod schemas (API + web)
│   ├── config-eslint/
│   └── tsconfig/
├── turbo.json
└── package.json            # "workspaces": ["apps/*", "packages/*"]` },
                 { code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}`, file: 'turbo.json' },
                 { p: ['<code>npx turbo run test --filter=api...</code> tests only the API and what it depends on; cached tasks are skipped. <b>Nx</b> offers the same plus generators and a project graph.', '<code>npx turbo run test --filter=api...</code> يختبر الواجهة وما تعتمد عليه فقط؛ والمهام المخزنة تُتخطى. و <b>Nx</b> يقدم نفس الشيء مع مولدات ورسم بياني للمشاريع.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['2,000-line PRs that get “LGTM” after 30 seconds.', 'طلبات دمج من 2000 سطر تحصل على "LGTM" بعد 30 ثانية.'] },
                 { mistake: ['Bikeshedding on formatting (let Prettier decide) while missing the auth bug.', 'الجدال حول التنسيق (دع Prettier يقرر) مع تفويت خطأ المصادقة.'] },
                 { mistake: ['Decisions living only in Slack threads — nobody knows why things are the way they are.', 'قرارات تعيش فقط في محادثات Slack — لا أحد يعرف لماذا الأمور على حالها.'] }],
                [{ qa: [
                    { q: ['What do you look for first in a code review?', 'ما أول ما تبحث عنه في مراجعة الكود؟'], a: ['Does it solve the right problem, correctly and safely (auth, validation, data integrity)? Then tests, then design/readability, then style (automated).', 'هل يحل المشكلة الصحيحة بشكل صحيح وآمن (المصادقة، التحقق، سلامة البيانات)؟ ثم الاختبارات، ثم التصميم والقابلية للقراءة، ثم الأسلوب (مؤتمت).'] },
                    { q: ['How do you handle disagreement in a review?', 'كيف تتعامل مع الخلاف في المراجعة؟'], a: ['Ask questions, explain trade-offs with data, separate blocking from preference, move to a quick call if it loops, and record significant decisions in an ADR.', 'اطرح أسئلة، اشرح المفاضلات بالبيانات، افصل ما يمنع الدمج عن التفضيلات، انتقل إلى مكالمة سريعة إذا طال النقاش، وسجّل القرارات المهمة في ADR.'] },
                    { q: ['Monorepo pros and cons?', 'مزايا وعيوب المستودع الموحد؟'], a: ['Pros: shared code/types, atomic changes across apps, one CI. Cons: tooling needed (Turborepo/Nx), bigger repo, permissions and CI time must be managed with caching/filters.', 'المزايا: كود وأنواع مشتركة، تغييرات ذرية عبر التطبيقات، CI واحد. العيوب: يحتاج أدوات (Turborepo/Nx)، مستودع أكبر، ويجب إدارة الصلاحيات ووقت CI بالذاكرة المؤقتة والفلاتر.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Review each other', 'راجعوا بعضكم'],
            b: [{ tasks: [
                ['Pair up: open a PR on your partner’s Tasky repo fixing one thing; review theirs with the checklist.', 'في أزواج: افتح PR على مستودع Tasky لزميلك يصلح شيئًا واحدًا؛ وراجع طلبه بالقائمة.'],
                ['Write ADR 0001 for a decision you made (MongoDB vs Postgres, JWT vs sessions…).', 'اكتب ADR 0001 لقرار اتخذته (MongoDB مقابل Postgres، JWT مقابل الجلسات…).'],
                ['Improve your README: setup in 3 commands, env vars table, architecture diagram, API docs link.', 'حسّن ملف README: الإعداد في 3 أوامر، جدول متغيرات البيئة، رسم المعمارية، رابط توثيق الواجهة.'],
                ['Bonus: move <code>schemas/</code> into a shared workspace package.', 'إضافي: انقل <code>schemas/</code> إلى حزمة workspace مشتركة.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { q: ['What is an ADR?', 'ما هو ADR؟'], o: [['A deployment tool', 'أداة نشر'], ['A short document recording an architecture decision and its context', 'وثيقة قصيرة تسجل قرارًا معماريًا وسياقه'], ['A database', 'قاعدة بيانات'], ['A linter rule', 'قاعدة فحص']], a: 1, e: ['Architecture Decision Record.', 'سجل القرار المعماري.'] },
        { tf: false, q: ['Large PRs are better because reviewers see the whole feature at once.', 'طلبات الدمج الكبيرة أفضل لأن المراجعين يرون الميزة كاملة.'], e: ['Review quality drops sharply with size.', 'جودة المراجعة تنخفض بشدة مع الحجم.'] },
        { q: ['In <code>turbo.json</code>, <code>"dependsOn": ["^build"]</code> means…', 'في <code>turbo.json</code>، <code>"dependsOn": ["^build"]</code> يعني…'], o: [['Build this package first', 'ابنِ هذه الحزمة أولًا'], ['Build the package’s dependencies first', 'ابنِ تبعيات الحزمة أولًا'], ['Skip build', 'تخطَّ البناء'], ['Build in parallel always', 'ابنِ بالتوازي دائمًا']], a: 1, e: ['^ refers to upstream workspace dependencies.', 'الرمز ^ يشير إلى تبعيات الـ workspace العليا.'] },
        { q: ['Which review comment is best?', 'أي تعليق مراجعة هو الأفضل؟'], o: [['“This is wrong.”', '"هذا خطأ."'], ['“blocking: this route skips the ownership check, so any user can delete any task — can we use findAccessible()?”', '"blocking: هذا المسار يتخطى فحص الملكية فيستطيع أي مستخدم حذف أي مهمة — هل نستخدم findAccessible()؟"'], ['“Why?”', '"لماذا؟"'], ['“LGTM”', '"LGTM"']], a: 1, e: ['Specific, explains impact, proposes a fix.', 'محدد، يشرح الأثر، ويقترح حلًا.'] }
    ]
});

DECK.chapters.push({
    n: 42, level: 4, icon: '5️⃣',
    t: ['Express 5 & beyond', 'Express 5 وما بعده'],
    sub: ['What changed, migrating from 4, NestJS / Fastify comparison, when to move on', 'ما الذي تغير، الترحيل من 4، المقارنة مع NestJS / Fastify، ومتى تنتقل'],
    learn: [
        ['List the Express 5 breaking changes', 'عدّد التغييرات الكاسرة في Express 5'],
        ['Migrate an Express 4 app safely', 'رحّل تطبيق Express 4 بأمان'],
        ['Decide when another framework is worth it', 'قرر متى يستحق إطار آخر الانتقال']
    ],
    slides: [
        {
            kind: 'concept', t: ['What changed in Express 5', 'ما الذي تغير في Express 5'],
            b: [{ table: { h: [['Area', 'المجال'], ['Express 4', 'Express 4'], ['Express 5', 'Express 5']], r: [
                [['Async errors', 'الأخطاء غير المتزامنة'], ['need asyncHandler / try-catch', 'تحتاج asyncHandler / try-catch'], ['rejected promises → next(err) ✅', 'الوعود المرفوضة ← next(err) ✅']],
                [['Wildcards', 'الرموز البديلة'], '<code>app.get(\'*\')</code>', ['<code>app.get(\'/*splat\')</code> (named, array value)', '<code>app.get(\'/*splat\')</code> (مسمّى، قيمته مصفوفة)']],
                [['Optional params', 'المعاملات الاختيارية'], '<code>/:id?</code>', '<code>{/:id}</code>'],
                [['Regex in paths', 'regex في المسارات'], ['<code>/user(s)?</code>, <code>/:id(\\d+)</code>', '<code>/user(s)?</code>، <code>/:id(\\d+)</code>'], ['removed → validate in handler/Zod', 'أُزيل ← تحقق في المعالج/Zod']],
                ['<code>req.body</code>', ['<code>{}</code> without parser', '<code>{}</code> بدون محلل'], '<code>undefined</code>'],
                ['<code>req.query</code>', ['writable, “extended” parser (nested objects)', 'قابل للكتابة، محلل "extended" (كائنات متداخلة)'], ['read-only getter, “simple” parser', 'للقراءة فقط، محلل "simple"']],
                [['Removed', 'أُزيل'], '<code>app.del</code>, <code>req.param()</code>, <code>res.sendfile</code>, <code>res.json(obj, 200)</code>', ['use <code>app.delete</code>, <code>req.params</code>, <code>res.sendFile</code>, <code>res.status(200).json(obj)</code>', 'استخدم <code>app.delete</code> و <code>req.params</code> و <code>res.sendFile</code> و <code>res.status(200).json(obj)</code>']],
                [['Status codes', 'رموز الحالة'], ['anything', 'أي قيمة'], ['must be an integer 100–999', 'يجب أن يكون عددًا صحيحًا 100–999']],
                [['Node.js', 'Node.js'], '0.10+', '18+']
            ] } }]
        },
        {
            kind: 'code', t: ['Migrating 4 → 5', 'الترحيل من 4 إلى 5'],
            b: [{ cols: [
                [{ term: `npm install express@5
npx @expressjs/codemod upgrade        # automated renames
npm test                              # your safety net` },
                 { code: `-app.get('*', notFoundPage);
+app.get('/*splat', notFoundPage);

-app.get('/files/:name?', getFile);
+app.get('/files{/:name}', getFile);

-app.del('/tasks/:id', remove);
+app.delete('/tasks/:id', remove);

-res.json({ ok: true }, 201);
+res.status(201).json({ ok: true });

-app.get('/t/:id', asyncHandler(async (req, res) => { … }));
+app.get('/t/:id', async (req, res) => { … });   // errors handled ✅

-req.query.page = Number(req.query.page);        // 💥 throws in v5
+req.valid = { query: listQuery.parse(req.query) };`, file: 'migration.diff', lang: 'diff' }],
                [{ table: { h: ['', 'Express', 'Fastify', 'NestJS'], r: [
                    [['Philosophy', 'الفلسفة'], ['minimal, flexible', 'خفيف ومرن'], ['performance + schemas + plugins', 'الأداء + المخططات + الإضافات'], ['structured framework (modules, DI, decorators)', 'إطار منظم (وحدات، حقن تبعيات، مزخرفات)']],
                    [['Throughput', 'الإنتاجية'], ['good', 'جيدة'], ['~2–3× Express in benchmarks', '~2–3 أضعاف Express في القياسات'], ['= its adapter (Express or Fastify)', '= المحوّل المستخدم (Express أو Fastify)']],
                    [['Validation / docs', 'التحقق / التوثيق'], ['you choose (Zod, swagger)', 'أنت تختار (Zod و swagger)'], ['JSON-schema built in, auto OpenAPI', 'JSON-schema مدمج و OpenAPI تلقائي'], ['class-validator, @nestjs/swagger', 'class-validator و ‎@nestjs/swagger']],
                    [['Move when…', 'انتقل عندما…'], '—', ['latency/throughput is a real bottleneck', 'يكون زمن الاستجابة/الإنتاجية عائقًا حقيقيًا'], ['large team wants enforced conventions', 'يريد فريق كبير اصطلاحات مفروضة']]
                ] } },
                 { best: ['Your Express skills transfer: middleware ≈ Fastify hooks ≈ Nest guards/interceptors; services and DI are the same ideas you used in chapter 28.', 'مهاراتك في Express تنتقل: الوسائط ≈ خطافات Fastify ≈ حراس/معترضات Nest؛ والخدمات وحقن التبعيات نفس الأفكار التي استخدمتها في الفصل 28.'] },
                 { tip: ['Most apps never need to switch. Profile first: the bottleneck is almost always the database or an external call, not the framework.', 'معظم التطبيقات لا تحتاج إلى الانتقال أبدًا. قِس أولًا: العائق دائمًا تقريبًا هو قاعدة البيانات أو استدعاء خارجي وليس الإطار.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Common mistakes & interview questions', 'أخطاء شائعة وأسئلة مقابلات'],
            b: [{ cols: [
                [{ mistake: ['Upgrading to v5 while middleware like <code>express-mongo-sanitize</code> still writes to <code>req.query</code>.', 'الترقية إلى v5 مع وسائط مثل <code>express-mongo-sanitize</code> ما زالت تكتب في <code>req.query</code>.'] },
                 { mistake: ['Relying on nested query parsing (<code>?filter[status]=done</code>) — v5 uses the simple parser unless you set <code>app.set(\'query parser\', \'extended\')</code>.', 'الاعتماد على تحليل الاستعلام المتداخل (<code>?filter[status]=done</code>) — يستخدم v5 المحلل البسيط ما لم تضبط <code>app.set(\'query parser\', \'extended\')</code>.'] },
                 { mistake: ['Rewriting in another framework for “performance” without measuring.', 'إعادة الكتابة بإطار آخر من أجل "الأداء" دون قياس.'] }],
                [{ qa: [
                    { q: ['What is the most important change in Express 5?', 'ما أهم تغيير في Express 5؟'], a: ['Native promise support: errors thrown or rejected in async handlers/middleware go to the error handler automatically — no more wrappers or unhandled rejections.', 'الدعم الأصلي للوعود: الأخطاء المرمية أو المرفوضة في المعالجات/الوسائط غير المتزامنة تذهب لمعالج الأخطاء تلقائيًا — بلا أغلفة وبلا وعود مرفوضة غير معالجة.'] },
                    { q: ['Express vs NestJS — which would you pick?', 'Express مقابل NestJS — أيهما تختار؟'], a: ['Express for small/medium services, maximum flexibility and simplicity. NestJS for large teams needing enforced structure, DI and batteries included. It is a team/organisation decision more than a technical one.', 'Express للخدمات الصغيرة والمتوسطة والمرونة والبساطة القصوى. و NestJS للفرق الكبيرة التي تحتاج هيكلة مفروضة وحقن تبعيات وأدوات جاهزة. إنه قرار فريق ومؤسسة أكثر منه تقني.'] },
                    { q: ['How would you migrate a large Express 4 codebase?', 'كيف ترحّل مشروع Express 4 كبيرًا؟'], a: ['Get test coverage on critical paths, run the codemod, fix path syntax and removed APIs, audit middleware that mutates req.query, remove async wrappers gradually, deploy behind a canary.', 'احصل على تغطية اختبارات للمسارات الحرجة، شغّل أداة codemod، أصلح صياغة المسارات والواجهات المحذوفة، افحص الوسائط التي تعدّل req.query، أزل الأغلفة غير المتزامنة تدريجيًا، وانشر بإصدار canary.'] }
                ] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Migrate a legacy app', 'رحّل تطبيقًا قديمًا'],
            b: [{ tasks: [
                ['Clone any Express 4 tutorial project (or your old code). Install Express 5 and run the tests/endpoints.', 'استنسخ أي مشروع تعليمي بـ Express 4 (أو كودك القديم). ثبّت Express 5 وشغّل الاختبارات/النقاط.'],
                ['Run <code>npx @expressjs/codemod upgrade</code> and review the diff.', 'نفّذ <code>npx @expressjs/codemod upgrade</code> وراجع الفروق.'],
                ['Fix wildcards, optional params and <code>req.query</code> writes by hand.', 'أصلح الرموز البديلة والمعاملات الاختيارية والكتابة في <code>req.query</code> يدويًا.'],
                ['Remove every <code>asyncHandler</code> and verify errors still reach the error middleware.', 'احذف كل <code>asyncHandler</code> وتحقق أن الأخطاء ما زالت تصل إلى وسيط الأخطاء.']
            ], time: 30 }]
        }
    ],
    quiz: [
        { out: true, q: ['Express 5, <code>GET /q?a[b]=1</code>. What is <code>req.query</code>?', 'Express 5، الطلب <code>GET /q?a[b]=1</code>. ما قيمة <code>req.query</code>؟'], o: ["`{ a: { b: '1' } }`", "`{ 'a[b]': '1' }`", '`{}`', '`undefined`'], a: 1, e: ['Express 5 defaults to the simple query parser.', 'يستخدم Express 5 المحلل البسيط افتراضيًا.'] },
        { q: ['Express 5 equivalent of <code>/:id?</code>?', 'ما يكافئ <code>/:id?</code> في Express 5؟'], o: ['`/:id?`', '`{/:id}`', '`/*id`', '`/(:id)`'], a: 1, e: ['Braces mark optional segments.', 'الأقواس المعقوصة تحدد الأجزاء الاختيارية.'] },
        { tf: true, q: ['<code>res.status(200.5)</code> throws in Express 5.', '<code>res.status(200.5)</code> يرمي خطأ في Express 5.'], e: ['Status must be an integer between 100 and 999.', 'يجب أن يكون الرمز عددًا صحيحًا بين 100 و 999.'] },
        { q: ['Best reason to move from Express to Fastify?', 'أفضل سبب للانتقال من Express إلى Fastify؟'], o: [['It is newer', 'إنه أحدث'], ['Measured throughput/latency bottleneck in the framework layer', 'عائق مقاس في الإنتاجية/زمن الاستجابة في طبقة الإطار'], ['Fewer files', 'ملفات أقل'], ['Better logo', 'شعار أفضل']], a: 1, e: ['Measure first; switch for a real, proven need.', 'قِس أولًا؛ وانتقل لحاجة حقيقية مثبتة.'] }
    ]
});

DECK.chapters.push({
    n: 43, level: 4, icon: '🏆',
    t: ['Capstone: production-ready API', 'المشروع الختامي: واجهة جاهزة للإنتاج'],
    sub: ['Requirements, architecture, final repo, interview preparation and career roadmap', 'المتطلبات، المعمارية، المستودع النهائي، التحضير للمقابلات وخارطة المسار المهني'],
    project: ['Everything comes together: Tasky v1.0 — authenticated, tested, documented, dockerised, deployed.', 'كل شيء يجتمع: Tasky v1.0 — بمصادقة واختبارات وتوثيق و Docker ونشر.'],
    learn: [
        ['Ship a complete API that you can show in interviews', 'انشر واجهة كاملة تستطيع عرضها في المقابلات'],
        ['Explain your architecture and trade-offs', 'اشرح معماريتك والمفاضلات'],
        ['Know what to learn next', 'اعرف ماذا تتعلم بعد ذلك']
    ],
    slides: [
        {
            kind: 'project', t: ['Capstone requirements', 'متطلبات المشروع الختامي'],
            b: [
                { diagram: 'capstone' },
                { cols: [
                    [{ table: { h: [['Area', 'المجال'], ['Must have', 'إلزامي'], ['Chapter', 'الفصل']], r: [
                        [['Auth', 'المصادقة'], ['register, login, refresh, logout, bcrypt, JWT + httpOnly cookie', 'تسجيل، دخول، تحديث، خروج، bcrypt، JWT + كوكي httpOnly'], '18'],
                        [['Roles', 'الأدوار'], ['user / admin + ownership checks', 'مستخدم / مدير + فحص الملكية'], '19'],
                        [['Data', 'البيانات'], ['MongoDB or PostgreSQL, indexes, pagination', 'MongoDB أو PostgreSQL، فهارس، تصفح'], '14–15, 22'],
                        [['Quality', 'الجودة'], ['Zod validation, central errors, ≥ 70% coverage', 'تحقق Zod، أخطاء مركزية، تغطية ≥ 70%'], '16–17, 26'],
                        [['Ops', 'التشغيل'], ['Docker compose, CI, health checks, graceful shutdown', 'Docker compose، CI، فحوص الصحة، إيقاف آمن'], '33, 36–37'],
                        [['Docs', 'التوثيق'], ['OpenAPI at /docs, README, 2 ADRs', 'OpenAPI على ‎/docs، README، وسجلا قرار'], '24, 41'],
                        [['Live', 'النشر'], ['HTTPS URL + logs/metrics', 'رابط HTTPS + سجلات/مقاييس'], '38–39']
                    ] } }],
                    [{ h3: ['Pick one bonus ⭐', 'اختر ميزة إضافية ⭐'] },
                     { ul: [
                         ['Real-time updates (Socket.IO or SSE)', 'تحديثات مباشرة (Socket.IO أو SSE)'],
                         ['Email reminders with BullMQ', 'تذكيرات بريدية مع BullMQ'],
                         ['Google sign-in or TOTP 2FA', 'الدخول بحساب Google أو مصادقة TOTP'],
                         ['Redis caching + idempotency keys', 'تخزين Redis مؤقتًا + مفاتيح تساوي الأثر'],
                         ['TypeScript end-to-end', 'TypeScript من البداية للنهاية']
                     ] },
                     { best: ['Grading idea: 40% working features, 20% tests, 15% security, 15% ops/docs, 10% code quality & demo.', 'فكرة للتقييم: 40% ميزات تعمل، 20% اختبارات، 15% أمان، 15% تشغيل/توثيق، 10% جودة الكود والعرض.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Final repository structure', 'هيكلة المستودع النهائية'],
            b: [{ cols: [
                [{ tree: `tasky-api/
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── docs/
│   ├── openapi.yaml
│   └── adr/0001-mongodb.md
├── src/
│   ├── app.js                 # express app (middleware, routes, errors)
│   ├── server.js              # boot, health, graceful shutdown
│   ├── config/                # index.js (zod env), db.js, logger.js, cache.js
│   ├── routes/                # auth, tasks, users
│   ├── controllers/
│   ├── services/              # business rules + ownership
│   ├── models/                # Mongoose schemas + indexes
│   ├── schemas/               # Zod DTOs
│   ├── middlewares/           # auth, authorize, validate, error, notFound
│   ├── queues/ & workers/     # BullMQ
│   ├── observability/         # metrics, instrumentation
│   └── utils/                 # AppError, tokens
├── tests/                     # setup.js, *.test.js
├── Dockerfile
├── docker-compose.yml
├── eslint.config.js
├── vitest.config.js
├── .env.example
└── README.md` }],
                [{ code: `# Tasky API

Team task manager REST API — Express 5, MongoDB, Redis, BullMQ.

## Quick start
\`\`\`bash
cp .env.example .env
docker compose up -d
open http://localhost:3000/docs
\`\`\`

## Scripts
| npm run dev | npm test | npm run lint | npm run build |

## Architecture
routes → controllers → services → models (see docs/adr)

## Environment
| Variable | Required | Example |
| MONGODB_URI | yes | mongodb://mongo:27017/tasky |
| JWT_ACCESS_SECRET | yes | 64 random chars |`, file: 'README.md', lang: 'text' },
                 { tip: ['Record a 3-minute demo video (Loom) walking through the API in Swagger, a test run and the CI pipeline. Put it at the top of your README and on your CV.', 'سجّل فيديو عرض لمدة 3 دقائق (Loom) تتجول فيه في الواجهة عبر Swagger وتشغيل الاختبارات وخط CI. ضعه في أعلى README وفي سيرتك الذاتية.'] }]
            ] }]
        },
        {
            kind: 'mistakes', t: ['Interview preparation: 10 classic questions', 'التحضير للمقابلات: 10 أسئلة كلاسيكية'],
            b: [{ qa: [
                { q: ['What is middleware in Express and how does the order matter?', 'ما هو الوسيط في Express ولماذا يهم الترتيب؟'], a: ['A function (req, res, next) in a pipeline. Express runs them in registration order; each ends the response or calls next(). Security & parsers first, routes, then 404 and the error handler.', 'دالة (req, res, next) ضمن سلسلة. ينفذها Express حسب ترتيب التسجيل؛ كل واحدة تنهي الاستجابة أو تستدعي next(). الأمان والمحللات أولًا، ثم المسارات، ثم 404 ومعالج الأخطاء.'] },
                { q: ['How does Node handle concurrency with a single thread?', 'كيف يتعامل Node مع التزامن بخيط واحد؟'], a: ['Non-blocking I/O delegated to libuv/OS; the event loop runs callbacks when results are ready. CPU-heavy work must go to worker threads or separate processes.', 'إدخال/إخراج غير حاجب يُفوَّض إلى libuv ونظام التشغيل؛ وحلقة الأحداث تنفذ الاستدعاءات عند جاهزية النتائج. والعمل الثقيل يجب أن يذهب إلى worker threads أو عمليات منفصلة.'] },
                { q: ['How do you structure error handling in an Express API?', 'كيف تنظم معالجة الأخطاء في واجهة Express؟'], a: ['Custom AppError with status codes thrown from services; Express 5 forwards async errors; a notFound handler; one global error middleware that normalises library errors, logs 5xx and hides internals in production.', 'صنف AppError مخصص برموز الحالة يُرمى من الخدمات؛ و Express 5 يمرر الأخطاء غير المتزامنة؛ ومعالج notFound؛ ووسيط أخطاء عام واحد يوحّد أخطاء المكتبات ويسجل 5xx ويخفي التفاصيل في الإنتاج.'] },
                { q: ['JWT vs sessions — trade-offs?', 'JWT مقابل الجلسات — المفاضلات؟'], a: ['Sessions: server state, easy revocation, best for same-domain web apps. JWT: stateless, scales across services, but revocation needs short expiry + refresh tokens/denylist. Store refresh tokens in httpOnly cookies.', 'الجلسات: حالة على الخادم، إلغاء سهل، الأفضل لتطبيقات الويب على نفس النطاق. و JWT: عديم الحالة، يتوسع عبر الخدمات، لكن الإلغاء يحتاج عمرًا قصيرًا + رموز تحديث/قائمة حظر. خزّن رموز التحديث في كوكيز httpOnly.'] },
                { q: ['How do you secure a REST API?', 'كيف تؤمّن واجهة REST؟'], a: ['HTTPS, helmet, strict CORS, validation, authN + authZ with ownership checks, rate limiting, parameterised queries, secrets management, dependency audits, logging without sensitive data — mapped to OWASP API Top 10.', 'HTTPS و helmet و CORS صارم والتحقق والمصادقة والتفويض مع فحص الملكية وتحديد المعدل والاستعلامات بالمعاملات وإدارة الأسرار وتدقيق التبعيات والسجلات بلا بيانات حساسة — وفق OWASP API Top 10.'] },
                { q: ['How would you paginate a large collection?', 'كيف تقسم مجموعة كبيرة إلى صفحات؟'], a: ['Offset (page/limit + meta) for small/admin lists; cursor-based (after=lastId) for large or infinite feeds — stable and index-friendly. Always cap the limit.', 'الإزاحة (page/limit + meta) للقوائم الصغيرة/الإدارية؛ والمؤشر (after=lastId) للقوائم الكبيرة أو اللانهائية — مستقر ومناسب للفهارس. وحدد دائمًا سقفًا للحد.'] },
                { q: ['What happens when you call next(err)?', 'ماذا يحدث عند استدعاء next(err)؟'], a: ['Express skips all remaining non-error middleware and routes and jumps to the next error-handling middleware (4 arguments).', 'يتخطى Express كل الوسائط والمسارات العادية المتبقية ويقفز إلى وسيط معالجة الأخطاء التالي (4 معاملات).'] },
                { q: ['How do you scale an Express API?', 'كيف توسّع واجهة Express؟'], a: ['Stateless instances (state in DB/Redis), multiple processes (cluster/PM2/containers) behind a load balancer, caching, queues for slow work, DB indexes/read replicas, and observability to find bottlenecks.', 'نسخ عديمة الحالة (الحالة في قاعدة البيانات/Redis)، عمليات متعددة (cluster/PM2/حاويات) خلف موازن حمل، تخزين مؤقت، طوابير للعمل البطيء، فهارس قاعدة البيانات/نسخ القراءة، ومراقبة لإيجاد العوائق.'] },
                { q: ['How do you test an Express API?', 'كيف تختبر واجهة Express؟'], a: ['Export app without listen; integration tests with Supertest against an isolated DB (memory server or container); unit tests for services with injected fakes; run everything in CI with coverage.', 'صدّر التطبيق بدون listen؛ واختبارات تكامل بـ Supertest على قاعدة معزولة (خادم ذاكرة أو حاوية)؛ واختبارات وحدة للخدمات مع نسخ وهمية محقونة؛ وشغّل كل شيء في CI مع التغطية.'] },
                { q: ['Tell me about a hard bug you fixed.', 'حدثني عن خطأ صعب أصلحته.'], a: ['Use STAR: Situation, Task, Action (how you investigated: logs, traces, reproduction, hypothesis), Result (measurable) — and what you changed so it never happens again (test, alert, ADR).', 'استخدم STAR: الموقف، المهمة، الإجراء (كيف حققت: السجلات، التتبع، إعادة الإنتاج، الفرضية)، النتيجة (قابلة للقياس) — وماذا غيّرت لكي لا يتكرر (اختبار، تنبيه، ADR).'] }
            ] }]
        },
        {
            kind: 'concept', t: ['Career roadmap: junior → senior', 'خارطة المسار المهني: Junior ← Senior'],
            b: [
                { table: { h: ['', 'Junior', 'Mid-level', 'Senior'], r: [
                    [['You can…', 'تستطيع…'], ['build CRUD endpoints with guidance, fix bugs', 'بناء نقاط CRUD بتوجيه، وإصلاح الأخطاء'], ['own features end-to-end: design, tests, deploy', 'امتلاك الميزات من البداية للنهاية: التصميم والاختبار والنشر'], ['own systems: architecture, reliability, security, trade-offs', 'امتلاك الأنظمة: المعمارية والموثوقية والأمان والمفاضلات']],
                    [['Chapters', 'الفصول'], '1 – 17', '18 – 33', '34 – 43'],
                    [['Focus', 'التركيز'], ['JS, HTTP, Express basics, Git, SQL/NoSQL basics', 'JS و HTTP وأساسيات Express و Git وأساسيات SQL/NoSQL'], ['auth, testing, TypeScript, caching, queues, Docker', 'المصادقة والاختبار و TypeScript والتخزين المؤقت والطوابير و Docker'], ['distributed systems, observability, mentoring, code review, communication', 'الأنظمة الموزعة والمراقبة والإرشاد ومراجعة الكود والتواصل']],
                    [['Proof', 'الدليل'], ['2–3 small projects on GitHub', '2–3 مشاريع صغيرة على GitHub'], ['the capstone, live and documented', 'المشروع الختامي منشورًا وموثقًا'], ['impact: incidents prevented, systems improved, people grown', 'الأثر: حوادث منعتها، أنظمة حسنتها، أشخاص طورتهم']]
                ] } },
                { cols: [
                    [{ h3: ['What to learn next', 'ماذا تتعلم بعد ذلك'] },
                     { ul: [
                         ['PostgreSQL deeply (indexes, transactions, query plans)', 'PostgreSQL بعمق (الفهارس، المعاملات، خطط الاستعلام)'],
                         ['System design (caching, queues, consistency, sharding)', 'تصميم الأنظمة (التخزين المؤقت، الطوابير، الاتساق، التجزئة)'],
                         ['Kubernetes basics & cloud (AWS/GCP)', 'أساسيات Kubernetes والسحابة (AWS/GCP)'],
                         ['NestJS or Fastify, and another language (Go) for perspective', 'NestJS أو Fastify، ولغة أخرى (Go) لتوسيع المنظور']
                     ] }],
                    [{ h3: ['Keep going', 'استمر'] },
                     { ul: [
                         ['Contribute to an open-source Node project (docs and tests count!)', 'ساهم في مشروع Node مفتوح المصدر (التوثيق والاختبارات تُحسب!)'],
                         ['Write a blog post about one thing you learned here — teaching is learning twice', 'اكتب مقالًا عن شيء تعلمته هنا — التعليم تعلّم مرتين'],
                         ['Practise system-design interviews with a friend weekly', 'تدرب على مقابلات تصميم الأنظمة مع صديق أسبوعيًا'],
                         ['Ship. Ship. Ship. 🚀', 'انشر. انشر. انشر. 🚀']
                     ] }]
                ] }
            ]
        },
        {
            kind: 'exercise', t: ['Capstone plan (4 weeks)', 'خطة المشروع الختامي (4 أسابيع)'],
            b: [{ tasks: [
                ['<b>Week 1</b> — scope, data model, ADR 0001, auth + tasks CRUD with validation and errors.', '<b>الأسبوع 1</b> — النطاق، نموذج البيانات، ADR 0001، المصادقة و CRUD للمهام مع التحقق والأخطاء.'],
                ['<b>Week 2</b> — roles & ownership, pagination/search, tests ≥ 70%, OpenAPI docs.', '<b>الأسبوع 2</b> — الأدوار والملكية، التصفح/البحث، اختبارات ≥ 70%، توثيق OpenAPI.'],
                ['<b>Week 3</b> — security hardening, logging/metrics, Docker compose, CI pipeline, your bonus feature.', '<b>الأسبوع 3</b> — تحصين الأمان، السجلات/المقاييس، Docker compose، خط CI، وميزتك الإضافية.'],
                ['<b>Week 4</b> — deploy with HTTPS, README + demo video, peer code review, 10-minute presentation.', '<b>الأسبوع 4</b> — النشر مع HTTPS، README + فيديو عرض، مراجعة كود من زميل، وعرض لمدة 10 دقائق.']
            ], time: 10, hint: ['Commit every day with Conventional Commits — your Git history is part of the grade.', 'اعمل commit كل يوم بـ Conventional Commits — سجل Git جزء من التقييم.'] }]
        }
    ],
    quiz: [
        { q: ['Which item belongs to a production-ready API?', 'أي عنصر ينتمي إلى واجهة جاهزة للإنتاج؟'], o: [['Stack traces in responses', 'تفاصيل الأخطاء في الاستجابات'], ['Health checks + graceful shutdown', 'فحوص الصحة + الإيقاف الآمن'], ['Secrets in the repo', 'الأسرار في المستودع'], ['No tests', 'بلا اختبارات']], a: 1, e: ['Operability is part of “done”.', 'قابلية التشغيل جزء من "الإنجاز".'] },
        { q: ['Interview: best structure to tell a story about a bug you fixed?', 'مقابلة: أفضل هيكلة لسرد قصة خطأ أصلحته؟'], o: ['STAR', 'CRUD', 'REST', 'SOLID'], a: 0, e: ['Situation, Task, Action, Result.', 'الموقف، المهمة، الإجراء، النتيجة.'] },
        { tf: true, q: ['A senior engineer is expected to explain trade-offs, not just write code.', 'يُتوقع من الـ Senior شرح المفاضلات وليس كتابة الكود فقط.'], e: ['Communication and judgement are core senior skills.', 'التواصل وحسن التقدير مهارات أساسية للـ Senior.'] },
        { q: ['What should be at the top of your capstone README?', 'ماذا يجب أن يكون في أعلى ملف README لمشروعك الختامي؟'], o: [['Your favourite colour', 'لونك المفضل'], ['What it is, live URL, quick start, demo video', 'ما هو، الرابط المباشر، البدء السريع، فيديو العرض'], ['The full source code', 'الكود الكامل'], ['Nothing', 'لا شيء']], a: 1, e: ['Reviewers decide in 30 seconds.', 'المراجعون يقررون خلال 30 ثانية.'] }
    ]
});
