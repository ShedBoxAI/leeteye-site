#!/usr/bin/env node

/**
 * LeetEye pSEO Data Extraction Script
 *
 * Reads problem data from the iOS app's firebase-config directory
 * and outputs consolidated JSON for page generation.
 */

const fs = require('fs');
const path = require('path');

// Paths
const FIREBASE_CONFIG_PATH = path.join(__dirname, '../../intuition_builder/firebase-config');
const OUTPUT_PATH = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

/**
 * Load and parse JSON file
 */
function loadJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Extract categories data
 */
function extractCategories() {
    const categoriesPath = path.join(FIREBASE_CONFIG_PATH, 'categories.json');
    const categories = loadJSON(categoriesPath);

    if (!categories) return [];

    return categories.map(cat => ({
        id: cat.id,
        displayName: cat.displayName,
        slug: cat.id,
        colorHex: cat.colorHex,
        order: cat.order,
        prerequisites: cat.prerequisites || [],
        description: getCategoryDescription(cat.id)
    }));
}

/**
 * Get category description (can be expanded)
 */
function getCategoryDescription(categoryId) {
    const descriptions = {
        'arrays-and-hashing': 'Master the fundamentals of arrays and hash-based data structures for O(1) lookups.',
        'two-pointers': 'Learn to solve problems efficiently using the two-pointer technique.',
        'stack': 'Understand LIFO data structure and its applications in parsing and backtracking.',
        'sliding-window': 'Optimize subarray and substring problems with the sliding window pattern.',
        'binary-search': 'Divide and conquer with logarithmic time complexity.',
        'linked-list': 'Navigate node-based data structures with pointer manipulation.',
        'trees': 'Traverse and manipulate hierarchical data structures.',
        'tries': 'Efficiently store and search strings with prefix trees.',
        'backtracking': 'Explore all possibilities with systematic trial and error.',
        'heap': 'Maintain priority with heap-based data structures.',
        'graphs': 'Model relationships and connections between entities.',
        'advanced-graphs': 'Master complex graph algorithms like shortest paths and minimum spanning trees.',
        '1d-dp': 'Solve optimization problems with one-dimensional dynamic programming.',
        '2d-dp': 'Tackle grid and matrix problems with two-dimensional DP.',
        'greedy': 'Make locally optimal choices for globally optimal solutions.',
        'intervals': 'Handle overlapping ranges and scheduling problems.',
        'bit-manipulation': 'Leverage binary operations for space and time efficiency.',
        'math-and-geometry': 'Apply mathematical concepts to algorithmic problems.'
    };
    return descriptions[categoryId] || '';
}

/**
 * Extract all problems from a category
 */
function extractProblemsFromCategory(categoryId) {
    const problemsDir = path.join(FIREBASE_CONFIG_PATH, 'problems');
    const fileName = `problems_${categoryId.replace(/-/g, '_')}.json`;
    const filePath = path.join(problemsDir, fileName);

    const problems = loadJSON(filePath);
    if (!problems) return [];

    return problems.map(problem => ({
        id: problem.id,
        slug: problem.id.replace(/^\d+-/, ''), // Remove leading number prefix
        title: problem.metadata?.title || problem.id,
        category: problem.metadata?.category || categoryId,
        difficulty: problem.metadata?.difficulty || 'medium',
        tags: problem.metadata?.tags || [],
        estimatedTime: problem.metadata?.estimated_time_minutes || 5,
        problemStatement: problem.metadata?.problem_statement || '',
        examples: problem.metadata?.examples || [],
        relatedProblems: problem.metadata?.related_problems || [],

        // Steps (MCQ questions)
        steps: (problem.steps || []).map(step => ({
            type: step.type,
            question: step.question,
            options: step.options || [],
            correct: step.correct,
            explanation: step.explanation,
            conceptId: step.concept_id
        })),

        // Summary
        oneLiner: problem.summary?.one_liner || '',
        pattern: problem.summary?.pattern || '',
        keyInsight: problem.summary?.key_insight || '',
        timeComplexity: problem.summary?.complexity?.time || '',
        spaceComplexity: problem.summary?.complexity?.space || '',
        triggerWords: problem.summary?.trigger_words || [],
        relatedPatterns: problem.summary?.related_patterns || [],
        pythonSolution: problem.summary?.python_solution || ''
    }));
}

