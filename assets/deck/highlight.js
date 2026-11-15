/* Tiny offline syntax highlighter (no dependencies).
   Returns an array of HTML lines so the engine can number / highlight lines. */
(function () {
    'use strict';

    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

    const JS_KW = set(`const let var function return if else for while do switch case break continue class extends
        import export from default new this super async await try catch finally throw typeof instanceof in of
        void delete yield static get set as interface type enum implements public private protected readonly
        declare namespace keyof satisfies abstract`);
    const JS_LIT = set('true false null undefined NaN Infinity');
    const SQL_KW = set(`SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE JOIN LEFT RIGHT INNER OUTER ON CREATE
        TABLE INDEX PRIMARY KEY REFERENCES NOT NULL DEFAULT AND OR ORDER BY LIMIT OFFSET GROUP HAVING AS IN IS
        LIKE ILIKE RETURNING UNIQUE SERIAL TEXT INTEGER INT VARCHAR TIMESTAMP BOOLEAN DESC ASC EXPLAIN ANALYZE
        COUNT DISTINCT BEGIN COMMIT ROLLBACK FOREIGN CASCADE ALTER ADD COLUMN DROP IF EXISTS`);
    const PRISMA_KW = set('model enum generator datasource type');
    const GQL_KW = set(`type query mutation subscription schema input enum interface union scalar fragment on
        syntax package service rpc returns message import option repeated`);
    const DOCKER_KW = set('FROM AS WORKDIR COPY RUN CMD ENV EXPOSE USER ARG ENTRYPOINT HEALTHCHECK LABEL ADD VOLUME SHELL STOPSIGNAL ONBUILD');

    function lex(code, rules) {
        const out = [];
        let i = 0;
        const n = code.length;
        outer: while (i < n) {
            for (const [cls, re] of rules) {
                re.lastIndex = i;
                const m = re.exec(code);
                if (m && m[0].length) {
                    const c = typeof cls === 'function' ? cls(m[0], code, i) : cls;
                    out.push([c, m[0]]);
                    i += m[0].length;
                    continue outer;
                }
            }
            out.push(['', code[i]]);
            i++;
        }
        return out;
    }

    const lineStart = (code, i) => code.lastIndexOf('\n', i - 1) + 1;
    const before = (code, i) => code.slice(lineStart(code, i), i);
    const nextChar = (code, i) => { const m = /\S/.exec(code.slice(i)); return m ? m[0] : ''; };
    const prevChar = (code, i) => { const m = /\S(?=\s*$)/.exec(code.slice(Math.max(0, i - 80), i)); return m ? m[0] : ''; };

    const STR = /`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y;
    const NUM = /\b(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?)\b/y;
    const WS = /\s+/y;

    function jsIdent(word, code, i) {
        if (JS_KW.has(word)) return 't-kw';
        if (JS_LIT.has(word)) return 't-lit';
        const p = prevChar(code, i);
        const end = i + word.length;
        const nc = nextChar(code, end);
        if (p === '.') return nc === '(' ? 't-fn' : 't-prop';
        if (nc === '(') return 't-fn';
        if (nc === ':' && (p === '{' || p === ',') && code[end] === ':') return 't-prop';
        if (/^[A-Z]/.test(word)) return 't-type';
        return '';
    }

    const RULES = {
        js: [
            ['t-com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
            ['t-str', STR],
            ['t-num', NUM],
            [jsIdent, /[A-Za-z_$][\w$]*/y],
            ['t-op', /=>|===|!==|\?\?=?|\?\.|\.\.\.|&&|\|\|/y],
            ['', WS]
        ],
        json: [
            ['t-prop', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
            ['t-str', /"(?:\\.|[^"\\])*"/y],
            ['t-num', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
            ['t-lit', /\b(?:true|false|null)\b/y],
            ['t-com', /\/\/[^\n]*/y],
            ['', WS]
        ],
        bash: [
            [(w, c, i) => (i === 0 || /\s/.test(c[i - 1]) ? 't-com' : ''), /#[^\n]*/y],
            ['t-str', /"(?:\\.|[^"\\])*"|'[^']*'/y],
            ['t-var', /\$\{[^}]*\}|\$[A-Za-z_]\w*|\$\d|\$\(/y],
            ['t-attr', /(?<=\s)--?[A-Za-z][\w-]*(?:=)?/y],
            [(w, c, i) => {
                const b = before(c, i).trim();
                return b === '' || /(\|\||&&|\||;|\$\(|sudo|npx|time)$/.test(b) ? 't-fn' : '';
            }, /[A-Za-z_.\/~][\w.\/@:+~-]*/y],
            ['t-op', /\|\||&&|[|>;\\]/y],
            ['', WS]
        ],
        yaml: [
            [(w, c, i) => (i === 0 || /\s/.test(c[i - 1]) ? 't-com' : ''), /#[^\n]*/y],
            ['t-var', /\$\{\{[^}]*\}\}/y],
            [(w, c, i) => (/^\s*(?:-\s+)?$/.test(before(c, i)) ? 't-prop' : ''), /[\w.\-/"']+(?=\s*:(?:\s|$))/y],
            ['t-str', /"(?:\\.|[^"\\])*"|'[^'\n]*'/y],
            ['t-lit', /\b(?:true|false|null|yes|no|on)\b(?=\s*$|\s*#)/my],
            ['t-num', /\b\d+(?:\.\d+)?\b/y],
            ['t-op', /(?<=^\s*)-(?=\s)|\||>/my],
            ['', WS]
        ],
        docker: [
            [(w, c, i) => (/^\s*$/.test(before(c, i)) ? 't-com' : ''), /#[^\n]*/y],
            [(w, c, i) => (DOCKER_KW.has(w) ? 't-kw' : ''), /[A-Z]+\b/y],
            ['t-str', /"(?:\\.|[^"\\])*"/y],
            ['t-var', /\$\{[^}]*\}|\$[A-Za-z_]\w*/y],
            ['t-attr', /(?<=\s)--[\w-]+(?:=)?/y],
            ['', WS]
        ],
        nginx: [
            ['t-com', /#[^\n]*/y],
            [(w, c, i) => (/^\s*$/.test(before(c, i)) ? 't-kw' : ''), /[a-z_]+/y],
            ['t-var', /\$\w+/y],
            ['t-str', /"[^"]*"|'[^']*'/y],
            ['t-num', /\b\d+[kmsMG]?\b/y],
            ['', WS]
        ],
        sql: [
            ['t-com', /--[^\n]*/y],
            ['t-str', /'(?:''|[^'])*'/y],
            ['t-num', NUM],
            [(w) => (SQL_KW.has(w.toUpperCase()) ? 't-kw' : ''), /[A-Za-z_]\w*/y],
            ['', WS]
        ],
        prisma: [
            ['t-com', /\/\/[^\n]*/y],
            ['t-str', /"(?:\\.|[^"\\])*"/y],
            ['t-attr', /@@?[\w.]+/y],
            [(w) => (PRISMA_KW.has(w) ? 't-kw' : /^[A-Z]/.test(w) ? 't-type' : ''), /[A-Za-z_]\w*/y],
            ['t-num', NUM],
            ['', WS]
        ],
        graphql: [
            ['t-com', /#[^\n]*|\/\/[^\n]*/y],
            ['t-str', /"(?:\\.|[^"\\])*"/y],
            [(w) => (GQL_KW.has(w) ? 't-kw' : /^[A-Z]/.test(w) ? 't-type' : ''), /[A-Za-z_]\w*/y],
            ['t-num', NUM],
            ['t-var', /\$\w+/y],
            ['', WS]
        ],
        html: [
            ['t-com', /<!--[\s\S]*?-->/y],
            ['t-fn', /<%[=\-_#]?[\s\S]*?[-_]?%>/y],
            ['t-tag', /<\/?[A-Za-z][\w-]*|\/?>/y],
            ['t-attr', /[A-Za-z_:@][\w:.-]*(?==)/y],
            ['t-str', /"[^"]*"|'[^']*'/y],
            ['', WS]
        ],
        env: [
            ['t-com', /#[^\n]*/y],
            [(w, c, i) => (/^\s*$/.test(before(c, i)) ? 't-prop' : 't-str'), /[A-Za-z_][\w]*(?==)|[^\s=#][^\n#]*/y],
            ['t-op', /=/y],
            ['', WS]
        ],
        tree: [
            ['t-com', /#[^\n]*|[│├└─]+/y],
            ['t-fn', /[\w.@\-[\]]+\/(?=\s|$)/y],
            ['', /[^\n#│├└─]/y]
        ]
    };
    RULES.ts = RULES.js;
    // JSX = JS + tags and attributes (attr="…" without spaces around "=")
    RULES.jsx = [
        RULES.js[0], RULES.js[1],
        ['t-tag', /<\/?[A-Za-z][\w.]*|<\/?>|\/>/y],
        ['t-attr', /[A-Za-z][\w-]*(?==["{])/y],
        ...RULES.js.slice(2)
    ];
    RULES.tsx = RULES.jsx;

    // CSS: a word followed by ":" is a property only if the statement ends with ; or } (not {)
    function isDecl(code, j) {
        const m = /[;{}]/.exec(code.slice(j));
        return !m || m[0] !== '{';
    }
    function css(code) {
        const out = [];
        let i = 0, inValue = false, parens = 0;
        while (i < code.length) {
            const rest = code.slice(i);
            let m, c = '';
            if ((m = /^\/\*[\s\S]*?\*\//.exec(rest))) c = 't-com';
            else if ((m = /^"(?:\\.|[^"\\\n])*"|^'(?:\\.|[^'\\\n])*'/.exec(rest))) c = 't-str';
            else if ((m = /^\s+/.exec(rest))) c = '';
            else if ((m = /^[{};]/.exec(rest))) inValue = false;
            else if (inValue) {
                if ((m = /^#[0-9a-fA-F]{3,8}\b/.exec(rest))) c = 't-num';
                else if ((m = /^-?(?:\d*\.)?\d+(?:[a-zA-Z]+|%)?/.exec(rest))) c = 't-num';
                else if ((m = /^!important/.exec(rest))) c = 't-kw';
                else if ((m = /^[\w-]+(?=\()/.exec(rest))) c = 't-fn';
                else if ((m = /^--[\w-]+/.exec(rest))) c = 't-var';
                else if ((m = /^[a-zA-Z][\w-]*/.exec(rest))) c = 't-lit';
                else m = [rest[0]];
            } else {
                if ((m = /^@[\w-]+/.exec(rest))) c = 't-kw';
                else if ((m = /^\(/.exec(rest))) parens++;
                else if ((m = /^\)/.exec(rest))) parens = Math.max(0, parens - 1);
                else if ((m = /^(?:--[\w-]+|[a-zA-Z-]+)(?=\s*:)/.exec(rest)) && (parens > 0 || isDecl(code, i + m[0].length)) && !/::?$/.test(code.slice(Math.max(0, i - 2), i))) {
                    c = m[0].startsWith('--') ? 't-var' : 't-prop';
                    const after = /^\s*:/.exec(code.slice(i + m[0].length));
                    if (after && parens === 0) {
                        out.push([c, m[0]], ['', after[0]]);
                        i += m[0].length + after[0].length;
                        inValue = true;
                        continue;
                    }
                }
                else if ((m = /^\.[\w-]+/.exec(rest))) c = 't-fn';
                else if ((m = /^#[\w-]+/.exec(rest))) c = 't-type';
                else if ((m = /^::?[\w-]+/.exec(rest))) c = 't-kw';
                else if ((m = /^\[[^\]]*\]/.exec(rest))) c = 't-attr';
                else if ((m = /^-?\d+(?:\.\d+)?(?:[a-z]+|%)?/.exec(rest))) c = 't-num';
                else if ((m = /^[a-zA-Z][\w-]*/.exec(rest))) c = 't-tag';
                else if ((m = /^[>+~*&,]/.exec(rest))) c = 't-op';
                else m = [rest[0]];
            }
            out.push([c, m[0]]);
            i += m[0].length;
        }
        return out;
    }

    function http(code) {
        const idx = code.indexOf('\n\n');
        const head = idx === -1 ? code : code.slice(0, idx);
        const body = idx === -1 ? '' : code.slice(idx);
        const toks = [];
        head.split('\n').forEach((line, k) => {
            if (k > 0) toks.push(['', '\n']);
            let m;
            if ((m = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(.*)$/.exec(line))) {
                toks.push(['t-kw', m[1]], ['', m[2]], ['t-str', m[3]], ['t-com', m[4]]);
            } else if ((m = /^(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/.exec(line))) {
                toks.push(['t-com', m[1]], ['', m[2]], ['t-num', m[3]], ['t-fn', m[4]]);
            } else if ((m = /^([\w-]+)(:)(.*)$/.exec(line))) {
                toks.push(['t-prop', m[1]], ['', m[2]], ['t-str', m[3]]);
            } else if (/^\s*(#|\/\/|###)/.test(line)) {
                toks.push(['t-com', line]);
            } else toks.push(['', line]);
        });
        return toks.concat(lex(body, RULES.json));
    }

    function diff(code) {
        return code.split('\n').flatMap((l, k) => {
            const c = /^\+/.test(l) ? 't-add' : /^-/.test(l) ? 't-del' : /^@@/.test(l) ? 't-com' : '';
            return k ? [['', '\n'], [c, l]] : [[c, l]];
        });
    }

    function tokens(code, lang) {
        if (lang === 'http') return http(code);
        if (lang === 'diff') return diff(code);
        if (lang === 'css' || lang === 'scss') return css(code);
        const r = RULES[lang];
        return r ? lex(code, r) : [['', code]];
    }

    function toLines(toks) {
        const lines = [''];
        for (const [c, t] of toks) {
            t.split('\n').forEach((p, k) => {
                if (k > 0) lines.push('');
                if (p) lines[lines.length - 1] += c ? `<span class="${c}">${esc(p)}</span>` : esc(p);
            });
        }
        return lines;
    }

    const EXT = {
        js: 'js', mjs: 'js', cjs: 'js', ts: 'ts', jsx: 'jsx', tsx: 'tsx', css: 'css', scss: 'css', htm: 'html', mts: 'ts', json: 'json', yml: 'yaml', yaml: 'yaml',
        conf: 'nginx', env: 'env', http: 'http', sql: 'sql', prisma: 'prisma', ejs: 'html', html: 'html',
        graphql: 'graphql', gql: 'graphql', proto: 'graphql', sh: 'bash', diff: 'diff'
    };
    function guess(file) {
        if (!file) return 'js';
        const f = file.toLowerCase();
        if (f.includes('dockerfile')) return 'docker';
        if (f.startsWith('.env')) return 'env';
        if (f === '.gitignore' || f === '.dockerignore') return 'text';
        const ext = f.split('.').pop();
        return EXT[ext] || 'js';
    }

    window.Highlight = { lines: (code, lang) => toLines(tokens(code, lang)), guess, esc };
})();
