#!/usr/bin/env python3
"""
Generate educational algorithm pattern diagrams for LeetEye SEO pages.
Each diagram visually explains how a pattern works.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
import numpy as np
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'diagrams')
os.makedirs(OUT_DIR, exist_ok=True)

# Consistent style
COLORS = {
    'bg': '#0F172A',
    'card': '#1E293B',
    'orange': '#F97316',
    'green': '#22C55E',
    'blue': '#3B82F6',
    'purple': '#A855F7',
    'red': '#EF4444',
    'yellow': '#EAB308',
    'cyan': '#06B6D4',
    'text': '#F1F5F9',
    'muted': '#94A3B8',
    'cell': '#334155',
    'highlight': '#F9731640',
}

def setup_fig(w=10, h=5):
    fig, ax = plt.subplots(figsize=(w, h), facecolor=COLORS['bg'])
    ax.set_facecolor(COLORS['bg'])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)
    ax.axis('off')
    return fig, ax

def save(fig, name):
    path = os.path.join(OUT_DIR, f'{name}.png')
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=COLORS['bg'], pad_inches=0.3)
    plt.close(fig)
    print(f'  Created {name}.png')


# ─── 1. Arrays & Hashing ───────────────────────────────────────────

def arrays_and_hashing():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Hash Map: O(1) Lookup', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Array with values
    vals = [2, 7, 11, 15]
    for i, v in enumerate(vals):
        x = 2 + i * 1.5
        rect = FancyBboxPatch((x, 3.2), 1.1, 0.8, boxstyle="round,pad=0.1", facecolor=COLORS['cell'], edgecolor=COLORS['muted'], linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x + 0.55, 3.6, str(v), ha='center', va='center', fontsize=14, fontweight='bold', color=COLORS['text'])
        ax.text(x + 0.55, 3.05, f'i={i}', ha='center', va='center', fontsize=9, color=COLORS['muted'])

    ax.text(1.3, 3.6, 'nums', ha='center', va='center', fontsize=11, color=COLORS['muted'])

    # Hash map visualization
    ax.text(5, 2.5, 'target = 9    complement = 9 - 2 = 7', ha='center', fontsize=11, color=COLORS['orange'])

    hm = {2: 0, 7: 1}
    x_start = 3
    ax.text(5, 1.8, 'Hash Map (value \u2192 index)', ha='center', fontsize=11, color=COLORS['cyan'])
    for j, (k, v) in enumerate(hm.items()):
        x = x_start + j * 2.2
        rect = FancyBboxPatch((x, 0.6), 1.8, 0.8, boxstyle="round,pad=0.1",
                              facecolor=COLORS['highlight'] if k == 7 else COLORS['cell'],
                              edgecolor=COLORS['green'] if k == 7 else COLORS['muted'], linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x + 0.9, 1.0, f'{k} \u2192 {v}', ha='center', va='center', fontsize=13, fontweight='bold',
                color=COLORS['green'] if k == 7 else COLORS['text'])

    # Arrow from 7 in array to 7 in hash map
    ax.annotate('', xy=(5.05, 1.4), xytext=(5.05, 3.2),
                arrowprops=dict(arrowstyle='->', color=COLORS['green'], lw=2))
    ax.text(5.4, 2.2, 'Found!', fontsize=10, color=COLORS['green'], fontstyle='italic')

    save(fig, 'arrays-and-hashing')


# ─── 2. Two Pointers ───────────────────────────────────────────────

def two_pointers():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Two Pointers: Converging Inward', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    vals = [1, 3, 5, 7, 9, 11, 13]
    for i, v in enumerate(vals):
        x = 1.2 + i * 1.15
        c = COLORS['green'] if i == 0 or i == 6 else COLORS['cell']
        ec = COLORS['green'] if i == 0 or i == 6 else COLORS['muted']
        rect = FancyBboxPatch((x, 2.8), 0.9, 0.8, boxstyle="round,pad=0.1", facecolor=c if i in (0,6) else COLORS['cell'],
                              edgecolor=ec, linewidth=1.5, alpha=0.8 if i in (0,6) else 1)
        if i in (0, 6):
            rect.set_facecolor(COLORS['highlight'])
        ax.add_patch(rect)
        ax.text(x + 0.45, 3.2, str(v), ha='center', va='center', fontsize=13, fontweight='bold', color=COLORS['text'])

    # Left pointer
    ax.annotate('L', xy=(1.65, 2.8), xytext=(1.65, 2.0), fontsize=14, fontweight='bold',
                color=COLORS['orange'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=2))
    # Right pointer
    ax.annotate('R', xy=(8.1, 2.8), xytext=(8.1, 2.0), fontsize=14, fontweight='bold',
                color=COLORS['cyan'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['cyan'], lw=2))

    # Arrows showing convergence
    ax.annotate('', xy=(3.5, 1.6), xytext=(1.65, 1.6),
                arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=1.5, ls='--'))
    ax.annotate('', xy=(6.5, 1.6), xytext=(8.1, 1.6),
                arrowprops=dict(arrowstyle='->', color=COLORS['cyan'], lw=1.5, ls='--'))

    ax.text(5, 1.6, 'converge', ha='center', fontsize=11, color=COLORS['muted'], fontstyle='italic')
    ax.text(5, 0.8, 'if sum < target: L++    if sum > target: R--', ha='center', fontsize=12, color=COLORS['text'],
            fontfamily='monospace', bbox=dict(boxstyle='round,pad=0.4', facecolor=COLORS['card'], edgecolor=COLORS['muted']))

    save(fig, 'two-pointers')


# ─── 3. Sliding Window ─────────────────────────────────────────────

def sliding_window():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Sliding Window: Expand & Shrink', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    vals = ['a', 'b', 'c', 'b', 'd', 'a', 'b']
    for i, v in enumerate(vals):
        x = 1.0 + i * 1.1
        in_window = 2 <= i <= 4
        rect = FancyBboxPatch((x, 2.8), 0.85, 0.8, boxstyle="round,pad=0.1",
                              facecolor=COLORS['highlight'] if in_window else COLORS['cell'],
                              edgecolor=COLORS['orange'] if in_window else COLORS['muted'], linewidth=2 if in_window else 1)
        ax.add_patch(rect)
        ax.text(x + 0.42, 3.2, v, ha='center', va='center', fontsize=14, fontweight='bold', color=COLORS['orange'] if in_window else COLORS['text'])

    # Window bracket
    bracket = FancyBboxPatch((3.1, 2.65), 3.45, 1.1, boxstyle="round,pad=0.05",
                              facecolor='none', edgecolor=COLORS['orange'], linewidth=2.5, linestyle='--')
    ax.add_patch(bracket)
    ax.text(4.85, 4.0, 'window', ha='center', fontsize=11, fontweight='bold', color=COLORS['orange'])

    # Steps
    steps = [
        ('1. Expand right \u2192', COLORS['green']),
        ('2. If invalid, shrink left \u2192', COLORS['red']),
        ('3. Track best result', COLORS['cyan']),
    ]
    for i, (txt, c) in enumerate(steps):
        ax.text(5, 1.8 - i * 0.5, txt, ha='center', fontsize=12, color=c)

    save(fig, 'sliding-window')


# ─── 4. Binary Search ──────────────────────────────────────────────

def binary_search():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Binary Search: Halve the Search Space', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    vals = [1, 3, 5, 7, 9, 11, 13, 15, 17]
    for i, v in enumerate(vals):
        x = 0.5 + i * 1.0
        if i == 4:
            fc, ec = COLORS['highlight'], COLORS['green']
        elif i < 4:
            fc, ec = COLORS['cell'], COLORS['muted']
        else:
            fc, ec = COLORS['cell'], COLORS['muted']
        rect = FancyBboxPatch((x, 3.0), 0.8, 0.7, boxstyle="round,pad=0.08",
                              facecolor=fc, edgecolor=ec, linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x + 0.4, 3.35, str(v), ha='center', va='center', fontsize=12, fontweight='bold', color=COLORS['text'])

    # L, M, R pointers
    ax.annotate('L', xy=(0.9, 3.0), xytext=(0.9, 2.3), fontsize=12, fontweight='bold', color=COLORS['orange'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=2))
    ax.annotate('M', xy=(4.9, 3.0), xytext=(4.9, 2.3), fontsize=12, fontweight='bold', color=COLORS['green'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['green'], lw=2))
    ax.annotate('R', xy=(8.9, 3.0), xytext=(8.9, 2.3), fontsize=12, fontweight='bold', color=COLORS['cyan'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['cyan'], lw=2))

    # Elimination
    ax.text(5, 1.5, 'target = 9  |  mid = 9  \u2192  Found!', ha='center', fontsize=13, color=COLORS['green'],
            fontfamily='monospace', bbox=dict(boxstyle='round,pad=0.4', facecolor=COLORS['card'], edgecolor=COLORS['green'], alpha=0.5))
    ax.text(5, 0.7, 'Each step eliminates half \u2192 O(log n)', ha='center', fontsize=12, color=COLORS['muted'])

    save(fig, 'binary-search')


# ─── 5. Stack ──────────────────────────────────────────────────────

def stack():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Stack: Last In, First Out (LIFO)', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    items = ['(', '{', '[']
    for i, v in enumerate(items):
        y = 1.0 + i * 0.9
        rect = FancyBboxPatch((3.8, y), 2.4, 0.7, boxstyle="round,pad=0.08",
                              facecolor=COLORS['cell'] if i < 2 else COLORS['highlight'],
                              edgecolor=COLORS['orange'] if i == 2 else COLORS['muted'], linewidth=1.5)
        ax.add_patch(rect)
        ax.text(5, y + 0.35, v, ha='center', va='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Top label
    ax.annotate('TOP', xy=(6.5, 3.35), xytext=(7.5, 3.35), fontsize=12, fontweight='bold', color=COLORS['orange'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=2))

    # Push/Pop arrows
    ax.annotate('push', xy=(3.5, 3.8), xytext=(2, 4.2), fontsize=11, color=COLORS['green'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['green'], lw=1.5))
    ax.annotate('pop', xy=(6.5, 3.8), xytext=(8, 4.2), fontsize=11, color=COLORS['red'], ha='center',
                arrowprops=dict(arrowstyle='->', color=COLORS['red'], lw=1.5))

    ax.text(5, 0.4, 'Valid parentheses: push open, pop on matching close', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, 'stack')


# ─── 6. Linked List ────────────────────────────────────────────────

def linked_list():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Linked List: Pointer Manipulation', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    nodes = [1, 2, 3, 4, 5]
    for i, v in enumerate(nodes):
        x = 0.8 + i * 1.8
        circle = plt.Circle((x + 0.4, 3.0), 0.4, facecolor=COLORS['cell'], edgecolor=COLORS['cyan'], linewidth=2)
        ax.add_patch(circle)
        ax.text(x + 0.4, 3.0, str(v), ha='center', va='center', fontsize=14, fontweight='bold', color=COLORS['text'])
        if i < len(nodes) - 1:
            ax.annotate('', xy=(x + 1.4, 3.0), xytext=(x + 0.85, 3.0),
                        arrowprops=dict(arrowstyle='->', color=COLORS['muted'], lw=1.5))

    # Reverse arrows below
    ax.text(5, 2.0, 'Reverse: redirect pointers \u2190', ha='center', fontsize=12, color=COLORS['orange'])
    for i in range(1, len(nodes)):
        x = 0.8 + i * 1.8
        ax.annotate('', xy=(x - 1.0, 1.3), xytext=(x + 0.4, 1.3),
                    arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=1.5, ls='--'))

    ax.text(5, 0.6, 'prev, curr, next = None, head, head.next', ha='center', fontsize=11, color=COLORS['text'],
            fontfamily='monospace', bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['muted']))

    save(fig, 'linked-list')


# ─── 7. Trees ──────────────────────────────────────────────────────

def trees():
    fig, ax = setup_fig(10, 6)
    ax.set_ylim(0, 6)
    ax.text(5, 5.6, 'Binary Tree Traversal', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Tree structure
    positions = {1: (5, 4.5), 2: (3, 3.3), 3: (7, 3.3), 4: (2, 2.1), 5: (4, 2.1), 6: (6, 2.1), 7: (8, 2.1)}
    edges = [(1,2), (1,3), (2,4), (2,5), (3,6), (3,7)]

    for (p, c) in edges:
        px, py = positions[p]
        cx, cy = positions[c]
        ax.plot([px, cx], [py, cy], color=COLORS['muted'], lw=1.5, zorder=1)

    for node, (x, y) in positions.items():
        circle = plt.Circle((x, y), 0.35, facecolor=COLORS['cell'], edgecolor=COLORS['cyan'], linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y, str(node), ha='center', va='center', fontsize=13, fontweight='bold', color=COLORS['text'], zorder=3)

    # Traversal orders
    orders = [
        ('Inorder (L-N-R):', '4, 2, 5, 1, 6, 3, 7', COLORS['green']),
        ('Preorder (N-L-R):', '1, 2, 4, 5, 3, 6, 7', COLORS['orange']),
        ('Level-order (BFS):', '1, 2, 3, 4, 5, 6, 7', COLORS['cyan']),
    ]
    for i, (label, order, c) in enumerate(orders):
        y = 0.9 - i * 0.35
        ax.text(2.5, y, label, ha='right', fontsize=10, fontweight='bold', color=c)
        ax.text(2.7, y, order, ha='left', fontsize=10, color=COLORS['text'], fontfamily='monospace')

    save(fig, 'trees')


# ─── 8. Tries ──────────────────────────────────────────────────────

def tries():
    fig, ax = setup_fig(10, 6)
    ax.set_ylim(0, 6)
    ax.text(5, 5.6, 'Trie: Prefix Tree', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    nodes = {
        'root': (5, 4.8, ''),
        'a': (3, 3.6, 'a'), 'b': (7, 3.6, 'b'),
        'p': (2, 2.4, 'p'), 'n': (4, 2.4, 'n'),
        'p2': (1.5, 1.2, 'p'), 'e': (3, 1.2, 'd'),
        'l': (1.5, 0.2, 'le*'),
    }
    edges = [('root','a'), ('root','b'), ('a','p'), ('a','n'), ('p','p2'), ('n','e'), ('p2','l')]

    for (p, c) in edges:
        px, py, _ = nodes[p]
        cx, cy, _ = nodes[c]
        ax.plot([px, cx], [py, cy], color=COLORS['muted'], lw=1.5, zorder=1)

    for key, (x, y, label) in nodes.items():
        is_end = '*' in label
        circle = plt.Circle((x, y), 0.3, facecolor=COLORS['highlight'] if is_end else COLORS['cell'],
                            edgecolor=COLORS['green'] if is_end else COLORS['cyan'], linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y, label.replace('*',''), ha='center', va='center', fontsize=12, fontweight='bold', color=COLORS['text'], zorder=3)

    ax.text(7, 2.0, 'Words: "apple", "and", "bat"', fontsize=11, color=COLORS['text'],
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['muted']))
    ax.text(7, 1.2, 'Lookup: O(word length)', fontsize=11, color=COLORS['green'])
    ax.text(7, 0.6, 'Prefix search: O(prefix length)', fontsize=11, color=COLORS['cyan'])

    save(fig, 'tries')


# ─── 9. Backtracking ───────────────────────────────────────────────

def backtracking():
    fig, ax = setup_fig(10, 6)
    ax.set_ylim(0, 6)
    ax.text(5, 5.6, 'Backtracking: Explore & Prune', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Decision tree
    nodes = {
        'start': (5, 4.6, '[ ]'),
        'a': (2.5, 3.3, '[1]'), 'b': (5, 3.3, '[2]'), 'c': (7.5, 3.3, '[3]'),
        'ab': (1.5, 2.0, '[1,2]'), 'ac': (3.5, 2.0, '[1,3]'),
        'bc': (5.5, 2.0, '[2,3]'),
        'abc': (2.5, 0.8, '[1,2,3]'),
    }
    edges = [('start','a'), ('start','b'), ('start','c'), ('a','ab'), ('a','ac'), ('b','bc'), ('ab','abc')]

    for (p, c) in edges:
        px, py, _ = nodes[p]
        cx, cy, _ = nodes[c]
        ax.plot([px, cx], [py, cy], color=COLORS['muted'], lw=1.5, zorder=1)

    for key, (x, y, label) in nodes.items():
        is_leaf = key == 'abc'
        rect = FancyBboxPatch((x - 0.5, y - 0.25), 1.0, 0.5, boxstyle="round,pad=0.08",
                              facecolor=COLORS['highlight'] if is_leaf else COLORS['cell'],
                              edgecolor=COLORS['green'] if is_leaf else COLORS['muted'], linewidth=1.5, zorder=2)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, fontweight='bold', color=COLORS['text'], zorder=3)

    # Pruned branch
    ax.plot([7.5, 8.5], [3.3, 2.3], color=COLORS['red'], lw=1.5, ls='--', zorder=1)
    ax.text(8.8, 2.1, 'pruned', fontsize=10, color=COLORS['red'], fontstyle='italic')

    save(fig, 'backtracking')


# ─── 10. Heap ──────────────────────────────────────────────────────

def heap():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Min-Heap: Parent \u2264 Children', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    positions = {1: (5, 3.8), 3: (3.3, 2.7), 5: (6.7, 2.7), 7: (2.3, 1.6), 4: (4.3, 1.6), 8: (5.7, 1.6), 6: (7.7, 1.6)}
    edges_list = [(1,3), (1,5), (3,7), (3,4), (5,8), (5,6)]

    for (p, c) in edges_list:
        px, py = positions[p]
        cx, cy = positions[c]
        ax.plot([px, cx], [py, cy], color=COLORS['muted'], lw=1.5, zorder=1)

    for val, (x, y) in positions.items():
        is_root = val == 1
        circle = plt.Circle((x, y), 0.35, facecolor=COLORS['highlight'] if is_root else COLORS['cell'],
                            edgecolor=COLORS['orange'] if is_root else COLORS['cyan'], linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y, str(val), ha='center', va='center', fontsize=14, fontweight='bold', color=COLORS['text'], zorder=3)

    ax.text(5, 0.6, 'peek: O(1)    push/pop: O(log n)    Top-K problems', ha='center', fontsize=12, color=COLORS['muted'],
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['muted']))

    save(fig, 'heap')


# ─── 11. Graphs ────────────────────────────────────────────────────

def graphs():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Graph: BFS & DFS Traversal', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    nodes_pos = {'A': (2, 3.3), 'B': (4, 3.8), 'C': (6, 3.3), 'D': (3, 1.8), 'E': (5, 1.5), 'F': (7.5, 1.8)}
    edges_list = [('A','B'), ('B','C'), ('A','D'), ('D','E'), ('C','E'), ('C','F')]

    for (u, v) in edges_list:
        ux, uy = nodes_pos[u]
        vx, vy = nodes_pos[v]
        ax.plot([ux, vx], [uy, vy], color=COLORS['muted'], lw=1.5, zorder=1)

    bfs_order = {'A': 1, 'B': 2, 'D': 3, 'C': 4, 'E': 5, 'F': 6}
    for name, (x, y) in nodes_pos.items():
        circle = plt.Circle((x, y), 0.35, facecolor=COLORS['cell'], edgecolor=COLORS['cyan'], linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y, name, ha='center', va='center', fontsize=14, fontweight='bold', color=COLORS['text'], zorder=3)
        ax.text(x + 0.4, y + 0.35, str(bfs_order[name]), fontsize=9, color=COLORS['orange'], fontweight='bold')

    ax.text(5, 0.5, 'BFS: queue (level-by-level)    DFS: stack/recursion (deep first)', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, 'graphs')


# ─── 12. Advanced Graphs ───────────────────────────────────────────

def advanced_graphs():
    fig, ax = setup_fig()
    ax.text(5, 4.6, "Dijkstra's: Shortest Path", ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    nodes_pos = {'S': (1.5, 3), 'A': (3.5, 4), 'B': (3.5, 2), 'C': (6, 3), 'D': (8.5, 3)}
    weights = {('S','A'): 4, ('S','B'): 2, ('A','C'): 3, ('B','C'): 1, ('B','A'): 1, ('C','D'): 5}

    for (u, v), w in weights.items():
        ux, uy = nodes_pos[u]
        vx, vy = nodes_pos[v]
        on_path = (u, v) in [('S','B'), ('B','C'), ('C','D')]
        ax.annotate('', xy=(vx, vy), xytext=(ux, uy),
                    arrowprops=dict(arrowstyle='->', color=COLORS['green'] if on_path else COLORS['muted'],
                                    lw=2.5 if on_path else 1.5))
        mx, my = (ux + vx) / 2, (uy + vy) / 2 + 0.2
        ax.text(mx, my, str(w), fontsize=10, fontweight='bold', color=COLORS['orange'], ha='center',
                bbox=dict(boxstyle='round,pad=0.15', facecolor=COLORS['bg'], edgecolor='none'))

    dists = {'S': 0, 'A': 3, 'B': 2, 'C': 3, 'D': 8}
    for name, (x, y) in nodes_pos.items():
        circle = plt.Circle((x, y), 0.35, facecolor=COLORS['cell'], edgecolor=COLORS['green'], linewidth=2, zorder=2)
        ax.add_patch(circle)
        ax.text(x, y + 0.05, name, ha='center', va='center', fontsize=13, fontweight='bold', color=COLORS['text'], zorder=3)
        ax.text(x, y - 0.55, f'd={dists[name]}', fontsize=9, color=COLORS['green'], ha='center')

    ax.text(5, 0.5, 'Shortest: S \u2192 B \u2192 C \u2192 D = 8    (greedy + min-heap)', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, 'advanced-graphs')


# ─── 13. Dynamic Programming (1D) ──────────────────────────────────

def dp_1d():
    fig, ax = setup_fig()
    ax.text(5, 4.6, '1D DP: Build from Subproblems', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Fibonacci-style DP table
    vals = [0, 1, 1, 2, 3, 5, 8, 13]
    for i, v in enumerate(vals):
        x = 0.8 + i * 1.1
        highlight = i >= 6
        rect = FancyBboxPatch((x, 3.0), 0.85, 0.7, boxstyle="round,pad=0.08",
                              facecolor=COLORS['highlight'] if highlight else COLORS['cell'],
                              edgecolor=COLORS['orange'] if highlight else COLORS['muted'], linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x + 0.42, 3.35, str(v), ha='center', va='center', fontsize=13, fontweight='bold', color=COLORS['text'])
        ax.text(x + 0.42, 2.7, f'dp[{i}]', ha='center', fontsize=8, color=COLORS['muted'])

    # Arrow showing dp[i] = dp[i-1] + dp[i-2]
    ax.annotate('', xy=(7.6, 3.0), xytext=(6.5, 2.2), arrowprops=dict(arrowstyle='->', color=COLORS['green'], lw=1.5))
    ax.annotate('', xy=(7.6, 3.0), xytext=(7.6, 2.2), arrowprops=dict(arrowstyle='->', color=COLORS['green'], lw=1.5))
    ax.text(7.0, 1.8, 'dp[i] = dp[i-1] + dp[i-2]', fontsize=11, color=COLORS['green'], ha='center', fontfamily='monospace')

    ax.text(5, 0.8, 'Key: define recurrence \u2192 base case \u2192 fill table \u2192 return dp[n]', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, '1d-dp')


# ─── 14. Dynamic Programming (2D) ──────────────────────────────────

def dp_2d():
    fig, ax = setup_fig(10, 6)
    ax.set_ylim(0, 6)
    ax.text(5, 5.6, '2D DP: Grid Subproblems', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # 2D grid
    rows, cols = 4, 5
    for r in range(rows):
        for c in range(cols):
            x = 2.5 + c * 1.0
            y = 4.0 - r * 1.0
            on_path = (r, c) in [(0,0), (0,1), (0,2), (1,2), (2,2), (2,3), (2,4), (3,4)]
            rect = FancyBboxPatch((x, y), 0.8, 0.8, boxstyle="round,pad=0.05",
                                  facecolor=COLORS['highlight'] if on_path else COLORS['cell'],
                                  edgecolor=COLORS['green'] if on_path else COLORS['muted'], linewidth=1.5 if on_path else 1)
            ax.add_patch(rect)

    ax.text(2.9, 4.4, 'S', ha='center', va='center', fontsize=12, fontweight='bold', color=COLORS['green'])
    ax.text(6.9, 1.4, 'E', ha='center', va='center', fontsize=12, fontweight='bold', color=COLORS['orange'])

    ax.text(5, 0.4, 'dp[i][j] = dp[i-1][j] + dp[i][j-1]    (Unique Paths)', ha='center', fontsize=11, color=COLORS['text'],
            fontfamily='monospace', bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['muted']))

    save(fig, '2d-dp')


# ─── 15. Greedy ────────────────────────────────────────────────────

def greedy():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Greedy: Local Optimal \u2192 Global Optimal', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Activity selection visualization
    activities = [(1, 4, 'A'), (3, 5, 'B'), (0, 6, 'C'), (5, 7, 'D'), (6, 10, 'E'), (8, 11, 'F')]
    selected = [0, 3, 5]  # A, D, F

    for i, (s, e, name) in enumerate(activities):
        y = 3.6 - i * 0.5
        is_selected = i in selected
        color = COLORS['green'] if is_selected else COLORS['cell']
        ec = COLORS['green'] if is_selected else COLORS['muted']
        rect = FancyBboxPatch((1 + s * 0.7, y), (e - s) * 0.7, 0.35, boxstyle="round,pad=0.05",
                              facecolor=color if is_selected else COLORS['cell'],
                              edgecolor=ec, linewidth=1.5, alpha=0.3 if not is_selected else 0.8)
        ax.add_patch(rect)
        ax.text(1 + (s + e) / 2 * 0.7, y + 0.17, name, ha='center', va='center', fontsize=10,
                fontweight='bold', color=COLORS['text'] if is_selected else COLORS['muted'])

    ax.text(9, 2.5, 'Selected:\nA, D, F', fontsize=11, color=COLORS['green'], ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['green']))

    ax.text(5, 0.4, 'Sort by end time \u2192 always pick earliest finish', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, 'greedy')


# ─── 16. Intervals ─────────────────────────────────────────────────

def intervals():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Intervals: Merge Overlapping', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    ivs = [(1, 3), (2, 6), (5, 7), (8, 10), (9, 12)]
    colors_list = [COLORS['orange'], COLORS['orange'], COLORS['orange'], COLORS['cyan'], COLORS['cyan']]
    merged = [(1, 7), (8, 12)]

    for i, ((s, e), c) in enumerate(zip(ivs, colors_list)):
        y = 3.5 - i * 0.45
        rect = FancyBboxPatch((0.5 + s * 0.7, y), (e - s) * 0.7, 0.3, boxstyle="round,pad=0.05",
                              facecolor=c, edgecolor=c, linewidth=1, alpha=0.4)
        ax.add_patch(rect)
        ax.text(0.5 + (s + e) / 2 * 0.7, y + 0.15, f'[{s},{e}]', ha='center', fontsize=9, color=COLORS['text'])

    ax.text(5, 1.5, '\u2193 After merge', ha='center', fontsize=11, color=COLORS['green'])

    for i, (s, e) in enumerate(merged):
        y = 0.7
        x = 2 + i * 4
        rect = FancyBboxPatch((x, y), (e - s) * 0.5, 0.4, boxstyle="round,pad=0.08",
                              facecolor=COLORS['green'], edgecolor=COLORS['green'], linewidth=1.5, alpha=0.6)
        ax.add_patch(rect)
        ax.text(x + (e - s) * 0.25, y + 0.2, f'[{s},{e}]', ha='center', fontsize=11, fontweight='bold', color=COLORS['text'])

    save(fig, 'intervals')


# ─── 17. Bit Manipulation ──────────────────────────────────────────

def bit_manipulation():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Bit Manipulation: XOR Tricks', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # XOR property: a ^ a = 0
    bits_a = '0 1 1 0 1'
    bits_b = '0 1 1 0 1'
    bits_r = '0 0 0 0 0'

    ax.text(3, 3.5, 'a     =', fontsize=13, color=COLORS['text'], fontfamily='monospace', ha='right')
    ax.text(3.2, 3.5, bits_a, fontsize=13, color=COLORS['cyan'], fontfamily='monospace')
    ax.text(3, 2.9, 'a     =', fontsize=13, color=COLORS['text'], fontfamily='monospace', ha='right')
    ax.text(3.2, 2.9, bits_b, fontsize=13, color=COLORS['cyan'], fontfamily='monospace')
    ax.text(2, 3.2, 'XOR', fontsize=11, fontweight='bold', color=COLORS['orange'])
    ax.plot([3.2, 6.5], [2.7, 2.7], color=COLORS['muted'], lw=1)
    ax.text(3, 2.3, 'a ^ a =', fontsize=13, color=COLORS['text'], fontfamily='monospace', ha='right')
    ax.text(3.2, 2.3, bits_r, fontsize=13, color=COLORS['green'], fontfamily='monospace', fontweight='bold')

    ax.text(5, 1.4, 'Single Number: XOR all elements', ha='center', fontsize=12, color=COLORS['orange'])
    ax.text(5, 0.8, '[4, 1, 2, 1, 2]  \u2192  4^1^2^1^2 = 4', ha='center', fontsize=12, color=COLORS['text'],
            fontfamily='monospace', bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['card'], edgecolor=COLORS['muted']))

    save(fig, 'bit-manipulation')


# ─── 18. Math & Geometry ───────────────────────────────────────────

def math_and_geometry():
    fig, ax = setup_fig()
    ax.text(5, 4.6, 'Matrix: Rotate 90\u00b0 Clockwise', ha='center', fontsize=16, fontweight='bold', color=COLORS['text'])

    # Before
    grid = [[1,2,3],[4,5,6],[7,8,9]]
    ax.text(2.2, 3.8, 'Before', ha='center', fontsize=11, color=COLORS['muted'])
    for r in range(3):
        for c in range(3):
            x = 1.2 + c * 0.7
            y = 3.2 - r * 0.7
            rect = FancyBboxPatch((x, y), 0.6, 0.6, boxstyle="round,pad=0.03", facecolor=COLORS['cell'], edgecolor=COLORS['muted'], linewidth=1)
            ax.add_patch(rect)
            ax.text(x + 0.3, y + 0.3, str(grid[r][c]), ha='center', va='center', fontsize=11, color=COLORS['text'])

    ax.annotate('', xy=(5, 2.5), xytext=(3.8, 2.5), arrowprops=dict(arrowstyle='->', color=COLORS['orange'], lw=2))
    ax.text(4.4, 2.8, 'transpose\n+ reverse', ha='center', fontsize=9, color=COLORS['orange'])

    # After
    rotated = [[7,4,1],[8,5,2],[9,6,3]]
    ax.text(7, 3.8, 'After', ha='center', fontsize=11, color=COLORS['muted'])
    for r in range(3):
        for c in range(3):
            x = 6 + c * 0.7
            y = 3.2 - r * 0.7
            rect = FancyBboxPatch((x, y), 0.6, 0.6, boxstyle="round,pad=0.03",
                                  facecolor=COLORS['highlight'] if r == 0 else COLORS['cell'],
                                  edgecolor=COLORS['green'] if r == 0 else COLORS['muted'], linewidth=1)
            ax.add_patch(rect)
            ax.text(x + 0.3, y + 0.3, str(rotated[r][c]), ha='center', va='center', fontsize=11, color=COLORS['text'])

    ax.text(5, 0.6, 'Step 1: transpose (swap rows/cols)  Step 2: reverse each row', ha='center', fontsize=11, color=COLORS['muted'])

    save(fig, 'math-and-geometry')


# ─── Run All ────────────────────────────────────────────────────────

if __name__ == '__main__':
    print('Generating pattern diagrams...')
    generators = [
        arrays_and_hashing, two_pointers, sliding_window, binary_search,
        stack, linked_list, trees, tries, backtracking, heap,
        graphs, advanced_graphs, dp_1d, dp_2d, greedy, intervals,
        bit_manipulation, math_and_geometry,
    ]
    for gen in generators:
        gen()
    print(f'\nDone! {len(generators)} diagrams saved to assets/diagrams/')
