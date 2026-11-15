/* Talk 04 — metadata, sections, intro and closing slides.
   Same data format as express.js/js/data (engine: express.js/deck/engine.js).
   English-only talk: plain strings are fine everywhere except chapter titles,
   which stay ['…'] arrays because the engine builds "Quiz: <title>" from t[0]. */
window.DECK = window.DECK || { chapters: [] };
DECK.tours = DECK.tours || {};
DECK.tabs = DECK.tabs || {};
DECK.problems = DECK.problems || {};

DECK.meta = {
    id: 'talk04',
    root: '../../',
    lang: 'en',          // English only → hides the AR/EN switch
    levelBase: 1,        // "Section 1" … "Section 10"
    covers: false,       // no chapter cover slides — a talk moves faster
    title: 'From Frontend + Backend to Full Stack — Talk 04',
    short: 'Talk 04 · Frontend + Backend → Full Stack'
};

DECK.ui = {
    en: {
        level: 'Section', chapter: 'Topic', menu: 'Sections', search: 'Search topics…',
        progress: '{a} of {b} topics visited · {c} quizzes done',
        concept: 'Concept', code: 'Code', demo: 'Live demo', exercise: 'Try it', mistakes: 'Pitfalls', project: 'Task app',
        quiz: 'Quiz', intro: 'Start', outro: 'Wrap-up',
        perfect: 'Perfect score — you think like a full stack developer! 🏆',
        good: 'Great job — you understand how the pieces connect. 💪',
        low: 'Good start — revisit the sections you missed, then try again. 📚',
        startHint: 'Press → or Space to start'
    }
};

DECK.levels = [
    { icon: '🧭', t: 'Introduction', sub: 'What full stack really means, who does what, and the app we build today.' },
    { icon: '🏗️', t: 'Full Stack Architecture', sub: 'React → HTTP → Express → Prisma → PostgreSQL: client, server, REST, JSON, methods and status codes.' },
    { icon: '📡', t: 'Frontend ↔ Backend Communication', sub: 'fetch and Axios, the four request types, headers, bodies, async/await and UI states.' },
    { icon: '🛰️', t: 'Axios in Practice', sub: 'An Axios instance, a typed API module, error handling, env variables and a clean project structure.' },
    { icon: '🔗', t: 'The Complete Integration Demo', sub: 'One click, ten layers: follow a task from the React form to PostgreSQL and back.' },
    { icon: '🐞', t: 'Common Integration Problems', sub: 'CORS, 4xx, 5xx, wrong URLs, env variables, network, database and JSON errors — and how to debug them.' },
    { icon: '🔐', t: 'Authentication Integration', sub: 'Register, login, hashing, JWT, the Authorization header and protected routes on both sides.' },
    { icon: '🚀', t: 'From Localhost to Production', sub: 'Environment variables, CORS and deploying the frontend, the API and the database on Render.' },
    { icon: '🤝', t: 'Developer Workflow & Collaboration', sub: 'Branches, commits, pull requests and the API contract that lets frontend and backend work in parallel.' },
    { icon: '🎯', t: 'Final Quiz & Q&A', sub: 'Recap, test your understanding, and ask anything.' }
];

DECK.series = [
    { n: 'Talk 01', t: 'From Idea to Production', d: 'The full journey of building and shipping a product.' },
    { n: 'Talk 02', t: 'From Design to Frontend', d: 'Turning designs into real React interfaces.' },
    { n: 'Talk 03', t: 'From Database to Backend', d: 'Data models, servers and APIs.' },
    { n: 'Talk 04', t: 'From Frontend + Backend to Full Stack', d: 'Connecting everything into one working app.', cur: true }
];

