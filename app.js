/**
 * IP26 LIVE BROADCAST & MULTIMEDIA PRODUCTION PORTAL
 * Client Application Logic:
 * 1. Dual Theme Engine (Dark Slate / Warm Linen)
 * 2. Realtime Cloud Database Sync Engine (Supabase Realtime WebSockets + Offline Cache)
 * 3. Realtime Presence & Active Crew Tracking
 * 4. Interactive Inventory Checklist (Loading In & Packing Out)
 * 5. Toast Notification System
 * 6. Multi-dimensional Live Search & Dual Filter Engine (Vendor & Status)
 * 7. Summary Export / Copy to Clipboard
 * 8. Dynamic ScrollSpy Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if running on Inventory checklist view (Mobile Field Mode)
  const isInventoryPage = window.location.pathname.includes('inventory') ||
                          document.body.classList.contains('inventory-page') ||
                          Boolean(document.querySelector('.inv-table-inventory')) ||
                          Boolean(document.querySelector('.inv-table-field'));

  // Desktop lock screen bypass (for FOH laptops / station monitoring)
  const btnBypassLock = document.getElementById('btn-bypass-desktop-lock');
  if (btnBypassLock) {
    btnBypassLock.addEventListener('click', () => {
      const lockScreen = document.getElementById('desktop-lock-screen');
      if (lockScreen) {
        lockScreen.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // 1. Toast Notification System (Magic Motion & a11y)
  // Suppressed in Inventory mobile mode for fast, distraction-free checklist operations
  const toastContainer = document.getElementById('toast-container');

  function showToast(title, message, type = 'info') {
    if (isInventoryPage || !toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-item ${type === 'success' ? 'toast-success' : type === 'warning' ? 'toast-warning' : ''}`;

    const icon = type === 'success'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : type === 'warning'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-msg">${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  // 2. Theme Engine (Default & Permanent Dark Mode)
  const root = document.documentElement;
  root.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('ip26_theme', 'dark');
  } catch (err) {
    void err; // Storage restricted in private mode
  }

  // 3. Realtime Cloud Database & Inventory Sync Engine (Supabase)
  let supabaseClient = null;
  let realtimeChannel = null;
  let presenceChannel = null;

  const syncStatusDot = document.getElementById('sync-status-dot');
  const syncStatusText = document.getElementById('sync-status-text');
  const onlineCrewCount = document.getElementById('online-crew-count');
  const loadingCounterDisplay = document.getElementById('loading-counter-display');
  const packingCounterDisplay = document.getElementById('packing-counter-display');
  const loadingProgressBar = document.getElementById('loading-progress-bar');
  const packingProgressBar = document.getElementById('packing-progress-bar');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  // Batch Action Elements
  const btnBatchCheckAll = document.getElementById('btn-batch-check-all');
  const btnBatchUncheckAll = document.getElementById('btn-batch-uncheck-all');
  const batchActionModal = document.getElementById('batch-action-modal');
  const btnCloseBatchModal = document.getElementById('btn-close-batch-modal');
  const btnCancelBatchModal = document.getElementById('btn-cancel-batch-modal');
  const batchModalTitle = document.getElementById('batch-modal-title');
  const batchModalDesc = document.getElementById('batch-modal-desc');
  const batchOptionsContainer = document.getElementById('batch-options-container');

  // In-memory state cache with offline local persistence fallback
  const inventoryState = {}; // { itemId: { loaded, loaded_by, loaded_at, packed, packed_by, packed_at } }
  let totalInventoryCount = 0;

  try {
    const cachedState = localStorage.getItem('ip26_inventory_state');
    if (cachedState) {
      const parsed = JSON.parse(cachedState);
      Object.assign(inventoryState, parsed);
    }
  } catch (err) {
    void err; // Fallback to empty inventoryState when localStorage unavailable
  }

  function persistLocalState() {
    try {
      localStorage.setItem('ip26_inventory_state', JSON.stringify(inventoryState));
    } catch (err) {
      void err; // Local quota or restricted storage
    }
  }

  // Crew Identity Management (Sticky on Device)
  const crewNameInput = document.getElementById('crew-name-input');
  if (crewNameInput) {
    try {
      const savedCrew = localStorage.getItem('ip26_crew_name');
      if (savedCrew) crewNameInput.value = savedCrew;
    } catch (err) {
      void err;
    }
    crewNameInput.addEventListener('input', () => {
      const val = crewNameInput.value.trim();
      try {
        if (val) localStorage.setItem('ip26_crew_name', val);
      } catch (err) {
        void err;
      }
    });
  }

  function getEffectiveCrewName() {
    if (crewNameInput && crewNameInput.value.trim()) {
      return crewNameInput.value.trim();
    }
    try {
      const savedCrew = localStorage.getItem('ip26_crew_name');
      if (savedCrew) return savedCrew;
    } catch (err) {
      void err;
    }
    return 'Crew';
  }

  // Generate deterministic ID
  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Augment Inventory Tables with Checklist Columns
  const vendorBlocks = document.querySelectorAll('.vendor-block');
  vendorBlocks.forEach((block) => {
    const vendor = block.getAttribute('data-vendor') || 'Unknown';
    const table = block.querySelector('.inv-table');
    if (!table) return;

    // 1. Augment Header
    const headerRow = table.querySelector('thead tr');
    if (headerRow && !headerRow.querySelector('.th-sync')) {
      const thCols = headerRow.children;
      const thLoading = document.createElement('th');
      thLoading.className = 'th-sync';
      thLoading.textContent = 'Pasang';

      const thPacking = document.createElement('th');
      thPacking.className = 'th-sync';
      thPacking.textContent = 'Kemas';

      if (thCols.length >= 4) {
        headerRow.insertBefore(thLoading, thCols[3]);
        headerRow.insertBefore(thPacking, thCols[4]);
      } else {
        headerRow.appendChild(thLoading);
        headerRow.appendChild(thPacking);
      }
    }

    // 2. Augment Rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, idx) => {
      totalInventoryCount++;
      const itemName = row.getAttribute('data-name') || row.children[0]?.textContent.trim() || `Item-${idx}`;
      const itemId = `${slugify(vendor)}_${idx}_${slugify(itemName)}`;
      row.setAttribute('data-item-id', itemId);
      row.setAttribute('data-vendor-name', vendor);
      row.setAttribute('data-item-title', itemName);

      if (!inventoryState[itemId]) {
        inventoryState[itemId] = { loaded: false, packed: false };
      }

      // Check if already injected or pre-rendered in HTML (Compact SATSET)
      const existingSyncTd = row.querySelector('.sync-td');
      if (existingSyncTd) {
        const loadBtn = existingSyncTd.querySelector('.check-loading');
        const packBtn = existingSyncTd.querySelector('.check-packing');
        if (loadBtn) {
          loadBtn.setAttribute('data-item', itemId);
          loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleItemCheck(itemId, 'loading', vendor, itemName);
          });
        }
        if (packBtn) {
          packBtn.setAttribute('data-item', itemId);
          packBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleItemCheck(itemId, 'packing', vendor, itemName);
          });
        }
        renderRowUI(itemId, inventoryState[itemId]);
        return;
      }

      const tdLoading = document.createElement('td');
      tdLoading.className = 'sync-td';
      tdLoading.innerHTML = `
        <button type="button" class="inv-checkbox-btn check-loading" data-item="${itemId}" data-type="loading" role="checkbox" aria-checked="false" aria-label="Tandai pasang ${itemName}" title="Tandai Pasang">
          <svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      `;

      const tdPacking = document.createElement('td');
      tdPacking.className = 'sync-td';
      tdPacking.innerHTML = `
        <button type="button" class="inv-checkbox-btn check-packing" data-item="${itemId}" data-type="packing" role="checkbox" aria-checked="false" aria-label="Tandai kemas ${itemName}" title="Tandai Kemas">
          <svg class="check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      `;

      const rowCols = row.children;
      if (rowCols[0]) rowCols[0].setAttribute('title', rowCols[0].textContent.trim());
      if (rowCols[3]) rowCols[3].setAttribute('title', rowCols[3].textContent.trim());

      if (rowCols.length >= 4) {
        row.insertBefore(tdLoading, rowCols[3]);
        row.insertBefore(tdPacking, rowCols[4]);
      } else {
        row.appendChild(tdLoading);
        row.appendChild(tdPacking);
      }

      // Attach Click Listeners
      const loadBtn = tdLoading.querySelector('.check-loading');
      const packBtn = tdPacking.querySelector('.check-packing');

      loadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleItemCheck(itemId, 'loading', vendor, itemName);
      });

      packBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleItemCheck(itemId, 'packing', vendor, itemName);
      });

      // Render initial state
      renderRowUI(itemId, inventoryState[itemId]);
    });
  });

  // Render Row Checkboxes UI
  function renderRowUI(itemId, state, isRemote = false, remoteName = '') {
    if (!state) return;
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
    if (!row) return;

    // Highlight row in SATSET mode when item is loaded/pasang
    row.classList.toggle('is-loaded', Boolean(state.loaded));

    const loadBtn = row.querySelector('.check-loading');
    const packBtn = row.querySelector('.check-packing');

    if (loadBtn) {
      const isLoaded = Boolean(state.loaded);
      loadBtn.classList.toggle('checked', isLoaded);
      loadBtn.setAttribute('aria-checked', isLoaded ? 'true' : 'false');
      if (isLoaded) {
        const time = state.loaded_at ? new Date(state.loaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        loadBtn.title = `Dipasang oleh: ${state.loaded_by || 'Crew'} (${time})`;
      } else {
        loadBtn.title = 'Tandai Pasang';
      }
    }

    if (packBtn) {
      const isPacked = Boolean(state.packed);
      packBtn.classList.toggle('checked', isPacked);
      packBtn.setAttribute('aria-checked', isPacked ? 'true' : 'false');
      if (isPacked) {
        const time = state.packed_at ? new Date(state.packed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        packBtn.title = `Dikemas oleh: ${state.packed_by || 'Crew'} (${time})`;
      } else {
        packBtn.title = 'Tandai Kemas';
      }
    }

    if (isRemote) {
      row.classList.remove('remote-updated');
      void row.offsetWidth; // trigger reflow
      row.classList.add('remote-updated');
      setTimeout(() => { row.classList.remove('remote-updated'); }, 1200);

      const title = row.getAttribute('data-item-title') || 'Barang';
      showToast('Sinkronisasi Masuk', `${remoteName || 'Rekan kru'} memperbarui: ${title}`, 'info');
    }
  }

  // Recalculate Progress Meters
  function updateProgressMeters() {
    let loadedCount = 0;
    let packedCount = 0;
    const total = totalInventoryCount || Object.keys(inventoryState).length || 1;

    Object.keys(inventoryState).forEach((id) => {
      if (inventoryState[id]?.loaded) loadedCount++;
      if (inventoryState[id]?.packed) packedCount++;
    });

    const loadPct = Math.round((loadedCount / total) * 100);
    const packPct = Math.round((packedCount / total) * 100);

    if (loadingCounterDisplay) loadingCounterDisplay.textContent = `${loadedCount} / ${total} (${loadPct}%)`;
    if (packingCounterDisplay) packingCounterDisplay.textContent = `${packedCount} / ${total} (${packPct}%)`;
    if (loadingProgressBar) loadingProgressBar.style.width = `${loadPct}%`;
    if (packingProgressBar) packingProgressBar.style.width = `${packPct}%`;
  }

  updateProgressMeters();

  // Toggle Item Check (100% Supabase Cloud Driven)
  async function toggleItemCheck(itemId, type, vendor, itemName) {
    const currentState = inventoryState[itemId] || { loaded: false, packed: false };
    const by = getEffectiveCrewName();
    const now = new Date().toISOString();

    if (type === 'loading') {
      currentState.loaded = !currentState.loaded;
      currentState.loaded_by = currentState.loaded ? by : '';
      currentState.loaded_at = currentState.loaded ? now : null;
    } else if (type === 'packing') {
      currentState.packed = !currentState.packed;
      currentState.packed_by = currentState.packed ? by : '';
      currentState.packed_at = currentState.packed ? now : null;
    }

    inventoryState[itemId] = currentState;
    persistLocalState();

    // Optimistic UI update
    renderRowUI(itemId, currentState, false);
    updateProgressMeters();
    filterInventory(); // re-filter if status filter is active

    // 1. Layer 2: Broadcast to ntfy.sh Cloud Relay (instant SSE push to all crew devices)
    broadcastNtfyEvent({
      type: 'item_toggle',
      itemId: itemId,
      vendor: vendor,
      itemName: itemName,
      state: currentState,
      crew: by,
      sender: by,
      ts: Date.now()
    });

    // 2. Layer 1: Push to Supabase Cloud Database
    if (supabaseClient) {
      setSyncStatus('syncing', 'Menyinkronkan ke Cloud (Supabase + ntfy)...');
      try {
        const { error } = await supabaseClient
          .from('inventory_items')
          .upsert({
            item_id: itemId,
            vendor: vendor,
            item_name: itemName,
            loaded: currentState.loaded,
            loaded_by: currentState.loaded_by,
            loaded_at: currentState.loaded_at,
            packed: currentState.packed,
            packed_by: currentState.packed_by,
            packed_at: currentState.packed_at,
            updated_at: now
          }, { onConflict: 'item_id' });

        if (error) {
          console.warn('Supabase upsert warning:', error.message);
        }
        setSyncStatus('connected', 'Cloud Live (Supabase + ntfy.sh)');
      } catch (err) {
        console.error('Supabase sync error:', err);
        setSyncStatus('connected', 'Cloud Live (Supabase + ntfy.sh)');
      }
    }
  }

  // Copy Summary Handler
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', () => {
      let loadedCount = 0;
      let packedCount = 0;
      const total = totalInventoryCount || 150;

      const loadedList = [];
      const pendingLoadList = [];

      vendorBlocks.forEach((block) => {
        const vendor = block.getAttribute('data-vendor') || '';
        const rows = block.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const id = row.getAttribute('data-item-id');
          const title = row.getAttribute('data-item-title') || '';
          const state = inventoryState[id];
          if (state?.loaded) {
            loadedCount++;
            loadedList.push(`- [x] (${vendor}) ${title} - [Oleh: ${state.loaded_by || 'Crew'}]`);
          } else {
            pendingLoadList.push(`- [ ] (${vendor}) ${title}`);
          }
          if (state?.packed) packedCount++;
        });
      });

      const summaryText = `*RINGKASAN LOGISTIK IP26 - MULTIMEDIA & BROADCAST*\n` +
        `Update: ${new Date().toLocaleTimeString()} WIB\n\n` +
        `*Loading In*: ${loadedCount} / ${total} (${Math.round((loadedCount / total) * 100)}%)\n` +
        `*Packing Out*: ${packedCount} / ${total} (${Math.round((packedCount / total) * 100)}%)\n\n` +
        `*Barang Belum Siap Loading (${pendingLoadList.length})*:\n` +
        (pendingLoadList.slice(0, 10).join('\n') || 'Semua barang sudah terpasang!') +
        (pendingLoadList.length > 10 ? `\n...dan ${pendingLoadList.length - 10} barang lainnya.` : '') +
        `\n\nPortal: https://ip26-production.zzdree.workers.dev/`;

      navigator.clipboard.writeText(summaryText)
        .then(() => {
          if (isInventoryPage) {
            const originalHtml = btnCopySummary.innerHTML;
            btnCopySummary.innerHTML = '✓ Tersalin!';
            setTimeout(() => {
              btnCopySummary.innerHTML = originalHtml;
            }, 2000);
          } else {
            showToast('Ringkasan Disalin', 'Teks laporan logistik berhasil disalin ke clipboard!', 'success');
          }
        })
        .catch(() => {
          if (isInventoryPage) {
            const originalHtml = btnCopySummary.innerHTML;
            btnCopySummary.innerHTML = 'Gagal Menyalin';
            setTimeout(() => {
              btnCopySummary.innerHTML = originalHtml;
            }, 2000);
          } else {
            showToast('Gagal Menyalin', 'Izin clipboard ditolak peramban.', 'warning');
          }
        });
    });
  }

  function initSupabase(url, key) {
    if (!url || !key || typeof window.supabase === 'undefined') {
      setSyncStatus('offline', 'Mode Offline (Penyimpanan Lokal)');
      return;
    }

    try {
      setSyncStatus('syncing', 'Menghubungkan ke Supabase...');
      supabaseClient = window.supabase.createClient(url, key);

      // 1. Initial Fetch all existing items from database
      supabaseClient
        .from('inventory_items')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && Array.isArray(data)) {
            data.forEach((row) => {
              if (row.item_id) {
                inventoryState[row.item_id] = {
                  loaded: Boolean(row.loaded),
                  loaded_by: row.loaded_by || '',
                  loaded_at: row.loaded_at,
                  packed: Boolean(row.packed),
                  packed_by: row.packed_by || '',
                  packed_at: row.packed_at
                };
                renderRowUI(row.item_id, inventoryState[row.item_id]);
              }
            });
            persistLocalState();
            updateProgressMeters();
            filterInventory();
          }
          setSyncStatus('connected', 'Terhubung Supabase Cloud (Live Multi-Device)');
        })
        .catch(() => {
          setSyncStatus('connected', 'Terhubung Supabase Cloud (Live Multi-Device)');
        });

      // 2. Subscribe to Realtime PostgreSQL CDC Changes
      if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
      }

      realtimeChannel = supabaseClient
        .channel('ip26_realtime_inventory')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventory_items' },
          (payload) => {
            const row = payload.new;
            if (row && row.item_id) {
              const updatedState = {
                loaded: Boolean(row.loaded),
                loaded_by: row.loaded_by || '',
                loaded_at: row.loaded_at,
                packed: Boolean(row.packed),
                packed_by: row.packed_by || '',
                packed_at: row.packed_at
              };
              inventoryState[row.item_id] = updatedState;
              persistLocalState();
              renderRowUI(row.item_id, updatedState, true, row.loaded_by || row.packed_by);
              updateProgressMeters();
              filterInventory();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setSyncStatus('connected', 'Cloud Live (Layer 1: Supabase + Layer 2: ntfy.sh)');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setSyncStatus('syncing', 'Menghubungkan Cloud (ntfy Relay Aktif)...');
          }
        });

      // 3. Presence Channel for Online Crew Counting
      if (presenceChannel) {
        supabaseClient.removeChannel(presenceChannel);
      }

      presenceChannel = supabaseClient.channel('ip26_crew_presence');
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const userCount = Object.keys(state).length || 1;
          if (onlineCrewCount) onlineCrewCount.textContent = userCount;
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              user: getEffectiveCrewName(),
              online_at: new Date().toISOString()
            });
          }
        });

    } catch (e) {
      console.error('Failed to init Supabase:', e);
      setSyncStatus('syncing', '🟡 Menghubungkan Cloud (ntfy Relay Aktif)...');
    }
  }

  function setSyncStatus(state, message) {
    if (!syncStatusDot || !syncStatusText) return;
    syncStatusDot.className = 'status-pulse-dot';
    if (state === 'connected') syncStatusDot.classList.add('connected');
    if (state === 'syncing') syncStatusDot.classList.add('syncing');
    syncStatusText.textContent = message;
  }

  // Default Project Supabase Credentials (Zero-Config for all crew members)
  const DEFAULT_SUPABASE_URL = 'https://ssbkhhnnzwuykyeznpwd.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYmtoaG5uend1eWt5ZXpucHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDQ1NzcsImV4cCI6MjEwMjk4MDU3N30.-zGe_xWDTBmo604VS39jl8o7YvhEQYb3fZvCV-fcEbk';

  // Layer 2: ntfy.sh Realtime Cloud Relay (SSE Pub/Sub Zero-Setup)
  const NTFY_TOPIC = "ip26_checklist_sync_2026";
  const NTFY_PUB_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
  const NTFY_SSE_URL = `https://ntfy.sh/${NTFY_TOPIC}/sse`;

  let ntfyEventSource = null;
  let isNtfyConnected = false;

  function initNtfyRelay() {
    try {
      if (ntfyEventSource) {
        ntfyEventSource.close();
      }

      ntfyEventSource = new EventSource(NTFY_SSE_URL);

      ntfyEventSource.onopen = () => {
        isNtfyConnected = true;
      };

      ntfyEventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw && raw.message) {
            const payload = JSON.parse(raw.message);
            handleNtfyIncomingEvent(payload);
          }
        } catch (err) {
          void err; // Incomplete SSE frame chunk ignored
        }
      };

      ntfyEventSource.onerror = () => {
        isNtfyConnected = false;
      };
    } catch (err) {
      void err;
    }
  }

  function broadcastNtfyEvent(payload) {
    try {
      fetch(NTFY_PUB_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }).catch((err) => {
        void err; // Network offline or ntfy unreachable
      });
    } catch (err) {
      void err;
    }
  }

  function handleNtfyIncomingEvent(payload) {
    if (!payload || !payload.type) return;

    // Ignore self-echo within 3.5s
    const selfName = getEffectiveCrewName();
    if (payload.sender === selfName && (Date.now() - (payload.ts || 0) < 3500)) {
      return;
    }

    if (payload.type === 'item_toggle' && payload.itemId && payload.state) {
      const current = inventoryState[payload.itemId];
      if (!current || current.loaded !== payload.state.loaded || current.packed !== payload.state.packed) {
        inventoryState[payload.itemId] = {
          ...current,
          ...payload.state
        };
        persistLocalState();
        renderRowUI(payload.itemId, inventoryState[payload.itemId], true, payload.crew || 'Cloud Relay');
        updateProgressMeters();
        filterInventory();
      }
    } else if (payload.type === 'batch' && payload.actionType) {
      applyBatchLocalState(payload.actionType, payload.crew || 'Cloud Relay');
      showToast('Aksi Massal Cloud', `Aksi massal diterima dari ${payload.crew || 'rekan kru'} via Cloud Relay!`, 'info');
    }
  }

  function applyBatchLocalState(actionType, actorName) {
    const now = new Date().toISOString();
    const by = actorName || getEffectiveCrewName();

    vendorBlocks.forEach((block) => {
      const rows = block.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const itemId = row.getAttribute('data-item-id');
        if (!itemId) return;

        const currentState = inventoryState[itemId] || { loaded: false, packed: false };

        if (actionType === 'check-loading') {
          currentState.loaded = true;
          currentState.loaded_by = by;
          currentState.loaded_at = now;
        } else if (actionType === 'check-packing') {
          currentState.packed = true;
          currentState.packed_by = by;
          currentState.packed_at = now;
        } else if (actionType === 'check-all') {
          currentState.loaded = true;
          currentState.loaded_by = by;
          currentState.loaded_at = now;
          currentState.packed = true;
          currentState.packed_by = by;
          currentState.packed_at = now;
        } else if (actionType === 'uncheck-loading') {
          currentState.loaded = false;
          currentState.loaded_by = '';
          currentState.loaded_at = null;
        } else if (actionType === 'uncheck-packing') {
          currentState.packed = false;
          currentState.packed_by = '';
          currentState.packed_at = null;
        } else if (actionType === 'uncheck-all') {
          currentState.loaded = false;
          currentState.loaded_by = '';
          currentState.loaded_at = null;
          currentState.packed = false;
          currentState.packed_by = '';
          currentState.packed_at = null;
        }

        inventoryState[itemId] = currentState;
        renderRowUI(itemId, currentState, false);
      });
    });

    persistLocalState();
    updateProgressMeters();
    filterInventory();
  }

  // Always initialize Cloud Layers automatically
  initSupabase(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
  initNtfyRelay();

  // Direct Batch Action Handlers (Auto-executing with inline feedback on Inventory mobile, timed toast on desktop)
  if (btnBatchCheckAll) {
    btnBatchCheckAll.addEventListener('click', () => {
      batchSetAll(isInventoryPage ? 'check-loading' : 'check-all');
    });
  }

  if (btnBatchUncheckAll) {
    btnBatchUncheckAll.addEventListener('click', () => {
      batchSetAll(isInventoryPage ? 'uncheck-loading' : 'uncheck-all');
    });
  }

  async function batchSetAll(actionType) {
    applyBatchLocalState(actionType, getEffectiveCrewName());

    // Layer 2: Broadcast to ntfy.sh Cloud Relay
    broadcastNtfyEvent({
      type: 'batch',
      actionType: actionType,
      crew: getEffectiveCrewName(),
      sender: getEffectiveCrewName(),
      ts: Date.now()
    });

    const rowsToUpsert = [];
    vendorBlocks.forEach((block) => {
      const vendor = block.getAttribute('data-vendor') || '';
      const rows = block.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const itemId = row.getAttribute('data-item-id');
        const itemName = row.getAttribute('data-item-title') || '';
        if (!itemId) return;

        const currentState = inventoryState[itemId];
        if (currentState) {
          rowsToUpsert.push({
            item_id: itemId,
            vendor: vendor,
            item_name: itemName,
            loaded: currentState.loaded,
            loaded_by: currentState.loaded_by,
            loaded_at: currentState.loaded_at,
            packed: currentState.packed,
            packed_by: currentState.packed_by,
            packed_at: currentState.packed_at,
            updated_at: new Date().toISOString()
          });
        }
      });
    });

    const actionNames = {
      'check-loading': 'Semua barang berhasil ditandai Pasang (Loading In)!',
      'check-packing': 'Semua barang berhasil ditandai Kemas (Packing Out)!',
      'check-all': 'Semua barang ditandai Pasang & Kemas 100%!',
      'uncheck-loading': 'Status Pasang berhasil dikosongkan!',
      'uncheck-packing': 'Status Kemas berhasil dikosongkan!',
      'uncheck-all': 'Seluruh status checklist berhasil di-reset!'
    };

    if (isInventoryPage) {
      const activeBtn = actionType.startsWith('check') ? btnBatchCheckAll : btnBatchUncheckAll;
      if (activeBtn) {
        const origText = activeBtn.innerHTML;
        activeBtn.innerHTML = actionType.startsWith('check') ? '✓ Tercentang!' : '↺ Ter-reset!';
        setTimeout(() => { activeBtn.innerHTML = origText; }, 1600);
      }
    } else {
      showToast('Aksi Massal Selesai', actionNames[actionType] || 'Checklist inventaris diperbarui.', 'success');
    }

    if (supabaseClient && rowsToUpsert.length > 0) {
      setSyncStatus('syncing', 'Menyinkronkan aksi massal ke Cloud...');
      try {
        const chunkSize = 80;
        for (let i = 0; i < rowsToUpsert.length; i += chunkSize) {
          const chunk = rowsToUpsert.slice(i, i + chunkSize);
          await supabaseClient.from('inventory_items').upsert(chunk, { onConflict: 'item_id' });
        }
        setSyncStatus('connected', 'Cloud Live (Layer 1: Supabase + Layer 2: ntfy.sh)');
      } catch (err) {
        console.error('Supabase batch error:', err);
        setSyncStatus('connected', 'Cloud Live (Layer 1: Supabase + Layer 2: ntfy.sh)');
      }
    }
  }

  // License Modal Listeners
  const btnOpenLicense = document.getElementById('btn-open-license');
  const licenseModal = document.getElementById('license-modal');
  const btnCloseLicenseModal = document.getElementById('btn-close-license-modal');
  const btnDismissLicense = document.getElementById('btn-dismiss-license');

  if (btnOpenLicense) {
    btnOpenLicense.addEventListener('click', () => {
      if (licenseModal) licenseModal.style.display = 'flex';
    });
  }
  if (btnCloseLicenseModal) {
    btnCloseLicenseModal.addEventListener('click', () => {
      if (licenseModal) licenseModal.style.display = 'none';
    });
  }
  if (btnDismissLicense) {
    btnDismissLicense.addEventListener('click', () => {
      if (licenseModal) licenseModal.style.display = 'none';
    });
  }

  // 4. Live Multi-Dimensional Search & Dual Filter Engine
  const searchInput = document.getElementById('inv-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const statusPills = document.querySelectorAll('.status-pill');
  const countDisplay = document.getElementById('inv-count-display');

  let currentVendorFilter = 'all';
  let currentStatusFilter = 'all';
  let searchQuery = '';

  function filterInventory() {
    let visibleCount = 0;
    const query = searchQuery.toLowerCase().trim();

    vendorBlocks.forEach((block) => {
      const vendorName = block.getAttribute('data-vendor') || '';
      const matchesVendor = currentVendorFilter === 'all' || vendorName.toLowerCase() === currentVendorFilter.toLowerCase();
      
      const rows = block.querySelectorAll('tbody tr');
      let blockVisibleRows = 0;

      rows.forEach((row) => {
        const itemId = row.getAttribute('data-item-id');
        const state = inventoryState[itemId] || { loaded: false, packed: false };
        const rowText = row.innerText.toLowerCase();
        
        // 1. Text match
        const matchesSearch = query === '' || rowText.includes(query);

        // 2. Status match
        let matchesStatus = true;
        if (currentStatusFilter === 'loading-pending' || currentStatusFilter === 'unloaded') matchesStatus = !state.loaded;
        else if (currentStatusFilter === 'loading-ready' || currentStatusFilter === 'loaded') matchesStatus = state.loaded;
        else if (currentStatusFilter === 'packing-pending' || currentStatusFilter === 'unpacked') matchesStatus = !state.packed;
        else if (currentStatusFilter === 'packing-ready' || currentStatusFilter === 'packed') matchesStatus = state.packed;

        if (matchesVendor && matchesSearch && matchesStatus) {
          row.style.display = '';
          blockVisibleRows++;
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if (blockVisibleRows > 0) {
        block.style.display = '';
      } else {
        block.style.display = 'none';
      }
    });

    if (countDisplay) countDisplay.textContent = visibleCount;

    if (clearSearchBtn) {
      if (query.length > 0) clearSearchBtn.classList.add('visible');
      else clearSearchBtn.classList.remove('visible');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterInventory();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchInput.focus();
        filterInventory();
      }
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentVendorFilter = pill.getAttribute('data-filter') || 'all';
      filterInventory();
    });
  });

  statusPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      statusPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatusFilter = pill.getAttribute('data-status-filter') || 'all';
      filterInventory();
    });
  });

  // Initial filter run
  filterInventory();

  // 5. Scroll Progress & Scrollspy Navigation
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const sections = document.querySelectorAll('section[id], header[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileDockItems = document.querySelectorAll('.mobile-bottom-dock .dock-item[data-nav]');

  let isTicking = false;

  function updateScrollMetrics() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 1. Update Scroll Progress Bar
    if (scrollProgressBar && docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      scrollProgressBar.style.width = `${progress}%`;
      scrollProgressBar.setAttribute('aria-valuenow', Math.round(progress));
    }

    // 2. Update ScrollSpy Active Links
    const scrollPos = scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        mobileDockItems.forEach((dock) => {
          if (dock.getAttribute('data-nav') === id || (id === 'hero' && dock.getAttribute('data-nav') === 'hero')) {
            dock.classList.add('active');
          } else {
            dock.classList.remove('active');
          }
        });
      }
    });

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(updateScrollMetrics);
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollMetrics();

  // Mobile Navigation Drawer Controller
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerNavLinks = document.querySelectorAll('.drawer-nav-link');

  function openMobileDrawer() {
    if (mobileNavDrawer && mobileDrawerBackdrop) {
      mobileNavDrawer.classList.add('active');
      mobileDrawerBackdrop.classList.add('active');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'false');
      if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    if (mobileNavDrawer && mobileDrawerBackdrop) {
      mobileNavDrawer.classList.remove('active');
      mobileDrawerBackdrop.classList.remove('active');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'true');
      if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
  drawerNavLinks.forEach((link) => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // Keyboard Navigation & Escape key accessibility for Modals & Drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
        closeMobileDrawer();
        if (mobileMenuToggle) mobileMenuToggle.focus();
        return;
      }
      if (cloudConfigModal && cloudConfigModal.style.display === 'flex') {
        cloudConfigModal.style.display = 'none';
        if (btnOpenCloudConfig) btnOpenCloudConfig.focus();
      }
      if (licenseModal && licenseModal.style.display === 'flex') {
        licenseModal.style.display = 'none';
        if (btnOpenLicense) btnOpenLicense.focus();
      }
      if (batchActionModal && batchActionModal.style.display === 'flex') {
        batchActionModal.style.display = 'none';
      }
    }
  });

  // 6. Hero Ambient Wave & Particle Simulation
  const canvas = document.getElementById('hero-ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let animFrameId = null;

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: 400 };
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // Generate Particle Nodes
    const particles = [];
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 400),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    function renderAmbientMesh() {
      time += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
      const waveColor = isDark ? 'rgba(0, 210, 255, 0.08)' : 'rgba(2, 132, 199, 0.06)';
      const nodeColor = isDark ? 'rgba(0, 210, 255, 0.4)' : 'rgba(2, 132, 199, 0.35)';
      const lineColor = isDark ? 'rgba(0, 210, 255, 0.05)' : 'rgba(2, 132, 199, 0.04)';

      // 1. Draw Simulated 3D Broadcast Wave Grid
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = waveColor;

      const lines = 6;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        const baseOffsetY = (height * 0.45) + (l * 18);
        for (let x = 0; x <= width; x += 15) {
          const freq1 = Math.sin(x * 0.006 + time + l * 0.4) * 22;
          const freq2 = Math.cos(x * 0.012 - time * 0.8 + l) * 12;
          const mouseInfluence = Math.sin(x * 0.004 + mouseX * 2) * 16 * mouseY;
          const y = baseOffsetY + freq1 + freq2 + mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 2. Update & Connect Particle Telemetry Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.fillStyle = nodeColor;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = (1 - dist / 110);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(renderAmbientMesh);
    }

    renderAmbientMesh();
  }

  // 7. Dynamic Mermaid Engine (Transparent & Theme-Adaptive)
  let mermaidRenderCounter = 0;

  async function renderAllMermaid() {
    if (!window.mermaid) return;
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';

    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          darkMode: isDark,
          background: 'transparent',
          mainBkg: 'transparent',
          nodeBkg: 'transparent',
          nodeBorder: isDark ? '#484848' : '#d0c7b8',
          nodeTextColor: isDark ? '#f5f5f5' : '#1c1917',
          lineColor: isDark ? '#00d2ff' : '#0284c7',
          textColor: isDark ? '#f5f5f5' : '#1c1917',
          primaryColor: 'transparent',
          primaryTextColor: isDark ? '#f5f5f5' : '#1c1917',
          primaryBorderColor: isDark ? '#484848' : '#d0c7b8',
          clusterBkg: 'transparent',
          clusterBorder: isDark ? '#333333' : '#e5dfd3',
          titleColor: isDark ? '#f5f5f5' : '#1c1917',
          edgeLabelBackground: isDark ? '#1f1f1f' : '#ffffff'
        },
        themeCSS: `
          .node rect, .node circle, .node ellipse, .node polygon, .node path, .label-container, .basic.label-container {
            fill: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} !important;
            stroke: ${isDark ? '#333333' : '#e5dfd3'} !important;
            stroke-width: 1px !important;
            transition: stroke 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease;
          }
          .node:hover rect, .node:hover circle, .node:hover ellipse, .node:hover polygon, .node:hover path, .node:hover .label-container,
          .node:active rect, .node:active circle, .node:active ellipse, .node:active polygon, .node:active path, .node:active .label-container {
            stroke: #00d2ff !important;
            stroke-width: 2.5px !important;
            filter: drop-shadow(0 0 8px #00d2ff) !important;
            cursor: pointer;
          }
          .cluster rect {
            fill: transparent !important;
            stroke: ${isDark ? '#333333' : '#e5dfd3'} !important;
          }
          .edgeLabel {
            background-color: ${isDark ? '#1f1f1f' : '#ffffff'} !important;
            color: ${isDark ? '#cccccc' : '#44403c'} !important;
          }
          .flowchart-link, .edgePaths path, path.flowchart-link {
            stroke: ${isDark ? '#00d2ff' : '#0284c7'} !important;
          }
          .node .label, .nodeLabel, text, tspan, p, span, div {
            fill: ${isDark ? '#f5f5f5' : '#1c1917'} !important;
            color: ${isDark ? '#f5f5f5' : '#1c1917'} !important;
          }
        `,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });

      const mermaidNodes = document.querySelectorAll('.mermaid');
      for (let i = 0; i < mermaidNodes.length; i++) {
        const node = mermaidNodes[i];
        if (!node.getAttribute('data-mermaid-src')) {
          const currentText = node.textContent.trim();
          if (currentText && !currentText.startsWith('<') && !currentText.includes('mermaid-svg-')) {
            node.setAttribute('data-mermaid-src', currentText);
          }
        }
        const rawCode = node.getAttribute('data-mermaid-src');
        if (!rawCode) continue;

        mermaidRenderCounter++;
        const renderId = `mermaid-svg-${i}-${mermaidRenderCounter}`;
        try {
          const { svg } = await window.mermaid.render(renderId, rawCode);
          node.innerHTML = svg;
        } catch (renderErr) {
          console.warn(`Mermaid render failed for diagram ${i}:`, renderErr);
        }
      }
    } catch (err) {
      console.warn('Mermaid engine initialization warning:', err);
    }
  }

  // Initial render on boot with polling retry for deferred Mermaid loading
  function initMermaidWithRetry(retries = 15, delay = 100) {
    if (window.mermaid) {
      renderAllMermaid();
      return;
    }
    if (retries > 0) {
      setTimeout(() => initMermaidWithRetry(retries - 1, delay), delay);
    }
  }

  initMermaidWithRetry();
});
