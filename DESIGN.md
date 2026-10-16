# 🎨 Design System & Specification: IP26 Production Portal
**Project:** IP26 Live Broadcast & Multimedia Web Portal  
**Document ID:** `DESIGN-IP26-UNNES-2026`  
**Design Lead:** System & Frontend Design Engineer  
**Status:** Production / Fully Synchronized  

---

## 1. Visual Theme, Atmosphere & Aesthetic Philosophy

### Aesthetic Direction: *Utilitarian Broadcast Command*
The visual language is inspired by high-end professional broadcast control rooms, master control facilities (MCR), and mission-critical telemetry interfaces. It rejects generic SaaS aesthetics, flat templates, and decorative fluff in favor of **hyper-clarity, high density, and tactile feedback**.

- **Atmosphere:** Rigorous, disciplined, technical, and immediately actionable under high-pressure live production conditions.
- **DFII (Design Feasibility & Impact Index) Score:**
  - Aesthetic Impact: 5/5
  - Context Fit: 5/5
  - Implementation Feasibility: 5/5
  - Performance Safety: 5/5
  - Consistency Risk: -0/5
  - **Total DFII = 20/20 (Executes at Highest Enterprise Quality)**

---

## 2. Color Palette & Roles (Dual Theme Specification)

### A. Dark Mode Palette — *Pure Neutral Grey* (Default)
| Color Role | Token Name | Hex Code | Visual Character & Functional Usage |
| :--- | :--- | :---: | :--- |
| **Canvas Background** | `--bg-primary` | `#121212` | Pure neutral dark grey canvas; zero blue tint, glare-free, and eye-friendly. |
| **Surface Background** | `--bg-surface` | `#1f1f1f` | Balanced dark grey elevation for cards, spec bins, and inventory tables. |
| **Surface Elevated** | `--bg-surface-elevated` | `#262626` | Elevated neutral grey for sticky headers, dialogs, and controls. |
| **Surface Hover** | `--bg-surface-hover` | `#303030` | Interactive hover tone with tactile contrast. |
| **Border / Stroke** | `--border-subtle` | `#333333` | Technical hairline divider contours. |
| **Border Strong** | `--border-strong` | `#484848` | Focused card borders, modal strokes, and active elements. |
| **Text Primary** | `--text-primary` | `#f5f5f5` | Crisp pure white for headers and primary telemetry. |
| **Text Secondary** | `--text-secondary` | `#cccccc` | Clean neutral light grey for descriptions and documentation. |
| **Text Muted** | `--text-muted` | `#8e8e8e` | Auxiliary metadata, timestamps, and subtitles. |
| **Accent Primary** | `--accent-cyan` | `#00d2ff` | High-visibility technical cyan for active states, live indicators & signal paths. |
| **Accent Secondary** | `--accent-amber` | `#f59e0b` | Warning indicators for missing laptops & standby gear. |
| **Accent Success** | `--accent-emerald` | `#10b981` | Status badges for verified & deployed devices (`✅ Ready`). |

### B. Light Mode Palette — *Pure Warm White & Editorial Linen*
| Color Role | Token Name | Hex Code | Visual Character & Functional Usage |
| :--- | :--- | :---: | :--- |
| **Canvas Background** | `--bg-primary` | `#fdfbf7` | Pure warm white linen canvas; soft, elegant, and daylight-ready. |
| **Surface Background** | `--bg-surface` | `#ffffff` | Pure white crisp surface cards. |
| **Surface Elevated** | `--bg-surface-elevated` | `#f3efe6` | Warm cream elevation for sticky headers, badges, and filters. |
| **Surface Hover** | `--bg-surface-hover` | `#ebe5d8` | Tactile warm cream hover state. |
| **Border / Stroke** | `--border-subtle` | `#e5dfd3` | Soft warm hairline dividers. |
| **Border Strong** | `--border-strong` | `#d0c7b8` | Focused borders and outline rings. |
| **Text Primary** | `--text-primary` | `#1c1917` | Deep warm charcoal with maximum typography legibility. |
| **Text Secondary** | `--text-secondary` | `#44403c` | Warm charcoal for body text and instructions. |
| **Text Muted** | `--text-muted` | `#78716c` | Warm stone grey for descriptions and sub-labels. |
| **Accent Primary** | `--accent-cyan` | `#0284c7` | Deep sky blue for interactive links and signal arrows. |
| **Accent Secondary** | `--accent-amber` | `#d97706` | Rich amber for warning badges and alerts. |
| **Accent Success** | `--accent-emerald` | `#059669` | Crisp forest green for verified items. |