DECK.intro = [
    {
        id: 'start', type: 'title', img: 'img/hero.svg',
        alt: 'Illustration: a React app in the browser sends a request to an Express API, which talks to PostgreSQL and returns JSON',
        t: 'From Frontend + Backend to Full Stack',
        sub: 'Understanding integration, API communication, and building complete web applications.',
        chips: ['🎤 Oussama Taright', '🏛️ Micro Club USTHB', '🌐 Web Track · Knowledge Sharing Week', '04 / 04']
    },
    {
        id: 'speaker', t: 'About the speaker',
        b: [
            { lead: 'I’m <b>Oussama Taright</b>, a full stack developer and Computer Science student at <b>USTHB</b>. I build web and mobile apps with React, Next.js, React Native, Node.js and Express. Today I’ll show you how the pieces you already know fit together.' },
            { cols: [
                [{ h3: 'Things I’ve shipped' }, { ul: [
                    '<b>WASSLA</b> — marketplace & delivery platform on Google Play and the App Store (Express + MongoDB + Socket.io).',
                    '<b>Code Souls</b> — gamified frontend learning platform, 🥇 1st place at GDG Hackathon.',
                    '<b>ChoufPrice DZ</b> — community price monitoring across the 58 wilayas.',
                    '<b>Sakinah</b> — open-source, offline-first app (Expo + React Native).'
                ] }],
                [{ h3: 'Find me' }, { cards: [
                    { i: '💻', t: 'GitHub', d: '<a href="https://github.com/oussamatght" target="_blank" rel="noopener">github.com/oussamatght</a>' },
                    { i: '💼', t: 'LinkedIn', d: '<a href="https://www.linkedin.com/in/taright-oussama" target="_blank" rel="noopener">in/taright-oussama</a>' }
                ] }]
            ] }
        ]
    },
    {
        id: 'series', t: 'The Web Track journey',
        b: [
            { lead: 'Each talk built one part of a web application. Today we <b>connect them</b>: the interface from Talk 02 talks to the API and database from Talk 03, and we ship the result the way Talk 01 described.' },
            { html: () => Talk.series() },
            { cards: [
                { i: '🎯', t: 'Goal of this talk', d: 'Understand how a click in React becomes a row in PostgreSQL and comes back as updated UI.' },
                { i: '🧪', t: 'One running example', d: 'A Task Manager app. Same code, same names, every slide.' },
                { i: '🛠️', t: 'Practical', d: 'Real folder structures, real errors, a live demo and a deployment you can repeat at home.' }
            ] }
        ]
    },
    {
        id: 'agenda', type: 'roadmap', t: 'Today’s agenda',
        before: [{ lead: 'Ten sections. Click one to jump there. Every important idea follows the same rhythm:' }],
        b: [{ html: '<div class="chain"><span class="side-client" style="--sc:var(--l0)">① Simple explanation</span><i>→</i><span style="--sc:var(--l1)">② Visual</span><i>→</i><span style="--sc:var(--l3)">③ Code</span><i>→</i><span style="--sc:var(--l4)">④ Step by step</span><i>→</i><span style="--sc:var(--l6)">⑤ Real-world use</span></div>' },
            { tip: 'Following along on your laptop? <kbd>←</kbd> <kbd>→</kbd> to move, <kbd>Esc</kbd> for the slide overview, <kbd>M</kbd> for the sections menu, <kbd>?</kbd> for all shortcuts.' }]
    }
];

DECK.outro = [
    {
        id: 'resources', t: 'Keep going: resources & practice',
        b: [{ cols: [
            [{ h3: '📚 Official docs' }, { ul: [
                '<a href="https://react.dev/learn" target="_blank" rel="noopener">react.dev</a> — React, state and effects',
                '<a href="https://axios-http.com/docs/intro" target="_blank" rel="noopener">axios-http.com</a> — instances, interceptors, errors',
                '<a href="https://expressjs.com/" target="_blank" rel="noopener">expressjs.com</a> — routing, middleware, error handling',
                '<a href="https://www.prisma.io/docs" target="_blank" rel="noopener">prisma.io/docs</a> — schema, migrations, client',
                '<a href="https://developer.mozilla.org/en-US/docs/Web/HTTP" target="_blank" rel="noopener">MDN HTTP</a> — methods, status codes, CORS',
                '<a href="https://render.com/docs" target="_blank" rel="noopener">render.com/docs</a> — static sites, web services, Postgres'
            ] }],
            [{ h3: '🏋️ Practice project ideas' }, { ul: [
                'Add a <b>due date</b> to tasks: migration → service → API → form. One feature, every layer.',
                'Add <b>filters</b>: <code>GET /api/tasks?done=true</code> with a query param and a dropdown.',
                'Add <b>projects</b>: a <code>Project</code> model with many tasks (a Prisma relation).',
                'Deploy it on Render and share the link with the club. 🚀'
            ] },
            { tip: 'Want to go deeper on the backend? The <a href="../../express.js/index.html">Express.js deck</a> in this repo goes from zero to senior, with quizzes.' }]
        ] }]
    },
    {
        id: 'thanks', center: true, narrow: true, t: 'Thank you! 🙏',
        sub: 'Frontend + backend + database + deployment = <b>full stack</b>. Now go build something real and ship it.',
        b: [{ html: `<div class="pill-row">
                <a href="https://github.com/oussamatght" target="_blank" rel="noopener"><span>💻 github.com/oussamatght</span></a>
                <a href="https://www.linkedin.com/in/taright-oussama" target="_blank" rel="noopener"><span>💼 in/taright-oussama</span></a>
                <a href="https://github.com/oussamatght/slides" target="_blank" rel="noopener"><span>🗂️ Slides: github.com/oussamatght/slides</span></a>
            </div>
            <p style="color:var(--muted);margin-top:1.4rem">Micro Club USTHB · Web Track · Knowledge Sharing Week · Talk 04</p>` }]
    }
];
