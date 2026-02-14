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
// Pattern Content Data (for richer hub pages)
// ============================================
const patternContent = {
    'arrays-and-hashing': {
        howItWorks: 'Arrays and Hashing combines two fundamental concepts: sequential data storage and constant-time lookups. The core idea is to use a hash map (dictionary) to store seen values while iterating through an array, enabling O(1) lookups instead of O(n) nested searches. This transforms brute-force O(n\u00B2) solutions into O(n) single-pass algorithms. The hash map acts as a memory of what you\'ve encountered, letting you answer questions like "have I seen this before?" or "what pairs with this value?" instantly.',
        commonMistakes: [
            'Forgetting to handle duplicate elements in the hash map',
            'Using a hash set when you need to track indices (use a hash map instead)',
            'Not considering that hash maps use O(n) extra space',
            'Modifying the array in-place when the problem expects the original order preserved'
        ],
        whenNotToUse: [
            'When the array is already sorted (two pointers is more space-efficient)',
            'When you need to find elements in a specific range (binary search is better)',
            'When memory is extremely constrained and O(1) space is required'
        ]
    },
    'two-pointers': {
        howItWorks: 'Two Pointers uses two index variables that move through a sorted array or sequence from different positions. The most common setup places one pointer at the start and another at the end, moving them inward based on comparisons. This eliminates the need for nested loops by making intelligent decisions about which pointer to advance. The key insight is that in a sorted array, moving the left pointer increases the sum while moving the right pointer decreases it, letting you efficiently search for target conditions.',
        commonMistakes: [
            'Forgetting to sort the array first (two pointers requires sorted input for most problems)',
            'Off-by-one errors with pointer boundaries (use < vs <= carefully)',
            'Not handling duplicate elements when the problem asks for unique results',
            'Moving the wrong pointer \u2014 always reason about which direction gets you closer to the goal'
        ],
        whenNotToUse: [
            'When the input is unsorted and sorting would lose important information (like indices)',
            'When you need to consider all subarrays, not just pairs',
            'When the data structure isn\'t linear (use BFS/DFS for graphs and trees)'
        ]
    },
    'sliding-window': {
        howItWorks: 'Sliding Window maintains a dynamic window (subarray) that expands and contracts as it moves through the array. You grow the window by advancing the right pointer and shrink it by advancing the left pointer. The window tracks a running state (sum, character count, etc.) that updates incrementally instead of recalculating from scratch. This converts O(n\u00D7k) brute-force approaches to O(n) by reusing computation from the previous window position.',
        commonMistakes: [
            'Shrinking the window too aggressively \u2014 only shrink when the constraint is violated',
            'Not updating the window state correctly when removing the left element',
            'Confusing fixed-size windows (always size k) with variable-size windows (expand/shrink)',
            'Forgetting to check the result after the final expansion, missing the last valid window'
        ],
        whenNotToUse: [
            'When elements are not contiguous (use dynamic programming or backtracking)',
            'When you need to compare non-adjacent elements (use two pointers)',
            'When the problem requires considering all subsequences, not just subarrays'
        ]
    },
    'binary-search': {
        howItWorks: 'Binary Search eliminates half the search space with each comparison. Starting with a range [low, high], you check the middle element and decide whether the answer lies in the left or right half. This gives O(log n) time complexity. Beyond basic sorted array search, binary search applies to any problem where you can define a monotonic condition \u2014 a boundary where values go from "no" to "yes" (or vice versa). You\'re essentially searching for that boundary.',
        commonMistakes: [
            'Infinite loops from incorrect mid calculation or boundary updates (use low + (high - low) // 2)',
            'Off-by-one errors in the loop condition: while low <= high vs while low < high',
            'Not correctly identifying the search space \u2014 sometimes you search on the answer, not the array',
            'Forgetting that binary search requires a monotonic property to work correctly'
        ],
        whenNotToUse: [
            'When the array is unsorted and you can\'t sort it',
            'When there\'s no monotonic property to exploit',
            'When the search space is tiny (linear scan is simpler and equally fast)'
        ]
    },
    'stack': {
        howItWorks: 'A Stack follows Last-In-First-Out (LIFO) ordering, making it perfect for problems involving matching, nesting, or "most recent" lookups. The Monotonic Stack variant maintains elements in sorted order, enabling efficient "next greater/smaller element" queries. When you push an element, you first pop all elements that violate the monotonic property, processing them as you go. This processes each element at most twice (push + pop), giving O(n) total time.',
        commonMistakes: [
            'Popping from an empty stack \u2014 always check if the stack is empty before popping',
            'Forgetting to process remaining elements in the stack after the main loop',
            'Using a regular stack when a monotonic stack is needed (or vice versa)',
            'Not storing both value and index when the problem needs positional information'
        ],
        whenNotToUse: [
            'When you need FIFO ordering (use a queue instead)',
            'When you need to access elements in the middle (use a deque or array)',
            'When the problem doesn\'t involve nesting, matching, or nearest greater/smaller elements'
        ]
    },
    'linked-list': {
        howItWorks: 'Linked List problems typically use pointer manipulation techniques. The two most important patterns are the fast/slow pointer (tortoise and hare) for cycle detection and finding midpoints, and dummy head nodes for simplifying insertions/deletions. The fast pointer moves two steps while the slow moves one \u2014 when fast reaches the end, slow is at the middle. For cycle detection, if they ever meet, a cycle exists. Reversing a linked list uses three pointers: prev, curr, and next.',
        commonMistakes: [
            'Losing reference to nodes by overwriting pointers without saving them first',
            'Forgetting the edge case of empty lists or single-node lists',
            'Not using a dummy head node, leading to complex special-case handling for the head',
            'Infinite loops from incorrect pointer updates during reversal or reordering'
        ],
        whenNotToUse: [
            'When you need random access by index (use an array)',
            'When the problem is about subsequences or subarrays (use sliding window or DP)',
            'When the overhead of pointer manipulation outweighs the benefit'
        ]
    },
    'trees': {
        howItWorks: 'Tree problems are solved recursively by breaking them into subproblems at each node. At every node you have three choices: process the node before its children (preorder), between children (inorder), or after children (postorder). Most tree problems follow a pattern: define what information you need from left and right subtrees, combine it at the current node, and return the result upward. BFS (level-order) uses a queue to process nodes level by level, useful for shortest path or level-specific operations.',
        commonMistakes: [
            'Not handling the null/None base case (every recursive tree function needs it)',
            'Confusing when to use DFS vs BFS \u2014 use DFS for path problems, BFS for level problems',
            'Returning values incorrectly in recursive calls (the return value must propagate up)',
            'Not considering that a tree might be unbalanced, leading to O(n) height instead of O(log n)'
        ],
        whenNotToUse: [
            'When the structure has cycles (it\'s a graph, not a tree \u2014 use graph algorithms)',
            'When you need to process all pairs of nodes (the recursive approach won\'t help)',
            'When the problem is about sequences or arrays with no hierarchical structure'
        ]
    },
    'tries': {
        howItWorks: 'A Trie (prefix tree) stores strings character by character in a tree structure, where each node represents a character and paths from root to leaves form complete words. This enables O(L) lookup, insertion, and prefix matching where L is the word length \u2014 independent of how many words are stored. Each node typically has a children map and a boolean flag marking word endings. Tries excel at prefix-based operations like autocomplete, spell checking, and finding all words with a common prefix.',
        commonMistakes: [
            'Forgetting to mark word endpoints (isEnd flag) leading to false prefix-only matches',
            'Not handling the empty string case',
            'Using arrays of size 26 when the character set might include numbers or special chars',
            'Memory overhead \u2014 tries can use much more memory than hash sets for the same data'
        ],
        whenNotToUse: [
            'When you only need exact string matching (a hash set is simpler and uses less memory)',
            'When the strings are very long and few (hash map is more space-efficient)',
            'When the character set is very large (each node would need too many children slots)'
        ]
    },
    'backtracking': {
        howItWorks: 'Backtracking systematically explores all possible solutions by building candidates incrementally and abandoning ("pruning") paths that can\'t lead to valid solutions. It follows a choose-explore-unchoose pattern: at each step, make a choice, recurse to explore further, then undo the choice to try alternatives. The key optimization is pruning \u2014 recognizing early when a partial solution can\'t possibly work, saving time by not exploring that entire subtree.',
        commonMistakes: [
            'Forgetting to unchoose (backtrack) after exploring \u2014 this corrupts the state for sibling branches',
            'Not pruning effectively, leading to exponential blowup on large inputs',
            'Creating new copies of the state at every level instead of modifying in place (wastes memory)',
            'Generating duplicate solutions \u2014 use sorting and skip duplicates at each level'
        ],
        whenNotToUse: [
            'When an optimal substructure exists (use dynamic programming instead)',
            'When a greedy approach gives the optimal solution',
            'When the search space is too large even with pruning (consider approximation algorithms)'
        ]
    },
    'heap': {
        howItWorks: 'A Heap (Priority Queue) maintains elements in a partially ordered structure where the min (or max) element can be accessed in O(1) and extracted in O(log n). This is essential for "top K" problems, stream processing, and merge operations. For "K smallest/largest" problems, use a max-heap of size K \u2014 when it exceeds K elements, pop the max, guaranteeing the K smallest remain. Two heaps (max-heap + min-heap) can maintain a running median by balancing elements between them.',
        commonMistakes: [
            'Using the wrong heap type \u2014 Python\'s heapq is a min-heap; negate values for max-heap',
            'Forgetting that heap operations are O(log n), not O(1) for insertion',
            'Not maintaining the correct heap size for K-element problems',
            'Trying to remove arbitrary elements from a heap (use lazy deletion or a different data structure)'
        ],
        whenNotToUse: [
            'When you need the full sorted order (just sort the array)',
            'When K is close to N (sorting is simpler and equally efficient)',
            'When you need to access elements by index (use a sorted array or balanced BST)'
        ]
    },
    'graphs': {
        howItWorks: 'Graph problems are solved using BFS (breadth-first search) for shortest paths and level exploration, or DFS (depth-first search) for exhaustive exploration and connectivity. Build an adjacency list from edges, then traverse. BFS uses a queue and processes nodes level by level, guaranteeing shortest path in unweighted graphs. DFS uses recursion or a stack, going as deep as possible before backtracking. Track visited nodes to avoid cycles. Union-Find is used for connectivity queries and cycle detection in undirected graphs.',
        commonMistakes: [
            'Not marking nodes as visited, causing infinite loops in cyclic graphs',
            'Using DFS when BFS is needed for shortest path (DFS doesn\'t guarantee shortest path)',
            'Building the adjacency list incorrectly for undirected graphs (add edges both ways)',
            'Not handling disconnected components (run BFS/DFS from every unvisited node)'
        ],
        whenNotToUse: [
            'When the problem is about sequences without relationships (use arrays/DP)',
            'When the graph is actually a tree (simpler tree algorithms suffice)',
            'When the data is grid-based with simple traversal (might be simpler to index directly)'
        ]
    },
    'advanced-graphs': {
        howItWorks: 'Advanced graph algorithms handle weighted edges, shortest paths, and minimum spanning trees. Dijkstra\'s algorithm finds shortest paths from a source using a priority queue, always expanding the closest unvisited node. Bellman-Ford handles negative weights by relaxing all edges V-1 times. Kruskal\'s and Prim\'s algorithms find minimum spanning trees. Topological sort orders nodes in a DAG so every edge goes from earlier to later, essential for dependency resolution.',
        commonMistakes: [
            'Using Dijkstra with negative edge weights (it won\'t work \u2014 use Bellman-Ford)',
            'Not using a priority queue for Dijkstra, resulting in O(V\u00B2) instead of O((V+E)log V)',
            'Forgetting to detect negative cycles with Bellman-Ford',
            'Applying topological sort to a graph with cycles (it only works on DAGs)'
        ],
        whenNotToUse: [
            'When all edges have equal weight (use simple BFS for shortest path)',
            'When the graph is small enough for brute-force approaches',
            'When the problem doesn\'t actually need shortest paths or spanning trees'
        ]
    },
    '1d-dp': {
        howItWorks: '1D Dynamic Programming solves problems by storing solutions to subproblems in an array, where each entry depends only on previous entries. The pattern is: define state (what dp[i] represents), find the recurrence relation (how dp[i] relates to dp[i-1], dp[i-2], etc.), set base cases, and fill the array bottom-up. Classic examples include Fibonacci, climbing stairs, and house robber. Many 1D DP problems can be space-optimized to O(1) by only keeping the last few values.',
        commonMistakes: [
            'Wrong state definition \u2014 dp[i] must have a clear, consistent meaning',
            'Missing base cases (dp[0], dp[1] are often special)',
            'Not considering all transitions \u2014 each dp[i] might depend on multiple previous states',
            'Off-by-one errors in loop bounds when filling the DP table'
        ],
        whenNotToUse: [
            'When a greedy approach provably gives the optimal answer',
            'When the problem doesn\'t have overlapping subproblems (use divide and conquer)',
            'When the state space is too large to fit in memory'
        ]
    },
    '2d-dp': {
        howItWorks: '2D Dynamic Programming extends 1D DP to problems with two varying parameters, using a 2D table where dp[i][j] represents the solution for a subproblem defined by indices i and j. Common patterns include grid traversal (paths from top-left to bottom-right), string matching (edit distance, LCS), and knapsack problems (items vs capacity). Each cell depends on its neighbors (usually left, top, or diagonal), and you fill the table row by row.',
        commonMistakes: [
            'Wrong table dimensions \u2014 often need (m+1) x (n+1) to handle empty string/array base cases',
            'Filling the table in the wrong order (dependencies must already be computed)',
            'Not initializing the first row and column correctly',
            'Using O(mn) space when O(n) suffices by only keeping the current and previous rows'
        ],
        whenNotToUse: [
            'When the problem only has one varying parameter (1D DP is sufficient)',
            'When the grid/table is too large (consider memoization with pruning)',
            'When the problem requires tracking more state than two indices can capture'
        ]
    },
    'greedy': {
        howItWorks: 'Greedy algorithms make the locally optimal choice at each step, trusting that it leads to a globally optimal solution. The key is proving the greedy choice property: that selecting the best option at each step never prevents finding the overall best solution. Common techniques include sorting by deadline/end time for scheduling, always picking the largest/smallest available element, and interval scheduling (sort by end time, pick non-overlapping). Greedy works when local decisions don\'t need to be revised.',
        commonMistakes: [
            'Assuming greedy works without proving the greedy choice property (many problems look greedy but aren\'t)',
            'Sorting by the wrong criterion (end time vs start time vs duration matters)',
            'Not considering edge cases where the greedy choice fails',
            'Confusing greedy with DP \u2014 if you need to consider multiple previous choices, it\'s DP'
        ],
        whenNotToUse: [
            'When the optimal solution requires considering combinations of choices (use DP)',
            'When local optimal choices conflict with global optimality (0/1 knapsack is NOT greedy)',
            'When the problem requires exploring all possibilities (use backtracking)'
        ]
    },
    'intervals': {
        howItWorks: 'Interval problems involve ranges [start, end] that may overlap, merge, or need scheduling. The universal first step is sorting by start time (or end time for scheduling). After sorting, you scan linearly, comparing each interval\'s start with the previous interval\'s end to detect overlaps. For merging, extend the end when overlapping. For insert, find the right position and merge affected intervals. For scheduling, sort by end time and greedily pick non-overlapping intervals.',
        commonMistakes: [
            'Forgetting to sort the intervals first (almost every interval problem requires sorting)',
            'Sorting by the wrong key (start time for merge, end time for scheduling)',
            'Not handling edge cases: adjacent intervals [1,2],[2,3] \u2014 are they overlapping?',
            'Modifying the interval list while iterating instead of building a new result'
        ],
        whenNotToUse: [
            'When intervals have complex dependencies beyond simple overlap',
            'When you need real-time interval insertion/deletion (use an interval tree)',
            'When the problem is about points, not ranges'
        ]
    },
    'bit-manipulation': {
        howItWorks: 'Bit manipulation operates directly on the binary representation of numbers using bitwise operators: AND (&), OR (|), XOR (^), NOT (~), and shifts (<<, >>). XOR is especially powerful: a ^ a = 0 and a ^ 0 = a, so XORing all elements cancels out pairs, leaving the unique element. Common tricks include n & (n-1) to clear the lowest set bit, n & (-n) to isolate the lowest set bit, and bit masks to track state in O(1) space. This enables solving certain problems without extra data structures.',
        commonMistakes: [
            'Operator precedence errors \u2014 bitwise operators have lower precedence than comparison operators in most languages',
            'Not considering signed vs unsigned integers (negative numbers have different bit patterns)',
            'Assuming 32-bit integers when the problem uses different sizes',
            'Overcomplicating solutions \u2014 bit manipulation should simplify, not obscure the logic'
        ],
        whenNotToUse: [
            'When a hash set or hash map solution is clearer and equally efficient',
            'When the numbers are too large for fixed-width bit operations',
            'When the bit manipulation trick is obscure and makes the code unreadable'
        ]
    },
    'math-and-geometry': {
        howItWorks: 'Math and Geometry problems use mathematical properties and formulas to find efficient solutions. Common techniques include modular arithmetic (for large numbers), the GCD/LCM for divisibility problems, matrix operations for grid rotations, and mathematical formulas to avoid brute-force counting. For geometry, key concepts are coordinate math, distance formulas, and understanding how rotations and reflections map coordinates. Often the trick is recognizing a mathematical pattern that eliminates the need for simulation.',
        commonMistakes: [
            'Integer overflow when multiplying large numbers (use modular arithmetic or long/BigInt)',
            'Floating-point precision errors in geometry (use integer math where possible)',
            'Not handling negative numbers or zero as edge cases',
            'Overcomplicating with code when a formula or mathematical property gives a direct answer'
        ],
        whenNotToUse: [
            'When there\'s no mathematical shortcut and simulation is the only approach',
            'When the problem is fundamentally about data structures, not math',
            'When the mathematical solution is too complex and a simpler algorithmic approach works'
        ]
    }
};

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

    // Generate rich content sections
    const content = patternContent[category.id] || {};
    const howItWorksHtml = content.howItWorks ? `<p>${escapeHtml(content.howItWorks)}</p>` : '';
    const commonMistakesHtml = (content.commonMistakes || []).map(m => `<li>${escapeHtml(m)}</li>`).join('\n');
    const whenNotToUseHtml = (content.whenNotToUse || []).map(w => `<li>${escapeHtml(w)}</li>`).join('\n');

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
        .replace(/\{\{how_it_works_html\}\}/g, howItWorksHtml)
        .replace(/\{\{common_mistakes_html\}\}/g, commonMistakesHtml)
        .replace(/\{\{when_not_to_use_html\}\}/g, whenNotToUseHtml)
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
            <a href="https://apps.apple.com/us/app/leeteye/id6756695234" class="cta-button cta-primary">Download LeetEye Free</a>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
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
            <p>&copy; 2025 LeetEye. Pattern recognition for coding interviews.</p>
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