---

## 3. Typography Hierarchy

- **Display & Section Headers:** `Outfit`, sans-serif — Geometric, modern, confident, with tight tracking (`-0.02em`).
- **Body & Tabular Data:** `Plus Jakarta Sans`, sans-serif — Optimized for compact data display, tabular readability, and neutral tone.
- **Signal Paths, Ports & Hardware Codes:** `JetBrains Mono`, monospace — Monospaced precision for gear codes, quantities, and routing formulas (`A6000`, `18-105MM`, `HDMI 10M`, `QL5`, `Pyro S`).

---

## 4. Component Stylings & Micro-Interactions

### A. Navigation Bars
- **Desktop Navbar (Top):** Fixed `top: 0`, frosted backdrop filter (`backdrop-filter: blur(16px)`), reading progress bar indicator, single-word crisp links (PIC, Alur, Sistem, Kamera, Device, Logistik, Rundown), real-time status pill, theme switcher, and Cloud Sync toggle.
- **Mobile Navigation Dock (Bottom):** Fixed `bottom: 0`, elevated dock design with safe-area padding (`env(safe-area-inset-bottom)`), 5 key icon tabs (Beranda, Tim, Sinyal, Kamera, Alat), active indicator pill with subtle glow.

### B. Realtime Cloud Synchronization Bar & Telemetry
- **3-Layer Cloud-Only Synchronization & Zero-Config Telemetry:** Fully streamlined for internal broadcast crew access without friction or manual configuration modals. Operates across 3 resilient cloud layers:
  1. *Layer 1 (Primary Cloud DB):* Supabase PostgreSQL Realtime CDC backend for authoritative data persistence and presence tracking.
  2. *Layer 2 (Realtime Cloud Relay):* `ntfy.sh` Server-Sent Events (SSE) Pub/Sub relay for zero-latency cross-smartphone live broadcast.
  3. *Layer 3 (Cloud Snapshot Backup):* Automated GitHub Actions cron workflow snapshotting data to `backup/inventory_backup.json`.
- **Dual Progress Gauges:** Dynamic percentage bars tracking independent **Loading In (Pemasangan)** and **Packing Out (Pengemasan)** completion rates.
- **Quick Action & Batch Buttons:**
  - `✓ Ceklis Semua`: Opens mass checklist modal with options for Loading In, Packing Out, or 100% full check.
  - `↺ Reset Ceklis`: Opens reset modal with granular uncheck options (Loading In, Packing Out, or complete reset).
  - `📋 Salin Ringkasan`: Formatted WhatsApp-ready Markdown logistics summary exporter.

