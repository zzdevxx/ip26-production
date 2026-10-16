/**
 * IP26 MEDIA OUTPUT & RECAP LANDING PAGE
 * Client Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  const playlist = window.IP26_PLAYLIST || { videos: [] };
  const videos = playlist.videos;

  // =========================================================================
  // 1. PERMANENT DARK THEME (matches archive portal)
  // =========================================================================
  document.documentElement.setAttribute("data-theme", "dark");

  // =========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // =========================================================================
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

  // =========================================================================
  // 3. FEATURED MASTER VIDEO PLAYER
  // =========================================================================
  const playerIframe = document.getElementById("featured-player-iframe");
  const playerTitle = document.getElementById("player-active-title");
  const playerSubtitle = document.getElementById("player-active-subtitle");
  const playerYtLink = document.getElementById("player-yt-link");
  const playerTabs = document.querySelectorAll(".player-tab");

  function setFeaturedVideo(videoId, title, artist, duration, autoPlay = true) {
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

    // Update active tab if matches
    playerTabs.forEach(tab => {
      if (tab.dataset.videoId === videoId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  playerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const vid = tab.dataset.videoId;
      const title = tab.dataset.title;
      const artist = tab.dataset.artist;
      const dur = tab.dataset.duration;
      setFeaturedVideo(vid, title, artist, dur, true);
    });
  });

  // Timeline cues jump markers
  document.querySelectorAll(".cue-item").forEach(cue => {
    cue.addEventListener("click", () => {
      const timeSec = cue.dataset.seconds || 0;
      const masterVid = "gAigrossEBk";
      if (!playerIframe) return;

      playerIframe.src = `https://www.youtube-nocookie.com/embed/${masterVid}?autoplay=1&start=${timeSec}&rel=0`;
      const timeLbl = cue.querySelector(".cue-time")?.textContent || "";
      const nameLbl = cue.querySelector(".cue-label")?.textContent || "";

      if (playerTitle) playerTitle.textContent = `Full Live Master — ${nameLbl}`;
      if (playerSubtitle) {
        playerSubtitle.innerHTML = `<span>Bagian ${timeLbl}</span> &bull; <span>04:00:50 Total</span>`;
      }
      if (playerYtLink) {
        playerYtLink.href = `https://www.youtube.com/watch?v=${masterVid}&t=${timeSec}s`;
      }

      playerTabs.forEach(tab => {
        if (tab.dataset.videoId === masterVid) tab.classList.add("active");
        else tab.classList.remove("active");
      });

      // Scroll to player
      document.getElementById("featured-live")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // =========================================================================
  // 4. CATALOGUE FILTERING & SEARCH
  // =========================================================================
  const filterPills = document.querySelectorAll(".filter-pill");
  const searchInput = document.getElementById("catalog-search-input");
  const searchClear = document.getElementById("search-clear-btn");
  const countBadge = document.getElementById("search-count-badge");
  const videoGrid = document.getElementById("video-catalog-grid");

  let activeCategory = "all";
  let searchQuery = "";

  function renderVideos() {
    if (!videoGrid) return;

    const filtered = videos.filter(v => {
      // Category filter
      const matchesCat = (activeCategory === "all") || (v.category === activeCategory);
      if (!matchesCat) return false;

      // Search query
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

    // Bind card play buttons and card thumb clicks
    videoGrid.querySelectorAll(".video-card").forEach(card => {
      const playBtn = card.querySelector(".card-play-btn");
      const thumb = card.querySelector(".video-thumb-container");

      const handlePlay = () => {
        const vid = playBtn.dataset.videoId;
        const title = playBtn.dataset.title;
        const artist = playBtn.dataset.artist;
        const dur = playBtn.dataset.duration;

        setFeaturedVideo(vid, title, artist, dur, true);
        document.getElementById("featured-live")?.scrollIntoView({ behavior: "smooth" });
      };

      if (playBtn) playBtn.addEventListener("click", handlePlay);
      if (thumb) thumb.addEventListener("click", handlePlay);
    });
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

  // Filter pills event listeners
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "all";
      renderVideos();
    });
  });

  // Search input with debounce
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

  // Initial render of videos
  renderVideos();
});
