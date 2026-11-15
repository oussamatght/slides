/* =====================================================================
   Talk 04 — interactive widgets on top of the shared deck engine.
   Used from data files as  { html: () => Talk.tour('create') }  blocks.
   - Talk.tabs(id)      tab explorer, panels are normal engine blocks (DECK.tabs)
   - Talk.tour(id)      step-through flow with code per layer (DECK.tours)
   - Talk.problems(id)  error explorer: what / why / debug / fix (DECK.problems)
   - Talk.demo(opts)    live Task app talking to an in-browser fake API,
                        with a request pipeline and a DevTools-like Network log
   - Talk.series()      the Web Track talk series strip
   Everything is rendered as HTML strings while the engine renders slides;
   interaction is delegated on document (data-t="…"), so re-renders are safe.
   ===================================================================== */
(function () {
    'use strict';

    const DECK = window.DECK;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const R = () => window.DeckRender;
    const hlJSON = (txt) => window.Highlight.lines(txt, 'json').join('\n');
    const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =================================================================
       Tabs
       ================================================================= */
    function tabs(id) {
        const spec = DECK.tabs[id];
        if (!spec) return '';
        const btns = spec.items.map((it, k) => `<button class="ttab${k === 0 ? ' on' : ''}" role="tab" aria-selected="${k === 0}" data-t="tab" data-k="${k}"${it.c ? ` style="--tc:${it.c}"` : ''}>${it.i ? `<span aria-hidden="true">${it.i}</span> ` : ''}${it.k}</button>`).join('');
        const panes = spec.items.map((it, k) => `<div class="tpane${k === 0 ? ' on' : ''}" role="tabpanel" data-k="${k}"${it.c ? ` style="--tc:${it.c}"` : ''}>${R().blocks(it.b)}</div>`).join('');
        return `<div class="ttabs" data-tabs="${id}">${spec.hint ? `<p class="t-hint">${spec.hint}</p>` : ''}<div class="ttab-list" role="tablist" aria-label="${esc(spec.label || id)}">${btns}</div><div class="tpanes">${panes}</div></div>`;
    }
    function setTab(root, k) {
        $$(':scope > .ttab-list .ttab', root).forEach((b, i) => { b.classList.toggle('on', i === k); b.setAttribute('aria-selected', String(i === k)); });
        $$(':scope > .tpanes > .tpane', root).forEach((p, i) => p.classList.toggle('on', i === k));
    }

    /* =================================================================
       Tour (step-through flow)
       ================================================================= */
    const SIDE = { client: 'Frontend', server: 'Backend', db: 'Database', back: 'Response' };
    function tour(id) {
        const t = DECK.tours[id];
        if (!t) return '';
        const n = t.steps.length;
        const chips = t.steps.map((s, k) => `<button class="tstop side-${s.side || 'client'}${k === 0 ? ' on' : ''}" role="tab" aria-selected="${k === 0}" data-t="tour-go" data-k="${k}"><span class="tnum">${k + 1}</span><span>${s.i ? s.i + ' ' : ''}${s.k}</span></button>`).join('<span class="tlink" aria-hidden="true"></span>');
        const steps = t.steps.map((s, k) => {
            const code = s.code ? R().codeBlock({ code: s.code, file: s.file, lang: s.lang, hl: s.hl }) : '';
            const payload = s.data ? `<div class="tpayload"><span>${s.dataLabel || 'What travels here'}</span><pre>${hlJSON(s.data)}</pre></div>` : '';
            return `<div class="tstep side-${s.side || 'client'}${k === 0 ? ' on' : ''}" data-k="${k}" role="tabpanel">
                <div class="tstep-code">${code}</div>
                <div class="tstep-say"><p class="tstep-where">${SIDE[s.side || 'client']} · step ${k + 1} of ${n}</p>
                    <h3>${s.i ? s.i + ' ' : ''}${s.k}</h3><p>${s.say}</p>${payload}${s.tip ? `<p class="tstep-tip">💡 ${s.tip}</p>` : ''}</div>
            </div>`;
        }).join('');
        return `<div class="tour" data-tour="${id}" data-i="0" data-n="${n}">
            <div class="tour-track" role="tablist" aria-label="${esc(t.label || 'Flow steps')}">${chips}</div>
            <div class="tour-body">${steps}</div>
            <div class="tour-ctrl">
                <button class="btn" data-t="tour-prev" disabled>← Back</button>
                <span class="tour-count" aria-live="polite">1 / ${n}</span>
                <button class="btn primary" data-t="tour-next">Next step →</button>
                <button class="btn" data-t="tour-play" aria-pressed="false">▶ Auto-play</button>
                <span class="tour-hint"><kbd>→</kbd> / <kbd>Space</kbd> steps through the flow, then moves on</span>
            </div></div>`;
    }
    const tourTimers = new WeakMap();
    function setTour(el, i) {
        const n = Number(el.dataset.n);
        i = Math.max(0, Math.min(n - 1, i));
        el.dataset.i = String(i);
        $$('.tstop', el).forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); b.setAttribute('aria-selected', String(k === i)); });
        $$('.tstep', el).forEach((s, k) => s.classList.toggle('on', k === i));
        $('.tour-count', el).textContent = `${i + 1} / ${n}`;
        $('[data-t="tour-prev"]', el).disabled = i === 0;
        $('[data-t="tour-next"]', el).disabled = i === n - 1;
        const chip = $$('.tstop', el)[i];
        if (chip) {
            const track = $('.tour-track', el);
            const left = chip.offsetLeft - track.offsetLeft - track.clientWidth / 2 + chip.clientWidth / 2;
            track.scrollTo({ left, behavior: reduced() ? 'auto' : 'smooth' });
        }
    }
    function stopTour(el) {
        clearInterval(tourTimers.get(el));
        tourTimers.delete(el);
        const b = $('[data-t="tour-play"]', el);
        if (b) { b.textContent = '▶ Auto-play'; b.setAttribute('aria-pressed', 'false'); }
    }
    function playTour(el) {
        if (tourTimers.has(el)) { stopTour(el); return; }
        if (Number(el.dataset.i) >= Number(el.dataset.n) - 1) setTour(el, 0);
        const b = $('[data-t="tour-play"]', el);
        b.textContent = '⏸ Pause'; b.setAttribute('aria-pressed', 'true');
        tourTimers.set(el, setInterval(() => {
            const i = Number(el.dataset.i);
            if (i >= Number(el.dataset.n) - 1) { stopTour(el); return; }
            setTour(el, i + 1);
        }, 3200));
    }

    /* =================================================================
       Problem explorer
       ================================================================= */
    function problems(id) {
        const list = DECK.problems[id];
        if (!list) return '';
        const btns = list.map((p, k) => `<button class="ttab prob-tab${k === 0 ? ' on' : ''}" role="tab" aria-selected="${k === 0}" data-t="tab" data-k="${k}" style="--tc:${p.c}"><b>${p.k}</b> ${p.name}</button>`).join('');
        const panes = list.map((p, k) => `<div class="tpane${k === 0 ? ' on' : ''}" role="tabpanel" style="--tc:${p.c}">
            <div class="prob-head"><span class="prob-code">${p.k}</span><div><p class="prob-name">${p.name}</p><p class="prob-sum">${p.sum}</p></div></div>
            <div class="prob">
                <div class="prob-card"><h4>👀 What happens</h4><p>${p.see}</p>${p.console ? `<pre class="prob-console">${esc(p.console)}</pre>` : ''}</div>
                <div class="prob-card"><h4>🤔 Why it happens</h4><p>${p.why}</p></div>
                <div class="prob-card"><h4>🔍 How to debug</h4><ol class="prob-steps">${p.debug.map((d) => `<li>${d}</li>`).join('')}</ol></div>
                <div class="prob-card"><h4>🛠️ How to fix</h4><p>${p.fix}</p>${p.fixCode ? R().codeBlock(p.fixCode) : ''}</div>
            </div></div>`).join('');
        return `<div class="ttabs probs" data-tabs="prob-${id}"><div class="ttab-list" role="tablist" aria-label="Integration problems">${btns}</div><div class="tpanes">${panes}</div></div>`;
    }

    /* =================================================================
       Series strip (intro)
       ================================================================= */
    function series() {
        return `<div class="series">${DECK.series.map((s) => `<div class="series-item${s.cur ? ' cur' : ''}">
            <span class="series-n">${s.n}</span><b>${s.t}</b><small>${s.d}</small>${s.cur ? '<em>You are here</em>' : ''}</div>`).join('<span class="series-link" aria-hidden="true"></span>')}</div>`;
    }

    /* =================================================================
       Live demo — Task app + fake Express/Prisma API in the browser
       ================================================================= */
    const STAGES = [
        { k: 'React', i: '⚛️', side: 'client' },
        { k: 'Axios', i: '📡', side: 'client' },
        { k: 'Express route', i: '🧭', side: 'server' },
        { k: 'Middleware', i: '🧩', side: 'server' },
        { k: 'Controller', i: '🎛️', side: 'server' },
        { k: 'Service', i: '🧠', side: 'server' },
        { k: 'Prisma', i: '🔷', side: 'db' },
        { k: 'PostgreSQL', i: '🐘', side: 'db' }
    ];
    const SPEEDS = [['fast', 'Fast', 260], ['normal', 'Normal', 700], ['slow', 'Slow 3G', 2000]];
    const BREAKS = [
        ['none', 'Nothing'], ['404', '404 wrong URL'], ['401', '401 no token'],
        ['500', '500 server bug'], ['offline', 'API offline'], ['cors', 'CORS']
    ];
    const STATUS_TEXT = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 500: 'Internal Server Error' };
    const now = () => new Date().toISOString();
    function seedDB() {
        return [
            { id: 3, title: 'Prepare the Talk 04 slides', done: false, createdAt: '2026-11-15T09:30:00.000Z', updatedAt: '2026-11-15T09:30:00.000Z' },
            { id: 2, title: 'Write the Prisma schema', done: true, createdAt: '2026-11-14T18:10:00.000Z', updatedAt: '2026-11-14T20:02:00.000Z' },
            { id: 1, title: 'Design the Task API', done: true, createdAt: '2026-11-14T16:00:00.000Z', updatedAt: '2026-11-14T17:45:00.000Z' }
        ];
    }
    const demo = {
        db: seedDB(), nextId: 4,
        tasks: [], status: 'idle', error: null, formError: null,
        busy: null, speed: 'normal', brk: 'none',
        log: [], seq: 0, stage: -1, hit: -1, bad: -1, dir: 1, lastAction: null
    };
    const clone = (x) => JSON.parse(JSON.stringify(x));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // the fake backend: route → middleware → controller → service → "Prisma"
    function fakeServer(method, url, body) {
        const m = url.match(/^\/api\/tasks(?:\/(\d+))?$/);
        if (!m) return { status: 404, data: { error: `Route not found: ${method} ${url}` }, stop: 2 };
        const id = m[1] ? Number(m[1]) : null;
        if (method === 'GET' && id === null) return { status: 200, data: clone(demo.db), stop: 7 };
        if (method === 'POST' && id === null) {
            const title = body && typeof body.title === 'string' ? body.title.trim() : '';
            if (!title) return { status: 400, data: { error: 'title is required' }, stop: 3 };
            if (title.length > 120) return { status: 400, data: { error: 'title is too long (max 120)' }, stop: 3 };
            const t = { id: demo.nextId++, title, done: false, createdAt: now(), updatedAt: now() };
            demo.db.unshift(t);
            return { status: 201, data: clone(t), stop: 7 };
        }
        if (id !== null && (method === 'PATCH' || method === 'DELETE')) {
            const t = demo.db.find((x) => x.id === id);
            if (!t) return { status: 404, data: { error: 'Task not found' }, stop: 7 };
            if (method === 'DELETE') { demo.db = demo.db.filter((x) => x.id !== id); return { status: 204, data: null, stop: 7 }; }
            Object.assign(t, body, { updatedAt: now() });
            return { status: 200, data: clone(t), stop: 7 };
        }
        return { status: 404, data: { error: `Route not found: ${method} ${url}` }, stop: 2 };
    }

    // what the axios call looks like — and what can go wrong on the way
    async function request(method, url, body) {
        const brk = demo.brk;
        demo.brk = 'none';                    // a "break" only affects the next request
        if (brk === '404') url = url.replace('/api/tasks', '/api/task');
        const entry = { n: ++demo.seq, method, url, body, status: 'pending', ms: 0, res: undefined, note: '' };
        demo.log.unshift(entry);
        if (demo.log.length > 30) demo.log.pop();
        const t0 = performance.now();
        const total = SPEEDS.find((s) => s[0] === demo.speed)[2];
        let res;
        if (brk === 'offline') res = { status: 0, data: null, stop: 1, note: 'net::ERR_CONNECTION_REFUSED — nothing is listening on localhost:4000' };
        else if (brk === 'cors') res = { status: 0, data: null, stop: 2, cors: true, note: 'Blocked by CORS policy: No "Access-Control-Allow-Origin" header is present on the requested resource.' };
        else if (brk === '401') res = { status: 401, data: { error: 'Missing token' }, stop: 3 };
        else if (brk === '500') res = { status: 500, data: { error: 'Internal Server Error' }, stop: 6, note: 'Server log: PrismaClientInitializationError: Can\'t reach database server at localhost:5432' };
        else res = fakeServer(method, url, body);
        // CORS: the server answered, but the browser blocks the response before Axios sees it
        const failedAt = res.cors ? 1 : res.status === 0 || res.status >= 400 ? res.stop : -1;
        const fwd = res.stop + 1, back = res.status === 0 && !res.cors ? 0 : res.stop + 1;
        const tick = total / Math.max(2, fwd + back);
        demo.bad = -1;
        demo.dir = 1;
        for (let s = 0; s <= res.stop; s++) { demo.stage = s; demo.hit = s - 1; paint(); await sleep(tick); }
        if (failedAt >= 0) { demo.bad = failedAt; paint(); await sleep(tick); }
        if (back) {
            demo.dir = -1;
            for (let s = res.stop; s >= 0; s--) { demo.stage = s; paint(); await sleep(tick * 0.8); }
        }
        demo.stage = -1; demo.hit = -1;
        entry.ms = Math.round(performance.now() - t0);
        entry.status = res.status;
        entry.res = res.data;
        entry.note = res.note || '';
        entry.cors = !!res.cors;
        if (res.status >= 200 && res.status < 300) { demo.bad = -1; paint(); return res.data; }
        paint();
        const err = new Error(res.status ? (res.data && res.data.error) || 'Request failed' : 'Network Error');
        err.response = res.status ? { status: res.status, data: res.data } : undefined;
        throw err;
    }
    // same idea as getErrorMessage() in src/api/errors.ts
    const errorMessage = (err) => (err.response ? `${err.response.data && err.response.data.error ? err.response.data.error : 'Request failed'} (${err.response.status})` : 'Cannot reach the server. Is the API running?');

    async function act(kind, arg) {
        if (demo.busy) return;
        demo.lastAction = [kind, arg];
        demo.formError = null;
        try {
            if (kind === 'load') {
                demo.busy = 'load'; demo.status = 'loading'; demo.error = null; paint();
                demo.tasks = await request('GET', '/api/tasks');
                demo.status = 'success';
            } else if (kind === 'add') {
                demo.busy = 'add'; paint();
                const task = await request('POST', '/api/tasks', { title: arg });
                demo.tasks = [task, ...demo.tasks];
                $$('.td-input').forEach((i) => { i.value = ''; });
            } else if (kind === 'toggle') {
                const t = demo.tasks.find((x) => x.id === arg);
                demo.busy = 'row-' + arg; paint();
                const updated = await request('PATCH', `/api/tasks/${arg}`, { done: !t.done });
                demo.tasks = demo.tasks.map((x) => (x.id === updated.id ? updated : x));
            } else if (kind === 'delete') {
                demo.busy = 'row-' + arg; paint();
                await request('DELETE', `/api/tasks/${arg}`);
                demo.tasks = demo.tasks.filter((x) => x.id !== arg);
            }
        } catch (err) {
            if (kind === 'load') { demo.status = 'error'; demo.error = errorMessage(err); }
            else demo.formError = errorMessage(err);
        } finally {
            demo.busy = null;
            paint();
        }
    }

    function stateBadge() {
        const s = demo.busy && demo.busy !== 'load' ? 'saving…' : demo.status;
        return `<span class="td-state" title="React state in useTasks()">status = "${s}"</span>`;
    }
    function appBody() {
        let main;
        if (demo.status === 'idle') {
            main = `<div class="td-empty"><p>No data yet. The page has not asked the API for anything.</p>
                <button class="td-btn" data-t="td-load">▶ Load tasks <code>GET /api/tasks</code></button></div>`;
        } else if (demo.status === 'loading') {
            main = `<p class="td-muted" role="status">Loading tasks…</p><div class="td-skel"></div><div class="td-skel"></div><div class="td-skel"></div>`;
        } else if (demo.status === 'error') {
            main = `<div class="td-alert" role="alert"><span>⚠️ ${esc(demo.error)}</span><button class="td-btn ghost" data-t="td-load">↻ Retry</button></div>`;
        } else {
            const rows = demo.tasks.map((t) => {
                const busy = demo.busy === 'row-' + t.id;
                return `<li class="td-item${t.done ? ' done' : ''}${busy ? ' busy' : ''}">
                    <button class="td-check" data-t="td-toggle" data-id="${t.id}" aria-label="Mark “${esc(t.title)}” as ${t.done ? 'not done' : 'done'}" ${demo.busy ? 'disabled' : ''}>${t.done ? '✔' : ''}</button>
                    <span>${esc(t.title)}</span>
                    <button class="td-del" data-t="td-delete" data-id="${t.id}" aria-label="Delete “${esc(t.title)}”" ${demo.busy ? 'disabled' : ''}>🗑</button></li>`;
            }).join('');
            const left = demo.tasks.filter((t) => !t.done).length;
            main = (rows ? `<ul class="td-list">${rows}</ul>` : '<p class="td-muted">No tasks yet — add your first one!</p>') +
                `<p class="td-foot"><span>${demo.tasks.length} tasks · ${left} left</span><button class="td-link" data-t="td-load" ${demo.busy ? 'disabled' : ''}>↻ Reload</button></p>`;
        }
        const err = demo.formError ? `<div class="td-alert" role="alert"><span>⚠️ ${esc(demo.formError)}</span></div>` : '';
        return err + main;
    }
    function pipe() {
        return STAGES.map((s, k) => {
            const cls = k === demo.bad ? 'bad' : k === demo.stage ? 'on' : k <= demo.hit ? 'hit' : '';
            return `<span class="td-st side-${s.side} ${cls}"><span aria-hidden="true">${s.i}</span> ${s.k}</span>`;
        }).join(`<span class="td-arrow${demo.dir < 0 && demo.stage >= 0 ? ' back' : ''}" aria-hidden="true"></span>`);
    }
    function statusCls(s) { return s === 'pending' ? 'pend' : s === 0 ? 'err' : s < 300 ? 'ok' : s < 500 ? 'warn' : 'err'; }
    function logRows() {
        if (!demo.log.length) return '<p class="td-net-empty">No requests yet. Interact with the app on the left.</p>';
        return demo.log.map((e, k) => {
            const st = e.status === 'pending' ? 'pending…' : e.status === 0 ? (e.cors ? 'CORS error' : '(failed)') : `${e.status} ${STATUS_TEXT[e.status] || ''}`;
            const req = e.body !== undefined ? `<b>Request body</b><pre>${hlJSON(JSON.stringify(e.body, null, 2))}</pre>` : '';
            const res = e.status === 'pending' ? '' : e.status === 0 ? `<b>Response</b><pre>(no response)</pre>` : e.res === null ? `<b>Response</b><pre>(empty body)</pre>` : `<b>Response body</b><pre>${hlJSON(JSON.stringify(e.res, null, 2))}</pre>`;
            const note = e.note ? `<p class="td-note">${esc(e.note)}</p>` : '';
            return `<details class="td-row"${k === 0 ? ' open' : ''}><summary><span class="td-m m-${e.method}">${e.method}</span><span class="td-u">${esc(e.url)}</span><span class="td-s ${statusCls(e.status)}">${st}</span><span class="td-ms">${e.status === 'pending' ? '' : e.ms + ' ms'}</span></summary>
                <div class="td-detail">${note}${req}${res}</div></details>`;
        }).join('');
    }
    function controls() {
        const seg = (name, items, cur) => items.map(([v, label]) => `<button class="td-seg${v === cur ? ' on' : ''}" data-t="td-${name}" data-v="${v}" aria-pressed="${v === cur}">${label}</button>`).join('');
        return `<div class="td-ctrl-row"><span class="td-ctrl-l">🌐 Network</span>${seg('speed', SPEEDS, demo.speed)}</div>
            <div class="td-ctrl-row"><span class="td-ctrl-l">💥 Break the next request</span>${seg('break', BREAKS, demo.brk)}</div>`;
    }

    function demoHTML(o = {}) {
        return `<div class="tdemo${o.compact ? ' compact' : ''}">
            <div class="td-pipe" aria-hidden="true">${pipe()}</div>
            <div class="td-grid">
                <div class="td-win" role="region" aria-label="Task app (React)">
                    <div class="td-bar"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="td-url">localhost:5173/tasks</span>${stateBadge()}</div>
                    <div class="td-body">
                        <form class="td-form" data-t="td-form" autocomplete="off">
                            <input class="td-input" type="text" maxlength="140" placeholder="New task… (try an empty one)" aria-label="New task title">
                            <button class="td-btn" type="submit" ${demo.busy || demo.status !== 'success' ? 'disabled' : ''}>${demo.busy === 'add' ? 'Saving…' : 'Add'}</button>
                        </form>
                        <div class="td-app">${appBody()}</div>
                    </div>
                </div>
                <div class="td-net" role="region" aria-label="Network log">
                    <div class="td-net-head"><span>DevTools › Network</span><span><button class="td-mini" data-t="td-clear">clear</button> <button class="td-mini" data-t="td-reset">reset DB</button></span></div>
                    <div class="td-log">${logRows()}</div>
                </div>
            </div>
            ${o.controls === false ? '' : `<div class="td-ctrl">${controls()}</div>`}
        </div>`;
    }

    // repaint every demo instance in place (keeps the typed input value)
    function paint() {
        $$('.tdemo').forEach((el) => {
            $('.td-pipe', el).innerHTML = pipe();
            $('.td-app', el).innerHTML = appBody();
            $('.td-state', el).outerHTML = stateBadge();
            $('.td-log', el).innerHTML = logRows();
            const submit = $('.td-form .td-btn', el);
            submit.disabled = !!demo.busy || demo.status !== 'success';
            submit.textContent = demo.busy === 'add' ? 'Saving…' : 'Add';
            const ctrl = $('.td-ctrl', el);
            if (ctrl) ctrl.innerHTML = controls();
        });
    }

    /* =================================================================
       Events
       ================================================================= */
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-t]');
        if (!el) return;
        const t = el.dataset.t;
        if (t === 'tab') { setTab(el.closest('.ttabs'), Number(el.dataset.k)); return; }
        const tr = el.closest('.tour');
        if (tr) {
            if (t !== 'tour-play') stopTour(tr);
            if (t === 'tour-go') setTour(tr, Number(el.dataset.k));
            if (t === 'tour-next') setTour(tr, Number(tr.dataset.i) + 1);
            if (t === 'tour-prev') setTour(tr, Number(tr.dataset.i) - 1);
            if (t === 'tour-play') playTour(tr);
            return;
        }
        switch (t) {
            case 'td-load': act('load'); break;
            case 'td-toggle': act('toggle', Number(el.dataset.id)); break;
            case 'td-delete': act('delete', Number(el.dataset.id)); break;
            case 'td-speed': demo.speed = el.dataset.v; paint(); break;
            case 'td-break': demo.brk = el.dataset.v; paint(); break;
            case 'td-clear': demo.log = []; paint(); break;
            case 'td-reset':
                if (demo.busy) return;
                Object.assign(demo, { db: seedDB(), nextId: 4, tasks: [], status: 'idle', error: null, formError: null, log: [], brk: 'none', bad: -1 });
                paint();
                break;
            default:
        }
    });
    document.addEventListener('submit', (e) => {
        const f = e.target.closest('[data-t="td-form"]');
        if (!f) return;
        e.preventDefault();
        act('add', $('.td-input', f).value);
    });

    // On a slide with a tour, → / Space / PageDown step through it first (works with presenter clickers);
    // at the last step the key falls through to the engine and the deck moves on.
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if ($('.overlay.on') || $('#sidebar.on')) return;
        const tr = $('.slide.active .tour');
        if (!tr) return;
        const onControl = tag === 'button' || tag === 'summary' || tag === 'a';
        const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !onControl);
        const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp';
        const i = Number(tr.dataset.i), n = Number(tr.dataset.n);
        if ((fwd && i < n - 1) || (back && i > 0)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            stopTour(tr);
            setTour(tr, i + (fwd ? 1 : -1));
        }
    }, true);

    // expand every tab / tour step when printing
    window.addEventListener('beforeprint', () => document.documentElement.classList.add('t-print'));
    window.addEventListener('afterprint', () => document.documentElement.classList.remove('t-print'));

    window.Talk = { tabs, tour, problems, series, demo: demoHTML };
})();
