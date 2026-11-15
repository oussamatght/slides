/* =====================================================================
   Shared slide-deck engine (Express, HTML, CSS, React, Internet decks)
   Data lives in js/data/*.js (window.DECK). Every text is an [en, ar] pair.
   ===================================================================== */
(function () {
    'use strict';

    const DECK = window.DECK;
    const H = window.Highlight;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = H.esc;
    const pad = (n) => String(n).padStart(2, '0');

    /* ---------- storage (always guarded) ---------- */
    // lang / theme / text size are shared by every deck; progress is per deck
    const DECK_ID = (DECK.meta && DECK.meta.id) || 'deck';
    const SHARED_KEYS = new Set(['lang', 'theme', 'scale']);
    const keyOf = (k) => (SHARED_KEYS.has(k) ? 'slides.' : DECK_ID + '.') + k;
    const store = {
        get(k, d) { try { const v = localStorage.getItem(keyOf(k)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(keyOf(k), JSON.stringify(v)); } catch (e) { /* private mode */ } }
    };

    // all courses in the repo (links shown at the bottom of the sidebar)
    const COURSES = [
        { id: 'internet', path: 'intrent/', icon: '🌐', t: ['Internet & the Web', 'الإنترنت والويب'] },
        { id: 'html', path: '', icon: '🧱', t: ['HTML', 'HTML'] },
        { id: 'css', path: 'css/', icon: '🎨', t: ['CSS', 'CSS'] },
        { id: 'js', path: 'js/', icon: '🟨', t: ['JavaScript', 'JavaScript'] },
        { id: 'react', path: 'react/', icon: '⚛️', t: ['React', 'React'] },
        { id: 'git', path: 'git/github/', icon: '🌿', t: ['Git & GitHub', 'Git و GitHub'] },
        { id: 'express', path: 'express.js/', icon: '🚂', t: ['Express.js', 'Express.js'] }
    ];

    /* ---------- state ---------- */
    // optional per-deck settings: meta.lang forces one language (hides the AR/EN switch),
    // meta.levelBase shifts displayed level numbers (e.g. 1 → "Part 1" instead of "Level 0")
    const FORCED_LANG = DECK.meta && DECK.meta.lang;
    const LV_BASE = (DECK.meta && DECK.meta.levelBase) || 0;
    const lvNum = (i) => i + LV_BASE;
    let lang = FORCED_LANG || store.get('lang', (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en');
    let theme = store.get('theme', 'dark');
    let scale = store.get('scale', 1);
    let scores = store.get('scores', {});
    let seen = new Set(store.get('seen', []));
    let current = 0;
    let slides = [];
    let codeStore = new Map();
    let codeSeq = 0;
    const quizState = {};
    const exam = { phase: 'start', order: [], i: 0, picks: {}, round: [] };

    /* ---------- i18n ---------- */
    const L = (x) => {
        if (x == null) return '';
        if (Array.isArray(x)) return x[lang === 'ar' ? 1 : 0] ?? x[0];
        if (typeof x === 'object') return x[lang] ?? x.en ?? '';
        return String(x);
    };
    const UI = {
        en: {
            prev: 'Prev', next: 'Next', chapter: 'Chapter', level: 'Level', lesson: 'Lesson',
            concept: 'Concept', code: 'Example', exercise: 'Try it yourself', mistakes: 'Mistakes & interview',
            project: 'Project', quiz: 'Quiz', exam: 'Exam', level: 'Level', cover: 'Chapter', intro: 'Start', outro: 'Wrap-up',
            copy: 'Copy', copied: 'Copied!', result: 'Result', playground: 'Live editor — try it!', reset: 'Reset', courses: 'All courses', output: 'Expected output', terminal: 'Terminal',
            learn: 'What you will learn', milestone: 'Running project', solution: 'Show solution', hint: 'Hint',
            startTimer: 'Start {n}-min timer', timeUp: "⏰ Time's up!", timerStopped: 'Timer stopped',
            mc: 'Multiple choice', tf: 'True or false', out: 'What is the output?', true: 'True', false: 'False',
            correct: 'Correct!', wrong: 'Not quite.', nextQ: 'Next question', results: 'See results',
            retry: 'Retry quiz', continue: 'Continue', score: 'Score', best: 'Best',
            perfect: 'Perfect score — you nailed it! 🏆', good: 'Great job — keep going! 💪', low: 'Review the chapter and try again. 📚',
            examStart: 'Start the exam', examTitle: 'Final exam', examDesc: '{n} questions across all five levels. No hints during the exam — you get a full review at the end.',
            finish: 'Finish exam', prevQ: 'Previous', retryWrong: 'Retry wrong answers ({n})', restart: 'Restart exam',
            yourAnswer: 'Your answer', rightAnswer: 'Correct answer', notAnswered: 'not answered',
            question: 'Question', of: 'of', menu: 'Chapters', search: 'Search chapters…', progress: '{a} of {b} chapters visited · {c} quizzes done',
            overview: 'Slide overview', help: 'Keyboard shortcuts', close: 'Close', startHint: 'Press → or Space to start',
            fullscreen: 'Fullscreen', theme: 'Theme', language: 'Language', print: 'Print / PDF', zoomIn: 'Bigger text', zoomOut: 'Smaller text',
            laser: 'Laser pointer', blackout: 'Black screen', gotoFirst: 'First / last slide', answer: 'Answer quiz (1–4)',
            dashboard: 'Your progress', noScore: '—', resume: 'Resumed where you left off', pdfTip: 'Tip: choose “Save as PDF”, landscape, background graphics ON.',
            grade: ['Keep practising', 'Junior ready', 'Mid-level ready', 'Senior mindset']
        },
        ar: {
            prev: 'السابق', next: 'التالي', chapter: 'الفصل', level: 'المستوى', lesson: 'درس',
            concept: 'مفهوم', code: 'مثال', exercise: 'جرّب بنفسك', mistakes: 'أخطاء ومقابلات',
            project: 'المشروع', quiz: 'اختبار', exam: 'امتحان', cover: 'الفصل', intro: 'البداية', outro: 'الختام',
            copy: 'نسخ', copied: 'تم النسخ!', result: 'النتيجة', playground: 'محرر مباشر — جرّب!', reset: 'إعادة', courses: 'كل الدورات', output: 'الناتج المتوقع', terminal: 'الطرفية',
            learn: 'ماذا ستتعلم', milestone: 'المشروع المستمر', solution: 'اعرض الحل', hint: 'تلميح',
            startTimer: 'ابدأ مؤقت {n} دقائق', timeUp: '⏰ انتهى الوقت!', timerStopped: 'تم إيقاف المؤقت',
            mc: 'اختيار من متعدد', tf: 'صح أم خطأ', out: 'ما هو الناتج؟', true: 'صح', false: 'خطأ',
            correct: 'إجابة صحيحة!', wrong: 'ليست صحيحة.', nextQ: 'السؤال التالي', results: 'اعرض النتيجة',
            retry: 'أعد الاختبار', continue: 'تابع', score: 'النتيجة', best: 'الأفضل',
            perfect: 'علامة كاملة — أحسنت! 🏆', good: 'عمل رائع — استمر! 💪', low: 'راجع الفصل وحاول مجددًا. 📚',
            examStart: 'ابدأ الامتحان', examTitle: 'الامتحان النهائي', examDesc: '{n} سؤالًا من المستويات الخمسة. لا تلميحات أثناء الامتحان — ستحصل على مراجعة كاملة في النهاية.',
            finish: 'أنهِ الامتحان', prevQ: 'السابق', retryWrong: 'أعد الأسئلة الخاطئة ({n})', restart: 'أعد الامتحان',
            yourAnswer: 'إجابتك', rightAnswer: 'الإجابة الصحيحة', notAnswered: 'بدون إجابة',
            question: 'سؤال', of: 'من', menu: 'الفصول', search: 'ابحث في الفصول…', progress: 'زرت {a} من {b} فصلًا · أنهيت {c} اختبارًا',
            overview: 'نظرة عامة على الشرائح', help: 'اختصارات لوحة المفاتيح', close: 'إغلاق', startHint: 'اضغط → أو المسافة للبدء',
            fullscreen: 'ملء الشاشة', theme: 'السمة', language: 'اللغة', print: 'طباعة / PDF', zoomIn: 'تكبير الخط', zoomOut: 'تصغير الخط',
            laser: 'مؤشر ليزر', blackout: 'شاشة سوداء', gotoFirst: 'أول / آخر شريحة', answer: 'أجب على الاختبار (1–4)',
            dashboard: 'تقدّمك', noScore: '—', resume: 'تمت المتابعة من حيث توقفت', pdfTip: 'نصيحة: اختر "حفظ كـ PDF"، أفقي، وفعّل رسومات الخلفية.',
            grade: ['واصل التدريب', 'جاهز لمستوى Junior', 'جاهز لمستوى Mid', 'عقلية Senior']
        }
    };
    // a deck can rename UI labels, e.g. DECK.ui = { en: { chapter: 'Section' } }
    if (DECK.ui) Object.keys(DECK.ui).forEach((l) => { UI[l] = Object.assign(UI[l] || {}, DECK.ui[l]); });
    const T = (k, vars) => {
        let s = UI[lang][k] ?? UI.en[k] ?? k;
        if (vars) Object.keys(vars).forEach((v) => { s = s.replace('{' + v + '}', vars[v]); });
        return s;
    };

    const ICON = {
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>',
        timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>'
    };

    /* =====================================================================
       Block renderers
       ===================================================================== */
    function parseHL(hl) {
        const s = new Set();
        if (!hl) return s;
        String(hl).split(',').forEach((part) => {
            const [a, b] = part.split('-').map(Number);
            for (let i = a; i <= (b || a); i++) s.add(i);
        });
        return s;
    }

    function codeBlock(b) {
        const id = 'k' + codeSeq++;
        const code = String(b.code).replace(/^\n/, '').replace(/\s+$/, '');
        codeStore.set(id, code);
        const lang_ = b.lang || H.guess(b.file);
        const hl = parseHL(b.hl);
        const lines = H.lines(code, lang_);
        const body = lines.map((l, i) => `<span class="ln${hl.has(i + 1) ? ' hl' : ''}">${l}</span>`).join('');
        const html = `<div class="code-wrap">
            <div class="code-head"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="code-file">${esc(b.file || lang_)}</span><span class="code-lang">${esc(lang_)}</span>
                <button class="copy-btn" data-act="copy" data-id="${id}" aria-label="${T('copy')} ${esc(b.file || '')}">${ICON.copy}<span>${T('copy')}</span></button></div>
            <pre class="code${b.nonum ? ' nonum' : ''}${hl.size ? ' has-hl' : ''}" tabindex="0"><code>${body}</code></pre>
        </div>`;
        if (b.preview === undefined) return html;
        return `<div class="live${b.stack ? ' stack' : ''}">${html}${previewFrame(previewDoc(code, lang_, b), b.h)}</div>`;
    }

    /* ---------- live previews & playgrounds (HTML / CSS decks) ---------- */
    const PREVIEW_BASE = 'body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Tahoma,sans-serif;margin:14px;color:#0f172a;background:#fff;line-height:1.5}img{max-width:100%}';
    function previewDoc(code, lang_, b) {
        if (lang_ === 'css') return `<!doctype html><meta charset="utf-8"><style>${PREVIEW_BASE}${code}</style>${b.preview}`;
        if (/<html[\s>]|<!doctype/i.test(code)) return code;
        return `<!doctype html><meta charset="utf-8"><style>${PREVIEW_BASE}${b.css || ''}</style>${code}`;
    }
    const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    function previewFrame(doc, h) {
        return `<figure class="preview"><figcaption class="preview-head"><span>▶ ${T('result')}</span></figcaption>
            <iframe class="preview-frame" sandbox="allow-scripts allow-forms" style="height:${h || 260}px" srcdoc="${attr(doc)}" title="${T('result')}"></iframe></figure>`;
    }
    function playground(b) {
        const id = 'k' + codeSeq++;
        const src = String(b.play).replace(/^\n/, '').replace(/\s+$/, '');
        codeStore.set(id, src);
        return `<div class="play" data-play="${id}">
            <div class="play-pane"><div class="code-head"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="code-file">✏️ ${T('playground')}</span><span class="code-lang">html</span>
                <button class="copy-btn" data-act="play-reset" data-id="${id}">↺ ${T('reset')}</button></div>
                <textarea class="play-src" spellcheck="false" dir="ltr" aria-label="${T('playground')}" data-id="${id}">${esc(src)}</textarea></div>
            ${previewFrame(previewDoc(src, 'html', b), b.h || 300)}
        </div>`;
    }

    function termBlock(b) {
        const id = 'k' + codeSeq++;
        const cmds = String(b.term).replace(/^\n/, '').replace(/\s+$/, '');
        codeStore.set(id, cmds.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).join('\n'));
        const lines = H.lines(cmds, 'bash').map((l, i) => {
            const raw = cmds.split('\n')[i] || '';
            const prompt = raw.trim() && !raw.trim().startsWith('#') ? '<span class="t-prompt">$ </span>' : '';
            return `<span class="ln">${prompt}${l}</span>`;
        }).join('');
        const out = b.out ? `<div class="term-out" data-label="${T('output')}">${esc(String(b.out).replace(/^\n/, '').replace(/\s+$/, ''))}</div>` : '';
        return `<div class="code-wrap">
            <div class="code-head"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="code-file">${esc(b.file || T('terminal'))}</span><span class="code-lang">bash</span>
                <button class="copy-btn" data-act="copy" data-id="${id}" aria-label="${T('copy')}">${ICON.copy}<span>${T('copy')}</span></button></div>
            <pre class="code nonum"><code>${lines}</code></pre>${out}
        </div>`;
    }

    const CALLOUT = {
        tip: ['💡', ['Tip', 'نصيحة']],
        warn: ['⚠️', ['Warning', 'تحذير']],
        best: ['✅', ['Best practice', 'أفضل ممارسة']],
        mistake: ['❌', ['Common mistake', 'خطأ شائع']],
        note: ['🧠', ['Analogy', 'تشبيه']]
    };
    function callout(kind, text, label) {
        const [ico, lbl] = CALLOUT[kind];
        return `<div class="callout ${kind}" role="note"><span class="callout-ico" aria-hidden="true">${ico}</span>
            <div><span class="callout-label">${L(label || lbl)}</span><p>${L(text)}</p></div></div>`;
    }

    function table(t) {
        const head = `<thead><tr>${t.h.map((c) => `<th scope="col">${L(c)}</th>`).join('')}</tr></thead>`;
        const body = `<tbody>${t.r.map((row) => `<tr>${row.map((c) => `<td>${L(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="table-wrap"><table>${head}${body}</table></div>`;
    }

    function exerciseBox(b) {
        const timer = b.time ? `<button class="btn warm no-print" data-act="timer" data-min="${b.time}">${ICON.timer.replace('<svg', '<svg width="16" height="16"')} ${T('startTimer', { n: b.time })}</button>` : '';
        const sol = b.solution ? `<details class="solution"><summary>${T('solution')}</summary>${codeBlock(b.solution)}</details>` : '';
        return `<div class="exercise-box">
            <div class="exercise-head"><p class="exercise-label">🏋️ ${T('exercise')}</p>${timer}</div>
            <ol>${b.tasks.map((x) => `<li>${L(x)}</li>`).join('')}</ol>
            ${b.hint ? `<p class="hint"><strong>${T('hint')}:</strong> ${L(b.hint)}</p>` : ''}${sol}
        </div>`;
    }

    function block(b) {
        if (b == null) return '';
        if (typeof b === 'string' || Array.isArray(b)) return `<p class="p">${L(b)}</p>`;
        if (b.p) return `<p class="p">${L(b.p)}</p>`;
        if (b.lead) return `<p class="lead">${L(b.lead)}</p>`;
        if (b.ul) return `<ul class="bullet-list">${b.ul.map((x) => `<li>${L(x)}</li>`).join('')}</ul>`;
        if (b.steps) return `<ol class="steps">${b.steps.map((x) => `<li><span>${L(x)}</span></li>`).join('')}</ol>`;
        if (b.code !== undefined) return codeBlock(b);
        if (b.term !== undefined) return termBlock(b);
        if (b.tree !== undefined) return codeBlock({ code: b.tree, lang: 'tree', file: b.file || '📁 project', nonum: true });
        for (const k of Object.keys(CALLOUT)) if (b[k]) return callout(k, b[k], b.label);
        if (b.diagram) {
            return `<figure class="diagram" role="img" aria-label="${esc(L(b.cap || b.diagram))}">${window.Diagrams.render(b.diagram, L)}${b.cap ? `<figcaption>${L(b.cap)}</figcaption>` : ''}</figure>`;
        }
        if (b.table) return table(b.table);
        if (b.cols) return `<div class="cols${b.cols.length === 3 ? ' c3' : ''}">${b.cols.map((c) => `<div>${c.map(block).join('')}</div>`).join('')}</div>`;
        if (b.cards) {
            return `<div class="cards">${b.cards.map((c) => `<div class="card">${c.i ? `<div class="card-i" aria-hidden="true">${c.i}</div>` : ''}<p class="card-t">${L(c.t)}</p>${c.d ? `<p class="card-d">${L(c.d)}</p>` : ''}</div>`).join('')}</div>`;
        }
        if (b.img) return `<figure class="figure"><img src="${b.img}" alt="${esc(L(b.alt))}" loading="lazy">${b.cap ? `<figcaption>${L(b.cap)}</figcaption>` : ''}</figure>`;
        if (b.tasks) return exerciseBox(b);
        if (b.play !== undefined) return playground(b);
        if (b.qa) {
            return `<div class="qa">${b.qa.map((x) => `<details><summary>${L(x.q)}</summary><p class="qa-a">${L(x.a)}</p></details>`).join('')}</div>`;
        }
        if (b.h3) return `<h3 style="margin:.4rem 0 .7rem;font-size:1.15rem">${L(b.h3)}</h3>`;
        if (b.html) return typeof b.html === 'function' ? b.html(L, T) : L(b.html);
        return '';
    }
    const blocks = (arr) => (arr || []).map(block).join('');
    // deck-specific widgets (e.g. a talk's js/talk.js) can reuse the block renderers inside { html: fn } blocks
    window.DeckRender = { block, blocks, codeBlock };

    /* =====================================================================
       Slide list
       ===================================================================== */
    const chId = (ch) => 'ch' + pad(ch.n);
    const lvlVar = (i) => (i == null ? 'var(--accent)' : `var(--l${i})`);

    function build() {
        const S = [];
        const add = (o) => { o.idx = S.length; S.push(o); };
        // meta.covers === false (talks): no chapter cover slide; the chapter's first slide takes the chapter id
        const covers = !(DECK.meta && DECK.meta.covers === false);
        (DECK.intro || []).forEach((s, k) => add({ id: s.id || 'intro-' + k, kind: 'intro', title: s.t, data: s }));
        DECK.levels.forEach((lv, li) => {
            add({ id: 'level-' + li, lv: li, kind: 'level', title: lv.t, data: lv });
            DECK.chapters.filter((c) => c.level === li).sort((a, b) => a.n - b.n).forEach((ch) => {
                if (covers) add({ id: chId(ch), lv: li, ch, kind: 'cover', title: ch.t });
                ch.slides.forEach((s, k) => add({ id: !covers && k === 0 ? chId(ch) : chId(ch) + '-' + (k + 1), lv: li, ch, kind: s.kind || 'concept', title: s.t, data: s }));
                if (ch.quiz && ch.quiz.length) add({ id: !covers && !ch.slides.length ? chId(ch) : chId(ch) + '-quiz', lv: li, ch, kind: 'quiz', title: [`Quiz: ${ch.t[0]}`, `اختبار: ${ch.t[1]}`] });
            });
        });
        (DECK.outro || []).forEach((s, k) => add({ id: s.id || 'outro-' + k, kind: s.type === 'exam' ? 'exam' : 'outro', title: s.t, data: s }));
        return S;
    }

    function kicker(s) {
        const kind = s.kind;
        const pill = `<span class="kind-pill kind-${kind}">${T(kind)}</span>`;
        const ch = s.ch ? `<span>${T('chapter')} ${s.ch.n} · ${L(s.ch.t)}</span>` : '';
        return `<p class="slide-number">${pill}${ch}</p>`;
    }

    function renderSlide(s) {
        switch (s.kind) {
            case 'intro': case 'outro': return renderFree(s);
            case 'level': return renderLevel(s);
            case 'cover': return renderCover(s);
            case 'quiz': return renderQuiz(s);
            case 'exam': return renderExam(s);
            default:
                return `<div class="slide-content${s.data.narrow ? ' narrow' : ''}">${kicker(s)}<h2 class="slide-title">${L(s.title)}</h2>${blocks(s.data.b)}</div>`;
        }
    }

    function renderFree(s) {
        const d = s.data;
        if (d.type === 'title') {
            return `<div class="slide-content center narrow">
                ${d.img ? `<img src="${d.img}" alt="${esc(L(d.alt))}" style="width:min(420px,80%);max-height:34vh;margin:0 auto 1rem;display:block">` : ''}
                <h1 class="section-title">${L(d.t)}</h1>
                <p class="section-subtitle">${L(d.sub)}</p>
                ${d.chips ? `<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:1.4rem">${d.chips.map((c) => `<span class="level-badge" style="--lvl:var(--accent)">${L(c)}</span>`).join('')}</div>` : ''}
                <p style="margin-top:2rem;color:var(--muted)">${T('startHint')}</p></div>`;
        }
        if (d.type === 'roadmap') {
            const steps = DECK.levels.map((lv, i) => {
                const n = DECK.chapters.filter((c) => c.level === i).length;
                return `<button class="road-step" style="--lvl:var(--l${i})" data-act="goto" data-id="level-${i}"><b>${T('level')} ${lvNum(i)}</b><span>${L(lv.t)}</span><small>${n} ${lang === 'ar' ? 'فصول' : 'chapters'}</small></button>`;
            }).join('');
            return `<div class="slide-content"><p class="slide-number"><span class="kind-pill kind-concept">${T('intro')}</span></p><h2 class="slide-title">${L(d.t)}</h2>${blocks(d.before)}<div class="roadmap">${steps}</div>${blocks(d.b)}</div>`;
        }
        if (d.type === 'dashboard') return renderDashboard(s);
        const centered = d.center ? ' center' : '';
        return `<div class="slide-content${d.narrow ? ' narrow' : ''}${centered}">
            ${d.icon ? `<div class="section-icon">${d.icon}</div>` : `<p class="slide-number"><span class="kind-pill kind-concept">${T(s.kind)}</span></p>`}
            ${d.center ? `<h1 class="section-title">${L(d.t)}</h1>${d.sub ? `<p class="section-subtitle">${L(d.sub)}</p>` : ''}` : `<h2 class="slide-title">${L(d.t)}</h2>`}
            ${blocks(d.b)}</div>`;
    }

    function renderLevel(s) {
        const lv = s.data, li = s.lv;
        const chs = DECK.chapters.filter((c) => c.level === li).sort((a, b) => a.n - b.n);
        return `<div class="slide-content center narrow">
            ${lv.img ? `<img class="level-art" src="${lv.img}" alt="${esc(L(lv.alt || lv.t))}">` : `<div class="section-icon">${lv.icon}</div>`}
            <p class="slide-number" style="justify-content:center"><span class="kind-pill" style="color:var(--lvl)">${T('level')} ${lvNum(li)}</span></p>
            <h1 class="section-title">${L(lv.t)}</h1>
            <p class="section-subtitle">${L(lv.sub)}</p>
            <div class="chapter-list">${chs.map((c) => `<button class="chapter-link" data-act="goto" data-id="${chId(c)}"><span class="num">${pad(c.n)}</span><span>${c.icon} ${L(c.t)}</span></button>`).join('')}</div>
        </div>`;
    }

    function renderCover(s) {
        const ch = s.ch;
        const lv = DECK.levels[ch.level];
        const art = ch.img || lv.img;
        return `<div class="slide-content${art ? '' : ' narrow'}">
            <div class="cover">
                <div class="cover-num" aria-hidden="true">${pad(ch.n)}</div>
                <div>
                    <span class="level-badge">${lv.icon} ${T('level')} ${lvNum(ch.level)} · ${L(lv.t)}</span>
                    <h1 class="section-title" style="text-align:start;margin-top:.6rem">${ch.icon} ${L(ch.t)}</h1>
                    <p class="section-subtitle" style="text-align:start;margin:0">${L(ch.sub)}</p>
                </div>
            </div>
            <div class="cover-body${art ? ' has-art' : ''}"><div>
            ${ch.learn ? `<h3 style="margin:1.6rem 0 .7rem;font-size:1.05rem;color:var(--muted)">${T('learn')}</h3><ul class="bullet-list">${ch.learn.map((x) => `<li>${L(x)}</li>`).join('')}</ul>` : ''}
            ${ch.project ? `<div class="milestone"><b>🧩 ${T('milestone')}:</b> ${L(ch.project)}</div>` : ''}
            </div>${art ? `<img class="cover-art" src="${art}" alt="${esc(L(ch.alt || ch.t))}" loading="lazy">` : ''}</div>
        </div>`;
    }

    /* =====================================================================
       Quiz engine (per chapter)
       ===================================================================== */
    function qType(q) { return q.tf !== undefined ? 'tf' : q.out ? 'out' : 'mc'; }
    // Options are shuffled with a permutation seeded by the question text: stable across
    // renders and languages, but the correct answer is no longer always in the same slot.
    const permCache = new WeakMap();
    function perm(q) {
        if (permCache.has(q)) return permCache.get(q);
        const idx = q.o.map((_, i) => i);
        const s = JSON.stringify(q.q);
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
        for (let i = idx.length - 1; i > 0; i--) {
            h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
            const j = h % (i + 1);
            [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        permCache.set(q, idx);
        return idx;
    }
    function qOptions(q) { return qType(q) === 'tf' ? [UI[lang].true, UI[lang].false] : perm(q).map((i) => L(q.o[i])); }
    function qAnswer(q) { return qType(q) === 'tf' ? (q.tf ? 0 : 1) : perm(q).indexOf(q.a); }
    const optHTML = (txt) => (/^`[\s\S]*`$/.test(txt) ? `<code>${esc(txt.slice(1, -1))}</code>` : txt);

    function qBody(q) {
        return `<p class="q-type">${T(qType(q))}</p><p class="q-text">${L(q.q)}</p>${q.code ? codeBlock({ code: q.code, file: q.file || 'snippet.js', lang: q.lang }) : ''}`;
    }

    function ring(pct) {
        const C = 2 * Math.PI * 64;
        return `<div class="ring"><svg viewBox="0 0 150 150"><circle class="bg" cx="75" cy="75" r="64"/><circle class="fg" cx="75" cy="75" r="64" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg><div class="ring-txt">${pct}%</div></div>`;
    }

    function printQuiz(qs) {
        return `<div class="print-only print-quiz"><ol>${qs.map((q) => {
            const opts = qOptions(q), a = qAnswer(q);
            return `<li><b>${L(q.q)}</b>${q.code ? `<pre style="font-family:var(--mono);font-size:.85em;white-space:pre-wrap;direction:ltr;text-align:left">${esc(q.code)}</pre>` : ''}<br>${opts.map((o, i) => `<span class="${i === a ? 'ans' : ''}">${String.fromCharCode(65 + i)}) ${optHTML(o)}${i === a ? ' ✓' : ''}</span>`).join(' &nbsp; ')}<br><small>${L(q.e)}</small></li>`;
        }).join('')}</ol></div>`;
    }

    function renderQuiz(s) {
        const ch = s.ch, qs = ch.quiz, id = chId(ch);
        const st = quizState[id] || (quizState[id] = { i: 0, picks: [], done: false });
        const correct = st.picks.filter((p, k) => p === qAnswer(qs[k])).length;
        const dots = qs.map((q, k) => {
            const p = st.picks[k];
            const cls = p === undefined ? (k === st.i && !st.done ? 'cur' : '') : p === qAnswer(q) ? 'ok' : 'bad';
            return `<span class="q-dot ${cls}"></span>`;
        }).join('');
        let body;
        if (st.done) {
            const pct = Math.round((correct / qs.length) * 100);
            const msg = pct === 100 ? T('perfect') : pct >= 60 ? T('good') : T('low');
            const best = scores[id];
            body = `<div class="q-card result">${ring(pct)}<h3>${correct} / ${qs.length}</h3><p>${msg}${best ? ` · ${T('best')}: ${best.s}/${best.n}` : ''}</p>
                <div class="result-actions"><button class="btn" data-act="quiz-retry" data-q="${id}">↺ ${T('retry')}</button><button class="btn primary" data-act="next">${T('continue')} →</button></div></div>`;
        } else {
            const q = qs[st.i], pick = st.picks[st.i], ans = qAnswer(q), answered = pick !== undefined;
            const opts = qOptions(q).map((o, k) => {
                let cls = '';
                if (answered) { if (k === ans) cls = 'correct'; else if (k === pick) cls = 'wrong'; }
                return `<button class="q-opt ${cls}" data-act="quiz-pick" data-q="${id}" data-k="${k}" ${answered ? 'disabled' : ''}><span class="q-key">${k + 1}</span><span>${optHTML(o)}</span></button>`;
            }).join('');
            const fb = answered ? `<div class="q-explain ${pick === ans ? 'ok' : 'bad'}" role="status"><b>${pick === ans ? '✅ ' + T('correct') : '❌ ' + T('wrong')}</b>${L(q.e)}</div>` : '';
            const nextBtn = answered ? `<button class="btn primary" data-act="quiz-next" data-q="${id}">${st.i === qs.length - 1 ? T('results') : T('nextQ')} →</button>` : '<span></span>';
            body = `<div class="q-card">${qBody(q)}<div class="q-opts" role="group">${opts}</div>${fb}
                <div class="q-actions"><span class="q-score">${T('question')} ${st.i + 1} ${T('of')} ${qs.length}</span>${nextBtn}</div></div>`;
        }
        return `<div class="slide-content"><div class="quiz">${kicker(s)}
            <div class="quiz-top"><h2 class="slide-title" style="margin:0"><span class="emo">📝</span> ${T('quiz')}: ${L(ch.t)}</h2>
            <div style="display:flex;align-items:center;gap:.8rem"><div class="q-dots" aria-hidden="true">${dots}</div><span class="q-score">${correct}/${qs.length}</span></div></div>
            <div class="screen-only">${body}</div>${printQuiz(qs)}</div></div>`;
    }

    function quizPick(id, k) {
        const st = quizState[id];
        if (!st || st.done || st.picks[st.i] !== undefined) return;
        st.picks[st.i] = k;
        rerenderCurrent();
    }
    function quizNext(id) {
        const st = quizState[id];
        const ch = DECK.chapters.find((c) => chId(c) === id);
        if (st.picks[st.i] === undefined) return;
        if (st.i < ch.quiz.length - 1) st.i++;
        else {
            st.done = true;
            const s = st.picks.filter((p, k) => p === qAnswer(ch.quiz[k])).length;
            if (!scores[id] || s >= scores[id].s) { scores[id] = { s, n: ch.quiz.length }; store.set('scores', scores); }
            buildSidebar();
        }
        rerenderCurrent();
    }

    /* =====================================================================
       Final exam
       ===================================================================== */
    function renderExam(s) {
        const pool = DECK.exam;
        let body;
        if (exam.phase === 'start') {
            const best = scores.exam;
            body = `<div class="q-card center" style="padding:2rem">
                <div class="section-icon">🎓</div>
                <p class="lead">${T('examDesc', { n: pool.length })}</p>
                ${best ? `<p class="q-score">${T('best')}: ${best.s}/${best.n}</p>` : ''}
                <button class="btn primary" data-act="exam-start" style="margin-top:1rem;font-size:1rem;padding:.75rem 1.4rem">${T('examStart')} →</button></div>`;
        } else if (exam.phase === 'run') {
            const qi = exam.round[exam.i], q = pool[qi], pick = exam.picks[qi];
            const opts = qOptions(q).map((o, k) => `<button class="q-opt ${pick === k ? 'correct' : ''}" data-act="exam-pick" data-k="${k}" aria-pressed="${pick === k}"><span class="q-key">${k + 1}</span><span>${optHTML(o)}</span></button>`).join('');
            const last = exam.i === exam.round.length - 1;
            const dots = exam.round.map((x, k) => `<span class="q-dot ${k === exam.i ? 'cur' : exam.picks[x] !== undefined ? 'ok' : ''}"></span>`).join('');
            body = `<div class="quiz-top"><div class="q-dots">${dots}</div><span class="q-score">${T('question')} ${exam.i + 1} ${T('of')} ${exam.round.length}</span></div>
                <div class="q-card">${qBody(q)}<div class="q-opts">${opts}</div>
                <div class="q-actions"><button class="btn" data-act="exam-prev" ${exam.i === 0 ? 'disabled' : ''}>← ${T('prevQ')}</button>
                ${last ? `<button class="btn primary" data-act="exam-finish">${T('finish')} ✓</button>` : `<button class="btn primary" data-act="exam-next">${T('nextQ')} →</button>`}</div></div>`;
        } else {
            const total = exam.round.length;
            const ok = exam.round.filter((qi) => exam.picks[qi] === qAnswer(pool[qi]));
            const wrong = exam.round.filter((qi) => exam.picks[qi] !== qAnswer(pool[qi]));
            const pct = Math.round((ok.length / total) * 100);
            const grade = T('grade')[pct >= 90 ? 3 : pct >= 75 ? 2 : pct >= 55 ? 1 : 0];
            const bd = DECK.levels.map((lv, i) => {
                const inL = exam.round.filter((qi) => pool[qi].level === i);
                const okL = inL.filter((qi) => ok.includes(qi)).length;
                return `<div class="bd" style="--lvl:var(--l${i})">${T('level')} ${lvNum(i)}<b>${inL.length ? okL + '/' + inL.length : '—'}</b></div>`;
            }).join('');
            const review = exam.round.map((qi, k) => {
                const q = pool[qi], a = qAnswer(q), p = exam.picks[qi], opts = qOptions(q);
                return `<div class="review-item ${p === a ? 'ok' : 'bad'}"><b>${k + 1}. ${p === a ? '✅' : '❌'} ${L(q.q)}</b>
                    <small>${T('yourAnswer')}: ${p === undefined ? T('notAnswered') : optHTML(opts[p])} · ${T('rightAnswer')}: ${optHTML(opts[a])}</small><small>${L(q.e)}</small></div>`;
            }).join('');
            body = `<div class="q-card result">${ring(pct)}<h3>${ok.length} / ${total} · ${grade}</h3>
                <div class="breakdown">${bd}</div>
                <div class="result-actions">${wrong.length ? `<button class="btn primary" data-act="exam-retry-wrong">↺ ${T('retryWrong', { n: wrong.length })}</button>` : ''}<button class="btn" data-act="exam-restart">${T('restart')}</button></div>
                <div class="review">${review}</div></div>`;
        }
        return `<div class="slide-content"><div class="quiz">
            <p class="slide-number"><span class="kind-pill kind-quiz">${T('outro')}</span></p>
            <h2 class="slide-title"><span class="emo">🎓</span> ${T('examTitle')}</h2><div class="screen-only">${body}</div>${printQuiz(pool)}</div></div>`;
    }

    function examAct(act, k) {
        const pool = DECK.exam;
        if (act === 'exam-start' || act === 'exam-restart') { exam.phase = 'run'; exam.round = pool.map((_, i) => i); exam.i = 0; exam.picks = {}; }
        if (act === 'exam-pick') exam.picks[exam.round[exam.i]] = k;
        if (act === 'exam-next') exam.i = Math.min(exam.i + 1, exam.round.length - 1);
        if (act === 'exam-prev') exam.i = Math.max(exam.i - 1, 0);
        if (act === 'exam-finish') {
            exam.phase = 'done';
            if (exam.round.length === pool.length) {
                const s = exam.round.filter((qi) => exam.picks[qi] === qAnswer(pool[qi])).length;
                if (!scores.exam || s >= scores.exam.s) { scores.exam = { s, n: pool.length }; store.set('scores', scores); }
            }
        }
        if (act === 'exam-retry-wrong') {
            const wrong = exam.round.filter((qi) => exam.picks[qi] !== qAnswer(pool[qi]));
            wrong.forEach((qi) => delete exam.picks[qi]);
            exam.round = wrong; exam.i = 0; exam.phase = 'run';
        }
        rerenderCurrent();
        const sc = $('.slide.active .slide-content');
        if (sc && act !== 'exam-pick') sc.scrollTop = 0;
    }

    function renderDashboard(s) {
        const d = s.data;
        const cells = DECK.chapters.slice().sort((a, b) => a.n - b.n).map((c) => {
            const sc = scores[chId(c)];
            return `<button class="${sc ? '' : 'none'}" style="--lvl:var(--l${c.level})" data-act="goto" data-id="${chId(c)}-quiz">${pad(c.n)} ${L(c.t)} <b>${sc ? sc.s + '/' + sc.n : T('noScore')}</b></button>`;
        }).join('');
        const done = Object.keys(scores).filter((k) => k !== 'exam').length;
        const ex = scores.exam ? `${scores.exam.s}/${scores.exam.n}` : T('noScore');
        return `<div class="slide-content"><p class="slide-number"><span class="kind-pill kind-quiz">${T('outro')}</span></p>
            <h2 class="slide-title"><span class="emo">📊</span> ${L(d.t)}</h2><p class="lead">${T('progress', { a: seen.size, b: DECK.chapters.length, c: done })} · 🎓 ${ex}</p>
            <div class="dash">${cells}</div>${blocks(d.b)}</div>`;
    }

    /* =====================================================================
       DOM: render + navigation
       ===================================================================== */
    const container = $('#slidesContainer');

    function renderAll() {
        codeStore = new Map(); codeSeq = 0;
        container.innerHTML = slides.map((s, i) => {
            const cls = i === current ? 'slide active' : i < current ? 'slide prev' : 'slide';
            return `<section class="${cls}" id="s-${s.id}" style="--lvl:${lvlVar(s.lv ?? (s.ch ? s.ch.level : null))}" aria-roledescription="slide" aria-label="${i + 1} / ${slides.length}" ${i === current ? '' : 'aria-hidden="true" inert'}>${renderSlide(s)}</section>`;
        }).join('');
        updateChrome();
    }

    function rerenderCurrent() {
        const el = container.children[current];
        if (!el) return;
        const sc = el.querySelector('.slide-content');
        const top = sc ? sc.scrollTop : 0;
        el.innerHTML = renderSlide(slides[current]);
        const sc2 = el.querySelector('.slide-content');
        if (sc2) { sc2.scrollTop = top; $$(':scope > *', sc2).forEach((c) => { c.style.animation = 'none'; }); }
    }

    function goTo(i, opts = {}) {
        if (i < 0 || i >= slides.length || Number.isNaN(i)) return;
        const prev = current;
        current = i;
        Array.from(container.children).forEach((el, k) => {
            el.classList.toggle('active', k === i);
            el.classList.toggle('prev', k < i);
            if (k === i) { el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); }
            else { el.setAttribute('aria-hidden', 'true'); el.setAttribute('inert', ''); }
        });
        if (prev !== i && slides[i].kind === 'outro' && slides[i].data.type === 'dashboard') rerenderCurrent();
        const sc = container.children[i] && container.children[i].querySelector('.slide-content');
        if (sc && !opts.keepScroll) sc.scrollTop = 0;
        const s = slides[i];
        if (s.ch && !seen.has(chId(s.ch))) { seen.add(chId(s.ch)); store.set('seen', [...seen]); buildSidebar(); }
        store.set('slide', s.id);
        try { history.replaceState(null, '', '#' + s.id); } catch (e) { /* file:// in some browsers */ }
        updateChrome();
    }
    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);
    const indexOf = (id) => slides.findIndex((s) => s.id === id);

    function updateChrome() {
        const total = slides.length, s = slides[current];
        $('#progressFill').style.width = ((current + 1) / total) * 100 + '%';
        $('#progressBar').setAttribute('aria-valuenow', String(Math.round(((current + 1) / total) * 100)));
        $('#slideCounter').textContent = `${current + 1} / ${total}`;
        $('#prevBtn').disabled = current === 0;
        $('#nextBtn').disabled = current === total - 1;
        const lv = s.lv ?? (s.ch ? s.ch.level : null);
        $('#crumb').textContent = [lv != null ? `${T('level')} ${lvNum(lv)}` : '', s.ch ? `${T('chapter')} ${s.ch.n}` : '', L(s.ch ? s.ch.t : s.title)].filter(Boolean).join(' · ');
        document.documentElement.style.setProperty('--lvl-cur', lvlVar(lv));
        $$('.side-item').forEach((b) => b.classList.toggle('cur', s.ch ? b.dataset.id === chId(s.ch) : b.dataset.id === s.id));
    }

    function buildMarks() {
        const marks = $('#progressMarks');
        marks.innerHTML = slides.map((s, i) => (s.kind === 'level' ? `<i style="inset-inline-start:${(i / slides.length) * 100}%"></i>` : '')).join('');
    }

    /* ---------- sidebar ---------- */
    function buildSidebar() {
        const q = ($('#sideSearch').value || '').trim().toLowerCase();
        const match = (pair) => !q || (Array.isArray(pair) ? pair.join(' ') : String(pair)).toLowerCase().includes(q);
        let html = '';
        const item = (id, num, title, extra, lvl) => `<button class="side-item" data-act="goto" data-id="${id}" style="--lvl:${lvl}"><span class="num">${num}</span><span class="ttl">${L(title)}</span>${extra || ''}</button>`;
        const intro = (DECK.intro || []).filter((s) => match(s.t));
        if (intro.length) html += `<div class="side-level" style="--lvl:var(--accent)">${T('intro')}</div>` + intro.map((s, k) => item(s.id || 'intro-' + k, '•', s.t, '', 'var(--accent)')).join('');
        DECK.levels.forEach((lv, li) => {
            const chs = DECK.chapters.filter((c) => c.level === li && (match(c.t) || match(c.sub))).sort((a, b) => a.n - b.n);
            if (!chs.length && q) return;
            html += `<div class="side-level" style="--lvl:var(--l${li})">${lv.icon} ${T('level')} ${lvNum(li)} · ${L(lv.t)}</div>`;
            html += chs.map((c) => {
                const sc = scores[chId(c)];
                const badge = sc ? `<span class="badge ${sc.s / sc.n >= 0.8 ? 'good' : ''}">${sc.s}/${sc.n}</span>` : '';
                return item(chId(c), pad(c.n), c.t, `${badge}<span class="seen ${seen.has(chId(c)) ? 'on' : ''}" aria-hidden="true"></span>`, `var(--l${li})`);
            }).join('');
        });
        const outro = (DECK.outro || []).filter((s) => match(s.t));
        if (outro.length) html += `<div class="side-level" style="--lvl:var(--violet)">${T('outro')}</div>` + outro.map((s, k) => item(s.id || 'outro-' + k, '★', s.t, s.type === 'exam' && scores.exam ? `<span class="badge">${scores.exam.s}/${scores.exam.n}</span>` : '', 'var(--violet)')).join('');
        const root = (DECK.meta && DECK.meta.root) ?? '../';
        html += `<div class="side-level" style="--lvl:var(--accent-warm)">📚 ${T('courses')}</div>` + COURSES.map((c) =>
            `<a class="side-item${c.id === DECK_ID ? ' cur' : ''}" href="${root}${c.path}index.html"><span class="num">${c.icon}</span><span class="ttl">${L(c.t)}</span></a>`).join('');
        $('#sideBody').innerHTML = html;
        const done = Object.keys(scores).filter((k) => k !== 'exam').length;
        $('#sideProgress').textContent = T('progress', { a: seen.size, b: DECK.chapters.length, c: done });
        updateChromeSafe();
    }
    function updateChromeSafe() { if (slides.length) { const s = slides[current]; $$('.side-item').forEach((b) => b.classList.toggle('cur', s.ch ? b.dataset.id === chId(s.ch) : b.dataset.id === s.id)); } }

    function toggleSidebar(force) {
        const on = force ?? !$('#sidebar').classList.contains('on');
        $('#sidebar').classList.toggle('on', on);
        $('#scrim').classList.toggle('on', on);
        $('#menuBtn').setAttribute('aria-expanded', String(on));
        $('#sidebar').toggleAttribute('inert', !on);
        if (on) setTimeout(() => $('#sideSearch').focus(), 50);
    }

    /* ---------- overview & help ---------- */
    function buildOverview() {
        const groups = [];
        slides.forEach((s) => {
            const key = s.ch ? chId(s.ch) : s.kind === 'level' ? 'level-' + s.lv : s.kind;
            let g = groups[groups.length - 1];
            if (!g || g.key !== key) { g = { key, title: s.ch ? `${pad(s.ch.n)} · ${L(s.ch.t)}` : L(s.title), lv: s.lv, items: [] }; groups.push(g); }
            g.items.push(s);
        });
        $('#overviewBody').innerHTML = groups.map((g) => `<div class="ov-chapter" style="--lvl:${lvlVar(g.lv)}"><h3>${esc(g.title)}</h3><div class="ov-grid">${g.items.map((s) => `<button class="ov-card ${s.idx === current ? 'cur' : ''}" data-act="goto" data-id="${s.id}"><small>${T(s.kind)}</small><span>${esc(L(s.title))}</span><i>${s.idx + 1}</i></button>`).join('')}</div></div>`).join('');
    }
    function toggleOverlay(id, force) {
        const el = $('#' + id);
        const on = force ?? !el.classList.contains('on');
        $$('.overlay').forEach((o) => { if (o !== el) o.classList.remove('on'); });
        el.classList.toggle('on', on);
        if (on && id === 'overview') {
            buildOverview();
            const cur = $('.ov-card.cur');
            if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus({ preventScroll: true }); }
        }
        if (on && id === 'help') $('#help .tbtn').focus();
    }
    function buildHelp() {
        const rows = [
            ['→ / Space / PgDn', T('next')], ['← / PgUp', T('prev')], ['Home / End', T('gotoFirst')], ['F', T('fullscreen')],
            ['Esc', T('overview')], ['M', T('menu')], ['T', T('theme')], ['+ / −', T('zoomIn') + ' / ' + T('zoomOut')],
            ['L', T('laser')], ['B', T('blackout')], ['1 – 4', T('answer')], ['?', T('help')]
        ];
        $('#helpBody').innerHTML = `<div class="help-grid">${rows.map(([k, v]) => `<div class="help-row"><span>${v}</span><span>${k.split(' / ').map((x) => `<kbd>${x}</kbd>`).join(' ')}</span></div>`).join('')}</div><p class="hint" style="margin-top:1.5rem">${T('pdfTip')}</p>`;
    }

    /* ---------- theme / lang / zoom ---------- */
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', theme);
        $('#themeBtn').innerHTML = theme === 'dark'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
        $('#themeBtn').setAttribute('aria-label', T('theme'));
    }
    function applyLang() {
        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';
        $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'AR';
        $('#langBtn').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
        if (FORCED_LANG) $('#langBtn').style.display = 'none';
        document.title = L(DECK.meta.title);
        $$('[data-i18n]').forEach((el) => { el.textContent = T(el.dataset.i18n); });
        $$('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', T(el.dataset.i18nLabel)); el.title = T(el.dataset.i18nLabel); });
        $('#sideSearch').placeholder = T('search');
        $('.brand-title').textContent = L(DECK.meta.short);
        buildHelp();
        buildSidebar();
        renderAll();
        if ($('#overview').classList.contains('on')) buildOverview();
    }
    function applyScale() {
        document.documentElement.style.setProperty('--scale', scale);
        store.set('scale', scale);
    }

    /* ---------- toast / copy / timer ---------- */
    let toastT;
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg; t.classList.add('on');
        clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800);
    }
    async function copy(id, btn) {
        const text = codeStore.get(id) || '';
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
            ta.remove();
        }
        if (ok && btn) {
            btn.classList.add('ok'); btn.innerHTML = ICON.check + `<span>${T('copied')}</span>`;
            setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = ICON.copy + `<span>${T('copy')}</span>`; }, 1600);
        }
    }
    let timerEnd = 0, timerInt = null;
    function startTimer(min) {
        timerEnd = Date.now() + min * 60000;
        const chip = $('#timerChip');
        chip.classList.add('on'); chip.classList.remove('done');
        clearInterval(timerInt);
        const tick = () => {
            const left = Math.max(0, timerEnd - Date.now());
            const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
            chip.textContent = `⏱ ${pad(m)}:${pad(s)}`;
            if (left === 0) { clearInterval(timerInt); chip.classList.add('done'); toast(T('timeUp')); }
        };
        tick(); timerInt = setInterval(tick, 250);
    }
    function stopTimer() { clearInterval(timerInt); $('#timerChip').classList.remove('on', 'done'); toast(T('timerStopped')); }

    function fullscreen() {
        if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
        else document.exitFullscreen && document.exitFullscreen();
    }

    /* ---------- events ---------- */
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-act]');
        if (!el) return;
        const act = el.dataset.act;
        switch (act) {
            case 'copy': copy(el.dataset.id, el); break;
            case 'play-reset': {
                const box = el.closest('.play');
                box.querySelector('.play-src').value = codeStore.get(el.dataset.id);
                updatePlay(box);
                break;
            }
            case 'goto': {
                const i = indexOf(el.dataset.id);
                if (i >= 0) { goTo(i); toggleSidebar(false); toggleOverlay('overview', false); }
                break;
            }
            case 'next': next(); break;
            case 'timer': startTimer(Number(el.dataset.min)); break;
            case 'quiz-pick': quizPick(el.dataset.q, Number(el.dataset.k)); break;
            case 'quiz-next': quizNext(el.dataset.q); break;
            case 'quiz-retry': quizState[el.dataset.q] = { i: 0, picks: [], done: false }; rerenderCurrent(); break;
            default:
                if (act.startsWith('exam-')) examAct(act, Number(el.dataset.k));
        }
    });

    $('#prevBtn').addEventListener('click', prev);
    $('#nextBtn').addEventListener('click', next);
    $('#menuBtn').addEventListener('click', () => toggleSidebar());
    $('#sideClose').addEventListener('click', () => toggleSidebar(false));
    $('#scrim').addEventListener('click', () => toggleSidebar(false));
    $('#sideSearch').addEventListener('input', buildSidebar);
    $('#overviewBtn').addEventListener('click', () => toggleOverlay('overview'));
    $('#helpBtn').addEventListener('click', () => toggleOverlay('help'));
    $$('[data-close]').forEach((b) => b.addEventListener('click', () => toggleOverlay(b.dataset.close, false)));
    $('#themeBtn').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; store.set('theme', theme); applyTheme(); });
    $('#langBtn').addEventListener('click', () => { if (FORCED_LANG) return; lang = lang === 'ar' ? 'en' : 'ar'; store.set('lang', lang); applyLang(); });
    $('#fsBtn').addEventListener('click', fullscreen);
    $('#printBtn').addEventListener('click', () => { toast(T('pdfTip')); setTimeout(() => window.print(), 300); });
    $('#zoomIn').addEventListener('click', () => { scale = Math.min(1.6, +(scale + 0.1).toFixed(2)); applyScale(); });
    $('#zoomOut').addEventListener('click', () => { scale = Math.max(0.7, +(scale - 0.1).toFixed(2)); applyScale(); });
    $('#timerChip').addEventListener('click', stopTimer);
    $('#blackout').addEventListener('click', () => $('#blackout').classList.remove('on'));

    const bar = $('#progressBar');
    const barIndex = (e) => {
        const r = bar.getBoundingClientRect();
        let f = (e.clientX - r.left) / r.width;
        if (document.documentElement.dir === 'rtl') f = 1 - f;
        return Math.min(slides.length - 1, Math.max(0, Math.floor(f * slides.length)));
    };
    bar.addEventListener('click', (e) => goTo(barIndex(e)));
    bar.addEventListener('mousemove', (e) => {
        const i = barIndex(e), tip = $('#progressTip');
        tip.textContent = `${i + 1}. ${L(slides[i].title)}`;
        tip.style.left = (e.clientX - bar.getBoundingClientRect().left) + 'px';
    });

    function updatePlay(box) {
        box.querySelector('.preview-frame').srcdoc = previewDoc(box.querySelector('.play-src').value, 'html', {});
    }
    let playT;
    document.addEventListener('input', (e) => {
        const box = e.target.closest && e.target.closest('.play');
        if (!box) return;
        clearTimeout(playT);
        playT = setTimeout(() => updatePlay(box), 250);
    });
    // Tab inside a playground inserts two spaces instead of leaving the editor
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.target.classList && e.target.classList.contains('play-src')) {
            e.preventDefault();
            const ta = e.target;
            ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
            ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, true);

    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') { if (e.key === 'Escape') toggleSidebar(false); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const overlayOpen = $('.overlay.on') || $('#sidebar').classList.contains('on');
        const k = e.key;
        if (k === 'Escape') {
            e.preventDefault();
            if ($('#blackout').classList.contains('on')) $('#blackout').classList.remove('on');
            else if (overlayOpen) { toggleSidebar(false); $$('.overlay').forEach((o) => o.classList.remove('on')); }
            else toggleOverlay('overview', true);
            return;
        }
        if (overlayOpen) return;
        const onControl = tag === 'button' || tag === 'summary' || tag === 'a';
        const s = slides[current];
        if ((s.kind === 'quiz' || (s.kind === 'exam' && exam.phase === 'run')) && /^[1-6]$/.test(k)) {
            const btn = $$('.slide.active .q-opt')[Number(k) - 1];
            if (btn && !btn.disabled) { btn.click(); e.preventDefault(); }
            return;
        }
        if (k === 'Enter' && s.kind === 'quiz' && !onControl) {
            const nb = $('.slide.active [data-act="quiz-next"]');
            if (nb) { nb.click(); e.preventDefault(); }
            return;
        }
        switch (k) {
            case 'ArrowRight': case 'ArrowDown': case 'PageDown': e.preventDefault(); next(); break;
            case ' ': if (!onControl) { e.preventDefault(); next(); } break;
            case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); prev(); break;
            case 'Home': e.preventDefault(); goTo(0); break;
            case 'End': e.preventDefault(); goTo(slides.length - 1); break;
            case 'f': case 'F': fullscreen(); break;
            case 'm': case 'M': toggleSidebar(); break;
            case 't': case 'T': $('#themeBtn').click(); break;
            case 'l': case 'L': document.body.classList.toggle('laser-on'); break;
            case 'b': case 'B': $('#blackout').classList.toggle('on'); break;
            case '+': case '=': $('#zoomIn').click(); break;
            case '-': case '_': $('#zoomOut').click(); break;
            case '0': scale = 1; applyScale(); break;
            case '?': toggleOverlay('help'); break;
            default:
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!document.body.classList.contains('laser-on')) return;
        const l = $('#laser'); l.style.left = e.clientX + 'px'; l.style.top = e.clientY + 'px';
    });

    let tx = 0, ty = 0, tIgnore = false;
    container.addEventListener('touchstart', (e) => {
        tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
        tIgnore = !!e.target.closest('pre, .table-wrap, .diagram');
    }, { passive: true });
    container.addEventListener('touchend', (e) => {
        if (tIgnore) return;
        const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        const rtl = document.documentElement.dir === 'rtl';
        if ((dx < 0) !== rtl) next(); else prev();
    }, { passive: true });

    window.addEventListener('hashchange', () => {
        const i = indexOf(location.hash.slice(1));
        if (i >= 0 && i !== current) goTo(i);
    });
    window.addEventListener('beforeprint', () => { $$('.qa details, details.solution').forEach((d) => { d.dataset.wasOpen = d.open; d.open = true; }); });
    window.addEventListener('afterprint', () => { $$('.qa details, details.solution').forEach((d) => { d.open = d.dataset.wasOpen === 'true'; }); });

    /* ---------- boot ---------- */
    slides = build();
    const fromHash = indexOf(decodeURIComponent(location.hash.slice(1)));
    const saved = indexOf(store.get('slide', ''));
    current = fromHash >= 0 ? fromHash : saved >= 0 ? saved : 0;
    applyTheme();
    applyScale();
    buildMarks();
    applyLang();
    goTo(current);
    if (fromHash < 0 && saved > 0) toast(T('resume'));
    window.Deck = window.ExpressDeck = { goTo, slides: () => slides, indexOf };
})();
