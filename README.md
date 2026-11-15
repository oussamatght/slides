# 🎨 Web Development Slides Collection

> A growing collection of **interactive presentation slides and educational resources** for teaching modern web development.

This repository contains a collection of presentations and visual learning materials created for **web development courses, workshops, and training sessions**.

The slides cover topics ranging from **HTML, CSS, JavaScript, React, Git & GitHub, and web development fundamentals**.

---

## 🌐 Overview

This project is designed as a reusable educational resource for developers, students, and instructors.

Each topic is organized into its own directory and can be opened directly in the browser.

The goal is to make technical concepts easier to understand through:

* 🎨 Visual presentations
* 💻 Practical examples
* 🧩 Interactive demonstrations
* 📚 Structured learning materials
* 🚀 Workshop-ready content

---

## ✨ What's Inside

| Topic               | Description                                           |
| ------------------- | ----------------------------------------------------- |
| 🎨 CSS              | CSS concepts, layouts, animations, and modern styling |
| ⚡ JavaScript        | JavaScript fundamentals and practical examples        |
| ⚛️ React            | React concepts and examples                           |
| 🔀 Git & GitHub     | Version control and collaboration                     |
| 🚂 Express.js       | Express.js from zero to senior — bilingual (AR / EN), runnable examples, quizzes and a final exam |
| 🌐 Internet         | Web and internet fundamentals                         |
| 🖥️ Web Development | General web development resources                     |
| 🛠️ Workshops       | Workshop and training materials                       |
| 🔗 Talk 04          | **From Frontend + Backend to Full Stack**: Micro Club USTHB Web Track talk. React + Axios + Express + Prisma + PostgreSQL, live demo, animated diagrams, final quiz → [`workshop/talk-04-fullstack-integration/`](./workshop/talk-04-fullstack-integration/index.html) |
| 📑 Slideoop         | Additional presentation materials                     |
| 🧩 SVG              | SVG-related educational content                       |

---

# 📸 Preview

### JavaScript

![JavaScript Slides](./assets/screenshots/javascript.png)

### React

![React Slides](./assets/screenshots/react.png)

### CSS

![CSS Slides](./assets/screenshots/css.png)

### Git & GitHub

![Git & GitHub Slides](./assets/screenshots/git-github.png)

> Add your real screenshots to `assets/screenshots/` using the filenames above.

---

# 📂 Repository Structure

```text
slides/
│
├── css/
│   └── ...
│
├── express.js/
│   ├── index.html        # entry point (open directly in the browser)
│   ├── deck/             # shared engine: engine.js, deck.css, highlight.js, diagrams.js, build-shell.py
│   ├── js/data/          # Express content (one file per level)
│   └── img/              # original SVG illustrations
│
├── git/
│   └── github/
│       └── ...
│
├── intrent/
│   └── ...
│
├── js/
│   └── index.html
│
├── react/
│   └── ...
│
├── slideoop/
│   └── ...
│
├── workshop/
│   ├── index.html                         # full stack workshop deck
│   └── talk-04-fullstack-integration/     # Talk 04 (uses the express.js/deck engine)
│       ├── index.html                     # entry point
│       ├── css/talk.css                   # section colours + talk widgets
│       ├── js/talk.js                     # tours, tab explorers, live demo, error explorer
│       ├── js/data/                       # meta, diagrams, part1…part5 (slide content)
│       └── img/                           # hero + logo SVGs
│
├── svg/
│   └── ...
│
├── assets/
│   └── screenshots/
│       ├── javascript.png
│       ├── react.png
│       ├── css.png
│       └── git-github.png
│
├── index.html
└── README.md
```

---

# 🚀 How to Use

You don't need to install any dependencies.

Most slides are built using standard web technologies and can be opened directly in a browser.

### Option 1 — Open locally

Clone the repository:

```bash
git clone https://github.com/oussamatght/slides.git
```

Enter the project:

```bash
cd slides
```

Then open the desired slide's `index.html` file in your browser.

---

### Option 2 — Use VS Code Live Server

For the best local development experience:

1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Open the desired `index.html`.
4. Click **Open with Live Server**.

---

# 🔗 Talk 04: From Frontend + Backend to Full Stack

**Micro Club USTHB · Web Track · Knowledge Sharing Week**, presented by Oussama Taright.

How frontend, backend, APIs and databases work together, taught with one running example (a Task Manager built with React + Axios, Express 5, Prisma and PostgreSQL, deployed on Render).

**Open it**

* Double-click `workshop/talk-04-fullstack-integration/index.html`, **or**
* With Live Server: right-click that file → **Open with Live Server**.

It works offline, with no build step and no install. Only the fonts come from Google Fonts, and system fonts are used when you're offline.

**Sections**