/**
 * Get top problems per category (for initial launch)
 */
function getTopProblems(problems, limit = 28) {
    // Prioritize by: has summary, has solution, easy first
    const sorted = [...problems].sort((a, b) => {
        // Has key insight
        if (a.keyInsight && !b.keyInsight) return -1;
        if (!a.keyInsight && b.keyInsight) return 1;

        // Has solution
        if (a.pythonSolution && !b.pythonSolution) return -1;
        if (!a.pythonSolution && b.pythonSolution) return 1;

        // Difficulty order: easy, medium, hard
        const diffOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
        return (diffOrder[a.difficulty] || 1) - (diffOrder[b.difficulty] || 1);
    });

    return sorted.slice(0, limit);
}

/**
 * Generate comparison pairs
 */
function generateComparisonPairs() {
    return [
        { pattern1: 'sliding-window', pattern2: 'two-pointers', title: 'Sliding Window vs Two Pointers' },
        { pattern1: 'bfs', pattern2: 'dfs', title: 'BFS vs DFS' },
        { pattern1: 'dynamic-programming', pattern2: 'greedy', title: 'Dynamic Programming vs Greedy' },
        { pattern1: 'hash-map', pattern2: 'hash-set', title: 'Hash Map vs Hash Set' },
        { pattern1: 'memoization', pattern2: 'tabulation', title: 'Memoization vs Tabulation' },
        { pattern1: 'recursion', pattern2: 'iteration', title: 'Recursion vs Iteration' },
        { pattern1: 'dijkstra', pattern2: 'bfs', title: "Dijkstra's vs BFS" },
        { pattern1: 'stack', pattern2: 'queue', title: 'Stack vs Queue' },
        { pattern1: 'binary-search', pattern2: 'linear-search', title: 'Binary Search vs Linear Search' },
        { pattern1: 'inorder', pattern2: 'preorder', title: 'Inorder vs Preorder Traversal' },
        { pattern1: '1d-dp', pattern2: '2d-dp', title: '1D DP vs 2D DP' },
        { pattern1: 'top-down', pattern2: 'bottom-up', title: 'Top-Down vs Bottom-Up DP' },
        { pattern1: 'heap', pattern2: 'sorted-array', title: 'Heap vs Sorted Array' },
        { pattern1: 'trie', pattern2: 'hash-map', title: 'Trie vs Hash Map for Strings' },
        { pattern1: 'union-find', pattern2: 'dfs', title: 'Union-Find vs DFS for Connectivity' },
        { pattern1: 'backtracking', pattern2: 'dynamic-programming', title: 'Backtracking vs Dynamic Programming' },
        { pattern1: 'kadane', pattern2: 'brute-force', title: "Kadane's Algorithm vs Brute Force" },
        { pattern1: 'floyd-cycle', pattern2: 'hash-set', title: 'Floyd Cycle Detection vs Hash Set' },
        { pattern1: 'monotonic-stack', pattern2: 'brute-force', title: 'Monotonic Stack vs Brute Force' },
        { pattern1: 'prefix-sum', pattern2: 'brute-force', title: 'Prefix Sum vs Brute Force' },
        { pattern1: 'merge-sort', pattern2: 'quick-sort', title: 'Merge Sort vs Quick Sort' },
        { pattern1: 'array', pattern2: 'linked-list', title: 'Array vs Linked List' },
        { pattern1: 'adjacency-list', pattern2: 'adjacency-matrix', title: 'Adjacency List vs Matrix' },
        { pattern1: 'bst', pattern2: 'hash-map', title: 'BST vs Hash Map' },
        { pattern1: 'topological-sort', pattern2: 'dfs', title: 'Topological Sort vs DFS' },
        { pattern1: 'prims', pattern2: 'kruskals', title: "Prim's vs Kruskal's Algorithm" },
        { pattern1: 'bellman-ford', pattern2: 'dijkstra', title: "Bellman-Ford vs Dijkstra's" },
        { pattern1: 'counting-sort', pattern2: 'comparison-sort', title: 'Counting Sort vs Comparison Sort' },
        { pattern1: 'sliding-window-fixed', pattern2: 'sliding-window-variable', title: 'Fixed vs Variable Sliding Window' },
        { pattern1: 'fast-slow-pointers', pattern2: 'two-pointers', title: 'Fast-Slow Pointers vs Two Pointers' }
    ];
}

