# 📋 Product Requirements Document (PRD)
## IP26 Live Broadcast & Multimedia Production Web Portal
**Project:** IP26 Technical Production Web Command Portal  
**Document ID:** `PRD-IP26-UNNES-2026`  
**Status:** Production / Fully Deployed & Synchronized  
**Target Event:** Ibadah Perdana UKK UNNES 2026 (Auditorium UNNES)  

---

### 1. Executive Summary & Product Vision
The **IP26 Production Portal** is a lightweight, responsive, high-performance web dashboard & command portal designed as the **single source of truth** for all technical crews, PICs, and committee members executing the **Ibadah Perdana UKK UNNES 2026** at Auditorium Universitas Negeri Semarang.

The portal provides instant, frictionless, mobile-optimized access to master signal architectures, camera sub-systems, audio routing, equipment allocations, operator matrices, rundown media timelines, and multi-user synchronized inventory checklists without requiring logins, installations, or bulky software.

---

### 2. Target Audience & Personas
1. **Camera PICs & Operators (Alex, Kiel, Nia, Ferdy, Nico, Joel, Jennifer):** Rapid lookup of camera models, lens configurations, battery/memory card statuses, wireless transmitter frequencies, and tripod positions on mobile devices while on stage or in the hall.
2. **Video & Switcher Operators (Wilfred, Rania, Filia, Andreas, Bayu):** Detailed routing diagrams for Cinetreak V1, Splitter 4CH, ProPresenter 1 & 2 layers, and Resolume Arena Novastar mappings.
3. **Sound Engineers & FOH Audio (Jordan, Yosua, Andreas):** Reference for Yamaha QL5 sub-mix sends, NewBaxs CT80S streaming levels, and WiFi UNNES-ID remote iPad/MacBook configurations (Virtual Mixers 1, 2, 3).
4. **Stage Effects & Production Support (Jordan, Panitia):** Smoke Fogger 900W Pack setup, remote trigger, and stage atmospheric effects execution.
5. **Production Leads & Committee Leads (Andreas, Richard, Jennifer):** Full-scope inventory tracking across 18 loan providers + UNNES facilities (19 categories, 158 items), multi-device live checklist sync, vendor loan management, and post-event teardown (*usung-usung*) verifications.

---

### 3. Key Functional Requirements (FR)

| ID | Feature | Description | Priority |
| :--- | :--- | :--- | :---: |
| **FR-01** | **Unified Single-Page Architecture** | All information accessible in a continuous, smooth-scrolling single-page layout with high-performance section anchors and reading progress bar. | P0 |
| **FR-02** | **Dual Responsive Navigation** | • **Desktop:** Frosted sticky top header with reading progress bar, single-word links (PIC, Alur, Sistem, Kamera, Device, Logistik, Rundown), real-time status pill, theme switcher, and Cloud Sync toggle.<br>• **Mobile:** Ergonomic bottom navigation dock with touch-friendly icons and safe-area inset adaptation. | P0 |
| **FR-03** | **Dual-Theme Engine** | • **Dark Mode (Default):** Pure Neutral Grey (`#121212` / `#1f1f1f`) with zero blue tint and crisp cyan accents.<br>• **Light Mode:** Pure Warm White Linen (`#fdfbf7` / `#ffffff`) with deep warm charcoal typography. Seamlessly persisted via `localStorage`. | P0 |
| **FR-04** | **Interactive Flowchart, 2-Column Subsystems & Transparent Mermaid Engine** | Dual-engine visual diagrams: (1) High-level interactive 4-stage hardware pipeline board, and (2) 8 embedded Mermaid.js architecture flowcharts with transparent node containers, horizontal `flowchart LR` layouts, and auto-adapting lines/text (pure light text in dark mode, deep charcoal in light mode). Deep-dive sub-systems are laid out in an ergonomic **2-column responsive grid (6 balanced cards)** with dynamic 2.5px glowing outlines strictly on hover/click and instant re-render on theme toggle without page reload. | P0 |
| **FR-05** | **Realtime Multi-Device Cloud Sync (Zero-Config Supabase) & Anonymous Crew Mode** | 100% cloud-driven multi-crew bi-directional checklist synchronization using built-in Supabase PostgreSQL + Realtime WebSockets CDC. Built for anonymous, frictionless internal usage without mandatory name inputs or manual configuration modals. Tracks independent 'Loading In' (pemasangan) and 'Packing Out' (pengemasan) statuses per item via tactile checkboxes (`✓`), with dynamic total item calculation, live presence indicators (`online crew count`), and batch checklist controls ("✓ Ceklis Semua" & "↺ Reset Ceklis"). | P0 |
| **FR-06** | **Live Inventory Search, Multi-Filter & Fixed-Width Tables** | Instant client-side search and category filtering across all 19 equipment providers + UNNES facilities (20 categories: OWL, ABON, Andreas, GIA, GKJ, UKK, Jordan, Kiel, Nico, Lio, Darrel, Jennifer, Filia, Alex, Bayu, Wilfred, Evan, PlayStation, Panitia, UNNES) with real-time status badges (`✅ Ready`, `⚠️ Sebagian / Perhatian`, `☑️ Reserve`). Tables across all 20 vendor sections feature strict fixed column alignment (`table-layout: fixed`) and single-line description ellipsis with hover tooltips to ensure complete vertical alignment across all categories. | P0 |
| **FR-07** | **Camera Rig Layouts (2-Col Broadcast & 3-Col Documentation)** | Dedicated visual cards: Broadcast cameras arranged in a clean **2-column grid** (CAM 1 Alex Steady Wired, CAM 2 Kiel Mobile Wireless, CAM 3 Ferdy Mobile Wireless, CAM 4 Nia Steady Wired) and Documentation cameras in a **3-column grid** (CAM 5 Photo Nico, CAM 6 Video Joel, CAM 7 Story Jennifer). | P1 |
| **FR-08** | **Workstation & Operator Matrix** | Status matrix displaying operator names, assigned hardware roles, and 100% verified device allocations across all 10 workstations with zero missing units. | P1 |
| **FR-09** | **Rundown & Screen Mapping Matrix** | Sequential timeline covering Pre-Ibadah, Main Ibadah, and Post-Ibadah media targets across LED Main, LED Wings, and OBS live stream feeds. | P1 |
| **FR-10** | **5-Clause Operational & Legal Modal** | Complete verbatim ASCII legal and operational governance charter accessible via dedicated footer modal with full keyboard accessibility. | P2 |

