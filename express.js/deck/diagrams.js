/* Animated inline-SVG diagram renderers (shared by every deck).
   Each deck registers its own specs with Diagrams.define({ name: spec }).
   Three renderers: flow (boxes + arrows), seq (sequence diagram), onion (rings).
   Labels are [en, ar] pairs; colours come from CSS variables so both themes work. */
(function () {
    'use strict';
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const SLOT = 1.15; // seconds per animation step

    function dot(path, opt) {
        const cls = 'dg-dot' + (opt.color ? ' ' + opt.color : '');
        if (opt.T) {
            const s = Math.max(0.0001, opt.start / opt.T);
            const e = Math.min(0.9999, (opt.start + SLOT * 0.85) / opt.T);
            return `<circle r="5.5" class="${cls}" opacity="0">
                <animateMotion dur="${opt.T}s" repeatCount="indefinite" path="${path}" keyPoints="0;0;1;1" keyTimes="0;${s.toFixed(4)};${e.toFixed(4)};1" calcMode="linear"/>
                <animate attributeName="opacity" dur="${opt.T}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${s.toFixed(4)};${(s + 0.0001).toFixed(4)};${e.toFixed(4)};${(e + 0.0001).toFixed(4)};1"/>
            </circle>`;
        }
        return `<circle r="5.5" class="${cls}"><animateMotion dur="${opt.dur || 2.2}s" begin="${opt.delay || 0}s" repeatCount="indefinite" path="${path}"/></circle>`;
    }

    function anchor(n, t, side) {
        if (!side) {
            const dx = t.x - n.x, dy = t.y - n.y;
            side = Math.abs(dx) / (n.w / 2 + 1) >= Math.abs(dy) / (n.h / 2 + 1) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't');
        }
        return { r: [n.x + n.w / 2, n.y], l: [n.x - n.w / 2, n.y], t: [n.x, n.y - n.h / 2], b: [n.x, n.y + n.h / 2] }[side];
    }

    function nodeSVG(n, L) {
        const x = n.x - n.w / 2, y = n.y - n.h / 2;
        const label = L(n.t), sub = n.s ? L(n.s) : '';
        let inner = '';
        const big = n.h >= 70;
        if (n.i && big) {
            const iy = sub ? n.y - 19 : n.y - 11;
            inner += `<text class="dg-icon" x="${n.x}" y="${iy}" text-anchor="middle" dominant-baseline="central">${n.i}</text>`;
            inner += `<text class="dg-label" x="${n.x}" y="${sub ? n.y + 3 : n.y + 13}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
            if (sub) inner += `<text class="dg-sub" x="${n.x}" y="${n.y + 22}" text-anchor="middle" dominant-baseline="central">${esc(sub)}</text>`;
        } else {
            const lbl = (n.i ? n.i + ' ' : '') + label;
            inner += `<text class="dg-label" x="${n.x}" y="${sub ? n.y - 8 : n.y}" text-anchor="middle" dominant-baseline="central">${esc(lbl)}</text>`;
            if (sub) inner += `<text class="dg-sub" x="${n.x}" y="${n.y + 12}" text-anchor="middle" dominant-baseline="central">${esc(sub)}</text>`;
        }
        return `<g class="dg-node c-${n.c || 'base'}"><rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="12"/>${inner}</g>`;
    }

    function labelSVG(x, y, text) {
        const w = Math.max(30, text.length * 6.9 + 12);
        return `<rect class="dg-elabel-bg" x="${x - w / 2}" y="${y - 10}" width="${w}" height="19" rx="5"/>` +
            `<text class="dg-elabel" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`;
    }

    function flow(spec, L) {
        const nodes = {};
        spec.nodes.forEach((n) => { nodes[n.id] = Object.assign({ w: 150, h: 64 }, n); });
        const edges = spec.edges || [];
        const maxStep = spec.seq ? Math.max(0, ...edges.map((e, k) => (e.step ?? k))) : 0;
        const T = spec.seq ? (maxStep + 1) * SLOT + 0.6 : 0;
        let out = '';
        (spec.zones || []).forEach((z) => {
            out += `<rect class="dg-zone" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="16"/>` +
                `<text class="dg-zone-label" x="${z.x + 14}" y="${z.y + 18}">${esc(L(z.t))}</text>`;
        });
        let dots = '', labels = '';
        edges.forEach((e, k) => {
            const A = nodes[e.a], B = nodes[e.b];
            let pts;
            if (e.pts) pts = e.pts;
            else {
                let p1 = anchor(A, B, e.sa), p2 = anchor(B, A, e.sb);
                if (e.off) {
                    const horiz = Math.abs(p2[0] - p1[0]) >= Math.abs(p2[1] - p1[1]);
                    p1 = horiz ? [p1[0], p1[1] + e.off] : [p1[0] + e.off, p1[1]];
                    p2 = horiz ? [p2[0], p2[1] + e.off] : [p2[0] + e.off, p2[1]];
                }
                pts = [p1, p2];
            }
            let d;
            if (e.curve && pts.length === 2) {
                const [a, b] = pts;
                const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
                const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
                const cx = mx - ((b[1] - a[1]) / len) * e.curve, cy = my + ((b[0] - a[0]) / len) * e.curve;
                d = `M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`;
                e._mid = [(a[0] + 2 * cx + b[0]) / 4, (a[1] + 2 * cy + b[1]) / 4];
            } else {
                d = 'M' + pts.map((p) => p.join(',')).join(' L');
                const m = Math.floor((pts.length - 1) / 2);
                e._mid = [(pts[m][0] + pts[m + 1][0]) / 2, (pts[m][1] + pts[m + 1][1]) / 2];
            }
            const cls = ['dg-edge', e.flow ? 'flow' : '', e.cls || ''].join(' ');
            const marker = e.cls && e.cls.includes('red') ? 'dg-arr-r' : e.flow ? 'dg-arr-a' : 'dg-arr';
            out += `<path class="${cls}" d="${d}" marker-end="url(#${marker})"${e.both ? ` marker-start="url(#${marker})"` : ''}/>`;
            if (e.dot !== false) {
                const color = e.color || (e.cls && e.cls.includes('red') ? 'red' : '');
                dots += spec.seq ? dot(d, { T, start: (e.step ?? k) * SLOT, color }) : dot(d, { dur: e.dur, delay: e.delay, color });
            }
            if (e.t) {
                const off = e.lo || [0, e.off > 0 ? 17 : -13];
                labels += labelSVG(e._mid[0] + off[0], e._mid[1] + off[1], L(e.t));
            }
        });
        Object.values(nodes).forEach((n) => { out += nodeSVG(n, L); });
        return `<svg viewBox="0 0 ${spec.w} ${spec.h}" direction="ltr">${out}${labels}${dots}</svg>`;
    }

    function seq(spec, L) {
        const w = spec.w || 860, m = 95, top = 14, ah = 46, gap = spec.gap || 36;
        const n = spec.actors.length;
        const xs = spec.actors.map((_, i) => m + (i * (w - 2 * m)) / (n - 1));
        const y0 = top + ah + 28;
        const h = y0 + spec.msgs.length * gap + 10;
        const T = spec.msgs.length * SLOT + 0.8;
        let out = '', dots = '';
        spec.actors.forEach((a, i) => {
            out += `<line class="dg-lifeline" x1="${xs[i]}" y1="${top + ah}" x2="${xs[i]}" y2="${h - 6}"/>`;
            out += nodeSVG({ x: xs[i], y: top + ah / 2, w: 170, h: ah, t: a.t, i: a.i, c: a.c || 'base' }, L);
        });
        spec.msgs.forEach((g, k) => {
            const y = y0 + k * gap;
            const label = esc(L(g.t));
            if (g.a === g.b) {
                const x = xs[g.a];
                const right = g.a < n - 1;
                const tw = Math.max(60, L(g.t).length * 6.8 + 18);
                const rx = right ? x + 10 : x - 10 - tw;
                out += `<rect x="${rx}" y="${y - 12}" width="${tw}" height="24" rx="7" style="fill:rgba(251,191,36,.10);stroke:var(--accent-warm);stroke-width:1"/>`;
                out += `<text class="dg-msg-label" x="${rx + tw / 2}" y="${y}" text-anchor="middle" dominant-baseline="central">${label}</text>`;
                return;
            }
            const x1 = xs[g.a], x2 = xs[g.b];
            const dir = x2 > x1 ? 1 : -1;
            const d = `M${x1 + dir * 4},${y} L${x2 - dir * 6},${y}`;
            out += `<path class="dg-msg${g.back ? ' back' : ''}" d="${d}" marker-end="url(#${g.back ? 'dg-arr-c' : 'dg-arr-a'})"/>`;
            out += `<text class="dg-msg-label" x="${(x1 + x2) / 2}" y="${y - 9}" text-anchor="middle">${label}</text>`;
            dots += dot(d, { T, start: k * SLOT, color: g.back ? '' : '' });
        });
        return `<svg viewBox="0 0 ${w} ${h}" direction="ltr">${out}${dots}</svg>`;
    }

    function onion(spec, L) {
        const w = 860, h = 400, cx = 300, cy = 200;
        const cols = ['var(--l0)', 'var(--l2)', 'var(--l3)', 'var(--l1)'];
        let out = '';
        const R = [190, 145, 100, 55];
        spec.rings.forEach((r, i) => {
            out += `<circle cx="${cx}" cy="${cy}" r="${R[i]}" class="dg-ring" style="stroke:${cols[i]};fill:color-mix(in srgb, ${cols[i]} ${6 + i * 4}%, transparent)"/>`;
            const ty = i === 3 ? cy : cy - R[i] + 24;
            out += `<text class="dg-label" x="${cx}" y="${ty - (i === 3 ? 8 : 0)}" text-anchor="middle" dominant-baseline="central" style="font-size:13.5px">${esc(L(r.t))}</text>`;
            if (r.s) out += `<text class="dg-sub" x="${cx}" y="${ty + (i === 3 ? 10 : 15)}" text-anchor="middle" dominant-baseline="central">${esc(L(r.s))}</text>`;
        });
        // legend on the right
        out += `<path class="dg-edge flow" d="M560,330 L560,90" marker-end="url(#dg-arr-a)"/>`;
        out += `<text class="dg-label" x="580" y="90" dominant-baseline="central">${esc(L(spec.inward))}</text>`;
        (spec.notes || []).forEach((t, i) => {
            out += `<text class="dg-sub" x="580" y="${140 + i * 34}" dominant-baseline="central" style="font-size:13px">• ${esc(L(t))}</text>`;
        });
        return `<svg viewBox="0 0 ${w} ${h}" direction="ltr">${out}</svg>`;
    }

    /* ------------------------------------------------------------------ */
    const D = {};

    window.Diagrams = {
        define(specs) { Object.assign(D, specs); },
        has: (name) => !!D[name],
        render(name, L) {
            const s = D[name];
            if (!s) return '';
            if (s.type === 'seq') return seq(s, L);
            if (s.type === 'onion') return onion(s, L);
            return flow(s, L);
        }
    };
})();
