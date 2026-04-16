$file = "c:\Users\LENOVO\OneDrive\Bureau\slide formation\react\index.html"
$content = [System.IO.File]::ReadAllText($file)

# Find where to split
$beforeSlides = $content.Substring(0, $content.IndexOf("const slides = [{"))
$afterSlides = "const slides = [" + $content.Substring($content.IndexOf("        ];") + 10)

$newSlides = @"
    {
        type: 'title',
        title: 'Complete React Course for Beginners',
        subtitle: 'Master React from Basics to Advanced Patterns',
        section: 'intro'
    },
    {
        type: 'section',
        title: 'Introduction & Setup',
        subtitle: 'Understanding React and Getting Started',
        section: 'setup'
    },
    {
        type: 'lesson',
        section: 'setup',
        title: 'What is React?',
        explain: 'React is a JavaScript library created by Facebook for building user interfaces. It uses a component-based architecture where UI is broken into small, reusable pieces.',
        code: `// REACT WAY (Declarative):\nreturn <h1>Counter: {count}</h1>;`,
        exercise: 'Explain the difference between declarative and imperative programming.',
        hint: 'Declarative: describe WHAT you want. Imperative: describe HOW to do it.'
    }
"@

$combined = $beforeSlides + "`n        const slides = [`n" + $newSlides + "`n        " + $afterSlides

[System.IO.File]::WriteAllText($file, $combined)
Write-Host "Updated slides array"
