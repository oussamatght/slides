"""Regenerates the index.html shell of every deck that uses the shared engine.

Run from the repo root:  python express.js/deck/build-shell.py
Only the <head> settings and the list of data files differ between decks; the body
(top bar, sidebar, overlays, nav) is identical, so all decks stay consistent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_SRC = ROOT / 'express.js' / 'index.html'

DECKS = [
    dict(dir='express.js', root='../', title='Express.js — Zero to Senior',
         desc='Interactive bilingual (Arabic / English) Express.js course: from zero to senior, with runnable examples, exercises, quizzes and a final exam.',
         accent=None,
         data=['meta', 'diagrams', 'level0', 'level1', 'level2', 'level3', 'level4', 'exam']),
    dict(dir='intrent', root='../', title='Internet & the Web — How It Really Works',
         desc='Bilingual (Arabic / English) course: how the Internet, DNS, HTTP, browsers and hosting work — with diagrams, hands-on commands and quizzes.',
         accent=('#60a5fa', '96, 165, 250', '#1d4ed8', '29, 78, 216'),
         data=['meta', 'diagrams', 'chapters', 'exam']),
    dict(dir='.', root='', title='HTML — From Zero to Professional Pages',
         desc='Bilingual (Arabic / English) HTML course with live previews, playgrounds, exercises, quizzes and a final project.',
         accent=('#22d3ee', '34, 211, 238', '#0e7490', '14, 116, 144'),
         data=['meta', 'diagrams', 'chapters', 'exam'], data_dir='html/js/data/', logo='html/img/logo.svg'),
    dict(dir='css', root='../', title='CSS — Style Like a Pro',
         desc='Bilingual (Arabic / English) CSS course with live previews, playgrounds, Flexbox, Grid, responsive design, animations, quizzes and a final project.',
         accent=('#f472b6', '244, 114, 182', '#be185d', '190, 24, 93'),
         data=['meta', 'diagrams', 'chapters', 'exam']),
    dict(dir='react', root='../', title='React — From Components to Production',
         desc='Bilingual (Arabic / English) React course: components, state, hooks, routing, data fetching, testing and deployment — with quizzes and a final project.',
         accent=('#a78bfa', '167, 139, 250', '#6d28d9', '109, 40, 217'),
         data=['meta', 'diagrams', 'chapters', 'exam']),
]


def accent_css(a):
    if not a:
        return ''
    dark, dark_rgb, light, light_rgb = a
    return f'''    <style>
        /* deck accent colour (everything else comes from assets/deck/deck.css) */
        :root {{ --accent: {dark}; --accent-rgb: {dark_rgb}; --glow-1: rgba({dark_rgb}, .15); --grid: rgba({dark_rgb}, .035); --code-line: rgba({dark_rgb}, .13); }}
        :root[data-theme="light"] {{ --accent: {light}; --accent-rgb: {light_rgb}; --glow-1: rgba({light_rgb}, .12); --grid: rgba({light_rgb}, .05); }}
    </style>
'''


def build():
    tpl = TEMPLATE_SRC.read_text(encoding='utf8')
    head_end = tpl.index('</head>')
    body_start = tpl.index('<body>')
    scripts_start = tpl.index('    <!-- content')
    body = tpl[body_start:scripts_start]
    for d in DECKS:
        assets = 'deck/' if d['dir'] == 'express.js' else d['root'] + 'express.js/deck/'
        data_dir = d.get('data_dir', 'js/data/')
        logo = d.get('logo', 'img/logo.svg')
        head = f'''<!DOCTYPE html>
<html lang="en" dir="ltr" data-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>{d['title']}</title>
    <meta name="description" content="{d['desc']}">
    <meta name="theme-color" content="#0a0f1a">
    <link rel="icon" href="{logo}" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{assets}deck.css">
{accent_css(d['accent'])}    <script>
        /* apply saved theme/lang before first paint (no flash) — shared by all decks */
        try {{
            var t = JSON.parse(localStorage.getItem('slides.theme') || '"dark"');
            var l = JSON.parse(localStorage.getItem('slides.lang') || 'null') || ((navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en');
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.lang = l;
            document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
        }} catch (e) {{}}
    </script>
</head>

'''
        b = re.sub(r'src="[^"]*logo\.svg"', f'src="{logo}"', body)
        scripts = '    <!-- engine (shared by every deck) -->\n'
        scripts += f'    <script src="{assets}highlight.js"></script>\n    <script src="{assets}diagrams.js"></script>\n'
        scripts += '    <!-- content -->\n' + ''.join(f'    <script src="{data_dir}{f}.js"></script>\n' for f in d['data'])
        scripts += f'    <script src="{assets}engine.js"></script>\n</body>\n\n</html>\n'
        out = ROOT / d['dir'] / 'index.html'
        out.write_text(head + b + scripts, encoding='utf8')
        print('wrote', out.relative_to(ROOT))


if __name__ == '__main__':
    import sys
    only = set(sys.argv[1:])            # e.g. python build-shell.py express.js
    if only:
        DECKS[:] = [d for d in DECKS if d['dir'] in only]
    build()
