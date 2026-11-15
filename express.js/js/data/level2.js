/* Level 2 — Intermediate (chapters 13–24)
   Code blocks tagged x:'api' together form the runnable Tasky API after this level. */
window.DECK = window.DECK || { chapters: [] };

DECK.chapters.push({
    n: 13, level: 2, icon: '🔁',
    t: ['Building a full REST API (CRUD)', 'بناء واجهة REST كاملة (CRUD)'],
    sub: ['Resource naming, methods, status codes and a complete layered CRUD', 'تسمية الموارد، الطرق، رموز الحالة و CRUD كامل بطبقات'],
    project: ['Tasky becomes a complete CRUD API (in memory) with correct status codes.', 'يصبح Tasky واجهة CRUD كاملة (في الذاكرة) برموز حالة صحيحة.'],
    learn: [
        ['Design URLs around resources, not actions', 'صمّم الروابط حول الموارد وليس الأفعال'],
        ['Return the right status code for every outcome', 'أعد رمز الحالة الصحيح لكل نتيجة'],
        ['Protect against mass assignment', 'احمِ التطبيق من الإسناد الجماعي (mass assignment)']
    ],
    slides: [
        {
            kind: 'concept', t: ['REST conventions', 'اصطلاحات REST'],
            b: [
                { table: { h: [['Action', 'الإجراء'], ['Method + URL', 'الطريقة + الرابط'], ['Success', 'النجاح'], ['Errors', 'الأخطاء']], r: [
                    [['List tasks', 'عرض المهام'], '<code>GET /api/tasks</code>', '200 + array', '—'],
                    [['Get one', 'عرض مهمة'], '<code>GET /api/tasks/:id</code>', '200 + object', '404'],
                    [['Create', 'إنشاء'], '<code>POST /api/tasks</code>', ['201 + object + Location', '201 + الكائن + Location'], '400 / 409'],
                    [['Update some fields', 'تعديل بعض الحقول'], '<code>PATCH /api/tasks/:id</code>', '200 + object', '400 / 404'],
                    [['Replace', 'استبدال'], '<code>PUT /api/tasks/:id</code>', '200 + object', '400 / 404'],
                    [['Delete', 'حذف'], '<code>DELETE /api/tasks/:id</code>', '204', '404']
                ] } },
                { cols: [
                    [{ best: ['Nouns, plural, lowercase, hyphens: <code>/api/tasks</code>, <code>/api/team-members</code>. The <b>method</b> is the verb.', 'أسماء، بصيغة الجمع، أحرف صغيرة، وشرطات: <code>/api/tasks</code> و <code>/api/team-members</code>. <b>الطريقة</b> هي الفعل.'] }],
                    [{ mistake: ['Verbs in URLs: <code>POST /createTask</code>, <code>GET /getAllTasks</code>, <code>POST /tasks/delete/5</code>.', 'أفعال في الروابط: <code>POST /createTask</code> و <code>GET /getAllTasks</code> و <code>POST /tasks/delete/5</code>.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Model & service (in memory)', 'النموذج والخدمة (في الذاكرة)'],
            b: [{ cols: [
                [{ code: `// In-memory store — swapped for MongoDB in chapter 14
let tasks = [];
let nextId = 1;

export async function findAll() {
  return tasks;
}

export async function findById(id) {
  return tasks.find((t) => t.id === id) ?? null;
}

export async function create({ title }) {
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return task;
}

export async function update(id, changes) {
  const task = await findById(id);
  if (!task) return null;
  Object.assign(task, changes);
  return task;
}

export async function remove(id) {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}`, file: 'src/models/task.model.js', x: 'crud' }],
                [{ code: `import * as Task from '../models/task.model.js';

// whitelist → clients cannot set fields we did not allow
const ALLOWED = ['title', 'done'];

export const listTasks = () => Task.findAll();

export const getTask = (id) => Task.findById(id);

export const createTask = ({ title }) => Task.create({ title: title.trim() });

export function updateTask(id, body) {
  const changes = Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED.includes(key)),
  );
  return Task.update(id, changes);
}

export const deleteTask = (id) => Task.remove(id);`, file: 'src/services/tasks.service.js', hl: '4,12-14', x: 'crud' },
                 { warn: ['<b>Mass assignment</b>: <code>Object.assign(task, req.body)</code> lets a client send <code>{"role":"admin"}</code> or <code>{"owner":"someone-else"}</code>. Always whitelist (or validate with a strict schema — chapter 16).', '<b>الإسناد الجماعي</b>: <code>Object.assign(task, req.body)</code> يسمح للعميل بإرسال <code>{"role":"admin"}</code> أو <code>{"owner":"someone-else"}</code>. استخدم دائمًا قائمة سماح (أو تحقق بمخطط صارم — الفصل 16).'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Controller, routes & app', 'المتحكم والمسارات والتطبيق'],
            b: [{ cols: [
                [{ code: `import * as service from '../services/tasks.service.js';

export async function list(req, res) {
  res.json(await service.listTasks());
}

export async function getOne(req, res) {
  const task = await service.getTask(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}

export async function create(req, res) {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = await service.createTask({ title });
  res.status(201).location(\`/api/tasks/\${task.id}\`).json(task);
}

export async function update(req, res) {
  const task = await service.updateTask(Number(req.params.id), req.body ?? {});
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}

export async function remove(req, res) {
  const deleted = await service.deleteTask(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Task not found' });
  res.sendStatus(204);
}`, file: 'src/controllers/tasks.controller.js', hl: '19,30', x: 'crud' }],
                [{ code: `import { Router } from 'express';
import * as ctrl from '../controllers/tasks.controller.js';

const router = Router();

router.route('/').get(ctrl.list).post(ctrl.create);
router.route('/:id').get(ctrl.getOne).patch(ctrl.update).delete(ctrl.remove);

export default router;`, file: 'src/routes/tasks.routes.js', x: 'crud' },
                 { code: `import express from 'express';
import tasksRouter from './routes/tasks.routes.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: \`Route \${req.method} \${req.originalUrl} not found\` });
});

export default app;`, file: 'src/app.js', x: 'crud' },
                 { code: `import app from './app.js';

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(\`Tasky API on http://localhost:\${PORT}\`));`, file: 'src/server.js', x: 'crud' }]
            ] }]
        },
        {
            kind: 'code', t: ['Test the whole CRUD', 'اختبر CRUD كاملًا'],
            b: [{ cols: [
                [{ term: `node src/server.js
curl -X POST localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Write tests"}'
curl localhost:3000/api/tasks
curl -X PATCH localhost:3000/api/tasks/1 -H "Content-Type: application/json" -d '{"done":true,"id":99}'
curl -i -X DELETE localhost:3000/api/tasks/1
curl localhost:3000/api/tasks/1
curl -X POST localhost:3000/api/tasks -H "Content-Type: application/json" -d '{}'`, out: `{"id":1,"title":"Write tests","done":false}
[{"id":1,"title":"Write tests","done":false}]
{"id":1,"title":"Write tests","done":true}      ← "id":99 ignored
HTTP/1.1 204 No Content
{"error":"Task not found"}
{"error":"title is required"}` }],
                [{ tip: ['Keep a <code>requests.http</code> file with these calls in the repo — teammates can replay them in one click.', 'احتفظ بملف <code>requests.http</code> فيه هذه الطلبات داخل المستودع — يستطيع الزملاء إعادة تنفيذها بنقرة واحدة.'] },
                 { p: ['Notice the PATCH ignored <code>"id": 99</code> thanks to the whitelist, and DELETE returns <b>204 with an empty body</b>.', 'لاحظ أن PATCH تجاهل <code>"id": 99</code> بفضل قائمة السماح، وأن DELETE يعيد <b>204 بجسم فارغ</b>.'] },
                 { note: ['PUT vs PATCH: PUT = send the <i>whole</i> new version of the document (missing fields are reset). PATCH = send only what changes. Most APIs implement PATCH.', 'PUT مقابل PATCH: في PUT ترسل النسخة <i>الكاملة</i> الجديدة (الحقول الناقصة تُعاد ضبطها). في PATCH ترسل فقط ما يتغير. معظم الواجهات تطبّق PATCH.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Extend the CRUD', 'وسّع CRUD'],
            b: [{ tasks: [
                ['Add a <code>priority</code> field (<code>low | medium | high</code>, default <code>medium</code>) and allow updating it.', 'أضف الحقل <code>priority</code> (<code>low | medium | high</code>، الافتراضي <code>medium</code>) واسمح بتعديله.'],
                ['Implement <code>PUT /api/tasks/:id</code> that replaces title, done and priority (400 if one is missing).', 'نفّذ <code>PUT /api/tasks/:id</code> يستبدل العنوان والحالة والأولوية (400 إذا نقص أحدها).'],
                ['Return <b>409 Conflict</b> when creating a task whose title already exists.', 'أعد <b>409 Conflict</b> عند إنشاء مهمة بعنوان موجود مسبقًا.'],
                ['Write all calls in <code>requests.http</code> and run them in order.', 'اكتب كل الطلبات في <code>requests.http</code> ونفّذها بالترتيب.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['Which URL is RESTful for deleting task 5?', 'أي رابط يتبع REST لحذف المهمة 5؟'], o: ['`POST /tasks/delete/5`', '`GET /deleteTask?id=5`', '`DELETE /tasks/5`', '`DELETE /task/remove/5`'], a: 2, e: ['Resource URL + DELETE method.', 'رابط المورد + الطريقة DELETE.'] },
        { q: ['Best status for a successful DELETE with no body?', 'أفضل رمز لحذف ناجح بدون جسم؟'], o: ['200', '201', '204', '404'], a: 2, e: ['204 No Content.', '204 No Content.'] },
        { q: ['What is “mass assignment”?', 'ما هو "الإسناد الجماعي"؟'], o: [['Updating many documents at once', 'تحديث عدة مستندات دفعة واحدة'], ['Copying the client body directly into your model', 'نسخ جسم العميل مباشرة إلى النموذج'], ['Assigning many routes', 'إسناد مسارات كثيرة'], ['A Mongo feature', 'ميزة في Mongo']], a: 1, e: ['Clients could set fields like role or owner. Whitelist allowed fields.', 'قد يضبط العميل حقولًا مثل role أو owner. استخدم قائمة سماح.'] },
        { tf: false, q: ['PATCH should reset fields that are not included in the body.', 'يجب على PATCH إعادة ضبط الحقول غير الموجودة في الجسم.'], e: ['That is PUT semantics. PATCH changes only the sent fields.', 'هذا سلوك PUT. أما PATCH فيغير فقط الحقول المرسلة.'] },
        { out: true, q: ['Create returns which status + header?', 'الإنشاء يعيد أي رمز + ترويسة؟'], code: `res.status(201).location(\`/api/tasks/\${task.id}\`).json(task);`, o: [['200 + Location', '200 + Location'], ['201 + Location: /api/tasks/:id', '201 + Location: /api/tasks/:id'], ['201 + Content-Location', '201 + Content-Location'], ['204', '204']], a: 1, e: ['201 Created with the URL of the new resource.', '201 Created مع رابط المورد الجديد.'] }
    ]
});

DECK.chapters.push({
    n: 14, level: 2, icon: '🍃',
    t: ['MongoDB + Mongoose', 'MongoDB مع Mongoose'],
    sub: ['Schemas, models, queries, relations (populate) and indexes', 'المخططات، النماذج، الاستعلامات، العلاقات (populate) والفهارس'],
    project: ['Tasky stores tasks in MongoDB: the service now talks to a Mongoose model.', 'يخزن Tasky المهام في MongoDB: الخدمة تتعامل الآن مع نموذج Mongoose.'],
    learn: [
        ['Connect to MongoDB and define schemas with validation', 'اتصل بـ MongoDB وعرّف مخططات مع تحقق'],
        ['Query, sort, paginate, populate and aggregate', 'استعلم ورتّب وقسّم الصفحات واستخدم populate و aggregate'],
        ['Add indexes for the queries you actually run', 'أضف فهارس للاستعلامات التي تنفذها فعلًا']
    ],
    slides: [
        {
            kind: 'code', t: ['Connect & define a schema', 'الاتصال وتعريف مخطط'],
            b: [
                { term: `npm install mongoose
# local MongoDB (Docker) — or a free MongoDB Atlas cluster
docker run -d --name mongo -p 27017:27017 mongo:8` },
                { cols: [
                    [{ code: `import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}`, file: 'src/config/db.js', x: 'api' },
                     { code: `import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT ?? 3000;

await connectDB(process.env.MONGODB_URI);   // top-level await (ESM)
app.listen(PORT, () => console.log(\`🚀 Tasky API on http://localhost:\${PORT}\`));`, file: 'src/server.js', hl: '7', x: 'api' }],
                    [{ code: `import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    tags: [String],
  },
  { timestamps: true },            // adds createdAt / updatedAt
);

// compound index for "my open tasks, newest first"
taskSchema.index({ done: 1, createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);`, file: 'src/models/task.model.js', hl: '5,11,15' }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Queries you will write every day', 'استعلامات ستكتبها يوميًا'],
            b: [{ cols: [
                [{ code: `// CREATE
const task = await Task.create({ title: 'Learn Mongoose' });

// READ — filter, sort, limit, projection, plain objects
const open = await Task.find({ done: false })
  .sort({ createdAt: -1 })
  .limit(10)
  .select('title priority')
  .lean();                       // faster: plain JS objects

const one = await Task.findById(id);           // null if not found

// UPDATE — return the new document + run schema validators
const updated = await Task.findByIdAndUpdate(
  id,
  { done: true },
  { returnDocument: 'after', runValidators: true },
);

// DELETE
await Task.findByIdAndDelete(id);

// COUNT & AGGREGATE
const total = await Task.countDocuments({ done: true });
const byPriority = await Task.aggregate([
  { $group: { _id: '$priority', count: { $sum: 1 } } },
]);`, file: 'queries.js', hl: '9,17' }],
                [{ table: { h: [['Operator', 'المعامل'], ['Example', 'مثال']], r: [
                    ['<code>$gt $gte $lt $lte</code>', '<code>{ dueDate: { $lt: new Date() } }</code>'],
                    ['<code>$in $nin</code>', '<code>{ priority: { $in: [\'high\', \'medium\'] } }</code>'],
                    ['<code>$regex</code>', '<code>{ title: { $regex: \'milk\', $options: \'i\' } }</code>'],
                    ['<code>$or</code>', '<code>{ $or: [{ done: true }, { priority: \'low\' }] }</code>'],
                    ['<code>$push $pull</code>', '<code>{ $push: { tags: \'urgent\' } }</code>']
                ] } },
                 { warn: ['Mongoose 9 deprecates <code>{ new: true }</code> — use <code>{ returnDocument: \'after\' }</code>. And remember <code>runValidators: true</code>: update queries skip schema validation by default!', 'يلغي Mongoose 9 الخيار <code>{ new: true }</code> — استخدم <code>{ returnDocument: \'after\' }</code>. وتذكر <code>runValidators: true</code>: استعلامات التحديث تتجاوز تحقق المخطط افتراضيًا!'] },
                 { tip: ['<code>.lean()</code> returns plain objects (no getters, no <code>.save()</code>) — 3–5× faster for read-only endpoints.', '<code>.lean()</code> يعيد كائنات بسيطة (بلا getters وبلا <code>.save()</code>) — أسرع بـ 3–5 مرات لنقاط القراءة فقط.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Relations, populate & indexes', 'العلاقات و populate والفهارس'],
            b: [{ cols: [
                [{ code: `// reference (normalised) — best for large or shared data
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const comments = await Comment.find({ task: taskId })
  .populate('author', 'name email')     // JOIN-like
  .sort('-createdAt');

// embedding (denormalised) — best for small, owned data
const checklistSchema = new mongoose.Schema({
  title: String,
  items: [{ text: String, checked: { type: Boolean, default: false } }],
});`, file: 'relations.js', hl: '4,9' }],
                [{ table: { h: [['Embed', 'التضمين'], ['Reference', 'المرجع']], r: [
                     [['1 read, atomic updates', 'قراءة واحدة وتحديث ذري'], ['Data reused in many places', 'بيانات تستخدم في أماكن كثيرة']],
                     [['Small, bounded arrays', 'مصفوفات صغيرة ومحدودة'], ['Unbounded growth (comments, logs)', 'نمو غير محدود (تعليقات، سجلات)']],
                     [['Checklist items, address', 'عناصر قائمة، عنوان'], ['Users ↔ tasks, tasks ↔ comments', 'مستخدمون ↔ مهام، مهام ↔ تعليقات']]
                 ] } },
                 { best: ['Index the fields you <b>filter and sort</b> by. Check with <code>Task.find(q).explain(\'executionStats\')</code>: you want <code>IXSCAN</code>, not <code>COLLSCAN</code>.', 'أضف فهارس للحقول التي <b>تفلتر وترتب</b> بها. تحقق بـ <code>Task.find(q).explain(\'executionStats\')</code>: تريد <code>IXSCAN</code> وليس <code>COLLSCAN</code>.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Swap the in-memory model for Mongoose', 'استبدل نموذج الذاكرة بـ Mongoose'],
            b: [{ cols: [
                [{ code: `import { Task } from '../models/task.model.js';

export const listTasks = () => Task.find().sort('-createdAt').lean();

export const getTask = (id) => Task.findById(id);

export const createTask = (data) => Task.create(data);

export const updateTask = (id, changes) =>
  Task.findByIdAndUpdate(id, changes, { returnDocument: 'after', runValidators: true });

export const deleteTask = (id) => Task.findByIdAndDelete(id);`, file: 'src/services/tasks.service.js' }],
                [{ code: `PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/tasky`, file: '.env' },
                 { p: ['The controllers and routes do not change: only the service and model know about MongoDB. That is the payoff of the layers from chapter 12.', 'المتحكمات والمسارات لا تتغير: فقط الخدمة والنموذج يعرفان MongoDB. هذه ثمرة الطبقات من الفصل 12.'] },
                 { warn: ['IDs are now ObjectIds (<code>"6650f1…"</code>), not numbers: remove <code>Number(req.params.id)</code>. An invalid id throws a <code>CastError</code> — we turn it into a 400 in chapter 17.', 'المعرفات أصبحت ObjectId (<code>"6650f1…"</code>) وليست أرقامًا: احذف <code>Number(req.params.id)</code>. والمعرّف غير الصالح يرمي <code>CastError</code> — نحوله إلى 400 في الفصل 17.'] },
                 { tip: ['Use <code>127.0.0.1</code> rather than <code>localhost</code> in the URI: on some systems <code>localhost</code> resolves to IPv6 <code>::1</code> where MongoDB is not listening.', 'استخدم <code>127.0.0.1</code> بدل <code>localhost</code> في الرابط: في بعض الأنظمة يتحول <code>localhost</code> إلى IPv6 <code>::1</code> حيث لا يستمع MongoDB.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Persist Tasky in MongoDB', 'خزّن Tasky في MongoDB'],
            b: [{ tasks: [
                ['Start MongoDB (Docker or Atlas), add <code>MONGODB_URI</code> to <code>.env</code>, connect in <code>server.js</code>.', 'شغّل MongoDB (Docker أو Atlas)، أضف <code>MONGODB_URI</code> إلى <code>.env</code>، واتصل في <code>server.js</code>.'],
                ['Create the Task model and switch the service to Mongoose. Re-run your <code>requests.http</code>.', 'أنشئ نموذج Task وحوّل الخدمة إلى Mongoose. أعد تنفيذ <code>requests.http</code>.'],
                ['Add <code>GET /api/tasks/stats</code> using <code>aggregate</code> to count tasks per priority.', 'أضف <code>GET /api/tasks/stats</code> باستخدام <code>aggregate</code> لعدّ المهام حسب الأولوية.'],
                ['Open MongoDB Compass (or <code>mongosh</code>) and look at the documents and indexes.', 'افتح MongoDB Compass (أو <code>mongosh</code>) وشاهد المستندات والفهارس.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['Which option makes <code>findByIdAndUpdate</code> return the updated document in Mongoose 9?', 'أي خيار يجعل <code>findByIdAndUpdate</code> يعيد المستند المحدّث في Mongoose 9؟'], o: ["`{ returnDocument: 'after' }`", '`{ upsert: true }`', '`{ lean: true }`', '`{ strict: false }`'], a: 0, e: ['returnDocument: "after" (the old new: true is deprecated).', 'returnDocument: "after" (والخيار القديم new: true ملغى).'] },
        { tf: false, q: ['Update queries run schema validators by default.', 'استعلامات التحديث تشغّل محققات المخطط افتراضيًا.'], e: ['You need runValidators: true.', 'تحتاج إلى runValidators: true.'] },
        { q: ['What does <code>.populate(\'author\', \'name\')</code> do?', 'ماذا يفعل <code>.populate(\'author\', \'name\')</code>؟'], o: [['Creates an author', 'ينشئ مؤلفًا'], ['Replaces the author ObjectId with the user document (only name)', 'يستبدل ObjectId المؤلف بمستند المستخدم (الاسم فقط)'], ['Adds an index', 'يضيف فهرسًا'], ['Validates the author', 'يتحقق من المؤلف']], a: 1, e: ['It runs a second query and fills the reference.', 'ينفذ استعلامًا ثانيًا ويملأ المرجع.'] },
        { q: ['Comments on a task can grow to thousands. Best model?', 'تعليقات المهمة قد تصل إلى الآلاف. ما أفضل نموذج؟'], o: [['Embed them in the task', 'تضمينها في المهمة'], ['Separate collection referencing the task', 'مجموعة منفصلة تشير إلى المهمة'], ['Store as a string', 'حفظها كنص'], ['In localStorage', 'في localStorage']], a: 1, e: ['Unbounded arrays → reference (documents are limited to 16 MB).', 'مصفوفات غير محدودة ← مرجع (حجم المستند محدود بـ 16MB).'] },
        { q: ['<code>explain()</code> shows <code>COLLSCAN</code>. What should you do?', '<code>explain()</code> يعرض <code>COLLSCAN</code>. ماذا تفعل؟'], o: [['Add an index on the filtered/sorted fields', 'أضف فهرسًا على حقول الفلترة/الترتيب'], ['Use lean()', 'استخدم lean()'], ['Restart Mongo', 'أعد تشغيل Mongo'], ['Nothing', 'لا شيء']], a: 0, e: ['A collection scan reads every document; an index avoids it.', 'المسح الكامل يقرأ كل المستندات؛ والفهرس يتجنب ذلك.'] }
    ]
});

DECK.chapters.push({
    n: 15, level: 2, icon: '🐘',
    t: ['SQL option: PostgreSQL + Prisma', 'خيار SQL: PostgreSQL مع Prisma'],
    sub: ['Schema, migrations, relations and type-safe queries with Prisma 7', 'المخطط، الترحيلات، العلاقات واستعلامات آمنة الأنواع مع Prisma 7'],
    project: ['Alternative storage for Tasky: the same service API, backed by PostgreSQL.', 'تخزين بديل لـ Tasky: نفس واجهة الخدمة لكن فوق PostgreSQL.'],
    learn: [
        ['Choose SQL vs NoSQL for a given problem', 'اختر بين SQL و NoSQL حسب المشكلة'],
        ['Model relations and run migrations with Prisma', 'صمّم العلاقات ونفّذ الترحيلات بـ Prisma'],
        ['Query with filters, includes and transactions', 'استعلم مع الفلاتر و include والمعاملات']
    ],
    slides: [
        {
            kind: 'code', t: ['Setup Prisma 7', 'إعداد Prisma 7'],
            b: [{ cols: [
                [{ term: `npm install -D prisma@7
npm install @prisma/client@7 @prisma/adapter-pg@7 dotenv
npx prisma init --datasource-provider postgresql
# local Postgres
docker run -d --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:17` },
                 { code: `DATABASE_URL="postgresql://postgres:pass@localhost:5432/tasky"`, file: '.env' },
                 { code: `import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});`, file: 'prisma.config.ts' }],
                [{ code: `generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(120)
  done      Boolean  @default(false)
  priority  Priority @default(MEDIUM)
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId   Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId, done])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}`, file: 'prisma/schema.prisma', hl: '2-3,25,29' }]
            ] }]
        },
        {
            kind: 'code', t: ['Migrations & queries', 'الترحيلات والاستعلامات'],
            b: [{ cols: [
                [{ term: `npx prisma migrate dev --name init   # creates SQL + applies it
npx prisma generate                    # (re)builds the client
npx prisma studio                      # browse data in the browser`, out: `prisma/migrations/20261115165518_init/migration.sql
Your database is now in sync with your schema.
✔ Generated Prisma Client (7.x) to ./src/generated/prisma` },
                 { code: `import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });`, file: 'src/config/prisma.js', hl: '2,5' },
                 { warn: ['Prisma 7 generates a <b>TypeScript</b> client and needs a driver adapter. Node 22.18+/24 runs <code>.ts</code> imports natively; on older Node 22 add <code>--experimental-strip-types</code> or use <code>tsx</code>.', 'يولّد Prisma 7 عميلًا بـ <b>TypeScript</b> ويحتاج محوّل تشغيل (adapter). يشغّل Node 22.18+/24 استيراد <code>.ts</code> مباشرة؛ وفي إصدارات 22 الأقدم أضف <code>--experimental-strip-types</code> أو استخدم <code>tsx</code>.'] }],
                [{ code: `import { prisma } from '../config/prisma.js';

// filter + relation + sort + pagination
const tasks = await prisma.task.findMany({
  where: { ownerId: userId, done: false, title: { contains: 'milk', mode: 'insensitive' } },
  include: { owner: { select: { name: true, email: true } } },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 10,
});

const task = await prisma.task.create({
  data: { title: 'Learn Prisma', owner: { connect: { id: userId } } },
});

await prisma.task.update({ where: { id: task.id }, data: { done: true } });

// transaction: both succeed or both fail
await prisma.$transaction([
  prisma.task.deleteMany({ where: { ownerId: userId } }),
  prisma.user.delete({ where: { id: userId } }),
]);`, file: 'src/services/tasks.service.prisma.js', hl: '5-6,20' },
                 { tip: ['Never edit the database by hand in a team: change <code>schema.prisma</code> → <code>migrate dev</code> → commit the migration. Production runs <code>prisma migrate deploy</code>.', 'لا تعدّل قاعدة البيانات يدويًا في فريق: غيّر <code>schema.prisma</code> ← <code>migrate dev</code> ← احفظ الترحيل. والإنتاج ينفذ <code>prisma migrate deploy</code>.'] }]
            ] }]
        },
        {
            kind: 'concept', t: ['SQL or NoSQL? Prisma or Sequelize?', 'SQL أم NoSQL؟ Prisma أم Sequelize؟'],
            b: [
                { table: { h: ['', 'PostgreSQL / MySQL', 'MongoDB'], r: [
                    [['Data shape', 'شكل البيانات'], ['Tables, strict schema, joins', 'جداول، مخطط صارم، روابط'], ['Documents, flexible schema', 'مستندات، مخطط مرن']],
                    [['Relations', 'العلاقات'], ['First-class (foreign keys)', 'أساسية (مفاتيح أجنبية)'], ['Embedding or $lookup/populate', 'تضمين أو ‎$lookup/populate']],
                    [['Transactions', 'المعاملات'], ['Mature, everywhere', 'ناضجة وفي كل مكان'], ['Supported (replica set)', 'مدعومة (replica set)']],
                    [['Great for', 'ممتاز لـ'], ['Money, inventory, reporting', 'المال، المخزون، التقارير'], ['Catalogs, content, events, prototyping', 'الكتالوجات، المحتوى، الأحداث، النماذج الأولية']]
                ] } },
                { cols: [
                    [{ ul: [
                        ['<b>Prisma</b>: schema file, generated typed client, great DX and migrations.', '<b>Prisma</b>: ملف مخطط، عميل مولّد بأنواع، تجربة تطوير وترحيلات ممتازة.'],
                        ['<b>Sequelize</b>: older classic ORM (models in JS, <code>sequelize-cli</code> migrations).', '<b>Sequelize</b>: ORM كلاسيكي أقدم (نماذج بـ JS وترحيلات عبر <code>sequelize-cli</code>).'],
                        ['<b>Drizzle / Knex</b>: closer to SQL, lightweight.', '<b>Drizzle / Knex</b>: أقرب إلى SQL وخفيفة.']
                    ] }],
                    [{ best: ['Default to PostgreSQL when your data is relational (users, teams, tasks, permissions). Pick MongoDB when documents are naturally self-contained.', 'اختر PostgreSQL افتراضيًا عندما تكون بياناتك علائقية (مستخدمون، فرق، مهام، صلاحيات). واختر MongoDB عندما تكون المستندات مستقلة بطبيعتها.'] }]
                ] }
            ]
        },
        {
            kind: 'exercise', t: ['Tasky on PostgreSQL', 'Tasky على PostgreSQL'],
            b: [{ tasks: [
                ['Run Postgres in Docker, set <code>DATABASE_URL</code>, and run the first migration.', 'شغّل Postgres في Docker، اضبط <code>DATABASE_URL</code>، ونفّذ أول ترحيل.'],
                ['Write <code>tasks.service.prisma.js</code> with the same five functions as the Mongoose service.', 'اكتب <code>tasks.service.prisma.js</code> بنفس الدوال الخمس الموجودة في خدمة Mongoose.'],
                ['Add a <code>Tag</code> model with a many-to-many relation to <code>Task</code>; create a migration.', 'أضف نموذج <code>Tag</code> بعلاقة متعدد-إلى-متعدد مع <code>Task</code>؛ وأنشئ ترحيلًا.'],
                ['Open Prisma Studio and inspect the join table Prisma created.', 'افتح Prisma Studio وافحص جدول الربط الذي أنشأه Prisma.']
            ], time: 25, hint: ['No Docker? Use the SQLite adapter (<code>@prisma/adapter-better-sqlite3</code>) with <code>provider = "sqlite"</code> for the exercise.', 'لا يوجد Docker؟ استخدم محوّل SQLite (<code>@prisma/adapter-better-sqlite3</code>) مع <code>provider = "sqlite"</code> في التمرين.'] }]
        }
    ],
    quiz: [
        { q: ['Which command creates AND applies a new migration in development?', 'أي أمر ينشئ ترحيلًا جديدًا ويطبقه في بيئة التطوير؟'], o: ['`prisma generate`', '`prisma migrate dev`', '`prisma db pull`', '`prisma studio`'], a: 1, e: ['migrate dev diffs the schema, writes SQL and applies it.', 'migrate dev يقارن المخطط ويكتب SQL ويطبقه.'] },
        { q: ['What should production run?', 'ماذا يجب أن ينفذ الإنتاج؟'], o: ['`prisma migrate dev`', '`prisma migrate deploy`', '`prisma db push --force-reset`', '`prisma studio`'], a: 1, e: ['migrate deploy only applies committed migrations, never resets.', 'migrate deploy يطبق الترحيلات المحفوظة فقط ولا يعيد الضبط أبدًا.'] },
        { tf: true, q: ['<code>prisma.$transaction([...])</code> rolls back all operations if one fails.', '<code>prisma.$transaction([...])</code> يتراجع عن كل العمليات إذا فشلت إحداها.'], e: ['All-or-nothing semantics.', 'إما الكل أو لا شيء.'] },
        { q: ['Money transfers between accounts are best stored in…', 'التحويلات المالية بين الحسابات تُخزن بشكل أفضل في…'], o: [['A relational DB with transactions', 'قاعدة علائقية مع معاملات'], ['localStorage', 'localStorage'], ['A JSON file', 'ملف JSON'], ['Redis only', 'Redis فقط']], a: 0, e: ['Strong consistency and ACID transactions matter most here.', 'الاتساق القوي ومعاملات ACID هي الأهم هنا.'] }
    ]
});

DECK.chapters.push({
    n: 16, level: 2, icon: '✅',
    t: ['Validation with Zod', 'التحقق باستخدام Zod'],
    sub: ['Schemas for body / params / query, a reusable middleware, Joi & express-validator', 'مخططات للجسم والمعاملات والاستعلام، وسيط قابل لإعادة الاستخدام، Joi و express-validator'],
    project: ['Every Tasky route validates its input with Zod before touching the service.', 'كل مسار في Tasky يتحقق من مدخلاته بـ Zod قبل الوصول إلى الخدمة.'],
    learn: [
        ['Never trust client input', 'لا تثق أبدًا بمدخلات العميل'],
        ['Write Zod schemas that also coerce and set defaults', 'اكتب مخططات Zod تحوّل الأنواع وتضبط القيم الافتراضية'],
        ['Build one validate() middleware for all routes', 'ابنِ وسيط validate() واحدًا لكل المسارات']
    ],
    slides: [
        {
            kind: 'code', t: ['Schemas for Tasky', 'مخططات Tasky'],
            b: [{ cols: [
                [{ term: 'npm install zod' },
                 { code: `import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\\d]{24}$/i, 'Invalid id');

export const taskIdParams = z.object({ id: objectId });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
});

// strictObject → unknown keys (owner, _id…) are rejected
export const updateTaskSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(120).optional(),
    done: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional(),
    tags: z.array(z.string().trim().min(1)).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Send at least one field');

export const listTasksQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  done: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  sort: z.string().default('-createdAt'),
  q: z.string().trim().optional(),
});`, file: 'src/schemas/task.schema.js', hl: '15,26', x: 'api' }],
                [{ code: `// Validates req.body / req.params / req.query.
// Express 5: req.query is read-only, so parsed data goes to req.valid.
export const validate = (schemas) => (req, res, next) => {
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key] ?? {});
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.') || key,
          message: i.message,
        })),
      });
    }
    req.valid = { ...req.valid, [key]: result.data };
  }
  next();
};`, file: 'src/middlewares/validate.js', hl: '6,15', x: 'api' },
                 { code: `router.post('/', validate({ body: createTaskSchema }), ctrl.create);

// in the controller: only validated, typed data
const task = await service.createTask(req.user, req.valid.body);`, file: 'usage.js' }]
            ] }]
        },
        {
            kind: 'code', t: ['What the client sees', 'ما يراه العميل'],
            b: [{ cols: [
                [{ term: `curl -X POST localhost:3000/api/tasks \\
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
  -d '{"title":"","priority":"urgent","owner":"hacker"}'`, out: `400 Bad Request
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required" },
    { "field": "priority", "message": "Invalid option: expected one of \\"low\\"|\\"medium\\"|\\"high\\"" }
  ]
}` },
                 { p: ['<code>owner</code> is silently dropped by <code>z.object</code> (it strips unknown keys). With <code>z.strictObject</code> it would be rejected instead.', 'الحقل <code>owner</code> يُحذف بصمت بواسطة <code>z.object</code> (يحذف المفاتيح غير المعروفة). ومع <code>z.strictObject</code> سيُرفض بدلًا من ذلك.'] }],
                [{ table: { h: ['', 'Zod', 'Joi', 'express-validator'], r: [
                    [['Style', 'الأسلوب'], ['Schema, TS-first', 'مخطط، TS أولًا'], ['Schema', 'مخطط'], ['Middleware chain', 'سلسلة وسائط']],
                    [['Type inference', 'استنتاج الأنواع'], '✅ <code>z.infer</code>', '❌', '❌'],
                    [['Reuse on frontend', 'إعادة الاستخدام في الواجهة'], '✅', '⚠️', '❌'],
                    [['Example', 'مثال'], '<code>z.email()</code>', '<code>Joi.string().email()</code>', '<code>body(\'email\').isEmail()</code>']
                ] } },
                 { best: ['Validate at the edge (middleware) for shape & types, and in the service for business rules (“due date cannot be in the past for a new task”).', 'تحقق عند الحافة (الوسيط) من الشكل والأنواع، وفي الخدمة من قواعد العمل ("تاريخ الاستحقاق لا يكون في الماضي لمهمة جديدة").'] },
                 { mistake: ['Trusting the frontend’s validation. Anyone can call your API with curl — server-side validation is mandatory.', 'الاعتماد على تحقق الواجهة الأمامية. أي شخص يستطيع استدعاء واجهتك بـ curl — التحقق في الخادم إلزامي.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Validate everything', 'تحقق من كل شيء'],
            b: [{ tasks: [
                ['Add <code>validate()</code> to every Tasky task route (params, query, body).', 'أضف <code>validate()</code> لكل مسارات المهام في Tasky (المعاملات، الاستعلام، الجسم).'],
                ['Make <code>dueDate</code> reject dates in the past using <code>.refine()</code>.', 'اجعل <code>dueDate</code> يرفض التواريخ الماضية باستخدام <code>.refine()</code>.'],
                ['Send <code>?limit=500</code> and <code>?page=abc</code> — check the errors are clear.', 'أرسل <code>?limit=500</code> و <code>?page=abc</code> — تأكد أن الأخطاء واضحة.'],
                ['Bonus: export <code>type CreateTask = z.infer&lt;typeof createTaskSchema&gt;</code> in a <code>.d.ts</code> or TS file.', 'إضافي: صدّر <code>type CreateTask = z.infer&lt;typeof createTaskSchema&gt;</code> في ملف <code>.d.ts</code> أو TS.']
            ], time: 15 }]
        }
    ],
    quiz: [
        { out: true, q: ['What does this produce for <code>{ page: "3" }</code>?', 'ماذا ينتج عند <code>{ page: "3" }</code>؟'], code: `z.object({ page: z.coerce.number().default(1) }).parse({ page: '3' })`, o: ["`{ page: '3' }`", '`{ page: 3 }`', '`{ page: 1 }`', ['throws', 'يرمي خطأ']], a: 1, e: ['coerce converts the string to a number.', 'coerce يحوّل النص إلى رقم.'] },
        { q: ['Why do we store parsed data in <code>req.valid</code> instead of <code>req.query</code>?', 'لماذا نحفظ البيانات المحللة في <code>req.valid</code> بدل <code>req.query</code>؟'], o: [['Zod requires it', 'Zod يتطلب ذلك'], ['In Express 5 req.query is a read-only getter', 'في Express 5 يكون req.query للقراءة فقط'], ['For speed', 'للسرعة'], ['It is a convention only', 'مجرد اصطلاح']], a: 1, e: ['Assigning req.query throws in Express 5.', 'الإسناد إلى req.query يرمي خطأ في Express 5.'] },
        { tf: true, q: ['<code>z.object()</code> strips unknown keys by default; <code>z.strictObject()</code> rejects them.', '<code>z.object()</code> يحذف المفاتيح غير المعروفة افتراضيًا؛ و <code>z.strictObject()</code> يرفضها.'], e: ['Both protect against mass assignment, in different ways.', 'كلاهما يحمي من الإسناد الجماعي بطرق مختلفة.'] },
        { q: ['Which status for a validation error?', 'أي رمز لخطأ التحقق؟'], o: ['500', '400 / 422', '401', '302'], a: 1, e: ['Client sent invalid data → 400 (some APIs use 422).', 'العميل أرسل بيانات غير صالحة ← 400 (بعض الواجهات تستخدم 422).'] },
        { q: ['Where should “a user can have at most 100 open tasks” be checked?', 'أين يجب التحقق من "المستخدم يملك 100 مهمة مفتوحة كحد أقصى"؟'], o: [['Zod schema', 'مخطط Zod'], ['Service layer (needs DB)', 'طبقة الخدمات (تحتاج قاعدة البيانات)'], ['Frontend only', 'الواجهة فقط'], ['Nginx', 'Nginx']], a: 1, e: ['It is a business rule that requires data → service.', 'إنها قاعدة عمل تحتاج بيانات ← الخدمة.'] }
    ]
});

DECK.chapters.push({
    n: 17, level: 2, icon: '🚨',
    t: ['Error handling', 'معالجة الأخطاء'],
    sub: ['Custom error classes, async errors, 404 and one global error middleware', 'أصناف أخطاء مخصصة، الأخطاء غير المتزامنة، 404 ووسيط أخطاء عام واحد'],
    project: ['Tasky answers every error with the same JSON shape and never leaks stack traces in production.', 'يرد Tasky على كل خطأ بنفس شكل JSON ولا يسرّب تفاصيل الأخطاء في الإنتاج.'],
    learn: [
        ['Throw meaningful errors from any layer', 'ارمِ أخطاء ذات معنى من أي طبقة'],
        ['Understand async errors in Express 4 vs 5', 'افهم الأخطاء غير المتزامنة في Express 4 مقابل 5'],
        ['Centralise formatting, logging and status codes', 'اجعل التنسيق والتسجيل ورموز الحالة مركزية']
    ],
    slides: [
        {
            kind: 'code', t: ['AppError + 404 + global handler', 'AppError و 404 والمعالج العام'],
            b: [{ cols: [
                [{ code: `export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(msg = 'Bad request', details) { return new AppError(msg, 400, details); }
  static unauthorized(msg = 'Unauthorized') { return new AppError(msg, 401); }
  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403); }
  static notFound(msg = 'Not found') { return new AppError(msg, 404); }
  static conflict(msg = 'Conflict') { return new AppError(msg, 409); }
}`, file: 'src/utils/AppError.js', x: 'api' },
                 { code: `import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(AppError.notFound(\`Route \${req.method} \${req.originalUrl} not found\`));
}`, file: 'src/middlewares/notFound.js', x: 'api' }],
                [{ code: `import { AppError } from '../utils/AppError.js';

// translate library errors into AppErrors
function normalize(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') return AppError.badRequest('Malformed JSON body');
  if (err.type === 'entity.too.large') return new AppError('Payload too large', 413);
  if (err.name === 'CastError') return AppError.badRequest(\`Invalid \${err.path}: \${err.value}\`);
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return AppError.badRequest('Validation failed', details);
  }
  if (err.code === 11000) return AppError.conflict(\`Duplicate \${Object.keys(err.keyValue)}\`);
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return AppError.unauthorized('Invalid or expired token');
  }
  return new AppError('Internal server error', 500);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);        // let Express close the socket
  const error = normalize(err);
  if (error.statusCode >= 500) console.error(err);  // log real bugs
  res.status(error.statusCode).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && error.statusCode >= 500 && { stack: err.stack }),
  });
}`, file: 'src/middlewares/error.js', hl: '20,22-24', x: 'api' }]
            ] }]
        },
        {
            kind: 'concept', t: ['Async errors: Express 4 vs Express 5', 'الأخطاء غير المتزامنة: Express 4 مقابل 5'],
            b: [
                { cols: [
                    [{ code: `// Express 4: a rejected promise is NOT caught
app.get('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id); // throws CastError
  res.json(task);
}); // → unhandled rejection, request hangs

// fix in Express 4: wrap every async handler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/tasks/:id', asyncHandler(async (req, res) => { /* … */ }));`, file: 'express4.js', hl: '7-8' }],
                    [{ code: `// Express 5: rejected promises go to next(err) automatically
app.get('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw AppError.notFound('Task not found');
  res.json(task);
});

// so services can simply throw:
export async function getTask(id) {
  const task = await Task.findById(id);
  if (!task) throw AppError.notFound('Task not found');
  return task;
}`, file: 'express5.js', hl: '4,11' }]
                ] },
                { code: `import express from 'express';
import tasksRouter from './routes/tasks.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/error.js';

const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);

app.use(notFound);       // after all routes
app.use(errorHandler);   // always the very last
export default app;`, file: 'src/app.js', hl: '10-11' },
                { best: ['Throw <code>AppError</code>s in services; let the global handler decide the response. One error format for the whole API: <code>{ error, details? }</code>.', 'ارمِ <code>AppError</code> في الخدمات؛ ودع المعالج العام يقرر الاستجابة. شكل خطأ واحد لكل الواجهة: <code>{ error, details? }</code>.'] }
            ]
        },
        {
            kind: 'mistakes', t: ['Error-handling anti-patterns', 'أنماط خاطئة في معالجة الأخطاء'],
            b: [{ cols: [
                [{ mistake: ['<b>Swallowing errors</b>: <code>catch (e) {}</code> — the bug disappears from logs and the client gets nothing.', '<b>ابتلاع الأخطاء</b>: <code>catch (e) {}</code> — يختفي الخطأ من السجلات ولا يحصل العميل على شيء.'] },
                 { mistake: ['<b>Leaking internals</b>: sending <code>err.stack</code> or SQL messages to clients in production.', '<b>تسريب التفاصيل الداخلية</b>: إرسال <code>err.stack</code> أو رسائل SQL للعملاء في الإنتاج.'] },
                 { mistake: ['<b>try/catch in every controller</b> that formats its own error — inconsistent responses.', '<b>try/catch في كل متحكم</b> ينسّق خطأه بنفسه — استجابات غير متسقة.'] }],
                [{ mistake: ['<b>Error handler with 3 params</b> <code>(err, req, res)</code> — Express treats it as normal middleware.', '<b>معالج أخطاء بثلاثة معاملات</b> <code>(err, req, res)</code> — يعامله Express كوسيط عادي.'] },
                 { best: ['Crash on <b>programmer errors</b> you cannot recover from (<code>process.on(\'uncaughtException\')</code> → log → exit), and let PM2/Docker restart you. Chapter 33.', 'أوقف التطبيق عند <b>أخطاء المبرمج</b> غير القابلة للتعافي (<code>process.on(\'uncaughtException\')</code> ← سجّل ← اخرج) ودع PM2/Docker يعيد التشغيل. الفصل 33.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Centralise Tasky’s errors', 'اجعل أخطاء Tasky مركزية'],
            b: [{ tasks: [
                ['Add <code>AppError</code>, <code>notFound</code> and <code>errorHandler</code>; delete every manual <code>res.status(404)</code> in controllers.', 'أضف <code>AppError</code> و <code>notFound</code> و <code>errorHandler</code>؛ واحذف كل <code>res.status(404)</code> اليدوية في المتحكمات.'],
                ['Make the service throw <code>AppError.notFound()</code>.', 'اجعل الخدمة ترمي <code>AppError.notFound()</code>.'],
                ['Test: invalid ObjectId → 400, unknown route → 404, malformed JSON → 400, <code>throw new Error(\'x\')</code> → 500 without stack in production.', 'اختبر: ObjectId غير صالح ← 400، مسار غير معروف ← 404، JSON مشوّه ← 400، و <code>throw new Error(\'x\')</code> ← 500 بلا تفاصيل في الإنتاج.'],
                ['Add a <code>requestId</code> to every error response (from chapter 9’s middleware).', 'أضف <code>requestId</code> لكل استجابة خطأ (من وسيط الفصل 9).']
            ], time: 15 }]
        }
    ],
    quiz: [
        { tf: true, q: ['In Express 5, an error thrown inside an async route handler reaches the error middleware automatically.', 'في Express 5 يصل الخطأ المرمي داخل معالج مسار غير متزامن إلى وسيط الأخطاء تلقائيًا.'], e: ['Express 5 handles rejected promises; Express 4 needed a wrapper.', 'Express 5 يعالج الوعود المرفوضة؛ وكان Express 4 يحتاج غلافًا.'] },
        { q: ['How many parameters must an error handler declare?', 'كم معاملًا يجب أن يعرّف معالج الأخطاء؟'], o: ['2', '3', '4', '5'], a: 2, e: ['(err, req, res, next).', '(err, req, res, next).'] },
        { out: true, q: ['Request <code>GET /api/tasks/abc</code> with the handler above (Mongoose). Status?', 'الطلب <code>GET /api/tasks/abc</code> مع المعالج أعلاه (Mongoose). ما الرمز؟'], o: ['200', '400', '404', '500'], a: 1, e: ['CastError → normalize → AppError.badRequest → 400.', 'CastError ← normalize ← AppError.badRequest ← 400.'] },
        { q: ['Where must the 404 handler be registered?', 'أين يجب تسجيل معالج 404؟'], o: [['Before routes', 'قبل المسارات'], ['After routes, before the error handler', 'بعد المسارات وقبل معالج الأخطاء'], ['After the error handler', 'بعد معالج الأخطاء'], ['Anywhere', 'في أي مكان']], a: 1, e: ['It catches what no route matched, then forwards to the error handler.', 'يلتقط ما لم يطابقه أي مسار ثم يمرره لمعالج الأخطاء.'] },
        { q: ['What should a 500 response contain in production?', 'ماذا يجب أن تحتوي استجابة 500 في الإنتاج؟'], o: [['The stack trace', 'تفاصيل الخطأ (stack)'], ['The SQL query', 'استعلام SQL'], ['A generic message (+ request id)', 'رسالة عامة (+ معرّف الطلب)'], ['Environment variables', 'متغيرات البيئة']], a: 2, e: ['Log details server-side; give clients a generic message.', 'سجّل التفاصيل في الخادم؛ وأعطِ العميل رسالة عامة.'] }
    ]
});

DECK.chapters.push({
    n: 18, level: 2, icon: '🔐',
    t: ['Authentication', 'المصادقة'],
    sub: ['Password hashing, JWT access + refresh tokens, httpOnly cookies', 'تجزئة كلمات المرور، رموز JWT للوصول والتحديث، وكوكيز httpOnly'],
    project: ['Tasky gets register / login / refresh / logout / me endpoints.', 'يحصل Tasky على نقاط register / login / refresh / logout / me.'],
    learn: [
        ['Hash passwords with bcrypt (or argon2) — never store them', 'جزّئ كلمات المرور بـ bcrypt (أو argon2) — لا تخزنها أبدًا'],
        ['Issue short-lived access tokens and long-lived refresh tokens', 'أصدر رموز وصول قصيرة العمر ورموز تحديث طويلة العمر'],
        ['Protect routes with an authenticate middleware', 'احمِ المسارات بوسيط authenticate']
    ],
    slides: [
        {
            kind: 'concept', t: ['The JWT auth flow', 'مسار المصادقة بـ JWT'],
            b: [
                { diagram: 'auth', cap: ['Access token (15 min) in memory → sent as Bearer header. Refresh token (7 days) in an httpOnly cookie → only used on /auth/refresh.', 'رمز الوصول (15 دقيقة) في الذاكرة ← يُرسل في ترويسة Bearer. ورمز التحديث (7 أيام) في كوكي httpOnly ← يُستخدم فقط في ‎/auth/refresh.'] },
                { cols: [
                    [{ code: `eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiI2NjUw…Iiwicm9sZSI6InVzZXIifQ . 4fK…sig
└──── header ──────┘   └──────────── payload (base64, NOT encrypted) ─┘   └ signature ┘`, file: 'JWT anatomy', lang: 'text', nonum: true }],
                    [{ warn: ['A JWT is <b>signed, not encrypted</b>: anyone can read the payload. Never put passwords or secrets in it — just <code>sub</code> (user id) and <code>role</code>.', 'رمز JWT <b>موقّع وليس مشفرًا</b>: أي شخص يستطيع قراءة محتواه. لا تضع فيه كلمات مرور أو أسرارًا — فقط <code>sub</code> (معرّف المستخدم) و <code>role</code>.'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['User model, tokens & auth service', 'نموذج المستخدم والرموز وخدمة المصادقة'],
            b: [
                { term: 'npm install bcrypt jsonwebtoken cookie-parser' },
                { cols: [
                    [{ code: `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // bcrypt hash
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

// never send the hash to clients
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);`, file: 'src/models/user.model.js', hl: '7,14', x: 'api' },
                     { code: `import jwt from 'jsonwebtoken';

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);`, file: 'src/utils/tokens.js', x: 'api' }],
                    [{ code: `import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

export async function register({ name, email, password }) {
  if (await User.exists({ email })) throw AppError.conflict('Email already registered');
  const hash = await bcrypt.hash(password, 12);          // 12 salt rounds
  return User.create({ name, email, password: hash });
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // same message for "no user" and "wrong password" → no user enumeration
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw AppError.unauthorized('Invalid email or password');
  }
  return user;
}`, file: 'src/services/auth.service.js', hl: '7,12-15', x: 'api' },
                     { code: `import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.email().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});`, file: 'src/schemas/auth.schema.js', x: 'api' },
                     { code: `JWT_ACCESS_SECRET=generate-a-long-random-string
JWT_REFRESH_SECRET=another-different-long-random-string
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, file: '.env' }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['Controller, routes & authenticate middleware', 'المتحكم والمسارات ووسيط authenticate'],
            b: [{ cols: [
                [{ code: `import * as auth from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

const refreshCookie = {
  httpOnly: true,                                   // JS cannot read it (XSS)
  secure: process.env.NODE_ENV === 'production',    // HTTPS only
  sameSite: 'strict',                               // CSRF protection
  path: '/api/auth',                                // sent only to auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sendTokens(res, user, status = 200) {
  res.cookie('refreshToken', signRefreshToken(user), refreshCookie);
  res.status(status).json({ user, accessToken: signAccessToken(user) });
}

export async function register(req, res) {
  sendTokens(res, await auth.register(req.valid.body), 201);
}

export async function login(req, res) {
  sendTokens(res, await auth.login(req.valid.body));
}

export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) throw AppError.unauthorized('No refresh token');
  const { sub } = verifyRefreshToken(token);
  const user = await User.findById(sub);
  if (!user) throw AppError.unauthorized('User no longer exists');
  sendTokens(res, user);
}

export function logout(req, res) {
  res.clearCookie('refreshToken', refreshCookie);
  res.sendStatus(204);
}

export async function me(req, res) {
  res.json(await User.findById(req.user.id));
}`, file: 'src/controllers/auth.controller.js', hl: '7-10', x: 'api' }],
                [{ code: `import { verifyAccessToken } from '../utils/tokens.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw AppError.unauthorized('Missing Bearer token');
  const payload = verifyAccessToken(token);   // throws → error handler → 401
  req.user = { id: payload.sub, role: payload.role };
  next();
}`, file: 'src/middlewares/auth.js', hl: '7-8', x: 'api' },
                 { code: `import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), ctrl.register);
router.post('/login', validate({ body: loginSchema }), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);

export default router;`, file: 'src/routes/auth.routes.js', x: 'api' },
                 { term: `curl -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" \\
  -d '{"name":"Sara","email":"sara@tasky.dev","password":"supersecret"}'`, out: `201 Created
Set-Cookie: refreshToken=eyJ…; Path=/api/auth; HttpOnly; SameSite=Strict
{"user":{"name":"Sara","email":"sara@tasky.dev","role":"user","_id":"…"},"accessToken":"eyJ…"}` }]
            ] }]
        },
        {
            kind: 'concept', t: ['Where to store tokens? Sessions vs JWT', 'أين نخزن الرموز؟ الجلسات مقابل JWT'],
            b: [
                { table: { h: ['', ['Server sessions', 'جلسات الخادم'], ['JWT (stateless)', 'JWT (عديم الحالة)']], r: [
                    [['State', 'الحالة'], ['Stored in Redis/DB, cookie holds an id', 'مخزنة في Redis/DB والكوكي يحمل معرّفًا'], ['Self-contained signed token', 'رمز موقّع مكتفٍ بذاته']],
                    [['Revoke instantly', 'الإلغاء الفوري'], '✅', ['⚠️ needs a denylist or short expiry', '⚠️ يحتاج قائمة حظر أو عمرًا قصيرًا']],
                    [['Scales across servers', 'التوسع عبر الخوادم'], ['needs shared store', 'يحتاج مخزنًا مشتركًا'], '✅'],
                    [['Best for', 'الأفضل لـ'], ['Classic web apps (same domain)', 'تطبيقات الويب الكلاسيكية (نفس النطاق)'], ['SPAs, mobile apps, microservices', 'تطبيقات SPA والجوال والخدمات المصغرة']]
                ] } },
                { cols: [
                    [{ best: ['Access token in <b>memory</b> (JS variable), refresh token in an <b>httpOnly, Secure, SameSite</b> cookie. Rotate the refresh token on every use.', 'رمز الوصول في <b>الذاكرة</b> (متغير JS)، ورمز التحديث في كوكي <b>httpOnly و Secure و SameSite</b>. بدّل رمز التحديث عند كل استخدام.'] }],
                    [{ mistake: ['Storing tokens in <code>localStorage</code>: any XSS script can steal them. Using one long-lived token with no refresh/revoke strategy.', 'تخزين الرموز في <code>localStorage</code>: أي سكربت XSS يستطيع سرقتها. واستخدام رمز واحد طويل العمر بلا استراتيجية تحديث/إلغاء.'] }]
                ] },
                { tip: ['bcrypt cost 12 ≈ 250 ms per hash: slow on purpose. <b>argon2id</b> (<code>npm i argon2</code>) is the modern winner of the Password Hashing Competition — same API idea: <code>argon2.hash()</code> / <code>argon2.verify()</code>.', 'تكلفة bcrypt 12 ≈ 250ms لكل تجزئة: بطيئة عمدًا. و <b>argon2id</b> (<code>npm i argon2</code>) هو الفائز الحديث في مسابقة تجزئة كلمات المرور — بنفس الفكرة: <code>argon2.hash()</code> / <code>argon2.verify()</code>.'] }
            ]
        },
        {
            kind: 'exercise', t: ['Secure Tasky', 'أمّن Tasky'],
            b: [{ tasks: [
                ['Implement register / login / me. Store the access token from login in a shell variable and call <code>/me</code>.', 'نفّذ register / login / me. احفظ رمز الوصول من login في متغير طرفية واستدعِ <code>/me</code>.'],
                ['Use <code>curl -c cookies.txt</code> on login and <code>curl -b cookies.txt -X POST …/refresh</code> to get a new access token.', 'استخدم <code>curl -c cookies.txt</code> عند الدخول و <code>curl -b cookies.txt -X POST …/refresh</code> للحصول على رمز وصول جديد.'],
                ['Decode your token on jwt.io — what can you read? What can’t you change?', 'فك رمزك في jwt.io — ماذا تستطيع أن تقرأ؟ وماذا لا تستطيع أن تغير؟'],
                ['Bonus: refresh-token rotation — store a <code>tokenVersion</code> on the user and increment it on logout.', 'إضافي: تدوير رمز التحديث — خزّن <code>tokenVersion</code> في المستخدم وزِده عند الخروج.']
            ], time: 25 }]
        }
    ],
    quiz: [
        { q: ['How should passwords be stored?', 'كيف يجب تخزين كلمات المرور؟'], o: [['Plain text', 'نص عادي'], ['Encrypted with AES', 'مشفرة بـ AES'], ['Hashed with bcrypt/argon2 (salted, slow)', 'مجزأة بـ bcrypt/argon2 (مع ملح وبطيئة)'], ['Base64', 'Base64']], a: 2, e: ['Hashing is one-way; encryption can be reversed if the key leaks.', 'التجزئة باتجاه واحد؛ والتشفير يمكن عكسه إذا تسرب المفتاح.'] },
        { tf: false, q: ['The payload of a JWT is encrypted, so it is safe to store the password in it.', 'محتوى JWT مشفر، لذا من الآمن تخزين كلمة المرور فيه.'], e: ['It is only base64-encoded and signed. Anyone can read it.', 'إنه مرمّز base64 وموقّع فقط. أي شخص يستطيع قراءته.'] },
        { q: ['Why return the same message for “unknown email” and “wrong password”?', 'لماذا نعيد نفس الرسالة لـ "بريد غير معروف" و"كلمة مرور خاطئة"؟'], o: [['Less code', 'كود أقل'], ['To prevent user enumeration', 'لمنع كشف المستخدمين الموجودين'], ['Express requires it', 'Express يتطلب ذلك'], ['Speed', 'السرعة']], a: 1, e: ['Attackers could otherwise discover which emails are registered.', 'وإلا يستطيع المهاجم معرفة البريدات المسجلة.'] },
        { q: ['Which cookie flag stops JavaScript from reading the refresh token?', 'أي خاصية للكوكي تمنع JavaScript من قراءة رمز التحديث؟'], o: ['`secure`', '`httpOnly`', '`sameSite`', '`path`'], a: 1, e: ['httpOnly hides it from document.cookie (XSS protection).', 'httpOnly يخفيه عن document.cookie (حماية من XSS).'] },
        { q: ['Typical lifetime for an access token?', 'العمر المعتاد لرمز الوصول؟'], o: [['5–15 minutes', '5–15 دقيقة'], ['1 year', 'سنة'], ['Forever', 'للأبد'], ['1 second', 'ثانية']], a: 0, e: ['Short-lived limits damage if stolen; the refresh token renews it.', 'العمر القصير يحد من الضرر عند السرقة؛ ورمز التحديث يجدده.'] }
    ]
});

DECK.chapters.push({
    n: 19, level: 2, icon: '🛂',
    t: ['Authorization & RBAC', 'التفويض والأدوار (RBAC)'],
    sub: ['Roles and permissions, protecting routes, and ownership checks', 'الأدوار والصلاحيات، حماية المسارات، والتحقق من الملكية'],
    project: ['Users see only their own tasks; admins see everything and can list users.', 'المستخدمون يرون مهامهم فقط؛ والمدير يرى كل شيء ويستطيع عرض المستخدمين.'],
    learn: [
        ['Separate authentication (who) from authorization (what)', 'افصل المصادقة (من) عن التفويض (ماذا)'],
        ['Write an authorize(...roles) middleware', 'اكتب وسيط authorize(...roles)'],
        ['Check ownership in the service layer', 'تحقق من الملكية في طبقة الخدمات']
    ],
    slides: [
        {
            kind: 'code', t: ['Roles, permissions & authorize()', 'الأدوار والصلاحيات و authorize()'],
            b: [{ cols: [
                [{ code: `import { AppError } from '../utils/AppError.js';

// role-based: authorize('admin')
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    throw AppError.forbidden('You do not have permission to do this');
  }
  next();
};`, file: 'src/middlewares/authorize.js', x: 'api' },
                 { code: `// permission-based: scales better than roles
const PERMISSIONS = {
  user: ['task:read:own', 'task:write:own'],
  manager: ['task:read:any', 'task:write:own'],
  admin: ['task:read:any', 'task:write:any', 'user:read'],
};

export const can = (permission) => (req, res, next) => {
  if (!PERMISSIONS[req.user.role]?.includes(permission)) {
    throw AppError.forbidden();
  }
  next();
};

router.get('/admin/users', authenticate, can('user:read'), listUsers);`, file: 'permissions.js' }],
                [{ table: { h: [['Status', 'الرمز'], ['Meaning', 'المعنى']], r: [
                    ['<b>401</b> Unauthorized', ['Not logged in / bad token → “who are you?”', 'غير مسجّل / رمز خاطئ ← "من أنت؟"']],
                    ['<b>403</b> Forbidden', ['Logged in but not allowed → “I know you, but no”', 'مسجّل لكن غير مسموح ← "أعرفك، لكن لا"']]
                ] } },
                 { code: `import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { User } from '../models/user.model.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  res.json(await User.find().sort('-createdAt'));
});

export default router;`, file: 'src/routes/users.routes.js', hl: '8', x: 'api' },
                 { note: ['Authentication = showing your ID card at the door. Authorization = your badge only opens the rooms you are allowed into.', 'المصادقة = إظهار بطاقة هويتك عند الباب. والتفويض = بطاقتك تفتح فقط الغرف المسموح لك بدخولها.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Ownership: the check most APIs forget', 'الملكية: التحقق الذي تنساه معظم الواجهات'],
            b: [{ cols: [
                [{ code: `import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    tags: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

taskSchema.index({ owner: 1, done: 1, createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);`, file: 'src/models/task.model.js', hl: '10,15', x: 'api' },
                 { code: `import { Router } from 'express';
import * as ctrl from '../controllers/tasks.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema, updateTaskSchema, taskIdParams, listTasksQuery,
} from '../schemas/task.schema.js';

const router = Router();
router.use(authenticate);                // every task route needs a user

router.get('/', validate({ query: listTasksQuery }), ctrl.list);
router.post('/', validate({ body: createTaskSchema }), ctrl.create);
router.get('/:id', validate({ params: taskIdParams }), ctrl.getOne);
router.patch('/:id', validate({ params: taskIdParams, body: updateTaskSchema }), ctrl.update);
router.delete('/:id', validate({ params: taskIdParams }), ctrl.remove);

export default router;`, file: 'src/routes/tasks.routes.js', hl: '10', x: 'api' }],
                [{ code: `import { Task } from '../models/task.model.js';
import { AppError } from '../utils/AppError.js';

const canAccess = (user, task) => user.role === 'admin' || task.owner.equals(user.id);

async function findAccessible(user, id) {
  const task = await Task.findById(id);
  if (!task || !canAccess(user, task)) throw AppError.notFound('Task not found');
  return task;
}

export const listTasks = (user) =>
  Task.find(user.role === 'admin' ? {} : { owner: user.id }).sort('-createdAt').lean();

export const getTask = (user, id) => findAccessible(user, id);

export const createTask = (user, data) => Task.create({ ...data, owner: user.id });

export async function updateTask(user, id, changes) {
  const task = await findAccessible(user, id);
  task.set(changes);
  return task.save();
}

export async function deleteTask(user, id) {
  const task = await findAccessible(user, id);
  await task.deleteOne();
}`, file: 'src/services/tasks.service.js', hl: '4,8,17', x: 'api' },
                 { code: `import * as service from '../services/tasks.service.js';

export async function list(req, res) {
  res.json(await service.listTasks(req.user, req.valid.query));
}
export async function getOne(req, res) {
  res.json(await service.getTask(req.user, req.valid.params.id));
}
export async function create(req, res) {
  const task = await service.createTask(req.user, req.valid.body);
  res.status(201).location(\`/api/tasks/\${task.id}\`).json(task);
}
export async function update(req, res) {
  res.json(await service.updateTask(req.user, req.valid.params.id, req.valid.body));
}
export async function remove(req, res) {
  await service.deleteTask(req.user, req.valid.params.id);
  res.sendStatus(204);
}`, file: 'src/controllers/tasks.controller.js', x: 'api' },
                 { warn: ['<b>IDOR</b> (Insecure Direct Object Reference, OWASP API #1): <code>GET /tasks/:id</code> without an owner check lets anyone read anyone’s data by guessing ids. Answer 404 (not 403) to avoid revealing that the id exists.', '<b>IDOR</b> (المرجع المباشر غير الآمن، OWASP API #1): <code>GET /tasks/:id</code> بدون التحقق من المالك يسمح لأي شخص بقراءة بيانات غيره بتخمين المعرفات. أجب بـ 404 (وليس 403) لكي لا تكشف وجود المعرّف.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Wire Tasky together', 'اربط أجزاء Tasky معًا'],
            b: [{ cols: [
                [{ code: `import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import userRoutes from './routes/users.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/error.js';

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;`, file: 'src/app.js', hl: '15-17', x: 'api' }],
                [{ term: `# Sara creates a task, Omar tries to read it
curl -H "Authorization: Bearer $SARA" localhost:3000/api/tasks/6650f1c2e4b0a1b2c3d4e5f6
curl -H "Authorization: Bearer $OMAR" localhost:3000/api/tasks/6650f1c2e4b0a1b2c3d4e5f6
curl -H "Authorization: Bearer $OMAR" localhost:3000/api/users
curl localhost:3000/api/tasks`, out: `200 {"title":"Sara's task","owner":"…",…}
404 {"error":"Task not found"}
403 {"error":"You do not have permission to do this"}
401 {"error":"Missing Bearer token"}` },
                 { best: ['Test authorization like an attacker: for every endpoint, try (1) no token, (2) another user’s token, (3) a normal user on admin routes. Chapter 26 automates this.', 'اختبر التفويض كمهاجم: لكل نقطة نهاية جرّب (1) بلا رمز، (2) رمز مستخدم آخر، (3) مستخدم عادي على مسارات المدير. الفصل 26 يؤتمت ذلك.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Roles in practice', 'الأدوار عمليًا'],
            b: [{ tasks: [
                ['Register two users. Promote one to admin in MongoDB (<code>db.users.updateOne({email:…},{$set:{role:"admin"}})</code>).', 'سجّل مستخدمين. رقِّ أحدهما إلى مدير في MongoDB (<code>db.users.updateOne({email:…},{$set:{role:"admin"}})</code>).'],
                ['Verify: user A cannot read, update or delete user B’s task (404).', 'تحقق: المستخدم A لا يستطيع قراءة أو تعديل أو حذف مهمة المستخدم B (404).'],
                ['Add a <code>manager</code> role that can read all tasks but only edit its own.', 'أضف دور <code>manager</code> يستطيع قراءة كل المهام لكن يعدّل مهامه فقط.'],
                ['Add <code>PATCH /api/users/:id/role</code> (admin only) with Zod validation.', 'أضف <code>PATCH /api/users/:id/role</code> (للمدير فقط) مع تحقق Zod.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['A logged-in user calls an admin-only route. Status?', 'مستخدم مسجّل يستدعي مسارًا خاصًا بالمدير. ما الرمز؟'], o: ['401', '403', '404', '500'], a: 1, e: ['Identity is known but permission is missing → 403.', 'الهوية معروفة لكن الصلاحية ناقصة ← 403.'] },
        { q: ['What is IDOR?', 'ما هو IDOR؟'], o: [['A database index', 'فهرس في قاعدة البيانات'], ['Accessing objects by id without an ownership check', 'الوصول إلى الكائنات بالمعرّف دون التحقق من الملكية'], ['A JWT algorithm', 'خوارزمية JWT'], ['A Node module', 'وحدة في Node']], a: 1, e: ['OWASP API #1: Broken Object Level Authorization.', 'OWASP API #1: خلل التفويض على مستوى الكائن.'] },
        { out: true, q: ['Which order is correct?', 'أي ترتيب صحيح؟'], o: ["`router.get('/', authorize('admin'), authenticate, h)`", "`router.get('/', authenticate, authorize('admin'), h)`", "`router.get('/', h, authenticate)`", ['Order does not matter', 'الترتيب لا يهم']], a: 1, e: ['authorize needs req.user, which authenticate sets.', 'authorize يحتاج req.user الذي يضبطه authenticate.'] },
        { tf: true, q: ['Returning 404 instead of 403 for someone else’s resource hides whether it exists.', 'إعادة 404 بدل 403 لمورد شخص آخر تخفي ما إذا كان موجودًا.'], e: ['It prevents resource enumeration.', 'هذا يمنع كشف الموارد الموجودة.'] }
    ]
});

DECK.chapters.push({
    n: 20, level: 2, icon: '🎨',
    t: ['Templates, CORS & sessions', 'القوالب و CORS والجلسات'],
    sub: ['EJS server-side rendering (MVC), serving a frontend, CORS, express-session', 'عرض EJS من الخادم (MVC)، تقديم واجهة أمامية، CORS، و express-session'],
    learn: [
        ['Render HTML on the server with EJS', 'اعرض HTML من الخادم باستخدام EJS'],
        ['Allow a frontend on another origin with CORS', 'اسمح لواجهة من مصدر آخر عبر CORS'],
        ['Use cookie sessions for classic web apps', 'استخدم جلسات الكوكيز لتطبيقات الويب الكلاسيكية']
    ],
    slides: [
        {
            kind: 'code', t: ['EJS: the V in MVC', 'EJS: حرف V في MVC'],
            b: [
                { diagram: 'mvc', cap: ['Controller asks the Model for data, then renders a View into HTML.', 'المتحكم يطلب البيانات من النموذج ثم يحوّل العرض إلى HTML.'] },
                { cols: [
                    [{ code: `import express from 'express';
import path from 'node:path';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

app.get('/tasks', async (req, res) => {
  const tasks = [{ title: 'Learn EJS', done: false }, { title: 'Ship it', done: true }];
  res.render('tasks', { title: 'My tasks', tasks });
});

app.listen(3000);`, file: 'server.js', hl: '5,10' }],
                    [{ code: `<!doctype html>
<html>
<head><title><%= title %></title></head>
<body>
  <h1><%= title %></h1>
  <ul>
    <% tasks.forEach((task) => { %>
      <li><%= task.done ? '✅' : '⬜' %> <%= task.title %></li>
    <% }) %>
  </ul>
  <%- include('partials/footer') %>
</body>
</html>`, file: 'views/tasks.ejs', hl: '7-9' },
                     { warn: ['<code>&lt;%= %&gt;</code> escapes HTML (safe). <code>&lt;%- %&gt;</code> outputs raw HTML — only for trusted content like partials, never user input (XSS!).', '<code>&lt;%= %&gt;</code> يهرّب HTML (آمن). و <code>&lt;%- %&gt;</code> يخرج HTML خامًا — فقط لمحتوى موثوق مثل الأجزاء، وليس لمدخلات المستخدم أبدًا (XSS!).'] }]
                ] }
            ]
        },
        {
            kind: 'code', t: ['CORS: letting a frontend call your API', 'CORS: السماح للواجهة باستدعاء واجهتك'],
            b: [{ cols: [
                [{ code: `import cors from 'cors';

const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',');

app.use(cors({
  origin(origin, cb) {
    // allow tools like curl (no Origin header) and listed origins
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(\`Origin \${origin} not allowed by CORS\`));
  },
  credentials: true,                         // allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));`, file: 'src/app.js (cors)', lang: 'js', hl: '8,11' },
                 { code: `// React/Vite frontend on http://localhost:5173
const res = await fetch('http://localhost:3000/api/tasks', {
  credentials: 'include',                       // send cookies
  headers: { Authorization: \`Bearer \${accessToken}\` },
});`, file: 'frontend.js' }],
                [{ ul: [
                    ['CORS is enforced by the <b>browser</b>, not by your server. curl and Postman ignore it.', 'CORS يفرضه <b>المتصفح</b> وليس خادمك. و curl و Postman يتجاهلانه.'],
                    ['An <b>origin</b> = protocol + host + port. <code>localhost:5173</code> ≠ <code>localhost:3000</code>.', '<b>المصدر</b> = البروتوكول + المضيف + المنفذ. <code>localhost:5173</code> ≠ <code>localhost:3000</code>.'],
                    ['Non-simple requests (JSON, Authorization header) trigger a <b>preflight</b> <code>OPTIONS</code> request first — the cors package answers it.', 'الطلبات غير البسيطة (JSON، ترويسة Authorization) تسبب طلب <b>تمهيدي</b> <code>OPTIONS</code> أولًا — وحزمة cors تجيب عليه.']
                ] },
                 { mistake: ['<code>origin: \'*\'</code> together with <code>credentials: true</code> — browsers reject it, and reflecting any origin with cookies is a security hole.', '<code>origin: \'*\'</code> مع <code>credentials: true</code> — المتصفحات ترفضه، وعكس أي مصدر مع الكوكيز ثغرة أمنية.'] },
                 { tip: ['Serving the built frontend from the same Express app (<code>express.static(\'dist\')</code>) avoids CORS entirely — same origin.', 'تقديم الواجهة المبنية من نفس تطبيق Express (<code>express.static(\'dist\')</code>) يتجنب CORS كليًا — نفس المصدر.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Sessions with express-session', 'الجلسات مع express-session'],
            b: [{ cols: [
                [{ code: `import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.set('trust proxy', 1);                  // behind Nginx (chapter 38)
app.use(session({
  store: new RedisStore({ client: redis }), // MemoryStore leaks in production!
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
}));

app.post('/login', async (req, res) => {
  const user = await auth.login(req.body);
  req.session.regenerate((err) => {          // prevent session fixation
    if (err) throw err;
    req.session.userId = user.id;
    res.redirect('/dashboard');
  });
});

app.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));`, file: 'session.js', hl: '10,19' }],
                [{ best: ['Choose <b>sessions</b> for a server-rendered app on one domain (simple, instantly revocable). Choose <b>JWT</b> for SPAs/mobile/multiple services.', 'اختر <b>الجلسات</b> لتطبيق يُعرض من الخادم على نطاق واحد (بسيط وقابل للإلغاء فورًا). واختر <b>JWT</b> لتطبيقات SPA والجوال والخدمات المتعددة.'] },
                 { warn: ['The default <code>MemoryStore</code> leaks memory and loses sessions on restart. Use Redis (or a DB store) in production.', '<code>MemoryStore</code> الافتراضي يسرّب الذاكرة ويفقد الجلسات عند إعادة التشغيل. استخدم Redis (أو مخزن قاعدة بيانات) في الإنتاج.'] },
                 { term: 'npm install ejs cors express-session connect-redis redis' }]
            ] }]
        },
        {
            kind: 'exercise', t: ['A tiny Tasky dashboard', 'لوحة Tasky صغيرة'],
            b: [{ tasks: [
                ['Render <code>GET /dashboard</code> with EJS listing tasks from MongoDB, with a partial for header/footer.', 'اعرض <code>GET /dashboard</code> بـ EJS يسرد المهام من MongoDB، مع جزء للرأس والتذييل.'],
                ['Create a Vite app on port 5173 that fetches <code>/api/tasks</code> — see the CORS error, then fix it with the config above.', 'أنشئ تطبيق Vite على المنفذ 5173 يجلب <code>/api/tasks</code> — شاهد خطأ CORS ثم أصلحه بالإعداد أعلاه.'],
                ['Open DevTools → Network and find the preflight <code>OPTIONS</code> request.', 'افتح أدوات المطور ← Network وجد طلب <code>OPTIONS</code> التمهيدي.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['Which EJS tag safely escapes user content?', 'أي وسم EJS يهرّب محتوى المستخدم بأمان؟'], o: ['`<%- %>`', '`<%= %>`', '`<% %>`', '`<%# %>`'], a: 1, e: ['<%= escapes; <%- outputs raw HTML.', '‎<%= يهرّب؛ و ‎<%- يخرج HTML خامًا.'] },
        { tf: true, q: ['CORS is enforced by browsers; curl ignores it.', 'CORS يفرضه المتصفح؛ و curl يتجاهله.'], e: ['It protects users in browsers, not your server from scripts.', 'إنه يحمي المستخدمين في المتصفحات، ولا يحمي خادمك من السكربتات.'] },
        { q: ['A fetch with JSON body and Authorization header first sends…', 'طلب fetch بجسم JSON وترويسة Authorization يرسل أولًا…'], o: ['`HEAD`', ['A preflight OPTIONS request', 'طلبًا تمهيديًا OPTIONS'], '`TRACE`', ['Nothing extra', 'لا شيء إضافي']], a: 1, e: ['Non-simple requests require a preflight.', 'الطلبات غير البسيطة تتطلب طلبًا تمهيديًا.'] },
        { q: ['Why call <code>req.session.regenerate()</code> after login?', 'لماذا نستدعي <code>req.session.regenerate()</code> بعد الدخول؟'], o: [['To log out', 'للخروج'], ['To prevent session fixation', 'لمنع تثبيت الجلسة (session fixation)'], ['For speed', 'للسرعة'], ['To clear cookies', 'لمسح الكوكيز']], a: 1, e: ['A new session id after privilege change defeats fixation attacks.', 'معرّف جلسة جديد بعد تغيير الصلاحيات يُفشل هجمات التثبيت.'] }
    ]
});

DECK.chapters.push({
    n: 21, level: 2, icon: '📎',
    t: ['File uploads', 'رفع الملفات'],
    sub: ['Multer, validation, limits and cloud storage (S3 / Cloudinary)', 'Multer، التحقق، الحدود والتخزين السحابي (S3 / Cloudinary)'],
    project: ['Tasks can have attachments (images / PDF, max 5 MB).', 'يمكن للمهام أن تحمل مرفقات (صور / PDF، حتى 5MB).'],
    learn: [
        ['Receive multipart/form-data with Multer', 'استقبل multipart/form-data باستخدام Multer'],
        ['Validate type and size, rename files safely', 'تحقق من النوع والحجم وأعد تسمية الملفات بأمان'],
        ['Send files to cloud storage instead of local disk', 'أرسل الملفات إلى تخزين سحابي بدل القرص المحلي']
    ],
    slides: [
        {
            kind: 'code', t: ['Multer: disk storage with validation', 'Multer: تخزين على القرص مع تحقق'],
            b: [{ cols: [
                [{ term: 'npm install multer' },
                 { code: `import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppError } from '../utils/AppError.js';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // never trust the original name → random + safe extension
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, \`\${crypto.randomUUID()}\${ext}\`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },   // 5 MB, max 3 files
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(AppError.badRequest(\`File type \${file.mimetype} not allowed\`));
  },
});`, file: 'src/middlewares/upload.js', hl: '13,19,21' }],
                [{ code: `router.post(
  '/:id/attachments',
  validate({ params: taskIdParams }),
  upload.array('files', 3),            // field name "files"
  async (req, res) => {
    const files = req.files.map((f) => ({
      url: \`/uploads/\${f.filename}\`, size: f.size, type: f.mimetype,
    }));
    const task = await service.addAttachments(req.user, req.valid.params.id, files);
    res.status(201).json(task);
  },
);

// serve uploaded files
app.use('/uploads', express.static('uploads'));`, file: 'src/routes/tasks.routes.js', hl: '4' },
                 { term: `curl -X POST localhost:3000/api/tasks/$ID/attachments \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "files=@./invoice.pdf" -F "files=@./screenshot.png"`, out: `201 {"title":"Pay invoice","attachments":[{"url":"/uploads/2f1c…pdf","size":48211,"type":"application/pdf"}, …]}` },
                 { tip: ['Multer errors (e.g. <code>LIMIT_FILE_SIZE</code>) have <code>err.name === \'MulterError\'</code> — map them to 400/413 in your error handler.', 'أخطاء Multer (مثل <code>LIMIT_FILE_SIZE</code>) لها <code>err.name === \'MulterError\'</code> — حوّلها إلى 400/413 في معالج الأخطاء.'] }]
            ] }]
        },
        {
            kind: 'code', t: ['Cloud storage: S3 presigned URLs & Cloudinary', 'التخزين السحابي: روابط S3 الموقّعة و Cloudinary'],
            b: [{ cols: [
                [{ code: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

// 1) client asks for an upload URL
router.post('/uploads/presign', authenticate, async (req, res) => {
  const { type } = req.valid.body;                     // validated mime type
  const key = \`tasks/\${req.user.id}/\${crypto.randomUUID()}\`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: type }),
    { expiresIn: 60 },                                   // valid 60 seconds
  );
  res.json({ url, key });
});
// 2) browser PUTs the file directly to S3 → your server never touches the bytes`, file: 'presign.js', hl: '10-14' }],
                [{ code: `import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
const memory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5e6 } });

router.post('/avatar', authenticate, memory.single('avatar'), async (req, res) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'avatars', transformation: [{ width: 256, crop: 'fill' }] },
        (err, out) => (err ? reject(err) : resolve(out)))
      .end(req.file.buffer);
  });
  res.json({ url: result.secure_url });
});`, file: 'cloudinary.js' },
                 { best: ['Local <code>uploads/</code> disappears when containers restart and does not scale across servers. Use object storage (S3, R2, GCS, Cloudinary) in production.', 'مجلد <code>uploads/</code> المحلي يختفي عند إعادة تشغيل الحاويات ولا يتوسع عبر الخوادم. استخدم تخزين الكائنات (S3 أو R2 أو GCS أو Cloudinary) في الإنتاج.'] },
                 { warn: ['<code>mimetype</code> comes from the client and can lie. For sensitive apps, sniff magic bytes (<code>file-type</code> package) and scan for malware.', '<code>mimetype</code> يأتي من العميل وقد يكذب. للتطبيقات الحساسة افحص البايتات الأولى (حزمة <code>file-type</code>) وافحص البرمجيات الخبيثة.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Attachments for tasks', 'مرفقات للمهام'],
            b: [{ tasks: [
                ['Add <code>attachments: [{ url, size, type }]</code> to the Task schema.', 'أضف <code>attachments: [{ url, size, type }]</code> إلى مخطط Task.'],
                ['Implement the upload route with Multer and test with <code>curl -F</code>.', 'نفّذ مسار الرفع بـ Multer واختبره بـ <code>curl -F</code>.'],
                ['Upload a 10 MB file and a <code>.exe</code> — both must return clean 4xx JSON errors.', 'ارفع ملفًا بحجم 10MB وملف <code>.exe</code> — كلاهما يجب أن يعيد خطأ 4xx نظيفًا بصيغة JSON.'],
                ['Bonus: delete the file from disk when the task is deleted.', 'إضافي: احذف الملف من القرص عند حذف المهمة.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['Which Content-Type do file uploads use?', 'ما نوع المحتوى المستخدم لرفع الملفات؟'], o: ['`application/json`', '`multipart/form-data`', '`text/plain`', '`application/x-www-form-urlencoded`'], a: 1, e: ['Multipart allows binary parts with their own headers.', 'Multipart يسمح بأجزاء ثنائية لكل منها ترويساته.'] },
        { tf: false, q: ['Keeping the original filename on disk is safe.', 'الاحتفاظ باسم الملف الأصلي على القرص آمن.'], e: ['Names can contain ../, collide, or be executable. Generate your own.', 'الأسماء قد تحتوي ‎../ أو تتصادم أو تكون قابلة للتنفيذ. ولّد اسمك الخاص.'] },
        { q: ['Advantage of S3 presigned URLs?', 'ميزة روابط S3 الموقّعة؟'], o: [['Files go directly from browser to S3, not through your server', 'الملفات تذهب مباشرة من المتصفح إلى S3 وليس عبر خادمك'], ['They are free', 'مجانية'], ['No auth needed', 'لا تحتاج مصادقة'], ['They compress files', 'تضغط الملفات']], a: 0, e: ['Saves bandwidth/CPU and scales better.', 'توفر عرض النطاق والمعالج وتتوسع أفضل.'] },
        { q: ['Multer option that rejects files over 5 MB?', 'خيار Multer الذي يرفض الملفات فوق 5MB؟'], o: ['`fileFilter`', '`limits.fileSize`', '`storage`', '`dest`'], a: 1, e: ['limits.fileSize in bytes.', 'limits.fileSize بالبايت.'] }
    ]
});

DECK.chapters.push({
    n: 22, level: 2, icon: '🔎',
    t: ['Pagination, filtering, sorting & search', 'التصفح والفلترة والترتيب والبحث'],
    sub: ['Query-string APIs that scale: offset vs cursor, field selection, safe search', 'واجهات استعلام قابلة للتوسع: offset مقابل cursor، اختيار الحقول، بحث آمن'],
    project: ['<code>GET /api/tasks?done=false&sort=-dueDate&page=2&limit=20&q=report</code> returns data + meta.', '<code>GET /api/tasks?done=false&sort=-dueDate&page=2&limit=20&q=report</code> يعيد البيانات + بيانات وصفية.'],
    learn: [
        ['Build a list endpoint with filters, sort, pages and search', 'ابنِ نقطة قائمة مع فلاتر وترتيب وصفحات وبحث'],
        ['Return pagination metadata', 'أعد بيانات وصفية للتصفح'],
        ['Know when to switch to cursor pagination', 'اعرف متى تنتقل إلى التصفح بالمؤشر']
    ],
    slides: [
        {
            kind: 'code', t: ['A production-grade list endpoint', 'نقطة قائمة بمستوى الإنتاج'],
            b: [{ cols: [
                [{ code: `import { Task } from '../models/task.model.js';

const SORTABLE = ['createdAt', 'dueDate', 'priority', 'title'];
const escapeRegex = (s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');

export async function listTasks(user, { page, limit, done, sort, q, fields }) {
  // 1) filter
  const filter = user.role === 'admin' ? {} : { owner: user.id };
  if (done !== undefined) filter.done = done;
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };

  // 2) sort — whitelist to avoid sorting on unindexed/private fields
  const sortBy = sort.split(',')
    .filter((f) => SORTABLE.includes(f.replace('-', '')))
    .join(' ') || '-createdAt';

  // 3) run page + count in parallel
  const [data, total] = await Promise.all([
    Task.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(fields ? fields.split(',').join(' ') : '-__v')
      .lean(),
    Task.countDocuments(filter),
  ]);

  return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}`, file: 'src/services/tasks.service.js (listTasks)', lang: 'js', hl: '4,10,14,21-22' }],
                [{ term: `curl -H "Authorization: Bearer $TOKEN" \\
  "localhost:3000/api/tasks?done=false&sort=-priority,dueDate&page=1&limit=2&fields=title,priority"`, out: `{
  "data": [
    { "_id": "…", "title": "Fix login bug", "priority": "high" },
    { "_id": "…", "title": "Write report", "priority": "medium" }
  ],
  "meta": { "page": 1, "limit": 2, "total": 7, "pages": 4 }
}` },
                 { warn: ['Escape user input before putting it in <code>$regex</code>: <code>q=.*.*.*.*!</code> can trigger catastrophic backtracking (ReDoS). For real search, use a <b>text index</b> or Atlas Search / Meilisearch.', 'هرّب مدخلات المستخدم قبل وضعها في <code>$regex</code>: قيمة مثل <code>q=.*.*.*.*!</code> قد تسبب تراجعًا كارثيًا (ReDoS). للبحث الحقيقي استخدم <b>فهرسًا نصيًا</b> أو Atlas Search / Meilisearch.'] },
                 { best: ['Always cap <code>limit</code> (Zod <code>max(100)</code>) — otherwise <code>?limit=1000000</code> is a free DoS.', 'حدّد دائمًا سقفًا لـ <code>limit</code> (Zod <code>max(100)</code>) — وإلا يصبح <code>?limit=1000000</code> هجوم حجب خدمة مجاني.'] }]
            ] }]
        },
        {
            kind: 'concept', t: ['Offset vs cursor pagination', 'التصفح بالإزاحة مقابل المؤشر'],
            b: [{ cols: [
                [{ table: { h: ['', 'Offset (<code>?page=3</code>)', 'Cursor (<code>?after=…</code>)'], r: [
                    [['Jump to page N', 'القفز إلى صفحة N'], '✅', '❌'],
                    [['Speed on deep pages', 'السرعة في الصفحات العميقة'], ['❌ skip scans N docs', '❌ skip يمسح N مستندًا'], ['✅ uses the index', '✅ يستخدم الفهرس']],
                    [['New rows inserted', 'إضافة صفوف جديدة'], ['duplicates / gaps', 'تكرار / فجوات'], ['stable', 'مستقر']],
                    [['Best for', 'الأفضل لـ'], ['admin tables', 'جداول الإدارة'], ['infinite scroll, feeds, large data', 'التمرير اللانهائي، الخلاصات، البيانات الكبيرة']]
                ] } }],
                [{ code: `// cursor = last _id the client saw (ObjectIds are time-ordered)
export async function feed(user, { after, limit }) {
  const filter = { owner: user.id, ...(after && { _id: { $lt: after } }) };
  const items = await Task.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = items.length > limit;
  const data = items.slice(0, limit);
  return { data, nextCursor: hasMore ? data.at(-1)._id : null };
}`, file: 'cursor.js', hl: '3,4' }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Power up the list', 'طوّر القائمة'],
            b: [{ tasks: [
                ['Plug <code>listTasks(user, query)</code> into Tasky (the Zod query schema from chapter 16 already provides <code>page/limit/done/sort/q</code>).', 'اربط <code>listTasks(user, query)</code> بـ Tasky (مخطط الاستعلام من الفصل 16 يوفر <code>page/limit/done/sort/q</code>).'],
                ['Add <code>priority</code> and <code>dueBefore</code> filters (<code>$in</code>, <code>$lt</code>).', 'أضف فلتري <code>priority</code> و <code>dueBefore</code> (<code>$in</code> و <code>$lt</code>).'],
                ['Add a text index on title and use <code>$text: { $search: q }</code>; compare with regex.', 'أضف فهرسًا نصيًا على العنوان واستخدم <code>$text: { $search: q }</code>؛ وقارن مع regex.'],
                ['Add <code>GET /api/tasks/feed?after=…</code> with cursor pagination.', 'أضف <code>GET /api/tasks/feed?after=…</code> بالتصفح بالمؤشر.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { out: true, q: ['page=3, limit=20. How many documents are skipped?', 'page=3 و limit=20. كم مستندًا يتم تخطيه؟'], o: ['20', '40', '60', '3'], a: 1, e: ['(page − 1) × limit = 40.', '(page − 1) × limit = 40.'] },
        { q: ['Why whitelist sortable fields?', 'لماذا نستخدم قائمة سماح لحقول الترتيب؟'], o: [['Prettier code', 'كود أجمل'], ['Avoid sorting on unindexed/private fields', 'تجنب الترتيب على حقول غير مفهرسة أو خاصة'], ['Mongo requires it', 'Mongo يتطلب ذلك'], ['For CORS', 'من أجل CORS']], a: 1, e: ['Sorting on random fields can be slow or leak data.', 'الترتيب على حقول عشوائية قد يكون بطيئًا أو يسرّب بيانات.'] },
        { q: ['Best pagination for an infinite-scroll feed of millions of items?', 'أفضل تصفح لخلاصة تمرير لانهائي بملايين العناصر؟'], o: ['Offset', 'Cursor', ['No pagination', 'بدون تصفح'], ['Random', 'عشوائي']], a: 1, e: ['Cursor pagination stays fast and stable.', 'التصفح بالمؤشر يبقى سريعًا ومستقرًا.'] },
        { tf: true, q: ['User input inside <code>$regex</code> should be escaped.', 'يجب تهريب مدخلات المستخدم داخل <code>$regex</code>.'], e: ['Prevents ReDoS and unexpected matches.', 'يمنع ReDoS والمطابقات غير المتوقعة.'] }
    ]
});

DECK.chapters.push({
    n: 23, level: 2, icon: '📜',
    t: ['Logging', 'السجلات (Logging)'],
    sub: ['morgan, pino / winston, structured logs and request IDs', 'morgan و pino / winston، سجلات منظمة ومعرّفات الطلبات'],
    project: ['Tasky writes JSON logs with a request id on every line.', 'يكتب Tasky سجلات JSON مع معرّف طلب في كل سطر.'],
    learn: [
        ['Log HTTP requests with morgan or pino-http', 'سجّل طلبات HTTP بـ morgan أو pino-http'],
        ['Write structured JSON logs with levels', 'اكتب سجلات JSON منظمة بمستويات'],
        ['Correlate all logs of one request with an id', 'اربط كل سجلات طلب واحد بمعرّف']
    ],
    slides: [
        {
            kind: 'code', t: ['From console.log to structured logs', 'من console.log إلى سجلات منظمة'],
            b: [{ cols: [
                [{ term: `npm install pino pino-http
npm install -D pino-pretty` },
                 { code: `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,                     // production: raw JSON to stdout
});`, file: 'src/config/logger.js', hl: '5' },
                 { code: `import crypto from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from './config/logger.js';

app.use(pinoHttp({
  logger,
  genReqId: (req, res) => {
    const id = req.get('x-request-id') ?? crypto.randomUUID();
    res.set('X-Request-Id', id);
    return id;
  },
}));

// anywhere in a handler: child logger already has reqId
app.get('/api/tasks', (req, res) => {
  req.log.info({ userId: req.user?.id }, 'listing tasks');
  /* … */
});`, file: 'src/app.js (logging)', lang: 'js', hl: '7-10,16' }],
                [{ code: `{"level":30,"time":1763220000000,"reqId":"b1c2…","req":{"method":"GET","url":"/api/tasks"},"userId":"6650…","msg":"listing tasks"}
{"level":30,"time":1763220000012,"reqId":"b1c2…","res":{"statusCode":200},"responseTime":12,"msg":"request completed"}`, file: 'stdout (production)', lang: 'json' },
                 { table: { h: [['Level', 'المستوى'], ['Use for', 'الاستخدام']], r: [
                     ['<code>fatal</code> / <code>error</code>', ['crash / failed request', 'انهيار / طلب فاشل']],
                     ['<code>warn</code>', ['unexpected but handled', 'غير متوقع لكن تمت معالجته']],
                     ['<code>info</code>', ['business events (user registered)', 'أحداث العمل (تسجيل مستخدم)']],
                     ['<code>debug</code> / <code>trace</code>', ['development details', 'تفاصيل التطوير']]
                 ] } },
                 { tip: ['<b>morgan</b> (<code>app.use(morgan(\'dev\'))</code>) is perfect for quick local logs. <b>pino</b> is the fastest structured logger; <b>winston</b> is more configurable (multiple transports).', '<b>morgan</b> (<code>app.use(morgan(\'dev\'))</code>) ممتاز لسجلات محلية سريعة. و <b>pino</b> أسرع مسجّل منظم؛ و <b>winston</b> أكثر قابلية للتخصيص (وجهات متعددة).'] },
                 { mistake: ['Logging passwords, tokens, full card numbers or personal data. Use <code>redact</code> and think about GDPR.', 'تسجيل كلمات المرور أو الرموز أو أرقام البطاقات أو البيانات الشخصية. استخدم <code>redact</code> وفكّر في GDPR.'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Make Tasky observable', 'اجعل Tasky قابلًا للمراقبة'],
            b: [{ tasks: [
                ['Add pino + pino-http; in dev use pino-pretty, in prod plain JSON.', 'أضف pino و pino-http؛ في التطوير استخدم pino-pretty وفي الإنتاج JSON خام.'],
                ['Replace every <code>console.error</code> in the error handler with <code>req.log.error({ err }, …)</code>.', 'استبدل كل <code>console.error</code> في معالج الأخطاء بـ <code>req.log.error({ err }, …)</code>.'],
                ['Send a request with <code>-H "x-request-id: test-123"</code> and find all its log lines.', 'أرسل طلبًا مع <code>-H "x-request-id: test-123"</code> وجد كل أسطر سجله.'],
                ['Log a <code>user.registered</code> info event with the user id (not the email).', 'سجّل حدث info باسم <code>user.registered</code> مع معرّف المستخدم (وليس البريد).']
            ], time: 15 }]
        }
    ],
    quiz: [
        { q: ['Why structured (JSON) logs in production?', 'لماذا السجلات المنظمة (JSON) في الإنتاج؟'], o: [['They are colourful', 'ملونة'], ['Machines can search/filter/aggregate them', 'تستطيع الآلات البحث فيها وفلترتها وتجميعها'], ['Smaller code', 'كود أصغر'], ['Required by Express', 'مطلوبة من Express']], a: 1, e: ['Log platforms (Loki, ELK, Datadog) query fields.', 'منصات السجلات (Loki و ELK و Datadog) تستعلم بالحقول.'] },
        { q: ['What is a request id for?', 'ما فائدة معرّف الطلب؟'], o: [['Authentication', 'المصادقة'], ['Correlating all logs of one request (across services)', 'ربط كل سجلات طلب واحد (عبر الخدمات)'], ['Caching', 'التخزين المؤقت'], ['Rate limiting', 'تحديد المعدل']], a: 1, e: ['Search one id → see the whole story.', 'ابحث بمعرّف واحد ← شاهد القصة كاملة.'] },
        { tf: false, q: ['It is fine to log the Authorization header for debugging in production.', 'لا بأس بتسجيل ترويسة Authorization للتصحيح في الإنتاج.'], e: ['Tokens in logs = account takeover. Redact them.', 'الرموز في السجلات = الاستيلاء على الحسابات. احجبها.'] },
        { q: ['Which level for “user registered”?', 'أي مستوى لحدث "تسجيل مستخدم"؟'], o: ['`trace`', '`info`', '`error`', '`fatal`'], a: 1, e: ['Normal business event → info.', 'حدث عمل طبيعي ← info.'] }
    ]
});

DECK.chapters.push({
    n: 24, level: 2, icon: '📘',
    t: ['API documentation: Swagger / OpenAPI', 'توثيق الواجهة: Swagger / OpenAPI'],
    sub: ['OpenAPI 3 spec, Swagger UI, and keeping docs in sync with code', 'مواصفة OpenAPI 3، واجهة Swagger UI، وإبقاء التوثيق متزامنًا مع الكود'],
    project: ['Interactive docs at <code>/docs</code> with a “Try it out” button for every endpoint.', 'توثيق تفاعلي على <code>/docs</code> مع زر "Try it out" لكل نقطة نهاية.'],
    learn: [
        ['Describe endpoints, schemas and auth in OpenAPI', 'صف النقاط والمخططات والمصادقة في OpenAPI'],
        ['Serve Swagger UI from Express', 'قدّم Swagger UI من Express'],
        ['Generate the spec from code or Zod', 'ولّد المواصفة من الكود أو من Zod']
    ],
    slides: [
        {
            kind: 'code', t: ['openapi.yaml + Swagger UI', 'openapi.yaml و Swagger UI'],
            b: [{ cols: [
                [{ code: `openapi: 3.1.0
info: { title: Tasky API, version: 1.0.0 }
servers: [{ url: http://localhost:3000/api }]
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Task:
      type: object
      properties:
        _id: { type: string, example: 6650f1c2e4b0a1b2c3d4e5f6 }
        title: { type: string, example: Write docs }
        done: { type: boolean }
        priority: { type: string, enum: [low, medium, high] }
security: [{ bearerAuth: [] }]
paths:
  /tasks:
    get:
      summary: List my tasks
      parameters:
        - { in: query, name: page, schema: { type: integer, minimum: 1 } }
        - { in: query, name: done, schema: { type: boolean } }
      responses:
        '200': { description: OK }
        '401': { description: Missing or invalid token }
    post:
      summary: Create a task
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/Task' }
      responses:
        '201': { description: Created }
        '400': { description: Validation failed }`, file: 'docs/openapi.yaml', hl: '6,15' }],
                [{ term: 'npm install swagger-ui-express yaml' },
                 { code: `import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

const spec = YAML.parse(
  fs.readFileSync(path.join(import.meta.dirname, '../docs/openapi.yaml'), 'utf8'),
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/openapi.json', (req, res) => res.json(spec));`, file: 'src/app.js (docs)', lang: 'js', hl: '10' },
                 { ul: [
                     ['<b>Design-first</b>: write the YAML, review it with the frontend team, then code.', '<b>التصميم أولًا</b>: اكتب YAML وراجعه مع فريق الواجهة ثم اكتب الكود.'],
                     ['<b>Code-first</b>: generate it from JSDoc (<code>swagger-jsdoc</code>) or from your Zod schemas (<code>@asteasolutions/zod-to-openapi</code>) — one source of truth.', '<b>الكود أولًا</b>: ولّده من JSDoc (<code>swagger-jsdoc</code>) أو من مخططات Zod (<code>@asteasolutions/zod-to-openapi</code>) — مصدر حقيقة واحد.']
                 ] },
                 { best: ['The spec also powers client SDK generation, mock servers, contract tests and Postman imports. Keep it in the repo and lint it in CI (<code>@redocly/cli lint</code>).', 'المواصفة تسمح أيضًا بتوليد SDK للعملاء وخوادم وهمية واختبارات العقود والاستيراد في Postman. احفظها في المستودع وافحصها في CI (<code>@redocly/cli lint</code>).'] }]
            ] }]
        },
        {
            kind: 'exercise', t: ['Document Tasky', 'وثّق Tasky'],
            b: [{ tasks: [
                ['Write <code>openapi.yaml</code> for auth + tasks endpoints and serve it at <code>/docs</code>.', 'اكتب <code>openapi.yaml</code> لنقاط المصادقة والمهام وقدّمها على <code>/docs</code>.'],
                ['Click “Authorize”, paste a token and try <code>GET /tasks</code> from the browser.', 'اضغط "Authorize"، الصق رمزًا وجرّب <code>GET /tasks</code> من المتصفح.'],
                ['Add an <code>Error</code> schema and reference it in every 4xx response.', 'أضف مخطط <code>Error</code> واربطه بكل استجابة 4xx.'],
                ['Import <code>/openapi.json</code> into Postman and run the collection.', 'استورد <code>/openapi.json</code> إلى Postman ونفّذ المجموعة.']
            ], time: 20 }]
        }
    ],
    quiz: [
        { q: ['OpenAPI is…', 'OpenAPI هو…'], o: [['A testing library', 'مكتبة اختبارات'], ['A standard format to describe HTTP APIs', 'صيغة معيارية لوصف واجهات HTTP'], ['A database', 'قاعدة بيانات'], ['An auth protocol', 'بروتوكول مصادقة']], a: 1, e: ['Swagger UI is one tool that renders OpenAPI specs.', 'Swagger UI أداة تعرض مواصفات OpenAPI.'] },
        { q: ['Where are reusable request/response shapes defined?', 'أين تُعرّف أشكال الطلبات/الاستجابات القابلة لإعادة الاستخدام؟'], o: ['`paths`', '`components.schemas`', '`servers`', '`info`'], a: 1, e: ['Reference them with $ref.', 'تُستدعى عبر ‎$ref.'] },
        { tf: true, q: ['Generating the spec from Zod schemas keeps docs and validation in sync.', 'توليد المواصفة من مخططات Zod يبقي التوثيق والتحقق متزامنين.'], e: ['One source of truth = no drift.', 'مصدر حقيقة واحد = لا انحراف.'] },
        { q: ['How do you declare JWT auth in OpenAPI?', 'كيف تصرّح بمصادقة JWT في OpenAPI؟'], o: [['securitySchemes: bearerAuth (http, bearer)', 'securitySchemes: bearerAuth (http, bearer)'], ['headers: jwt', 'headers: jwt'], ['auth: true', 'auth: true'], ['You cannot', 'لا يمكن']], a: 0, e: ['components.securitySchemes + security.', 'components.securitySchemes مع security.'] }
    ]
});