---

### 4. Non-Functional Requirements (NFR)

1. **Performance & Web Vitals:** Ultra-fast initial load (< 300ms), sub-millisecond DOM filter query speeds, and zero blocking scripts.
2. **Accessibility & Universal Focus Management (a11y):** WCAG 2.1 AA compliant contrast ratios in both dark and light modes; keyboard accessible navigation (`Tab`, `Escape` modals, `Skip-to-content` link). Universal focus reset (`*:focus:not(:focus-visible) { outline: none !important; }`) eliminating sticky outlines after mouse clicks, with explicit 2px cyan focus rings reserved exclusively for keyboard navigation (`*:focus-visible`). Bottom-right floating toasts with auto-dismiss and stack animation.
3. **Diagram Engine Resilience (Mermaid.js 10.9.1):** Zero-error asynchronous vector rendering with race-condition prevention (`startOnLoad: false` declared in document `<head>`) and immutable source-code caching (`data-mermaid-src`), ensuring seamless real-time graph re-rendering during dynamic Dark/Light theme switching.
4. **Responsiveness & Smooth Micro-Interactions:** Fluid scaling across ultra-compact mobile (320px), standard tablets (768px), compact laptop viewports (1024px), and wide monitors (1440px+). Clean hairline default borders (`1px solid var(--border-subtle)`) with smooth hover micro-lifts across all cards, inventory rows, and the 3-phase Rundown schedule blocks (Pre-Ibadah, Main Ibadah, Post-Ibadah).
5. **Zero-Build Architecture:** Pure Vanilla HTML5, CSS3, and modern ES6+ JavaScript for maximum longevity, independence from build tool obsolescence, and instant execution via standard web browsers.
6. **3-Layer Cloud-Only Architecture & Anti-Pause Automation:**
   - **Layer 1 (Primary Cloud DB):** Supabase PostgreSQL database with CDC WebSockets for live state persistence across all crew smartphones. Automated GitHub Actions cron trigger (`supabase-keep-alive.yml`) pings the REST API twice daily (`0 0,12 * * *`) to prevent free-tier 7-day inactivity pause.
   - **Layer 2 (Realtime Cloud Relay):** Zero-setup `ntfy.sh` Server-Sent Events (SSE) Pub/Sub relay (`https://ntfy.sh/ip26_checklist_sync_2026`) providing instant sub-second broadcast redundancy across all crew phones.
   - **Layer 3 (Automated Cloud Snapshot Backup):** GitHub Actions workflow (`db-backup.yml`) executing twice daily and on-demand to fetch deterministic full JSON snapshots from Supabase and commit them to `backup/inventory_backup.json` in the Git repository.