/**
 * Main extraction function
 */
function main() {
    console.log('🔍 Extracting data from firebase-config...\n');

    // 1. Extract categories
    const categories = extractCategories();
    console.log(`✅ Extracted ${categories.length} categories`);

    // 2. Extract all problems
    const allProblems = {};
    const topProblems = {};
    let totalProblems = 0;
    let selectedProblems = 0;

    for (const category of categories) {
        const problems = extractProblemsFromCategory(category.id);
        allProblems[category.id] = problems;
        topProblems[category.id] = getTopProblems(problems, 28);
        totalProblems += problems.length;
        selectedProblems += topProblems[category.id].length;
        console.log(`  📁 ${category.displayName}: ${problems.length} problems (selected ${topProblems[category.id].length})`);
    }

    console.log(`\n✅ Total: ${totalProblems} problems, selected ${selectedProblems} for initial launch`);

    // 3. Generate comparison pairs
    const comparisons = generateComparisonPairs();
    console.log(`✅ Generated ${comparisons.length} comparison pairs`);

    // 4. Aggregate trigger words per category
    const triggerWordsByCategory = {};
    for (const [categoryId, problems] of Object.entries(allProblems)) {
        const words = new Set();
        problems.forEach(p => {
            (p.triggerWords || []).forEach(w => words.add(w));
        });
        triggerWordsByCategory[categoryId] = Array.from(words);
    }

    // 5. Count problems by difficulty per category
    const difficultyStats = {};
    for (const [categoryId, problems] of Object.entries(allProblems)) {
        difficultyStats[categoryId] = {
            easy: problems.filter(p => p.difficulty === 'easy').length,
            medium: problems.filter(p => p.difficulty === 'medium').length,
            hard: problems.filter(p => p.difficulty === 'hard').length
        };
    }

    // 6. Save output files
    const outputData = {
        categories,
        problems: topProblems, // Selected problems for initial launch
        allProblems, // All problems (for future expansion)
        comparisons,
        triggerWords: triggerWordsByCategory,
        difficultyStats,
        meta: {
            generatedAt: new Date().toISOString(),
            totalProblems,
            selectedProblems,
            categoryCount: categories.length,
            comparisonCount: comparisons.length
        }
    };

    // Write consolidated data
    const outputFile = path.join(OUTPUT_PATH, 'pseo-data.json');
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`\n📦 Saved to ${outputFile}`);

    // Write summary
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Total Problems: ${totalProblems}`);
    console.log(`   Selected Problems: ${selectedProblems}`);
    console.log(`   Comparisons: ${comparisons.length}`);
    console.log(`   Estimated Pages: ${categories.length + selectedProblems + comparisons.length + (categories.length * 3) + categories.length}`);
    console.log('     - Pattern Hubs: 18');
    console.log(`     - Problem Pages: ${selectedProblems}`);
    console.log('     - Difficulty Pages: 54 (18 × 3)');
    console.log(`     - Comparison Pages: ${comparisons.length}`);
    console.log('     - Cheat Sheets: 18');
}

// Run
main();