### C. Interactive Diagrams & Transparent Adaptive Mermaid Engine
- **Master Signal Board:** 4-stage interactive high-level hardware pipeline (Camera $\rightarrow$ Switcher $\rightarrow$ LED Processors $\rightarrow$ Stage & Stream).
- **Dynamic Transparent Flowcharts (Mermaid.js 10.9.1):** 
  - **Transparent Node Containers:** Node containers have 100% transparent fills (`rgba(255,255,255,0.03)` dark / `rgba(0,0,0,0.02)` light) with clean 1px subtle resting strokes (`var(--border-subtle)`), completely eliminating solid blocky white/black rectangles.
  - **Dynamic Glowing Node Outlines on Interaction:** Mermaid node containers remain quiet at 1px stroke in default state, and light up with a **2.5px cyan glowing outline (`#00d2ff`, filter drop-shadow)** ONLY when hovered (`:hover`) or clicked (`:active`).
  - **Engine Resilience & Race-Condition Hardening:** `startOnLoad: false` is initialized immediately in the document `<head>` to prevent premature parsing. The application caches immutable raw diagram source text in `data-mermaid-src`, completely preventing SVG-reparsing syntax errors during live theme transitions.
  - **Auto-Adaptive Lines & Typography:**
    - *Dark Mode:* Pure light text (`#f5f5f5`) and cyan/grey connecting vector lines.
    - *Light Mode:* Deep charcoal text (`#1c1917`) and sky-blue connecting vector lines.
  - **Instant Re-rendering on Theme Toggle:** Automatically re-renders SVG vector graphs in real-time when the theme switcher is clicked without requiring page reload.
  - Flowcharts rendered:
    1. *Bagan Struktur Komando & Hierarki Tim*
    2. *Master Architecture Signal Flow (5 Sub-Graphs)*
    3. *Sub-Flowchart 1: Sub-Sistem Kamera Wireless — CAM 2 & CAM 3 (`flowchart LR`)*
    4. *Sub-Flowchart 2: Sub-Sistem Kamera Kabel / Wired — CAM 1 & CAM 4 (`flowchart LR`)*
    5. *Sub-Flowchart 3: Sub-Sistem Distribusi Video & Pemetaan LED (`flowchart LR`)*
    6. *Sub-Flowchart 4: Sub-Sistem Audio FOH, Sub-Mixing & Streaming (`flowchart LR`)*
    7. *Sub-Flowchart 5: Sub-Sistem Efek Panggung (Smoke Fogger 900W) (`flowchart LR`)*
    8. *Sub-Flowchart 6: Sub-Sistem Distribusi Daya & Grounding (`flowchart LR`)*

### D. Cards, Camera Grids, Fixed Tables & Rundown Matrix
- Subtly rounded corners (`border-radius: 14px`).
- **Universal Focus Ring Reset:** All interactive elements implement `*:focus:not(:focus-visible) { outline: none !important; }` to eliminate sticky mouse-click outlines, while reserving high-visibility 2px cyan rings (`*:focus-visible`) for keyboard navigation.
- **Hairline Default Resting State:** 1px hairline technical borders (`1px solid var(--border-subtle)`) across all cards, callouts, telemetry blocks, camera spec bins, and Rundown phase containers with zero intrusive static outlines.
- **Dynamic Interactive Outlines:** Prominently highlights with a **2.5px glowing cyan outline (`0 0 0 2px var(--accent-cyan-subtle), var(--shadow-glow)`)** and micro-lift (`translateY(-2px)`) ONLY on hover (`:hover`), active/click (`:active`), or keyboard focus (`:focus-visible`).
- **3-Phase Rundown Schedule Design (`.timeline-phase` & `.timeline-box`):** Structured into Pre-Ibadah (Open Gate), Main Ibadah (Main Event), and Post-Ibadah (Usung-usung/Close Gate) with consistent hairline resting borders and smooth micro-lift hover animations.
- **Strict Fixed Column Alignment across 19 Inventory Tables (`.data-table.inv-table`):** Table columns are fixed across all 18 lender blocks + Auditorium UNNES (19 categories, 158 items: `table-layout: fixed`) guaranteeing exact vertical column matching regardless of item title lengths.
- **Single-Line Descriptions with Ellipsis:** Keterangan fields are strictly kept to a single line with `white-space: nowrap; text-overflow: ellipsis;` and native browser hover tooltips.
- **2-Column Broadcast Camera Grid (`.broadcast-grid`):** Arranges CAM 1 (Alex - Steady Wired) & CAM 2 (Kiel - Mobile Wireless) on the top row, and CAM 3 (Ferdy - Mobile Wireless) & CAM 4 (Nia - Steady Wired) on the bottom row to eliminate vertical scrolling.
- **3-Column Documentation Camera Grid (`.doc-grid`):** Arranges CAM 5 (Photo - Nico), CAM 6 (Video - Joel), and CAM 7 (Story - Jennifer) in a balanced 3-column desktop layout.
- **2-Column Responsive Subsystem Grid (`.subsystems-grid`):** Displays the 6 deep-dive technical chains in a 2-column grid on desktop/tablets paired with horizontal `flowchart LR` diagrams.
- **Direct Tactile Checkboxes:** Streamlined 32×32px responsive checkboxes with SVG checkmarks (`✓`) directly synchronized to Supabase Cloud with crew timestamps.