1. Introduction · 2. Full stack architecture · 3. Frontend ↔ backend communication · 4. Axios in practice · 5. The complete integration demo · 6. Common integration problems · 7. Authentication integration · 8. From localhost to production (Render) · 9. Developer workflow & collaboration · 10. Final quiz & Q&A

**Presenter controls**

| Key | Action |
| --- | --- |
| `→` / `Space` / `PageDown` | Next slide. On a step-through slide it advances the flow first, which works with clickers |
| `←` / `PageUp` | Previous slide / previous step |
| `Esc` | Slide overview · `M` sections menu · `?` all shortcuts |
| `F` · `T` · `L` · `B` · `+` / `−` | Fullscreen · theme · laser pointer · black screen · text size |
| `1`–`4` then `Enter` | Answer quiz questions |

**Interactive parts**

* **Live demo** (Sections 3, 5, 6): a real Task app running in the slide against an in-browser copy of the API. Load, add, tick and delete tasks; watch the request pipeline and a DevTools-style Network log. Change the network speed and **break the next request** (404, 401, 500, offline, CORS) to show each error live.
* **Step-through tour** (Section 5): the code at all 10 stops of `POST /api/tasks`.
* **Explorers**: click through architecture layers, CRUD requests, Render deployment steps and 11 integration problems (what happens, why, how to debug, how to fix).

**Editing**

Slide content lives in `js/data/*.js` and uses the same format as the Express deck. After changing the deck list or the data files in `express.js/deck/build-shell.py`, regenerate **only** this deck's shell:

```bash
python express.js/deck/build-shell.py workshop/talk-04-fullstack-integration
```

> ⚠️ Always pass the deck folder. Running `build-shell.py` with no argument also rewrites the shells of the other decks it lists (`intrent/`, `css/`, `react/`, root), which are currently standalone pages.

---

# 🧑‍🏫 Educational Use

These slides can be used for:

* University courses
* Coding bootcamps
* Web development workshops
* Programming clubs
* Private training
* Self-learning
* Developer presentations

They are especially useful for instructors who want a ready-to-use visual starting point for explaining web development concepts.

---

# 🛠️ Technologies

The collection uses different web technologies depending on the presentation:

### Core

* HTML5
* CSS3
* JavaScript

### Frontend

* React
* Modern JavaScript
* Responsive Web Design

### Developer Tools

* Git
* GitHub
* VS Code

### Graphics

* SVG
* CSS animations
* Browser APIs

---

# 🎯 Learning Topics

The repository covers several areas of modern web development.

```text
Web Development
│
├── HTML
│   ├── Structure
│   ├── Semantic HTML
│   └── Forms
│
├── CSS
│   ├── Layout
│   ├── Flexbox
│   ├── Grid
│   ├── Responsive Design
│   └── Animations
│
├── JavaScript
│   ├── Fundamentals
│   ├── DOM
│   ├── Events
│   ├── Async JavaScript
│   └── APIs
│
├── React
│   ├── Components
│   ├── Props
│   ├── State
│   └── Hooks
│
└── Git & GitHub
    ├── Git Basics
    ├── Branches
    ├── Commits
    └── Collaboration
```

---

# 👨‍💻 About the Project

This repository is part of my collection of educational resources for **web development training and technical workshops**.

The project reflects practical experience in preparing technical content and explaining programming concepts through visual presentations and hands-on examples.

---

# 👨‍🏫 About Me

## Oussama Taright

**Full-Stack Web Developer & Web Development Instructor**

I build modern web applications and create educational content for developers and students.

### Technologies I work with

```text
Frontend
├── HTML
├── CSS
├── JavaScript
├── TypeScript
├── React
├── Next.js
└── Tailwind CSS

Backend
├── Node.js
├── Express
├── REST APIs
├── MongoDB
└── PostgreSQL

Tools
├── Git
├── GitHub
├── Docker
└── Vercel
```

---

# 📚 Repository Goals

The collection is continuously evolving.

Future materials may include:

* TypeScript
* Next.js
* Node.js
* REST APIs
* Databases
* PostgreSQL
* Docker
* Full-Stack Development
* Advanced React
* Modern JavaScript

---

# 🤝 Contributions

Suggestions, improvements, and educational contributions are welcome.

If you find an issue with a slide or have an idea for improving the material, feel free to open an issue or submit a pull request.

---

# 📄 License

This repository is intended primarily for educational and portfolio purposes.

Unless otherwise stated, the original presentation content and materials are © Oussama Taright.

Please contact the author before redistributing or using the materials commercially.

---

# 🔗 Links

### GitHub

https://github.com/oussamatght

### Repository

https://github.com/oussamatght/slides

---

<p align="center">

<strong>Built for learning. Designed for teaching. 🚀</strong>

<br><br>

Made with ❤️ by <strong>Oussama Taright</strong>

</p>

