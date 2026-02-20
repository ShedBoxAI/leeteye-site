#!/usr/bin/env node

/**
 * LeetEye pSEO - Generate Comparison & Difficulty Pages
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/pseo-data.json');
const OUTPUT_PATH = path.join(__dirname, '..');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeHtml(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
}

function getAssetPath(depth) {
    return '../'.repeat(depth) + 'assets';
}

function getCssPath(depth) {
    return '../'.repeat(depth) + 'css';
}

function generateHead(vars) {
    return `
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
    <meta property="og:title" content="${escapeHtml(vars.og_title)}">
    <meta property="og:description" content="${escapeHtml(vars.meta_description)}">
    <meta property="og:image" content="https://leeteye.com/assets/og-image.png">
    <meta property="og:url" content="https://leeteye.com${vars.canonical_path}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(vars.og_title)}">
    <meta name="twitter:description" content="${escapeHtml(vars.meta_description)}">
    <meta name="twitter:image" content="https://leeteye.com/assets/og-image.png">
    <title>${escapeHtml(vars.page_title)}</title>
    <link rel="icon" type="image/png" href="${vars.assets_path}/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${vars.css_path}/pseo.css">`;
}

// Comparison data with descriptions
const comparisonDetails = {
    'sliding-window-vs-two-pointers': {
        pattern1_when: 'you need to find a contiguous subarray/substring that meets a condition',
        pattern2_when: 'you need to find pairs or compare elements from both ends',
        pattern1_best_for: 'Subarray sum, longest substring, window constraints',
        pattern2_best_for: 'Pair finding, palindrome checking, sorted array problems',
        pattern1_time: 'O(n)', pattern2_time: 'O(n)',
        pattern1_space: 'O(1) or O(k)', pattern2_space: 'O(1)',
        decision: ['Is the problem about a contiguous subarray/substring? → Sliding Window', 'Are you comparing elements from opposite ends? → Two Pointers', 'Need to find pairs that sum to target? → Two Pointers', 'Looking for longest/shortest window with constraint? → Sliding Window']
    },
    'bfs-vs-dfs': {
        pattern1_when: 'you need shortest path or level-order traversal',
        pattern2_when: 'you need to explore all paths or check connectivity',
        pattern1_best_for: 'Shortest path, level order, nearest neighbor',
        pattern2_best_for: 'Path finding, cycle detection, topological sort',
        pattern1_time: 'O(V+E)', pattern2_time: 'O(V+E)',
        pattern1_space: 'O(V)', pattern2_space: 'O(V) recursive stack',
        decision: ['Need shortest path in unweighted graph? → BFS', 'Need to explore all possible paths? → DFS', 'Level-by-level traversal? → BFS', 'Detecting cycles or backtracking? → DFS']
    },
    'dynamic-programming-vs-greedy': {
        pattern1_when: 'optimal substructure AND overlapping subproblems exist',
        pattern2_when: 'local optimal choice leads to global optimal',
        pattern1_best_for: 'Optimization with constraints, counting paths',
        pattern2_best_for: 'Scheduling, interval selection, Huffman coding',
        pattern1_time: 'O(n²) or O(n×m)', pattern2_time: 'O(n log n) or O(n)',
        pattern1_space: 'O(n) or O(n×m)', pattern2_space: 'O(1) typically',
        decision: ['Can you prove greedy choice property? → Greedy', 'Do subproblems overlap? → DP', 'Need to consider all possibilities? → DP', 'Is there an obvious "best next choice"? → Greedy']
    },
    'hash-map-vs-hash-set': {
        pattern1_when: 'you need to store key-value pairs or count frequencies',
        pattern2_when: 'you only need to track presence/absence',
        pattern1_best_for: 'Two Sum, frequency counting, caching',
        pattern2_best_for: 'Contains Duplicate, finding unique elements',
        pattern1_time: 'O(1) average', pattern2_time: 'O(1) average',
        pattern1_space: 'O(n)', pattern2_space: 'O(n)',
        decision: ['Need to store additional data with each key? → Hash Map', 'Just checking "have I seen this before"? → Hash Set', 'Counting occurrences? → Hash Map', 'Removing duplicates? → Hash Set']
    },
    'memoization-vs-tabulation': {
        pattern1_when: 'you want top-down DP with recursion',
        pattern2_when: 'you want bottom-up DP with iteration',
        pattern1_best_for: 'Tree problems, when not all subproblems needed',
        pattern2_best_for: 'When all subproblems must be solved, space optimization',
        pattern1_time: 'Same as tabulation', pattern2_time: 'Same as memoization',
        pattern1_space: 'O(n) + recursion stack', pattern2_space: 'O(n), can optimize to O(1)',
        decision: ['More comfortable with recursion? → Memoization', 'Need to optimize space? → Tabulation', 'Only some subproblems needed? → Memoization', 'Clear iterative order? → Tabulation']
    },
    'recursion-vs-iteration': {
        pattern1_when: 'the problem has natural recursive structure (trees, divide & conquer)',
        pattern2_when: 'you need better space efficiency or the pattern is linear',
        pattern1_best_for: 'Tree traversal, backtracking, divide & conquer',
        pattern2_best_for: 'Array processing, linked list, simple loops',
        pattern1_time: 'Depends on problem', pattern2_time: 'Depends on problem',
        pattern1_space: 'O(depth) stack space', pattern2_space: 'O(1) typically',
        decision: ['Tree or graph structure? → Recursion often cleaner', 'Risk of stack overflow? → Convert to iteration', 'Need backtracking? → Recursion', 'Simple linear processing? → Iteration']
    },
    'dijkstra-vs-bfs': {
        pattern1_when: 'edges have different weights (weighted graph)',
        pattern2_when: 'all edges have same weight (unweighted graph)',
        pattern1_best_for: 'Weighted shortest path, road networks',
        pattern2_best_for: 'Unweighted shortest path, maze solving',
        pattern1_time: 'O((V+E) log V)', pattern2_time: 'O(V+E)',
        pattern1_space: 'O(V)', pattern2_space: 'O(V)',
        decision: ['All edges have weight 1? → BFS is simpler', 'Different edge weights? → Dijkstra required', 'Negative weights? → Neither (use Bellman-Ford)', 'Need actual shortest distance? → Check weights first']
    }
};

// Generate comparison page
function generateComparisonPage(comparison) {
    const depth = 1;
    const slug = `${comparison.pattern1}-vs-${comparison.pattern2}`;
    const details = comparisonDetails[slug] || {
        pattern1_when: `the problem fits ${comparison.pattern1} pattern`,
        pattern2_when: `the problem fits ${comparison.pattern2} pattern`,
        pattern1_best_for: 'Various algorithmic problems',
        pattern2_best_for: 'Various algorithmic problems',
        pattern1_time: 'Varies', pattern2_time: 'Varies',
        pattern1_space: 'Varies', pattern2_space: 'Varies',
        decision: ['Analyze the problem constraints', 'Consider time/space trade-offs', 'Look for pattern triggers']
    };

    const pattern1Name = comparison.pattern1.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const pattern2Name = comparison.pattern2.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const head = generateHead({
        meta_description: `${pattern1Name} vs ${pattern2Name}: Learn when to use each pattern in coding interviews. Side-by-side comparison with examples.`,
        canonical_path: `/compare/${slug}.html`,
        og_title: `${comparison.title} | LeetEye`,
        page_title: `${comparison.title} | LeetEye`,
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    const decisionHtml = (details.decision || []).map(d => `<li>${escapeHtml(d)}</li>`).join('\n');

    // Find related comparisons
    const relatedComparisons = data.comparisons
        .filter(c => c.pattern1 !== comparison.pattern1 || c.pattern2 !== comparison.pattern2)
        .slice(0, 5);
    const relatedHtml = relatedComparisons.map(c =>
        `<li><a href="/compare/${c.pattern1}-vs-${c.pattern2}.html">${escapeHtml(c.title)}</a></li>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(comparison.title)}",
        "description": "${pattern1Name} vs ${pattern2Name}: Learn when to use each pattern.",
        "author": {"@type": "Organization", "name": "LeetEye"}
    }
    </script>
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
            <li><a href="/compare/">Comparisons</a></li>
            <li aria-current="page">${pattern1Name} vs ${pattern2Name}</li>
        </ol>
    </nav>

    <main class="content">
        <article class="comparison-article">
            <header class="comparison-header">
                <span class="category-badge">Comparison</span>
                <h1>${escapeHtml(comparison.title)}</h1>
                <p class="intro">Learn when to use each pattern and make the right choice in your coding interview.</p>
            </header>

            <section class="tldr">
                <h2>Quick Answer</h2>
                <div class="tldr-box">
                    <p><strong>Use ${pattern1Name}</strong> when ${details.pattern1_when}</p>
                    <p><strong>Use ${pattern2Name}</strong> when ${details.pattern2_when}</p>
                </div>
            </section>

            <section class="comparison-cards-section">
                <h2>Side-by-Side Comparison</h2>
                <div class="comparison-cards">
                    <div class="compare-card compare-card-orange">
                        <div class="compare-card-header">${pattern1Name}</div>
                        <div class="compare-card-rows">
                            <div class="compare-row">
                                <span class="compare-label">Best For</span>
                                <span class="compare-value">${details.pattern1_best_for}</span>
                            </div>
                            <div class="compare-row">
                                <span class="compare-label">Time</span>
                                <span class="compare-value"><code>${details.pattern1_time}</code></span>
                            </div>
                            <div class="compare-row">
                                <span class="compare-label">Space</span>
                                <span class="compare-value"><code>${details.pattern1_space}</code></span>
                            </div>
                        </div>
                    </div>
                    <div class="compare-card compare-card-purple">
                        <div class="compare-card-header">${pattern2Name}</div>
                        <div class="compare-card-rows">
                            <div class="compare-row">
                                <span class="compare-label">Best For</span>
                                <span class="compare-value">${details.pattern2_best_for}</span>
                            </div>
                            <div class="compare-row">
                                <span class="compare-label">Time</span>
                                <span class="compare-value"><code>${details.pattern2_time}</code></span>
                            </div>
                            <div class="compare-row">
                                <span class="compare-label">Space</span>
                                <span class="compare-value"><code>${details.pattern2_space}</code></span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="decision-guide">
                <h2>How to Decide</h2>
                <div class="decision-flowchart">
                    <ul class="decision-list">
                        ${decisionHtml}
                    </ul>
                </div>
            </section>

            <section class="cta-box">
                <h2>Practice Both Patterns</h2>
                <p>Build intuition to recognize which pattern fits. Practice with interactive MCQs in LeetEye.</p>
                <a href="https://apps.apple.com/us/app/leeteye/id6756695234?utm_source=website&utm_medium=comparison&utm_campaign=${slug}" class="cta-button cta-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Download LeetEye Free
                </a>
            </section>

            <aside class="related-comparisons">
                <h3>More Comparisons</h3>
                <ul>${relatedHtml}</ul>
            </aside>
        </article>
    </main>

    <div class="sticky-cta">
        <a href="https://apps.apple.com/us/app/leeteye/id6756695234" class="cta-button">Practice in LeetEye</a>
    </div>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .decision-list { list-style: none; padding: 0; }
        .decision-list li {
            padding: 1rem;
            background: #f9f9f9;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            border-left: 3px solid #F97316;
        }
    </style>
</body>
</html>`;
}

// Generate difficulty page
function generateDifficultyPage(category, difficulty) {
    const depth = 2;
    const problems = (data.problems[category.id] || []).filter(p => p.difficulty === difficulty);
    const diffCap = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    const head = generateHead({
        meta_description: `${diffCap} ${category.displayName} problems for coding interview practice. ${problems.length} problems with solutions.`,
        canonical_path: `/patterns/${category.id}/${difficulty}.html`,
        og_title: `${diffCap} ${category.displayName} Problems | LeetEye`,
        page_title: `${diffCap} ${category.displayName} Problems | LeetEye`,
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    // Noindex thin difficulty filter pages to avoid Google indexing low-content pages
    const noindexTag = '<meta name="robots" content="noindex, follow">';

    const problemsHtml = problems.length > 0
        ? problems.map(p => `
            <a href="/problems/${category.id}/${p.slug}.html" class="problem-card">
                <span class="problem-card-title">${escapeHtml(p.title)}</span>
                <span class="difficulty difficulty-${p.difficulty}">${p.difficulty}</span>
            </a>
        `).join('\n')
        : '<p class="no-problems">No problems at this difficulty yet. Check back soon!</p>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    ${noindexTag}
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
            <li><a href="/patterns/">Patterns</a></li>
            <li><a href="/patterns/${category.id}/">${escapeHtml(category.displayName)}</a></li>
            <li aria-current="page">${diffCap}</li>
        </ol>
    </nav>

    <main class="content">
        <header class="pattern-header" style="--pattern-color: ${category.colorHex}">
            <span class="difficulty difficulty-${difficulty}">${diffCap}</span>
            <h1>${diffCap} ${escapeHtml(category.displayName)} Problems</h1>
            <p class="intro">${problems.length} ${difficulty} problems to practice ${category.displayName}.</p>
        </header>

        <div class="difficulty-tabs">
            <a href="/patterns/${category.id}/easy.html" class="tab ${difficulty === 'easy' ? 'active' : ''}">Easy</a>
            <a href="/patterns/${category.id}/medium.html" class="tab ${difficulty === 'medium' ? 'active' : ''}">Medium</a>
            <a href="/patterns/${category.id}/hard.html" class="tab ${difficulty === 'hard' ? 'active' : ''}">Hard</a>
        </div>

        <div class="problems-grid">
            ${problemsHtml}
        </div>

        <section class="cta-box">
            <h2>Master ${escapeHtml(category.displayName)}</h2>
            <p>Build pattern recognition with interactive MCQs in LeetEye.</p>
            <a href="https://apps.apple.com/us/app/leeteye/id6756695234?utm_source=website&utm_medium=difficulty&utm_campaign=${category.id}-${difficulty}" class="cta-button cta-primary">
                Download LeetEye Free
            </a>
        </section>

        <aside class="related-problems">
            <h3>All ${escapeHtml(category.displayName)} Problems</h3>
            <a href="/patterns/${category.id}/" class="see-all-link">View all difficulties &rarr;</a>
        </aside>
    </main>

    <div class="sticky-cta">
        <a href="https://apps.apple.com/us/app/leeteye/id6756695234" class="cta-button">Practice in LeetEye</a>
    </div>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .tab.active { background: #F97316; color: white; }
        .no-problems { color: #666; font-style: italic; text-align: center; padding: 2rem; }
    </style>
</body>
</html>`;
}

// Generate comparison index page
function generateCompareIndexPage() {
    const depth = 1;
    const head = generateHead({
        meta_description: 'Algorithm pattern comparisons for coding interviews. When to use BFS vs DFS, DP vs Greedy, and more.',
        canonical_path: '/compare/',
        og_title: 'Pattern Comparisons | LeetEye',
        page_title: 'Pattern Comparisons | LeetEye',
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    const comparisonsHtml = data.comparisons.map(c => `
        <a href="/compare/${c.pattern1}-vs-${c.pattern2}.html" class="comparison-card">
            <span>${escapeHtml(c.title)}</span>
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
            <li aria-current="page">Comparisons</li>
        </ol>
    </nav>

    <main class="content">
        <h1>Pattern Comparisons</h1>
        <p class="intro">Learn when to use each algorithm pattern. Essential for coding interviews.</p>

        <div class="comparisons-grid">
            ${comparisonsHtml}
        </div>

        <section class="cta-box">
            <h2>Master Pattern Recognition</h2>
            <p>Build intuition with interactive MCQs in LeetEye.</p>
            <a href="https://apps.apple.com/us/app/leeteye/id6756695234" class="cta-button cta-primary">Download LeetEye Free</a>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .comparisons-grid { display: grid; gap: 0.75rem; margin: 2rem 0; }
        .comparison-card {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem 1.25rem; background: white; border: 1px solid #e5e5e5;
            border-radius: 10px; text-decoration: none; color: #0a0a0a;
            font-weight: 500; transition: all 0.2s;
        }
        .comparison-card:hover { transform: translateX(4px); border-color: #F97316; }
        .comparison-card .arrow { color: #999; }
    </style>
</body>
</html>`;
}

// Generate HTML sitemap page
function generateHtmlSitemapPage() {
    const depth = 0;
    const head = generateHead({
        meta_description: 'Complete sitemap of LeetEye - all algorithm patterns, problems, cheat sheets, and comparisons for coding interview prep.',
        canonical_path: '/sitemap.html',
        og_title: 'Sitemap | LeetEye',
        page_title: 'Sitemap | LeetEye',
        assets_path: getAssetPath(depth),
        css_path: getCssPath(depth)
    });

    // Build pattern sections with their problems and cheatsheets
    const patternSections = data.categories.map(cat => {
        const problems = (data.problems[cat.id] || []).map(p =>
            `<li><a href="/problems/${cat.id}/${p.slug}.html">${escapeHtml(p.title)}</a></li>`
        ).join('\n');
        return `
            <div class="sitemap-category">
                <h3><a href="/patterns/${cat.id}/">${escapeHtml(cat.displayName)}</a></h3>
                <ul>
                    <li><a href="/cheatsheets/${cat.id}.html">${escapeHtml(cat.displayName)} Cheat Sheet</a></li>
                    ${problems}
                </ul>
            </div>`;
    }).join('\n');

    // Comparisons
    const comparisonsHtml = data.comparisons.map(c =>
        `<li><a href="/compare/${c.pattern1}-vs-${c.pattern2}.html">${escapeHtml(c.title)}</a></li>`
    ).join('\n');

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
            <li aria-current="page">Sitemap</li>
        </ol>
    </nav>

    <main class="content">
        <h1>Sitemap</h1>
        <p class="intro">All pages on LeetEye - algorithm patterns, practice problems, cheat sheets, and comparisons.</p>

        <section class="sitemap-section">
            <h2><a href="/patterns/">Algorithm Patterns</a></h2>
            ${patternSections}
        </section>

        <section class="sitemap-section">
            <h2><a href="/cheatsheets/">All Cheat Sheets</a></h2>
            <ul>
                ${data.categories.map(c => `<li><a href="/cheatsheets/${c.id}.html">${escapeHtml(c.displayName)} Cheat Sheet</a></li>`).join('\n')}
            </ul>
        </section>

        <section class="sitemap-section">
            <h2><a href="/compare/">Pattern Comparisons</a></h2>
            <ul>
                ${comparisonsHtml}
            </ul>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
        </div>
    </footer>

    <style>
        .sitemap-section { margin-bottom: 2rem; }
        .sitemap-section h2 { margin-bottom: 1rem; }
        .sitemap-section h2 a { color: #0a0a0a; text-decoration: none; }
        .sitemap-section h2 a:hover { color: #F97316; }
        .sitemap-category { margin-bottom: 1.5rem; }
        .sitemap-category h3 { font-size: 1rem; margin-bottom: 0.5rem; }
        .sitemap-category h3 a { color: #333; text-decoration: none; }
        .sitemap-category h3 a:hover { color: #F97316; }
        .sitemap-section ul { list-style: none; padding: 0; }
        .sitemap-section li { padding: 0.25rem 0; }
        .sitemap-section li a { color: #555; text-decoration: none; font-size: 0.9rem; }
        .sitemap-section li a:hover { color: #F97316; }
    </style>
</body>
</html>`;
}

// Main
function main() {
    console.log('🚀 Generating extra pages...\n');

    // 1. Comparison pages
    console.log('📁 Generating comparison pages...');
    ensureDir(path.join(OUTPUT_PATH, 'compare'));

    data.comparisons.forEach(comparison => {
        const html = generateComparisonPage(comparison);
        const outputPath = path.join(OUTPUT_PATH, 'compare', `${comparison.pattern1}-vs-${comparison.pattern2}.html`);
        writeHtml(outputPath, html);
    });

    // Comparison index
    writeHtml(path.join(OUTPUT_PATH, 'compare', 'index.html'), generateCompareIndexPage());
    console.log(`   ✅ Generated ${data.comparisons.length} comparison pages + index`);

    // 2. Difficulty pages
    console.log('📁 Generating difficulty pages...');
    let diffCount = 0;
    const difficulties = ['easy', 'medium', 'hard'];

    data.categories.forEach(category => {
        difficulties.forEach(difficulty => {
            const html = generateDifficultyPage(category, difficulty);
            const outputPath = path.join(OUTPUT_PATH, 'patterns', category.id, `${difficulty}.html`);
            writeHtml(outputPath, html);
            diffCount++;
        });
    });
    console.log(`   ✅ Generated ${diffCount} difficulty pages`);

    // 3. HTML sitemap page
    console.log('📁 Generating HTML sitemap...');
    writeHtml(path.join(OUTPUT_PATH, 'sitemap.html'), generateHtmlSitemapPage());
    console.log('   ✅ Generated sitemap.html');

    // 4. Update sitemap
    console.log('📁 Updating sitemap...');
    const sitemapPath = path.join(OUTPUT_PATH, 'sitemap-pseo.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');

    const today = new Date().toISOString().split('T')[0];
    const newUrls = [];

    // Add comparison URLs
    newUrls.push(`  <url>\n    <loc>https://leeteye.com/compare/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>`);
    data.comparisons.forEach(c => {
        newUrls.push(`  <url>\n    <loc>https://leeteye.com/compare/${c.pattern1}-vs-${c.pattern2}.html</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.7</priority>\n  </url>`);
    });

    // Difficulty pages are noindex'd (thin content) - do NOT add to sitemap

    // Insert before closing tag
    sitemap = sitemap.replace('</urlset>', newUrls.join('\n') + '\n</urlset>');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('   ✅ Updated sitemap-pseo.xml');

    console.log('\n✨ Extra pages complete!');
    console.log(`   - Comparison pages: ${data.comparisons.length + 1}`);
    console.log(`   - Difficulty pages: ${diffCount}`);
}

main();