### E. Modals, Notifications & Dialogs
- **Batch Action Modal (`#batch-action-modal`):** Dynamic selection modal for mass-checking (`✓ Ceklis Semua`) or resetting (`↺ Reset Ceklis`) inventory checklist states with Supabase chunked upserting.
- **Bottom-Right Toast Notifications (`.toast-container`):** Stacked non-intrusive notifications positioned at the bottom-right corner across desktop and mobile.
- **5-Clause ASCII Legal & Operational License Modal:** Verbatim governance modal with monospace readability and accessible keyboard dismissal (Escape key).

### F. Landing Page — Official Media Release (`landing.css`)
Halaman hasil publik (`index.html`) memakai bahasa visual yang sama (Utilitarian Broadcast Command) namun dengan penekanan *media showcase*:
- **Media Hero (`.media-hero`):** Latar radial cyan halus di atas gradient surface→primary dengan grid halus; status pill hijau berdenyut (`EVENT COMPLETED`), judul display hingga `clamp(2.2rem, 5.5vw, 3.8rem)`, venue tag monospace, 3 CTA (primary cyan, secondary surface, archive amber), dan 4 kartu telemetri (`.stat-card` dengan angka `tabular-nums`).
- **Featured Master Player (`.featured-player-card`):** Bingkai `radius-xl` dengan bayangan dalam, baris tab feed (`.player-tab`) dengan durasi monospace, viewport iframe 16:9 (`padding-top: 56.25%`), dan meta bar (judul aktif, subtitle, tombol YouTube merah).
- **Timeline Cues (`.rundown-cues-card`):** Grid penanda waktu klik-lompat. Setiap `.cue-item` menampilkan `.cue-time` (monospace, cyan) + `.cue-label` satu baris ellipsis, dengan hover outline cyan.
- **Katalog Video (`.video-grid` → `.video-card`):** Kartu thumbnail 16:9 dengan overlay play-circle saat hover, pill durasi, tag kategori berwarna (broadcast biru / praise amber / worship emerald / hymn ungu / persembahan pink), judul display, dan footer dua tombol (*Putar di Sini* + *YouTube ↗*). Grid `auto-fill minmax(320px, 1fr)`.
- **Filter Pills & Search:** Pill kategori `radius-full` dengan count monospace (aktif = fill cyan penuh), input pencarian dengan ikon kiri + tombol clear kanan + badge jumlah hasil.
- **Ekosistem & Simulator:** `.pillar-card` (4 pilar teknologi) dan `.sim-card` (tautan simulator) dengan garis aksen atas `--sim-accent` per kartu.
- **Archive Banner (`.archive-banner`):** Banner amber `border-bottom` dengan badge, teks status, dan tombol kembali ke landing — hanya di `archive.html`.
- **Empty State (`.catalog-empty-state`):** Kartu dashed dengan ikon pencarian + judul + deskripsi saat filter/pencarian tidak menemukan hasil.

---

## 5. Responsive Breakpoints

- **Mobile Small (< 480px):** Single column, bottom dock nav, compact inventory cards, full-width search input.
- **Tablet (481px - 768px):** 2-column grid for camera cards, sticky bottom nav, collapsible filter tabs.
- **Compact Tablet / Laptop (769px - 1120px):** Compact desktop navbar with non-wrapping single-word labels, 2-column subsystem cards.
- **Desktop (1121px - 1440px):** Full multi-column hardware matrix, full sidebar/horizontal layout.
- **Wide Desktop (> 1440px):** Max container width `1280px` centered with generous margins.
