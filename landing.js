/**
 * IP26 MEDIA OUTPUT & RECAP LANDING PAGE
 * High-performance client logic: ambient aurora canvas, gliding pill slider,
 * bias lighting, cinema mode, and responsive video filtering.
 */

document.addEventListener("DOMContentLoaded", () => {
  const playlist = window.IP26_PLAYLIST || { videos: [] };
  const videos = playlist.videos;

  // Dark theme is the permanent architectural default for the broadcast portal.
  document.documentElement.setAttribute("data-theme", "dark");

  // Hero ambient aurora canvas (30fps throttled, paused when offscreen or hidden)
  const heroCanvas = document.getElementById("hero-ambient-canvas");
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    let width = 0;
    let height = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let animId = null;
    let isVisible = true;
    let isTabActive = !document.hidden;
    let lastRenderTime = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3 harmonic floating color nodes (Cyan, Purple, Blue) for low GPU footprint
    const auroraNodes = [
      { x: 0.25, y: 0.35, r: 360, color: "rgba(0, 210, 255, 0.14)", speed: 0.0008, phase: 0 },
      { x: 0.75, y: 0.45, r: 400, color: "rgba(168, 85, 247, 0.11)", speed: 0.0006, phase: 2.1 },
      { x: 0.50, y: 0.25, r: 300, color: "rgba(59, 130, 246, 0.09)", speed: 0.0010, phase: 4.3 }
    ];

    function resizeHeroCanvas() {
      if (!heroCanvas) return;
      const rect = heroCanvas.parentElement
        ? heroCanvas.parentElement.getBoundingClientRect()
        : { width: window.innerWidth, height: 600 };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroCanvas.width = rect.width * dpr;
      height = heroCanvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    window.addEventListener("resize", resizeHeroCanvas, { passive: true });
    resizeHeroCanvas();

    window.addEventListener("pointermove", (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = e.clientY / window.innerHeight;
    }, { passive: true });

    // Halt canvas loop when hero scrolls out of view
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        syncCanvasLoop();
      });
    }, { threshold: 0.05 });
    heroObserver.observe(heroCanvas);

    // Halt canvas loop when browser tab is inactive to preserve battery
    document.addEventListener("visibilitychange", () => {
      isTabActive = !document.hidden;
      syncCanvasLoop();
    });

    function syncCanvasLoop() {
      const shouldRun = isVisible && isTabActive && !reducedMotion;
      if (shouldRun && !animId) {
        lastRenderTime = performance.now();
        animId = requestAnimationFrame(renderAurora);
      } else if (!shouldRun && animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    function renderAurora(time) {
      if (!isVisible || !isTabActive) {
        animId = null;
        return;
      }

      // 30 FPS frame rate pacing (every ~33ms) to eliminate background CPU/GPU spikes
      if (time - lastRenderTime < 33) {
        animId = requestAnimationFrame(renderAurora);
        return;
      }
      lastRenderTime = time;

      // Mouse lerp interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const displayW = width / Math.min(window.devicePixelRatio || 1, 2);
      const displayH = height / Math.min(window.devicePixelRatio || 1, 2);

      ctx.clearRect(0, 0, displayW, displayH);
      ctx.globalCompositeOperation = "screen";

      auroraNodes.forEach(node => {
        const t = time || 0;
        const offsetX = Math.sin(t * node.speed + node.phase) * 60 + (mouseX - 0.5) * 60;
        const offsetY = Math.cos(t * node.speed + node.phase) * 40 + (mouseY - 0.5) * 50;
        const cx = displayW * node.x + offsetX;
        const cy = displayH * node.y + offsetY;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, node.r);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, node.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reducedMotion) {
        animId = requestAnimationFrame(renderAurora);
      }
    }

    if (!reducedMotion) {
      animId = requestAnimationFrame(renderAurora);
    } else {
      renderAurora(1000);
    }
  }

  // Mobile navigation drawer toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-nav-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const drawerClose = document.getElementById("drawer-close-btn");

  function openDrawer() {
    if (drawer && backdrop) {
      drawer.classList.add("active");
      backdrop.classList.add("active");
      drawer.setAttribute("aria-hidden", "false");
      if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (drawer && backdrop) {
      drawer.classList.remove("active");
      backdrop.classList.remove("active");
      drawer.setAttribute("aria-hidden", "true");
      if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }

  if (mobileToggle) mobileToggle.addEventListener("click", openDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  document.querySelectorAll(".drawer-nav-link").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // Featured master video player and ambient bias lighting
  const playerIframe = document.getElementById("featured-player-iframe");
  const playerTitle = document.getElementById("player-active-title");
  const playerSubtitle = document.getElementById("player-active-subtitle");
  const playerYtLink = document.getElementById("player-yt-link");
  const playerTabs = document.querySelectorAll(".player-tab");
  const playerAmbientGlow = document.getElementById("player-ambient-glow");

  const categoryGlowColors = {
    broadcast: "rgba(0, 210, 255, 0.40)",
    praise: "rgba(245, 158, 11, 0.35)",
    worship: "rgba(16, 185, 129, 0.35)",
    hymn: "rgba(168, 85, 247, 0.40)",
    persembahan: "rgba(244, 63, 94, 0.35)"
  };

  function updateAmbientGlow(category = "broadcast") {
    if (!playerAmbientGlow) return;
    const color = categoryGlowColors[category] || categoryGlowColors.broadcast;
    playerAmbientGlow.style.setProperty("--ambient-glow-color", color);
  }

  function setFeaturedVideo(videoId, title, artist, duration, category = "broadcast", autoPlay = true) {
    if (!playerIframe) return;
    const playParam = autoPlay ? "?autoplay=1&rel=0" : "?rel=0";
    playerIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}${playParam}`;

    if (playerTitle) playerTitle.textContent = title;
    if (playerSubtitle) {
      playerSubtitle.innerHTML = `<span>${artist}</span> &bull; <span>${duration}</span>`;
    }
    if (playerYtLink) {
      playerYtLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    }

    updateAmbientGlow(category);

    playerTabs.forEach(tab => {
      if (tab.dataset.videoId === videoId) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });
  }

  playerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const vid = tab.dataset.videoId;
      const title = tab.dataset.title;
      const artist = tab.dataset.artist;
      const dur = tab.dataset.duration;
      setFeaturedVideo(vid, title, artist, dur, "broadcast", true);
    });
  });

  // Timeline cues: jump master video to specific offset
  document.querySelectorAll(".cue-item").forEach(cue => {
    cue.addEventListener("click", () => {
      const timeSec = cue.dataset.seconds || 0;
      const masterVid = "gAigrossEBk";
      if (!playerIframe) return;

      playerIframe.src = `https://www.youtube-nocookie.com/embed/${masterVid}?autoplay=1&start=${timeSec}&rel=0`;
      const timeLbl = cue.querySelector(".cue-time")?.textContent || "";
      const nameLbl = cue.querySelector(".cue-label")?.textContent || "";

      if (playerTitle) playerTitle.textContent = `Full Live Master: ${nameLbl}`;
      if (playerSubtitle) {
        playerSubtitle.innerHTML = `<span>Bagian ${timeLbl}</span> &bull; <span>04:00:50 Total</span>`;
      }
      if (playerYtLink) {
        playerYtLink.href = `https://www.youtube.com/watch?v=${masterVid}&t=${timeSec}s`;
      }

      updateAmbientGlow("broadcast");

      playerTabs.forEach(tab => {
        if (tab.dataset.videoId === masterVid) {
          tab.classList.add("active");
          tab.setAttribute("aria-selected", "true");
        } else {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        }
      });

      document.getElementById("featured-live")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Cinema mode expansion
  const theaterBtn = document.getElementById("btn-theater-mode");
  const theaterBtnText = document.getElementById("theater-btn-text");
  const cinemaBackdrop = document.getElementById("cinema-backdrop");

  function toggleCinemaMode(forceState) {
    const isCurrentlyActive = document.body.classList.contains("cinema-mode-active");
    const shouldActivate = forceState !== undefined ? forceState : !isCurrentlyActive;

    if (shouldActivate) {
      document.body.classList.add("cinema-mode-active");
      if (theaterBtn) {
        theaterBtn.classList.add("active");
        theaterBtn.setAttribute("aria-pressed", "true");
      }
      if (theaterBtnText) theaterBtnText.textContent = "Exit Cinema";
    } else {
      document.body.classList.remove("cinema-mode-active");
      if (theaterBtn) {
        theaterBtn.classList.remove("active");
        theaterBtn.setAttribute("aria-pressed", "false");
      }
      if (theaterBtnText) theaterBtnText.textContent = "Cinema Mode";
    }
  }

  if (theaterBtn) {
    theaterBtn.addEventListener("click", () => toggleCinemaMode());
  }
  if (cinemaBackdrop) {
    cinemaBackdrop.addEventListener("click", () => toggleCinemaMode(false));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("cinema-mode-active")) {
      toggleCinemaMode(false);
    }
  });

  // Gliding active filter pill indicator (Framer-Motion spring effect)
  const filterPillsContainer = document.getElementById("category-filter-pills");
  const filterGlider = document.getElementById("filter-glider");
  const filterPills = document.querySelectorAll(".filter-pill");

  function updateFilterGlider(activeBtn) {
    if (!filterPillsContainer || !filterGlider || !activeBtn) return;
    if (window.innerWidth <= 768) return;

    const containerRect = filterPillsContainer.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const leftOffset = btnRect.left - containerRect.left;
    const width = btnRect.width;

    filterGlider.style.transform = `translate3d(${leftOffset}px, 0, 0)`;
    filterGlider.style.width = `${width}px`;
  }

  window.addEventListener("resize", () => {
    const activePill = filterPillsContainer?.querySelector(".filter-pill.active");
    if (activePill) updateFilterGlider(activePill);
  }, { passive: true });

  // Lightweight spotlight tracking: uses offsetX/Y to eliminate getBoundingClientRect layout thrashing
  function initCardSpotlights() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cards = document.querySelectorAll(".video-card, .stat-card, .pillar-card, .sim-card");
    cards.forEach(card => {
      card.addEventListener("pointermove", (e) => {
        card.style.setProperty("--mouse-x", `${e.offsetX}px`);
        card.style.setProperty("--mouse-y", `${e.offsetY}px`);
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--mouse-x", `-999px`);
        card.style.setProperty("--mouse-y", `-999px`);
      }, { passive: true });
    });
  }

  // Catalogue filtering and live text search
  const searchInput = document.getElementById("catalog-search-input");
  const searchClear = document.getElementById("search-clear-btn");
  const countBadge = document.getElementById("search-count-badge");
  const videoGrid = document.getElementById("video-catalog-grid");

  let activeCategory = "all";
  let searchQuery = "";

  function renderVideos() {
    if (!videoGrid) return;

    const filtered = videos.filter(v => {
      const matchesCat = (activeCategory === "all") || (v.category === activeCategory);
      if (!matchesCat) return false;

      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.displayTitle.toLowerCase().includes(q) ||
        v.artist.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    });

    if (countBadge) {
      countBadge.textContent = `Menampilkan ${filtered.length} dari ${videos.length} video`;
    }

    if (filtered.length === 0) {
      videoGrid.innerHTML = `
        <div class="catalog-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div class="empty-title">Tidak Ada Video yang Cocok</div>
          <p class="empty-desc">Coba gunakan kata kunci pencarian lain atau pilih kategori "Semua Video".</p>
        </div>
      `;
      return;
    }

    videoGrid.innerHTML = filtered.map(v => {
      const tagClass = `tag-${v.category}`;
      const catLabel = getCategoryLabel(v.category);

      return `
        <article class="video-card" data-video-id="${v.id}">
          <div class="video-thumb-container">
            <img
              src="${v.thumbnail}"
              alt="${escapeHtml(v.displayTitle)}"
              class="video-thumb-img"
              loading="lazy"
            />
            <div class="video-thumb-overlay">
              <div class="play-circle-btn" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
            <span class="video-duration-pill">${v.durationFormatted}</span>
          </div>

          <div class="video-card-body">
            <div class="video-card-meta">
              <span class="video-category-tag ${tagClass}">${catLabel}</span>
              <span class="video-artist-tag">${escapeHtml(v.artist)}</span>
            </div>

            <h3 class="video-card-title">${escapeHtml(v.displayTitle)}</h3>

            <div class="video-card-footer">
              <button
                type="button"
                class="card-play-btn"
                data-video-id="${v.id}"
                data-title="${escapeHtml(v.displayTitle)}"
                data-artist="${escapeHtml(v.artist)}"
                data-duration="${v.durationFormatted}"
                data-category="${v.category}"
                aria-label="Putar ${escapeHtml(v.displayTitle)}"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Putar di Sini</span>
              </button>

              <a
                href="${v.youtubeUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="card-yt-btn"
                title="Buka langsung di YouTube"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>YouTube ↗</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    videoGrid.querySelectorAll(".video-card").forEach(card => {
      const playBtn = card.querySelector(".card-play-btn");
      const thumb = card.querySelector(".video-thumb-container");

      const handlePlay = () => {
        const vid = playBtn.dataset.videoId;
        const title = playBtn.dataset.title;
        const artist = playBtn.dataset.artist;
        const dur = playBtn.dataset.duration;
        const cat = playBtn.dataset.category || "broadcast";

        setFeaturedVideo(vid, title, artist, dur, cat, true);
        document.getElementById("featured-live")?.scrollIntoView({ behavior: "smooth" });
      };

      if (playBtn) playBtn.addEventListener("click", handlePlay);
      if (thumb) thumb.addEventListener("click", handlePlay);
    });

    initCardSpotlights();
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case "broadcast": return "Siaran & Rekap";
      case "praise": return "Praise";
      case "worship": return "Worship";
      case "hymn": return "Kidung";
      case "persembahan": return "Persembahan";
      default: return "Lainnya";
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "all";
      updateFilterGlider(pill);
      renderVideos();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchClear) {
        searchClear.style.display = searchQuery.length > 0 ? "block" : "none";
      }
      renderVideos();
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchQuery = "";
        searchClear.style.display = "none";
        searchInput.focus();
        renderVideos();
      }
    });
  }

  renderVideos();
  initCardSpotlights();

  const initialActivePill = filterPillsContainer?.querySelector(".filter-pill.active");
  if (initialActivePill) {
    setTimeout(() => updateFilterGlider(initialActivePill), 100);
  }
});
