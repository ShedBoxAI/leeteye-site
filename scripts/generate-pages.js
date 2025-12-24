#!/usr/bin/env node

/**
 * LeetEye pSEO Page Generator
 *
 * Generates static HTML pages from templates and data.
 */

const fs = require('fs');
const path = require('path');

// Paths
const DATA_PATH = path.join(__dirname, '../data/pseo-data.json');
const TEMPLATES_PATH = path.join(__dirname, '../templates');
const OUTPUT_PATH = path.join(__dirname, '..');

// Load data
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Template cache
const templates = {};

/**
 * Load template file
 */
function loadTemplate(name) {
    if (!templates[name]) {
        const filePath = path.join(TEMPLATES_PATH, `${name}.html`);
        templates[name] = fs.readFileSync(filePath, 'utf8');
    }
    return templates[name];
}

/**
 * Generate head partial with variables
 */
function generateHead(vars) {
    return `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-58WNFTH58D"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-58WNFTH58D');
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(vars.meta_description)}">
    <link rel="canonical" href="https://leeteye.com${vars.canonical_path}">

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(vars.og_title)}">
    <meta property="og:description" content="${escapeHtml(vars.meta_description)}">
    <meta property="og:image" content="https://leeteye.com/assets/og-image.png">
    <meta property="og:url" content="https://leeteye.com${vars.canonical_path}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="LeetEye">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(vars.og_title)}">
    <meta name="twitter:description" content="${escapeHtml(vars.meta_description)}">
    <meta name="twitter:image" content="https://leeteye.com/assets/og-image.png">

    <title>${escapeHtml(vars.page_title)}</title>

    <link rel="icon" type="image/png" href="${vars.assets_path}/logo.png">
    <link rel="apple-touch-icon" href="${vars.assets_path}/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${vars.css_path}/pseo.css">`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Escape for JSON-LD
 */
function escapeJsonLd(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * Convert markdown-ish text to HTML
 */
function markdownToHtml(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

/**
 * Syntax highlight Python code
 */
function highlightPython(code) {
    if (!code) return '';

    // Keywords (excluding 'class' to avoid HTML attribute conflicts)
    const keywords = ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'yield', 'break', 'continue', 'pass', 'raise', 'global', 'nonlocal', 'assert', 'del'];

    // Built-in functions
    const builtins = ['len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'print', 'input', 'open', 'abs', 'min', 'max', 'sum', 'any', 'all', 'isinstance', 'type', 'append', 'pop', 'add', 'remove', 'get', 'keys', 'values', 'items'];

    // Use placeholders to avoid regex matching inside HTML tags
    const placeholders = [];
    const addPlaceholder = (html) => {
        const idx = placeholders.length;
        placeholders.push(html);
        return `__PH${idx}__`;
    };

    let result = escapeHtml(code);

    // Comments - replace with placeholder
    result = result.replace(/(#.*)$/gm, (match, p1) => addPlaceholder(`<span class="code-comment">${p1}</span>`));

    // Strings - replace with placeholder
    result = result.replace(/(&quot;[^&]*&quot;|&#039;[^&]*&#039;|"[^"]*"|'[^']*')/g, (match) => addPlaceholder(`<span class="code-string">${match}</span>`));

    // Keywords - replace with placeholder
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'g');
        result = result.replace(regex, (match) => addPlaceholder(`<span class="code-keyword">${match}</span>`));
    });

    // Built-ins - replace with placeholder
    builtins.forEach(fn => {
        const regex = new RegExp(`\\b(${fn})\\b`, 'g');
        result = result.replace(regex, (match) => addPlaceholder(`<span class="code-func">${match}</span>`));
    });

    // Numbers - replace with placeholder
    result = result.replace(/\b(\d+)\b/g, (match) => addPlaceholder(`<span class="code-number">${match}</span>`));

    // Restore all placeholders
    placeholders.forEach((html, idx) => {
        result = result.replace(`__PH${idx}__`, html);
    });

    return result;
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Write HTML file
 */
function writeHtml(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
}

/**
 * Get category by ID
 */
function getCategoryById(categoryId) {
    return data.categories.find(c => c.id === categoryId);
}

/**
 * Get relative asset path based on depth
 */
function getAssetPath(depth) {
    return '../'.repeat(depth) + 'assets';
}

function getCssPath(depth) {
    return '../'.repeat(depth) + 'css';
}

// ============================================
// Problem Page Generator
// ============================================
function generateProblemPage(problem, category) {
    const template = loadTemplate('problem');
    const depth = 3; // /problems/category/problem.html

    const head = generateHead({
        meta_description: `Learn how to solve ${problem.title} using ${problem.pattern || category.displayName}. ${problem.difficulty} difficulty. Time: ${problem.timeComplexity}, Space: ${problem.spaceComplexity}.`,
        canonical_path: `/problems/${category.id}/${problem.slug}.html`,
        og_title: `${problem.title} Solution | ${problem.pattern || category.displayName} | LeetEye`,
        page_title: `${problem.title} Solution | ${category.displayName} | LeetEye`,
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    // Generate steps HTML
    const stepsHtml = problem.steps.map((step, i) => {
        const correctOption = step.options.find(o => o.id === step.correct);
        return `
        <div class="reasoning-step">
            <div class="step-question">
                <span class="step-number">${i + 1}</span>
                ${markdownToHtml(step.question)}
            </div>
            <div class="step-answer">
                <strong>Answer:</strong> ${escapeHtml(correctOption?.text || '')}
            </div>
            <div class="step-explanation">
                ${markdownToHtml(step.explanation)}
            </div>
        </div>`;
    }).join('\n');

    // Generate steps schema for JSON-LD
    const stepsSchema = problem.steps.map((step, i) => {
        return `{
            "@type": "HowToStep",
            "name": "Step ${i + 1}",
            "text": "${escapeJsonLd(step.question)}",
            "position": ${i + 1}
        }`;
    }).join(',\n');

    // Generate examples HTML
    const examplesHtml = problem.examples.map((ex, i) => `
        <div class="example">
            <div class="example-label">Example ${i + 1}</div>
            <div class="example-input"><strong>Input:</strong> ${escapeHtml(ex.input)}</div>
            <div class="example-output"><strong>Output:</strong> ${escapeHtml(ex.output)}</div>
            ${ex.explanation ? `<div class="example-explanation">${escapeHtml(ex.explanation)}</div>` : ''}
        </div>
    `).join('\n');

    // Generate tags HTML
    const tagsHtml = problem.tags.map(tag =>
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('\n');

    // Generate trigger words HTML
    const triggerWordsHtml = (problem.triggerWords || []).map(word =>
        `<span class="trigger-tag">${escapeHtml(word)}</span>`
    ).join(' ');

    // Get related problems from same category
    const relatedProblems = (data.problems[category.id] || [])
        .filter(p => p.id !== problem.id)
        .slice(0, 5);

    const relatedProblemsHtml = relatedProblems.map(p => `
        <li>
            <a href="/problems/${category.id}/${p.slug}.html">
                <span class="problem-card-title">${escapeHtml(p.title)}</span>
                <span class="difficulty difficulty-${p.difficulty}">${p.difficulty}</span>
            </a>
        </li>
    `).join('\n');

    // Replace placeholders
    let html = template
        .replace('{{HEAD}}', head)
        .replace(/\{\{title\}\}/g, escapeHtml(problem.title))
        .replace(/\{\{slug\}\}/g, problem.slug)
        .replace(/\{\{category_slug\}\}/g, category.id)
        .replace(/\{\{category_name\}\}/g, escapeHtml(category.displayName))
        .replace(/\{\{difficulty\}\}/g, problem.difficulty)
        .replace(/\{\{difficulty_cap\}\}/g, problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1))
        .replace(/\{\{pattern\}\}/g, escapeHtml(problem.pattern || category.displayName))
        .replace(/\{\{estimated_time\}\}/g, problem.estimatedTime || 5)
        .replace(/\{\{problem_statement\}\}/g, markdownToHtml(problem.problemStatement))
        .replace(/\{\{examples_html\}\}/g, examplesHtml)
        .replace(/\{\{key_insight\}\}/g, escapeHtml(problem.keyInsight || 'Think about the core pattern.'))
        .replace(/\{\{one_liner\}\}/g, escapeHtml(problem.oneLiner || ''))
        .replace(/\{\{trigger_words_html\}\}/g, triggerWordsHtml || '<span class="trigger-tag">' + category.displayName + '</span>')
        .replace(/\{\{steps_html\}\}/g, stepsHtml)
        .replace(/\{\{steps_schema\}\}/g, stepsSchema)
        .replace(/\{\{python_solution\}\}/g, highlightPython(problem.pythonSolution))
        .replace(/\{\{time_complexity\}\}/g, escapeHtml(problem.timeComplexity || 'O(n)'))
        .replace(/\{\{space_complexity\}\}/g, escapeHtml(problem.spaceComplexity || 'O(1)'))
        .replace(/\{\{tags_html\}\}/g, tagsHtml)
        .replace(/\{\{related_problems_html\}\}/g, relatedProblemsHtml)
        .replace(/\{\{assets_path\}\}/g, getAssetPath(depth));

    return html;
}

// ============================================
// Pattern Hub Page Generator
// ============================================
function generatePatternHubPage(category) {
    const template = loadTemplate('pattern-hub');
    const depth = 2; // /patterns/category/index.html

    const problems = data.problems[category.id] || [];
    const stats = data.difficultyStats[category.id] || { easy: 0, medium: 0, hard: 0 };
    const triggerWords = data.triggerWords[category.id] || [];

    const head = generateHead({
        meta_description: `Master the ${category.displayName} pattern for coding interviews. ${problems.length} practice problems with step-by-step solutions.`,
        canonical_path: `/patterns/${category.id}/`,
        og_title: `${category.displayName} Pattern Guide | LeetEye`,
        page_title: `${category.displayName} Pattern | LeetEye`,
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    // Trigger words HTML
    const triggerWordsHtml = triggerWords.map(word =>
        `<span class="trigger-tag">${escapeHtml(word)}</span>`
    ).join('\n');

    // Problems HTML
    const problemsHtml = problems.map(p => `
        <a href="/problems/${category.id}/${p.slug}.html" class="problem-card">
            <span class="problem-card-title">${escapeHtml(p.title)}</span>
            <span class="difficulty difficulty-${p.difficulty}">${p.difficulty}</span>
        </a>
    `).join('\n');

    // Problems schema for JSON-LD
    const problemsSchema = problems.slice(0, 10).map((p, i) => `{
        "@type": "ListItem",
        "position": ${i + 1},
        "item": {
            "@type": "Article",
            "name": "${escapeJsonLd(p.title)}",
            "url": "https://leeteye.com/problems/${category.id}/${p.slug}.html"
        }
    }`).join(',\n');

    // Related patterns (based on prerequisites)
    const relatedPatterns = data.categories.filter(c =>
        c.prerequisites.includes(category.id) || category.prerequisites.includes(c.id)
    ).slice(0, 4);

    const relatedPatternsHtml = relatedPatterns.map(p => `
        <a href="/patterns/${p.id}/" class="pattern-badge" style="background: ${p.colorHex}20; color: ${p.colorHex}">
            ${escapeHtml(p.displayName)}
        </a>
    `).join('\n');

    // Comparisons involving this pattern
    const comparisons = data.comparisons.filter(c =>
        c.pattern1.includes(category.id.replace(/-/g, '')) ||
        c.pattern2.includes(category.id.replace(/-/g, ''))
    ).slice(0, 3);

    const comparisonsHtml = comparisons.map(c => `
        <li><a href="/compare/${c.pattern1}-vs-${c.pattern2}.html">${escapeHtml(c.title)}</a></li>
    `).join('\n');

    let html = template
        .replace('{{HEAD}}', head)
        .replace(/\{\{display_name\}\}/g, escapeHtml(category.displayName))
        .replace(/\{\{slug\}\}/g, category.id)
        .replace(/\{\{description\}\}/g, escapeHtml(category.description))
        .replace(/\{\{color_hex\}\}/g, category.colorHex)
        .replace(/\{\{problem_count\}\}/g, problems.length)
        .replace(/\{\{easy_count\}\}/g, stats.easy)
        .replace(/\{\{medium_count\}\}/g, stats.medium)
        .replace(/\{\{hard_count\}\}/g, stats.hard)
        .replace(/\{\{trigger_words_html\}\}/g, triggerWordsHtml)
        .replace(/\{\{problems_html\}\}/g, problemsHtml)
        .replace(/\{\{problems_schema\}\}/g, problemsSchema)
        .replace(/\{\{related_patterns_html\}\}/g, relatedPatternsHtml)
        .replace(/\{\{comparisons_html\}\}/g, comparisonsHtml)
        .replace(/\{\{assets_path\}\}/g, getAssetPath(depth))
        .replace(/\{\{#if template_code\}\}[\s\S]*?\{\{\/if\}\}/g, '') // Remove template code section for now
        .replace(/\{\{#if related_patterns\}\}[\s\S]*?\{\{\/if\}\}/g, relatedPatternsHtml ? `<section class="related-patterns"><h2>Related Patterns</h2><div class="patterns-grid">${relatedPatternsHtml}</div></section>` : '')
        .replace(/\{\{#if comparisons\}\}[\s\S]*?\{\{\/if\}\}/g, comparisonsHtml ? `<section class="comparisons"><h2>Compare With Other Patterns</h2><ul class="comparison-list">${comparisonsHtml}</ul></section>` : '');

    return html;
}

// ============================================
// Cheatsheet Page Generator
// ============================================
function generateCheatsheetPage(category) {
    const template = loadTemplate('cheatsheet');
    const depth = 1; // /cheatsheets/pattern.html

    const problems = data.problems[category.id] || [];
    const triggerWords = data.triggerWords[category.id] || [];

    const head = generateHead({
        meta_description: `${category.displayName} cheat sheet for coding interviews. Template code, complexity, and pattern recognition tips.`,
        canonical_path: `/cheatsheets/${category.id}.html`,
        og_title: `${category.displayName} Cheat Sheet | LeetEye`,
        page_title: `${category.displayName} Cheat Sheet | LeetEye`,
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    // Trigger words
    const triggerWordsHtml = triggerWords.map(word =>
        `<span class="trigger-tag">${escapeHtml(word)}</span>`
    ).join('\n');

    // Sample problems
    const problemsHtml = problems.slice(0, 5).map(p => `
        <a href="/problems/${category.id}/${p.slug}.html" class="problem-card">
            <span class="problem-card-title">${escapeHtml(p.title)}</span>
            <span class="difficulty difficulty-${p.difficulty}">${p.difficulty}</span>
        </a>
    `).join('\n');

    // Other cheatsheets
    const otherCheatsheets = data.categories.filter(c => c.id !== category.id).slice(0, 5);
    const otherCheatsheetsHtml = otherCheatsheets.map(c => `
        <li><a href="/cheatsheets/${c.id}.html">${escapeHtml(c.displayName)}</a></li>
    `).join('\n');

    // Get template code from first problem with a solution
    const templateProblem = problems.find(p => p.pythonSolution);
    const templateCode = templateProblem?.pythonSolution || '# Template code coming soon';

    // Get typical complexity from problems
    const typicalTime = problems.find(p => p.timeComplexity)?.timeComplexity || 'O(n)';
    const typicalSpace = problems.find(p => p.spaceComplexity)?.spaceComplexity || 'O(1)';

    // Variations placeholder
    const variationsHtml = `
        <li>Basic ${category.displayName}</li>
        <li>${category.displayName} with constraints</li>
        <li>Optimized ${category.displayName}</li>
    `;

    let html = template
        .replace('{{HEAD}}', head)
        .replace(/\{\{display_name\}\}/g, escapeHtml(category.displayName))
        .replace(/\{\{slug\}\}/g, category.id)
        .replace(/\{\{description\}\}/g, escapeHtml(category.description))
        .replace(/\{\{color_hex\}\}/g, category.colorHex)
        .replace(/\{\{trigger_words_html\}\}/g, triggerWordsHtml)
        .replace(/\{\{template_code\}\}/g, highlightPython(templateCode))
        .replace(/\{\{typical_time\}\}/g, escapeHtml(typicalTime))
        .replace(/\{\{typical_space\}\}/g, escapeHtml(typicalSpace))
        .replace(/\{\{variations_html\}\}/g, variationsHtml)
        .replace(/\{\{problems_html\}\}/g, problemsHtml)
        .replace(/\{\{other_cheatsheets_html\}\}/g, otherCheatsheetsHtml)
        .replace(/\{\{assets_path\}\}/g, getAssetPath(depth));

    return html;
}

// ============================================
// Index Pages Generator
// ============================================
function generatePatternsIndexPage() {
    const depth = 1;
    const head = generateHead({
        meta_description: 'Master 18 essential algorithm patterns for coding interviews. From Two Pointers to Dynamic Programming.',
        canonical_path: '/patterns/',
        og_title: 'Algorithm Patterns Guide | LeetEye',
        page_title: 'Algorithm Patterns | LeetEye',
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    const patternsHtml = data.categories.map(cat => {
        const stats = data.difficultyStats[cat.id] || { easy: 0, medium: 0, hard: 0 };
        const total = stats.easy + stats.medium + stats.hard;
        return `
        <a href="/patterns/${cat.id}/" class="pattern-card" style="border-left: 4px solid ${cat.colorHex}">
            <h3>${escapeHtml(cat.displayName)}</h3>
            <p>${escapeHtml(cat.description)}</p>
            <div class="pattern-card-meta">
                <span>${total} problems</span>
            </div>
        </a>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="/" class="back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                LeetEye
            </a>
            <img src="${getAssetPath(depth)}/logo.png" alt="LeetEye" class="logo-small">
        </div>
    </header>

    <nav class="breadcrumb">
        <ol>
            <li><a href="/">Home</a></li>
            <li aria-current="page">Patterns</li>
        </ol>
    </nav>

    <main class="content">
        <h1>Algorithm Patterns</h1>
        <p class="intro">Master these 18 essential patterns to solve any coding interview problem.</p>

        <div class="patterns-index-grid">
            ${patternsHtml}
        </div>

        <section class="cta-box">
            <h2>Practice Pattern Recognition</h2>
            <p>Build intuition with interactive MCQs in the LeetEye app.</p>
            <a href="https://apps.apple.com/app/leeteye" class="cta-button cta-primary">Download LeetEye Free</a>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .patterns-index-grid {
            display: grid;
            gap: 1rem;
            margin: 2rem 0;
        }
        .pattern-card {
            display: block;
            padding: 1.25rem;
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.2s;
        }
        .pattern-card:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .pattern-card h3 {
            margin: 0 0 0.5rem;
            color: #0a0a0a;
        }
        .pattern-card p {
            margin: 0 0 0.75rem;
            color: #666;
            font-size: 0.9rem;
        }
        .pattern-card-meta {
            color: #999;
            font-size: 0.8rem;
        }
        @media (min-width: 768px) {
            .patterns-index-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</body>
</html>`;
}

function generateCheatsheetsIndexPage() {
    const depth = 1;
    const head = generateHead({
        meta_description: 'Quick reference cheat sheets for all algorithm patterns. Template code, complexity, and trigger words.',
        canonical_path: '/cheatsheets/',
        og_title: 'Algorithm Cheat Sheets | LeetEye',
        page_title: 'Cheat Sheets | LeetEye',
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    const cheatsheetsHtml = data.categories.map(cat => `
        <a href="/cheatsheets/${cat.id}.html" class="cheatsheet-card" style="border-left: 4px solid ${cat.colorHex}">
            <span class="cheatsheet-icon">📋</span>
            <span>${escapeHtml(cat.displayName)}</span>
            <span class="arrow">&rarr;</span>
        </a>
    `).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="/" class="back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                LeetEye
            </a>
            <img src="${getAssetPath(depth)}/logo.png" alt="LeetEye" class="logo-small">
        </div>
    </header>

    <nav class="breadcrumb">
        <ol>
            <li><a href="/">Home</a></li>
            <li aria-current="page">Cheat Sheets</li>
        </ol>
    </nav>

    <main class="content">
        <h1>Algorithm Cheat Sheets</h1>
        <p class="intro">Quick reference for coding interviews. Bookmark these!</p>

        <div class="cheatsheets-grid">
            ${cheatsheetsHtml}
        </div>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .cheatsheets-grid {
            display: grid;
            gap: 0.75rem;
            margin: 2rem 0;
        }
        .cheatsheet-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.25rem;
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
            text-decoration: none;
            color: #0a0a0a;
            font-weight: 500;
            transition: all 0.2s;
        }
        .cheatsheet-card:hover {
            transform: translateX(4px);
        }
        .cheatsheet-card .arrow {
            margin-left: auto;
            color: #999;
        }
    </style>
</body>
</html>`;
}

// ============================================
// Sitemap Generator
// ============================================
function generateSitemap() {
    const urls = [];
    const today = new Date().toISOString().split('T')[0];

    // Homepage
    urls.push({ url: '/', priority: '1.0', changefreq: 'weekly' });

    // Pattern pages
    urls.push({ url: '/patterns/', priority: '0.9', changefreq: 'weekly' });
    data.categories.forEach(cat => {
        urls.push({ url: `/patterns/${cat.id}/`, priority: '0.8', changefreq: 'monthly' });
    });

    // Problem pages
    Object.entries(data.problems).forEach(([categoryId, problems]) => {
        problems.forEach(problem => {
            urls.push({
                url: `/problems/${categoryId}/${problem.slug}.html`,
                priority: '0.7',
                changefreq: 'monthly'
            });
        });
    });

    // Cheatsheets
    urls.push({ url: '/cheatsheets/', priority: '0.8', changefreq: 'monthly' });
    data.categories.forEach(cat => {
        urls.push({ url: `/cheatsheets/${cat.id}.html`, priority: '0.7', changefreq: 'monthly' });
    });

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://leeteye.com${u.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
}

// ============================================
// Main Generation
// ============================================
function main() {
    console.log('🚀 Starting page generation...\n');

    let problemCount = 0;
    let patternCount = 0;
    let cheatsheetCount = 0;

    // 1. Generate Pattern Hub Pages
    console.log('📁 Generating pattern hub pages...');
    data.categories.forEach(category => {
        const html = generatePatternHubPage(category);
        const outputPath = path.join(OUTPUT_PATH, 'patterns', category.id, 'index.html');
        writeHtml(outputPath, html);
        patternCount++;
    });
    console.log(`   ✅ Generated ${patternCount} pattern hub pages`);

    // 2. Generate Problem Pages
    console.log('📁 Generating problem pages...');
    Object.entries(data.problems).forEach(([categoryId, problems]) => {
        const category = getCategoryById(categoryId);
        if (!category) return;

        problems.forEach(problem => {
            const html = generateProblemPage(problem, category);
            const outputPath = path.join(OUTPUT_PATH, 'problems', categoryId, `${problem.slug}.html`);
            writeHtml(outputPath, html);
            problemCount++;
        });
    });
    console.log(`   ✅ Generated ${problemCount} problem pages`);

    // 3. Generate Cheatsheet Pages
    console.log('📁 Generating cheatsheet pages...');
    data.categories.forEach(category => {
        const html = generateCheatsheetPage(category);
        const outputPath = path.join(OUTPUT_PATH, 'cheatsheets', `${category.id}.html`);
        writeHtml(outputPath, html);
        cheatsheetCount++;
    });
    console.log(`   ✅ Generated ${cheatsheetCount} cheatsheet pages`);

    // 4. Generate Index Pages
    console.log('📁 Generating index pages...');
    writeHtml(path.join(OUTPUT_PATH, 'patterns', 'index.html'), generatePatternsIndexPage());
    writeHtml(path.join(OUTPUT_PATH, 'cheatsheets', 'index.html'), generateCheatsheetsIndexPage());
    console.log('   ✅ Generated patterns and cheatsheets index pages');

    // 5. Generate Sitemap
    console.log('📁 Generating sitemap...');
    const sitemap = generateSitemap();
    writeHtml(path.join(OUTPUT_PATH, 'sitemap-pseo.xml'), sitemap);
    console.log('   ✅ Generated sitemap-pseo.xml');

    // Summary
    console.log('\n✨ Generation complete!');
    console.log(`   Total pages: ${patternCount + problemCount + cheatsheetCount + 2}`);
    console.log(`   - Pattern hubs: ${patternCount}`);
    console.log(`   - Problem pages: ${problemCount}`);
    console.log(`   - Cheat sheets: ${cheatsheetCount}`);
    console.log(`   - Index pages: 2`);
}

// Run
main();