---

### 5. Information Architecture & Content Hierarchy

> **Arsitektur Pasca-Event (v2):** Setelah Ibadah Perdana 2026 sukses terlaksana, situs direstrukturisasi menjadi **dua wajah**: (A) **Landing Page Hasil Publik** (`index.html`) yang menampilkan output rekaman & playlist video untuk jemaat umum, dan (B) **Arsip Teknis Produksi** (`archive.html`) yang mempertahankan seluruh dokumentasi teknis pra-event untuk kru.

#### A. Landing Page — Official Media Release (`index.html`)
1. **Top Header:** Brand "Media & Output Portal", in-page nav (Full Live / Timeline / Video / Sistem / Simulator), tombol "Arsip Teknis", theme toggle, hamburger mobile.
2. **Hero Media Release:** Status "Event Completed", judul event, venue, 3 CTA (Putar Master 4 Jam / Telusuri 23 Video / Arsip Teknis), dan 4 kartu telemetri (durasi master, jumlah video, jumlah lagu, resolusi).
3. **Featured Master Live Player:** Pemutar YouTube embedded dengan 5 tab feed (Full Live Master, Full Live Raw, Opening, Countdown, Profile) + meta bar & tombol buka YouTube.
4. **Timeline Rundown Interaktif:** 8 penanda waktu (klik untuk melompat ke bagian video master pada detik tertentu).
5. **Katalog Video & Pencarian:** 6 pill filter kategori (Semua/Siaran/Praise/Worship/Kidung/Persembahan) + input pencarian real-time (judul/artis/kategori) + grid kartu 23 video dengan thumbnail, durasi, tag kategori, tombol "Putar di Sini" & "YouTube ↗".
6. **Ekosistem Produksi:** 4 kartu pilar teknologi (Switcher Cinelive V1, ProPresenter/Resolume, Audio FOH/Submix, 19 Vendor Logistik).
7. **Akses Simulator & Arsip:** 4 kartu tautan (Master Command Portal/Arsip, Switcher, ProPresenter, Inventaris).
8. **Footer & Mobile Dock:** Info event, tautan navigasi/modul/kanal resmi, dock mobile (Home/Videos/Arsip/Menu).

#### B. Arsip Teknis Produksi (`archive.html`)
Diawali **banner arsip amber** (status event selesai + tombol kembali ke landing), lalu:
1. **Top Navigation Header:** Progress bar, single-word anchors, live status badge, theme toggle, dan cloud status.
2. **Hero Section:** Event title, venue badge, real-time telemetry stats, live crew presence, dan action triggers.
3. **Command & Organization:** 3 Leadership team cards, 5 Technical Assignment Golden Rules, dan Mermaid Org Flowchart.
4. **Master Architecture & Signal Flow:** 4-Stage interactive board + Master Mermaid Signal Flow Diagram.
5. **6 Sub-System Deep-Dives (2-Column Grid):** (1) Wireless Cameras (CAM 2 & 3), (2) Wired Cameras (CAM 1 & 4), (3) Video & LED Mapping, (4) Audio Routing & Streaming, (5) Stage Effects (Smoke Fogger), and (6) Electrical Power Distribution (each with its dedicated compact `flowchart LR` Mermaid diagram & technical explanation).
6. **Camera Acquisition Systems:** 2-Column Broadcast (CAM 1–4) & 3-Column Documentation camera specifications.
7. **Workstations & Media Matrix:** Operator roles and 100% verified device allocation statuses.
8. **Master Inventory Directory:** Live search, 19 vendor filter pills, strict fixed-column tables with single-line ellipsis, dual-action realtime checklist (`[v] Pasang` & `[v] Kemas`), batch bulk actions ("✓ Ceklis Semua" & "↺ Reset Ceklis"), dynamic progress gauges, and clipboard summary exporter.
9. **Rundown & Screen Mapping:** 3-Phase structured timeline (Pre-Ibadah, Main Ibadah, Post-Ibadah) with multimedia asset distribution targets.
10. **Footer & Governance:** Operational charter and 5-clause ASCII license modal.
11. **Mobile Bottom Dock:** Tanpa dock di arsip (banner + drawer cukup).
