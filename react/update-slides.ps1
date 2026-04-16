$file = "c:\Users\LENOVO\OneDrive\Bureau\slide formation\react\index.html"
$content = [System.IO.File]::ReadAllText($file)

# Exact positions found
$arrayStart = 15313     # Start of "const slides = [{"
$arrayEnd = 36161 + 4   # Include the "];" and newlines after it

$before = $content.Substring(0, $arrayStart)
$after = $content.Substring($arrayEnd)

# New slides array  - escape backticks properly
$newSlides = @'
const slides = [{
                type: 'title',
                title: 'Complete React Course for Beginners',
                subtitle: 'Master React from Basics to Advanced Patterns',
                section: 'intro'
            }, {
                type: 'section',
                title: 'Introduction & Setup',
                subtitle: 'Understanding React and Getting Started',
                section: 'setup'
            }, {
                type: 'lesson',
                section: 'setup',
                title: 'What is React?',
                explain: 'React is a JavaScript library created by Facebook for building user interfaces. It uses a component-based architecture where UI is broken into small, reusable pieces.',
                code: '// REACT WAY (Declarative):\nreturn <h1>Counter: {count}</h1>;',
                exercise: 'Explain the difference between declarative and imperative programming.',
                hint: 'Declarative: describe WHAT you want. Imperative: describe HOW to do it.'
            }, {
                type: 'lesson',
                section: 'setup',
                title: 'Why React Matters',
                explain: 'React is crucial in modern web development. Companies like Netflix, Instagram, Uber, and Airbnb use React. React skills make you highly employable.',
                code: '// React is used at:\n// - Netflix, Airbnb, Uber Eats, Shopify\n// Learning React gives you:\n// - High-paying job opportunities\n// - Modern web development understanding',
                exercise: 'Research 3 companies using React.',
                hint: 'Check job postings and company tech stacks.'
            }, {
                type: 'lesson',
                section: 'setup',
                title: 'Setting Up Your Environment',
                explain: 'Before coding, install Node.js (includes npm). Node.js is a JavaScript runtime. npm is a package manager.',
                code: '// Step 1: Download Node.js from nodejs.org\n// Step 2: Verify\nnode --version\nnpm --version\n\n// Step 3: Create React project\nnpm create vite@latest my-app -- --template react',
                exercise: 'Install Node.js and verify with node --version.',
                hint: 'Download from nodejs.org. Choose LTS version.'
            }, {
                type: 'lesson',
                section: 'setup',
                title: 'Your First React App',
                explain: 'The App.jsx file is your first component. It is a JavaScript function that returns JSX. When you save, the browser auto-reloads.',
                code: '// src/App.jsx\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Welcome to React!</h1>\n      <button>Click me</button>\n    </div>\n  )\n}',
                exercise: 'Modify App.jsx: change the title and add a description.',
                hint: 'Edit the tags. Save and see changes instantly.'
            }, {
                type: 'section',
                title: 'Components & JSX',
                subtitle: 'The Building Blocks of React',
                section: 'components'
            }, {
                type: 'lesson',
                section: 'components',
                title: 'What Are Components?',
                explain: 'Components are reusable pieces of UI. Think of them like LEGO blocks. Each component is a function that returns JSX.',
                code: 'function Button() {\n  return <button>Click Me</button>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Button />\n      <Button />\n      <Button />\n    </div>\n  );\n}',
                exercise: 'Create 3 components: Header, Main, Footer.',
                hint: 'Each is a function with capital letter.'
            }, {
                type: 'lesson',
                section: 'components',
                title: 'JSX Basics',
                explain: 'JSX looks like HTML but is JavaScript. Use JavaScript expressions in {} curly braces. Must return single parent element.',
                code: 'const name = "Ahmed";\nconst age = 25;\n\nreturn (\n  <div className="profile">\n    <h1>Welcome, {name}!</h1>\n    <p>Age: {age}</p>\n  </div>\n);',
                exercise: 'Write JSX with variables and className.',
                hint: 'Use {} for expressions. Use className not class.'
            }, {
                type: 'lesson',
                section: 'components',
                title: 'Styling in React',
                explain: 'React offers: CSS files (common), inline styles, CSS Modules, or CSS-in-JS. Inline styles use camelCase.',
                code: '// Method 1: External CSS\nimport "./Button.css";\n<button className="btn">Click</button>\n\n// Method 2: Inline Styles\nconst style = { padding: "10px", backgroundColor: "#007bff" };\n<button style={style}>Click</button>',
                exercise: 'Create component with CSS and inline styles.',
                hint: 'Import CSS at top. Use camelCase for inline.'
            }, {
                type: 'section',
                title: 'Props - Passing Data',
                subtitle: 'Communication Between Components',
                section: 'props'
            }, {
                type: 'lesson',
                section: 'props',
                title: 'Understanding Props',
                explain: 'Props pass data from parent to child. Props are read-only. Child cannot modify them. One-way flow makes data predictable.',
                code: 'function App() {\n  return <UserCard name="Ahmed" role="Developer" />\n}\n\nfunction UserCard(props) {\n  return (\n    <div>\n      <h2>{props.name}</h2>\n      <p>Role: {props.role}</p>\n    </div>\n  );\n}',
                exercise: 'Create component with name, age, city props.',
                hint: 'Use <Card name="X" age="Y" city="Z" />'
            }, {
                type: 'lesson',
                section: 'props',
                title: 'Props Destructuring',
                explain: 'Destructure props in parameters for cleaner code. Shows exactly what props a component needs.',
                code: '// Before:\nfunction UserCard(props) {\n  return <h2>{props.name}</h2>;\n}\n\n// After (BETTER!):\nfunction UserCard({ name, age, city }) {\n  return (\n    <div>\n      <h2>{name}</h2>\n      <p>Age: {age}, City: {city}</p>\n    </div>\n  );\n}',
                exercise: 'Rewrite component with destructuring.',
                hint: 'function Component({prop1, prop2}) { ... }'
            }, {
                type: 'lesson',
                section: 'props',
                title: 'Special Prop: Children',
                explain: 'children receives content between opening/closing tags. Allows creating wrapper components.',
                code: 'function Card({ title, children }) {\n  return (\n    <div className="card">\n      <h2>{title}</h2>\n      <div>{children}</div>\n    </div>\n  );\n}\n\n<Card title="Profile">\n  <p>Name: Ahmed</p>\n  <button>Edit</button>\n</Card>',
                exercise: 'Create wrapper component (Box, Container).',
                hint: 'Render {children} inside template.'
            }, {
                type: 'lesson',
                section: 'props',
                title: 'Passing Functions as Props',
                explain: 'Pass functions to children as event handlers. Child calls function to communicate back to parent.',
                code: 'function App() {\n  const handleDelete = (id) => console.log("Deleting:", id);\n  return <Item id={1} onDelete={handleDelete} />;\n}\n\nfunction Item({ id, onDelete }) {\n  return (\n    <div>\n      <span>Item {id}</span>\n      <button onClick={() => onDelete(id)}>Delete</button>\n    </div>\n  );\n}',
                exercise: 'Create button that calls function from parent.',
                hint: 'Destructure function from props.'
            }, {
                type: 'section',
                title: 'Rendering - Dynamic UIs',
                subtitle: 'Conditionals & Lists',
                section: 'rendering'
            }, {
                type: 'lesson',
                section: 'rendering',
                title: 'Conditional Rendering',
                explain: 'Show/hide elements based on conditions. Use ternary, &&, or if/else. Key to dynamic interfaces.',
                code: '// Method 1: Ternary\n{isLoggedIn ? <p>Welcome!</p> : <p>Login</p>}\n\n// Method 2: Logical AND\n{isAdmin && <button>Delete</button>}\n\n// Method 3: if statement\nlet msg;\nif (status === "loading") msg = <p>Loading...</p>;\nreturn msg;',
                exercise: 'Create component showing different content by role.',
                hint: 'Use: {role === "admin" ? <AdminView /> : <UserView />}'
            }, {
                type: 'lesson',
                section: 'rendering',
                title: 'List Rendering with map()',
                explain: 'Render arrays using map(). Each item needs unique key prop. Never use index as key.',
                code: 'function UsersList() {\n  const users = [\n    { id: 1, name: "Ahmed" },\n    { id: 2, name: "Sara" },\n    { id: 3, name: "Ali" }\n  ];\n  \n  return (\n    <div>\n      {users.map((user) => (\n        <div key={user.id}>\n          <h3>{user.name}</h3>\n        </div>\n      ))}\n    </div>\n  );\n}',
                exercise: 'Render list of 5 items using map().',
                hint: 'Use: {array.map((item) => <Component key={item.id} />)}'
            }, {
                type: 'lesson',
                section: 'rendering',
                title: 'Key Prop Explained',
                explain: 'Key helps React identify changed items. Use unique IDs. Never use index. Without proper keys, bugs occur when reordering.',
                code: '// BAD: Using index\n{todos.map((todo, idx) => <li key={idx}>{todo}</li>)}\n\n// GOOD: Using ID\n{todos.map((todo) => <li key={todo.id}>{todo.text}</li>)}\n\n// Why? If you delete/reorder, animations and form state break.',
                exercise: 'Identify why using index as key is problematic.',
                hint: 'Think: what if you delete the first item?'
            }, {
                type: 'section',
                title: 'State - Making Apps Interactive',
                subtitle: 'useState Hook for Component State',
                section: 'state'
            }, {
                type: 'lesson',
                section: 'state',
                title: 'What is State?',
                explain: 'State is data managed internally by a component. Unlike props (from parent), state is created within component. When state changes, React re-renders.',
                code: '// Props: from parent (read-only)\nfunction Greeting({ name }) { return <h1>Hello {name}</h1>; }\n\n// State: owned by component (changeable)\nimport { useState } from "react";\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>+</button>\n    </div>\n  );\n}',
                exercise: 'Explain: What happens when state changes?',
                hint: 'State change → Re-render → New UI'
            }, {
                type: 'lesson',
                section: 'state',
                title: 'Introduction to useState',
                explain: 'useState is a React Hook. Returns [currentValue, functionToUpdate]. Call setState to update state and trigger re-render.',
                code: 'import { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}',
                exercise: 'Create component using useState to toggle boolean.',
                hint: 'const [isOpen, setIsOpen] = useState(false);'
            }, {
                type: 'lesson',
                section: 'state',
                title: 'Updating State with Inputs',
                explain: 'Connect inputs to state using value and onChange. value displays current state. onChange updates state. "Controlled component".',
                code: 'function SearchBox() {\n  const [search, setSearch] = useState("");\n  \n  return (\n    <div>\n      <input\n        value={search}\n        onChange={(e) => setSearch(e.target.value)}\n        placeholder="Search..."\n      />\n      <p>Searching for: {search}</p>\n    </div>\n  );\n}',
                exercise: 'Create form input displaying real-time user input.',
                hint: 'Use value={state} and onChange={(e) => setState(e.target.value)}'
            }, {
                type: 'lesson',
                section: 'state',
                title: 'Working with Object State',
                explain: 'State can be objects or arrays. When updating, create new object. Use spread operator. Prevents bugs.',
                code: 'function UserProfile() {\n  const [user, setUser] = useState({name: "", email: "", age: ""});\n  \n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setUser({ ...user, [name]: value });  // Create new object\n  };\n  \n  return (\n    <input name="name" value={user.name} onChange={handleChange} />\n  );\n}',
                exercise: 'Create object state with multiple properties.',
                hint: 'Use: {...state, property: newValue}'
            }, {
                type: 'lesson',
                section: 'state',
                title: 'Working with Array State',
                explain: 'Arrays need special handling. Never push() directly. Create new arrays with spread, filter(), or map().',
                code: 'function TodoApp() {\n  const [todos, setTodos] = useState([]);\n  \n  const add = (text) => setTodos([...todos, {id: Date.now(), text}]);\n  const remove = (id) => setTodos(todos.filter(t => t.id !== id));\n  const toggle = (id) => setTodos(todos.map(t => t.id === id ? {...t, done: !t.done} : t));\n  \n  return <div>{/* ... */}</div>;\n}',
                exercise: 'Create array state with add, remove, modify.',
                hint: 'Add: [...array, item]. Remove: filter(). Update: map()'
            }, {
                type: 'section',
                title: 'Context API',
                subtitle: 'Avoiding Prop Drilling',
                section: 'context'
            }, {
                type: 'lesson',
                section: 'context',
                title: 'The Prop Drilling Problem',
                explain: 'Prop drilling passes props through many layers. Example: App → Layout → Sidebar → Menu → Button. Messy! Context solves this.',
                code: '// PROP DRILLING\nApp → Layout(theme) → Sidebar(theme) → Menu(theme) → MenuItem\n\n// SOLUTION: CONTEXT\n// Use directly in MenuItem without drilling!',
                exercise: 'Identify prop drilling in your components.',
                hint: 'Look for props passed through multiple levels.'
            }, {
                type: 'lesson',
                section: 'context',
                title: 'Creating and Using Context',
                explain: 'Create context with createContext(). Wrap with Provider. Use useContext to access anywhere without drilling.',
                code: 'import { createContext, useState, useContext } from "react";\n\nconst ThemeContext = createContext();\n\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState("light");\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\nfunction MenuItem() {\n  const { theme } = useContext(ThemeContext);\n  return <button className={theme}>Menu</button>;\n}',
                exercise: 'Create UserContext and access in multiple components.',
                hint: 'createContext → Provider → useContext'
            }, {
                type: 'section',
                title: 'Forms & Validation',
                subtitle: 'Handling User Input',
                section: 'forms'
            }, {
                type: 'lesson',
                section: 'forms',
                title: 'Form Handling Basics',
                explain: 'Forms collect input. Use controlled components synced to state. Prevent default. Validate. Process submission.',
                code: 'function LoginForm() {\n  const [email, setEmail] = useState("");\n  const [password, setPassword] = useState("");\n  const [error, setError] = useState("");\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!email || !password) { setError("Required!"); return; }\n    console.log("Logging in:", { email, password });\n  };\n  \n  return <form onSubmit={handleSubmit}>{/* ... */}</form>;\n}',
                exercise: 'Build registration form: name, email, password.',
                hint: 'Use controlled inputs, validate, show errors.'
            }, {
                type: 'lesson',
                section: 'forms',
                title: 'Different Input Types',
                explain: 'Inputs vary: text, email, password, checkbox, radio, select, textarea. Different handling for each.',
                code: 'function Form() {\n  const [form, setForm] = useState({name: "", role: "user", newsletter: false});\n  \n  const handleText = (e) => setForm({...form, [e.target.name]: e.target.value});\n  const handleCheck = (e) => setForm({...form, [e.target.name]: e.target.checked});\n  \n  return (\n    <div>\n      <input name="name" onChange={handleText} />\n      <select name="role" onChange={handleText}>\n        <option>User</option><option>Admin</option>\n      </select>\n      <input type="checkbox" name="newsletter" onChange={handleCheck} />\n    </div>\n  );\n}',
                exercise: 'Create form with all input types.',
                hint: 'Text/select use value. Checkbox uses checked.'
            }, {
                type: 'section',
                title: 'Routing',
                subtitle: 'Building Single Page Apps',
                section: 'routing'
            }, {
                type: 'lesson',
                section: 'routing',
                title: 'Understanding SPA',
                explain: 'Single Page Apps load once, then JS displays content. No reloads. React Router watches URL and renders component. Fast!',
                code: '// Traditional: /home → reload, /about → reload (SLOW)\n// SPA: /home → show Home (instant), /about → show About (instant)\n\nimport { BrowserRouter, Routes, Route } from "react-router-dom";\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}',
                exercise: 'Explain why SPA navigation is faster.',
                hint: 'What gets reloaded in each case?'
            }, {
                type: 'lesson',
                section: 'routing',
                title: 'Setting Up React Router',
                explain: 'Install react-router-dom. Wrap with BrowserRouter. Define Routes. Use Link (no page reload).',
                code: '// npm install react-router-dom\n\nimport { BrowserRouter, Routes, Route, Link } from "react-router-dom";\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <nav><Link to="/">Home</Link><Link to="/about">About</Link></nav>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nfunction Home() { return <h1>Home</h1>; }\nfunction About() { return <h1>About</h1>; }',
                exercise: 'Create app with 3 routes and Link navigation.',
                hint: 'npm install, then BrowserRouter, Routes, Route, Link.'
            }, {
                type: 'lesson',
                section: 'routing',
                title: 'Dynamic Routes',
                explain: 'Routes can have parameters like /user/:id. useParams() gets the parameter value.',
                code: 'import { Routes, Route, useParams, Link } from "react-router-dom";\n\nfunction App() {\n  return (\n    <Routes>\n      <Route path="/" element={<UsersList />} />\n      <Route path="/user/:id" element={<UserDetail />} />\n    </Routes>\n  );\n}\n\nfunction UsersList() {\n  const users = [{id: 1, name: "Ahmed"}, {id: 2, name: "Sara"}];\n  return users.map(u => <Link key={u.id} to={"/user/" + u.id}>{u.name}</Link>);\n}\n\nfunction UserDetail() {\n  const { id } = useParams();\n  return <h1>User #{id}</h1>;\n}',
                exercise: 'Create products route with :productId parameter.',
                hint: 'Use useParams() to get parameter from URL.'
            }, {
                type: 'section',
                title: 'Performance & Optimization',
                subtitle: 'Building Fast React Apps',
                section: 'performance'
            }, {
                type: 'lesson',
                section: 'performance',
                title: 'Understanding Re-renders',
                explain: 'Components re-render when props/state change. useMemo caches computed values to avoid expensive recalculations.',
                code: 'import { useState, useMemo } from "react";\n\nfunction DataTable() {\n  const [data, setData] = useState([]);\n  const [sort, setSort] = useState("name");\n  \n  // Without useMemo: filter+sort every render (SLOW)\n  // const processed = data.filter(...).sort(...);\n  \n  // With useMemo: only when dependencies change  \n  const processed = useMemo(() => {\n    return data.filter(x => x).sort(x => x);\n  }, [data, sort]);\n  \n  return <table>{/* ... */}</table>;\n}',
                exercise: 'Identify unnecessary re-renders in component.',
                hint: 'Use console.log and React DevTools.'
            }, {
                type: 'lesson',
                section: 'performance',
                title: 'useMemo Hook',
                explain: 'useMemo caches expensive computation results. Only recomputes when dependencies change.',
                code: 'const processed = useMemo(() => {\n  console.log("Computing...");\n  \n  let result = data.filter(item => item.name.includes(search));\n  result.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));\n  \n  return result;\n}, [data, search, sortBy]);  // Recompute only if these change',
                exercise: 'Use useMemo to optimize expensive computation.',
                hint: 'Identify expensive work, wrap with useMemo.'
            }, {
                type: 'section',
                title: 'Advanced State - useReducer',
                subtitle: 'Complex State Management',
                section: 'advanced-state'
            }, {
                type: 'lesson',
                section: 'advanced-state',
                title: 'useReducer for Complex Logic',
                explain: 'useState for simple state. useReducer for complex updates. Reducer specifies state transitions.',
                code: 'import { useReducer } from "react";\n\nfunction reducer(state, action) {\n  switch(action.type) {\n    case "ADD": return [...state, action.payload];\n    case "REMOVE": return state.filter(t => t.id !== action.payload);\n    case "TOGGLE": return state.map(t => t.id === action.payload ? {...t, done: !t.done} : t);\n    default: return state;\n  }\n}\n\nconst [todos, dispatch] = useReducer(reducer, []);\n\ndispatch({ type: "ADD", payload: newTodo });\ndispatch({ type: "REMOVE", payload: id });',
                exercise: 'Decide: useState or useReducer for 3 scenarios.',
                hint: 'useState: simple. useReducer: complex interdependent state.'
            }, {
                type: 'section',
                title: 'Complete Todo App Project',
                subtitle: 'Building a Real Application',
                section: 'project'
            }, {
                type: 'lesson',
                section: 'project',
                title: 'Todo App - Full Example',
                explain: 'This project combines: components, props, state, forms, lists, filtering. Build a complete working Todo app.',
                code: 'import { useState, useMemo } from "react";\n\nfunction TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState("");\n  const [filter, setFilter] = useState("all");\n  \n  const filtered = useMemo(() => {\n    if (filter === "active") return todos.filter(t => !t.done);\n    if (filter === "done") return todos.filter(t => t.done);\n    return todos;\n  }, [todos, filter]);\n  \n  return (\n    <div>\n      <input value={input} onChange={(e) => setInput(e.target.value)} />\n      <button onClick={() => {setTodos([...todos, {id: Date.now(), text: input, done: false}]); setInput("");}}>Add</button>\n      <div>{filtered.map(t => <TodoItem key={t.id} todo={t} />)}</div>\n    </div>\n  );\n}',
                exercise: 'Build Todo app: add, delete, toggle, filter.',
                hint: 'Store in localStorage using JSON.stringify/parse.'
            }, {
                type: 'challenge',
                title: 'Final Challenge',
                subtitle: 'Advanced Todo App Project',
                exercise: 'Create enhanced Todo app with: add/delete/toggle, filter by status, categories/tags, priority levels, due dates, local storage, dark/light theme (Context), animations.',
                hint: 'Context for theme, useReducer for state, useMemo for filtering, localStorage for persistence.'
            }, {
                type: 'final',
                title: 'React Mastery Complete!',
                subtitle: 'You have learned React from Basics to Advanced!',
                content: [
                    'Components & JSX - Built reusable UI pieces',
                    'Props - Passed data between components',
                    'State - Made interactive applications',
                    'Conditional & List Rendering - Dynamic UIs',
                    'Forms & Validation - Handled user input',
                    'Context API - Shared global data',
                    'Routing - Built single-page apps',
                    'Performance - Optimized with useMemo',
                    'useReducer - Complex state management',
                    'Real Projects - Built Todo application',
                    '',
                    'Next Steps: Build more projects, explore libraries (Next.js, Redux, TailwindCSS), contribute to open source!'
                ]
            }
        ];
'@

$combined = $before + $newSlides + $after
[System.IO.File]::WriteAllText($file, $combined)

Write-Host "Successfully updated slides array!`nTotal characters in new slides: $($newSlides.Length)`nFile written to $file"
