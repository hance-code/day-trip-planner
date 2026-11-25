(() => {
  const STORAGE_KEY = "day_trip_planner_state_v1";

  const MODE_KEYS = ["transit", "car", "scooter", "walk"];

  let state = {
    trips: [],
    activeTripId: "",
    globalMode: "transit",
    peopleCount: 2,
    splitCarCost: true,
    highlightedStopId: null
  };

  // DOM References
  const el = {
    tripSelect: document.getElementById("tripSelect"),
    btnNewTrip: document.getElementById("btnNewTrip"),
    btnExport: document.getElementById("btnExport"),
    btnPrint: document.getElementById("btnPrint"),
    btnReset: document.getElementById("btnReset"),
    tripRegionBadge: document.getElementById("tripRegionBadge"),
    tripDurationBadge: document.getElementById("tripDurationBadge"),
    tripStopsBadge: document.getElementById("tripStopsBadge"),
    tripTitle: document.getElementById("tripTitle"),
    tripDescription: document.getElementById("tripDescription"),
    startTimeInput: document.getElementById("startTimeInput"),
    peopleCountInput: document.getElementById("peopleCountInput"),
    btnPeopleMinus: document.getElementById("btnPeopleMinus"),
    btnPeoplePlus: document.getElementById("btnPeoplePlus"),
    kpiPerPerson: document.getElementById("kpiPerPerson"),
    kpiGroupTotal: document.getElementById("kpiGroupTotal"),
    kpiDistance: document.getElementById("kpiDistance"),
    kpiTravelTime: document.getElementById("kpiTravelTime"),
    kpiEndTime: document.getElementById("kpiEndTime"),
    kpiFoodCount: document.getElementById("kpiFoodCount"),
    timelineContainer: document.getElementById("timelineContainer"),
    foodGrid: document.getElementById("foodGrid"),
    compareTableContainer: document.getElementById("compareTableContainer"),
    routeMapSvg: document.getElementById("routeMapSvg"),
    btnOpenFullMap: document.getElementById("btnOpenFullMap"),
    splitCarCostToggle: document.getElementById("splitCarCostToggle"),
    budgetDonutSvg: document.getElementById("budgetDonutSvg"),
    donutPerPerson: document.getElementById("donutPerPerson"),
    budgetBreakdownList: document.getElementById("budgetBreakdownList"),
    miscBudgetInput: document.getElementById("miscBudgetInput"),
    footerPerPerson: document.getElementById("footerPerPerson"),
    footerPeopleCount: document.getElementById("footerPeopleCount"),
    footerTotalGroup: document.getElementById("footerTotalGroup"),
    btnAddStop: document.getElementById("btnAddStop"),
    stopModal: document.getElementById("stopModal"),
    stopModalTitle: document.getElementById("stopModalTitle"),
    stopForm: document.getElementById("stopForm"),
    editStopId: document.getElementById("editStopId"),
    stopNameInput: document.getElementById("stopNameInput"),
    stopCategoryInput: document.getElementById("stopCategoryInput"),
    stopDurationInput: document.getElementById("stopDurationInput"),
    stopTicketCostInput: document.getElementById("stopTicketCostInput"),
    stopFoodCostInput: document.getElementById("stopFoodCostInput"),
    stopFoodItemsInput: document.getElementById("stopFoodItemsInput"),
    stopNoteInput: document.getElementById("stopNoteInput"),
    legDistanceInput: document.getElementById("legDistanceInput"),
    legTransitMin: document.getElementById("legTransitMin"),
    legTransitCost: document.getElementById("legTransitCost"),
    legCarMin: document.getElementById("legCarMin"),
    legCarCost: document.getElementById("legCarCost"),
    legScooterMin: document.getElementById("legScooterMin"),
    legScooterCost: document.getElementById("legScooterCost"),
    legWalkMin: document.getElementById("legWalkMin"),
    legRouteDescInput: document.getElementById("legRouteDescInput"),
    btnCloseStopModal: document.getElementById("btnCloseStopModal"),
    btnCancelStopModal: document.getElementById("btnCancelStopModal"),
    exportModal: document.getElementById("exportModal"),
    exportTextarea: document.getElementById("exportTextarea"),
    btnCloseExportModal: document.getElementById("btnCloseExportModal"),
    btnCopyExport: document.getElementById("btnCopyExport"),
    toast: document.getElementById("toast")
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNTD(val) {
    return `NT$ ${Math.round(val).toLocaleString("zh-TW")}`;
  }

  function parseTimeToMinutes(hhmm) {
    const [h, m] = (hhmm || "08:30").split(":").map(Number);
    return (Number.isFinite(h) ? h : 8) * 60 + (Number.isFinite(m) ? m : 30);
  }

  function formatMinutesToHHMM(totalMin) {
    const normalized = ((totalMin % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function formatDurationLabel(mins) {
    if (mins < 60) return `${mins} 分鐘`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} 小時` : `${h} 小時 ${m} 分`;
  }

  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.toast.classList.add("hidden");
    }, 2400);
  }

  function initDefaultState() {
    const clonedTrips = deepClone(PRESET_TRIPS).map((trip) => {
      trip.stops.forEach((s) => {
        if (s.legFromPrev) {
          s.legFromPrev.selectedMode = trip.defaultMode || "transit";
          s.legFromPrev.expandedCompare = false;
        }
      });
      return trip;
    });
    state = {
      trips: clonedTrips,
      activeTripId: clonedTrips[0].id,
      globalMode: clonedTrips[0].defaultMode || "transit",
      peopleCount: 2,
      splitCarCost: true,
      highlightedStopId: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        initDefaultState();
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.trips) && parsed.trips.length > 0) {
        state = {
          trips: parsed.trips,
          activeTripId: parsed.activeTripId || parsed.trips[0].id,
          globalMode: parsed.globalMode || "transit",
          peopleCount: Math.max(1, Math.min(20, Number(parsed.peopleCount) || 2)),
          splitCarCost: parsed.splitCarCost !== false,
          highlightedStopId: null
        };
      } else {
        initDefaultState();
      }
    } catch {
      initDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }

  function getActiveTrip() {
    return state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
  }

  function getLegMode(leg) {
    if (!leg) return state.globalMode;
    return leg.selectedMode || state.globalMode;
  }

  function computeLegPerPersonCost(leg, mode) {
    if (!leg || !leg.modes || !leg.modes[mode]) return 0;
    const rawCost = Number(leg.modes[mode].cost) || 0;
    if (TRANSPORT_META[mode].shareable && state.splitCarCost) {
      return rawCost / Math.max(1, state.peopleCount);
    }
    return rawCost;
  }

  // Compute full schedule and metrics for the active trip
  function computeTripMetrics(trip) {
    let cursorMin = parseTimeToMinutes(trip.defaultStartTime);
    let totalDistanceKm = 0;
    let totalTravelMin = 0;
    let totalStayMin = 0;
    let transportCostPerPerson = 0;
    let foodCostPerPerson = 0;
    let ticketCostPerPerson = 0;
    let foodItemsCount = 0;

    const scheduledStops = trip.stops.map((stop, idx) => {
      let legInfo = null;
      if (idx > 0 && stop.legFromPrev) {
        const mode = getLegMode(stop.legFromPrev);
        const modeData = stop.legFromPrev.modes[mode] || { minutes: 0, cost: 0, detail: "" };
        const dist = Number(stop.legFromPrev.distanceKm) || 0;
        const mins = Number(modeData.minutes) || 0;
        const perPersonLegCost = computeLegPerPersonCost(stop.legFromPrev, mode);

        cursorMin += mins;
        totalDistanceKm += dist;
        totalTravelMin += mins;
        transportCostPerPerson += perPersonLegCost;

        legInfo = {
          mode,
          distanceKm: dist,
          minutes: mins,
          rawCost: Number(modeData.cost) || 0,
          perPersonCost: perPersonLegCost,
          detail: modeData.detail || "",
          routeDesc: stop.legFromPrev.routeDesc || "",
          expandedCompare: Boolean(stop.legFromPrev.expandedCompare),
          modes: stop.legFromPrev.modes
        };
      }

      const arrivalMin = cursorMin;
      const stayMin = Number(stop.duration) || 30;
      const departureMin = arrivalMin + stayMin;
      cursorMin = departureMin;
      totalStayMin += stayMin;

      foodCostPerPerson += Number(stop.foodCost) || 0;
      ticketCostPerPerson += Number(stop.ticketCost) || 0;
      foodItemsCount += (stop.foodItems || []).length;

      return {
        ...stop,
        index: idx,
        arrivalStr: formatMinutesToHHMM(arrivalMin),
        departureStr: formatMinutesToHHMM(departureMin),
        legInfo
      };
    });

    const miscPerPerson = Number(trip.miscBudget) || 0;
    const perPersonTotal = transportCostPerPerson + foodCostPerPerson + ticketCostPerPerson + miscPerPerson;
    const groupTotal = perPersonTotal * state.peopleCount;
    const totalTripMin = totalTravelMin + totalStayMin;

    return {
      scheduledStops,
      totalDistanceKm,
      totalTravelMin,
      totalStayMin,
      totalTripMin,
      endTimeStr: scheduledStops.length ? scheduledStops[scheduledStops.length - 1].departureStr : trip.defaultStartTime,
      transportCostPerPerson,
      foodCostPerPerson,
      ticketCostPerPerson,
      miscPerPerson,
      perPersonTotal,
      groupTotal,
      foodItemsCount
    };
  }

  function renderTripSelect() {
    el.tripSelect.innerHTML = state.trips
      .map((t) => `<option value="${escapeHtml(t.id)}" ${t.id === state.activeTripId ? "selected" : ""}>${escapeHtml(t.title)}</option>`)
      .join("");
  }

  function renderSegmentedButtons() {
    document.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === state.globalMode);
    });
  }

  function renderHeroAndKPIs(trip, metrics) {
    el.tripRegionBadge.textContent = trip.region || "自訂路線";
    el.tripDurationBadge.textContent = `總行程約 ${formatDurationLabel(metrics.totalTripMin)}`;
    el.tripStopsBadge.textContent = `${trip.stops.length} 個站點`;
    el.tripTitle.textContent = trip.title;
    el.tripDescription.textContent = trip.description || "可自由新增景點、美食與調整交通方式。";
    el.startTimeInput.value = trip.defaultStartTime || "08:30";
    el.peopleCountInput.value = state.peopleCount;
    el.splitCarCostToggle.checked = state.splitCarCost;
    el.miscBudgetInput.value = trip.miscBudget ?? 300;

    el.kpiPerPerson.textContent = formatNTD(metrics.perPersonTotal);
    el.kpiGroupTotal.textContent = `全團 (${state.peopleCount}人) 共 ${formatNTD(metrics.groupTotal)}`;
    el.kpiDistance.textContent = `${metrics.totalDistanceKm.toFixed(1)} km`;
    el.kpiTravelTime.textContent = `移動約 ${formatDurationLabel(metrics.totalTravelMin)}`;
    el.kpiEndTime.textContent = metrics.endTimeStr;
    el.kpiFoodCount.textContent = `收錄 ${metrics.foodItemsCount} 項美食亮點`;
  }

  function buildGoogleMapSingleUrl(stop) {
    if (Number.isFinite(stop.lat) && Number.isFinite(stop.lng)) {
      return `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}`;
  }

  function buildGoogleMapRouteUrl(stops, mode) {
    if (!stops.length) return "https://www.google.com/maps";
    const travelmode = mode === "walk" ? "walking" : mode === "transit" ? "transit" : "driving";
    if (stops.length === 1) return buildGoogleMapSingleUrl(stops[0]);
    const fmt = (s) => (Number.isFinite(s.lat) && Number.isFinite(s.lng) ? `${s.lat},${s.lng}` : encodeURIComponent(s.name));
    const origin = fmt(stops[0]);
    const destination = fmt(stops[stops.length - 1]);
    const waypoints = stops.slice(1, -1).map(fmt).join("|");
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelmode}`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    return url;
  }

  function renderTimeline(trip, metrics) {
    if (!metrics.scheduledStops.length) {
      el.timelineContainer.innerHTML = `
        <div class="stop-card" style="text-align:center;padding:36px 20px;">
          <p class="muted">目前還沒有任何站點，點擊右上角「＋ 新增景點 / 美食」開始規劃吧！</p>
        </div>`;
      return;
    }

    const html = metrics.scheduledStops
      .map((stop, idx) => {
        const cat = CATEGORY_META[stop.category] || CATEGORY_META.attraction;
        const isHighlighted = state.highlightedStopId === stop.id;
        let legHtml = "";

        if (idx > 0 && stop.legInfo) {
          const leg = stop.legInfo;
          const prevStop = metrics.scheduledStops[idx - 1];
          const dirUrl = buildGoogleMapRouteUrl([prevStop, stop], leg.mode);
          const modeOptions = MODE_KEYS.map(
            (m) => `<option value="${m}" ${m === leg.mode ? "selected" : ""}>${TRANSPORT_META[m].icon} ${TRANSPORT_META[m].label}</option>`
          ).join("");

          const compareChips = MODE_KEYS.map((m) => {
            const mData = leg.modes[m] || { minutes: 0, cost: 0, detail: "" };
            const perCost = computeLegPerPersonCost(stop.legFromPrev, m);
            return `
              <button type="button" class="leg-compare-chip ${m === leg.mode ? "active" : ""}"
                data-action="pick-leg-mode" data-stop-id="${escapeHtml(stop.id)}" data-mode="${m}">
                <strong>${TRANSPORT_META[m].icon} ${TRANSPORT_META[m].label}</strong>
                <span>${mData.minutes} 分 · ${formatNTD(perCost)}/人</span>
              </button>`;
          }).join("");

          legHtml = `
            <div class="leg-connector">
              <div class="leg-top">
                <div class="leg-summary">
                  <select class="leg-mode-select" data-action="change-leg-mode" data-stop-id="${escapeHtml(stop.id)}" aria-label="選擇此段交通方式">
                    ${modeOptions}
                  </select>
                  <span class="leg-metrics">${leg.distanceKm.toFixed(1)} km · 約 ${leg.minutes} 分鐘</span>
                  <span class="leg-cost-pill">${formatNTD(leg.perPersonCost)} /人</span>
                </div>
                <div class="leg-actions">
                  <button type="button" class="text-link" data-action="toggle-leg-compare" data-stop-id="${escapeHtml(stop.id)}">
                    ${leg.expandedCompare ? "收合比較 ▲" : "比較交通方式 ▼"}
                  </button>
                  <a class="text-link" href="${dirUrl}" target="_blank" rel="noopener noreferrer">導航 ↗</a>
                </div>
              </div>
              <div class="leg-desc">🛣️ ${escapeHtml(leg.routeDesc)}（${escapeHtml(leg.detail)}）</div>
              ${leg.expandedCompare ? `<div class="leg-compare-drawer">${compareChips}</div>` : ""}
            </div>`;
        }

        const foodChips = (stop.foodItems || [])
          .map((item) => `<span class="food-chip">🍴 ${escapeHtml(item)}</span>`)
          .join("");

        return `
          ${legHtml}
          <article class="stop-card ${isHighlighted ? "highlighted" : ""}" id="stop-card-${escapeHtml(stop.id)}" data-stop-id="${escapeHtml(stop.id)}">
            <div class="stop-card-top">
              <div class="stop-title-group">
                <div class="stop-index ${escapeHtml(stop.category)}">${idx + 1}</div>
                <div>
                  <div class="stop-time-row">
                    <span class="time-pill">${stop.arrivalStr} - ${stop.departureStr}</span>
                    <span>停留 ${stop.duration} 分</span>
                    <span class="cat-badge ${cat.badgeClass}">${cat.icon} ${cat.label}</span>
                  </div>
                  <h4 class="stop-name">${escapeHtml(stop.name)}</h4>
                </div>
              </div>
              <div class="stop-controls">
                <button class="icon-btn" type="button" title="上移" data-action="move-up" data-stop-id="${escapeHtml(stop.id)}" ${idx === 0 ? "disabled" : ""}>↑</button>
                <button class="icon-btn" type="button" title="下移" data-action="move-down" data-stop-id="${escapeHtml(stop.id)}" ${idx === metrics.scheduledStops.length - 1 ? "disabled" : ""}>↓</button>
                <button class="icon-btn" type="button" title="編輯" data-action="edit-stop" data-stop-id="${escapeHtml(stop.id)}">✏️</button>
                <button class="icon-btn" type="button" title="刪除" data-action="delete-stop" data-stop-id="${escapeHtml(stop.id)}">🗑️</button>
              </div>
            </div>
            <div class="stop-meta">
              ${stop.note ? `<p class="stop-note">${escapeHtml(stop.note)}</p>` : ""}
              ${foodChips ? `<div class="stop-tags">${foodChips}</div>` : ""}
              <div class="stop-footer">
                <div class="cost-badges">
                  <span class="cost-pill">🎫 門票/體驗 ${formatNTD(stop.ticketCost)}</span>
                  <span class="cost-pill">🍜 餐飲估計 ${formatNTD(stop.foodCost)}</span>
                </div>
                <a class="text-link" href="${buildGoogleMapSingleUrl(stop)}" target="_blank" rel="noopener noreferrer">地圖位置 ↗</a>
              </div>
            </div>
          </article>`;
      })
      .join("");

    el.timelineContainer.innerHTML = html;
  }

  function renderFoodTab(metrics) {
    const foodStops = metrics.scheduledStops.filter(
      (s) => (s.foodItems && s.foodItems.length > 0) || s.foodCost > 0 || s.category === "food" || s.category === "cafe"
    );

    if (!foodStops.length) {
      el.foodGrid.innerHTML = `<p class="muted">尚無美食推薦項目。</p>`;
      return;
    }

    el.foodGrid.innerHTML = foodStops
      .map((stop) => {
        const cat = CATEGORY_META[stop.category] || CATEGORY_META.food;
        const chips = (stop.foodItems || []).map((f) => `<span class="food-chip">🍴 ${escapeHtml(f)}</span>`).join("");
        return `
          <div class="food-card">
            <div class="stop-time-row">
              <span class="time-pill">第 ${stop.index + 1} 站 · ${stop.arrivalStr}</span>
              <span class="cat-badge ${cat.badgeClass}">${cat.icon} ${cat.label}</span>
            </div>
            <h4>${escapeHtml(stop.name)}</h4>
            <p class="stop-note">${escapeHtml(stop.note || "必吃美食停靠點")}</p>
            <div class="stop-tags">${chips}</div>
            <div class="stop-footer">
              <span class="cost-pill">預估每人 ${formatNTD(stop.foodCost)}</span>
              <a class="text-link" href="${buildGoogleMapSingleUrl(stop)}" target="_blank" rel="noopener noreferrer">查看店家 ↗</a>
            </div>
          </div>`;
      })
      .join("");
  }

  function renderCompareTab(trip) {
    const rows = MODE_KEYS.map((mode) => {
      let totalMin = 0;
      let totalPerPerson = 0;
      let totalGroup = 0;
      trip.stops.forEach((s, idx) => {
        if (idx > 0 && s.legFromPrev && s.legFromPrev.modes[mode]) {
          const m = s.legFromPrev.modes[mode];
          totalMin += Number(m.minutes) || 0;
          const raw = Number(m.cost) || 0;
          if (TRANSPORT_META[mode].shareable && state.splitCarCost) {
            totalPerPerson += raw / Math.max(1, state.peopleCount);
            totalGroup += raw;
          } else {
            totalPerPerson += raw;
            totalGroup += raw * state.peopleCount;
          }
        }
      });

      const isCurrent = state.globalMode === mode;
      return `
        <tr class="${isCurrent ? "active-row" : ""}">
          <td><strong>${TRANSPORT_META[mode].icon} ${TRANSPORT_META[mode].label}</strong><br><span class="muted">${TRANSPORT_META[mode].note}</span></td>
          <td><strong>${formatDurationLabel(totalMin)}</strong></td>
          <td><strong>${formatNTD(totalPerPerson)}</strong></td>
          <td>${formatNTD(totalGroup)}</td>
          <td>
            <button type="button" class="btn ${isCurrent ? "btn-primary" : "btn-secondary"}" data-action="apply-global-mode" data-mode="${mode}">
              ${isCurrent ? "使用中" : "套用此方式"}
            </button>
          </td>
        </tr>`;
    }).join("");

    el.compareTableContainer.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>交通工具</th>
            <th>總移動時間</th>
            <th>每人交通費</th>
            <th>全團交通費 (${state.peopleCount}人)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderRouteMap(trip, metrics) {
    const stops = metrics.scheduledStops;
    el.btnOpenFullMap.href = buildGoogleMapRouteUrl(stops, state.globalMode);

    if (!stops.length) {
      el.routeMapSvg.innerHTML = `<text x="210" y="150" text-anchor="middle" fill="#64748b" font-size="14">尚無站點可繪製路線</text>`;
      return;
    }

    const width = 420;
    const height = 300;
    const padX = 52;
    const padY = 44;

    // Normalize coordinates; synthesize smooth snake path if stops lack lat/lng
    const coords = stops.map((s, i) => {
      if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) {
        return { lat: s.lat, lng: s.lng, hasGeo: true };
      }
      return { lat: 25 - i * 0.02, lng: 121 + (i % 2 === 0 ? 0.01 : 0.04), hasGeo: false };
    });

    const lats = coords.map((c) => c.lat);
    const lngs = coords.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(0.008, maxLat - minLat);
    const lngSpan = Math.max(0.008, maxLng - minLng);

    const points = coords.map((c, idx) => {
      if (stops.length === 1) return { x: width / 2, y: height / 2, stop: stops[0] };
      const nx = (c.lng - minLng) / lngSpan;
      const ny = 1 - (c.lat - minLat) / latSpan;
      return {
        x: padX + nx * (width - padX * 2),
        y: padY + ny * (height - padY * 2),
        stop: stops[idx]
      };
    });

    // Subtle grid background
    let svg = `
      <defs>
        <pattern id="mapGrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#ebe6da" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#mapGrid)" />`;

    // Route segments + duration tags
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const leg = p2.stop.legInfo;
      const modeIcon = leg ? TRANSPORT_META[leg.mode].icon : "";
      const minText = leg ? `${modeIcon} ${leg.minutes}m` : "";

      svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#0f766e" stroke-width="3" stroke-dasharray="6 4" opacity="0.82" />`;
      if (minText) {
        svg += `
          <g transform="translate(${mx.toFixed(1)}, ${my.toFixed(1)})">
            <rect x="-24" y="-10" width="48" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="0" y="3" text-anchor="middle" font-size="10" font-weight="600" fill="#0f766e">${minText}</text>
          </g>`;
      }
    }

    // Stop Pins
    const catColors = {
      attraction: "#0f766e",
      food: "#d95d39",
      cafe: "#d97706",
      shopping: "#4f46e5"
    };

    points.forEach((pt, idx) => {
      const color = catColors[pt.stop.category] || "#1e293b";
      const isActive = state.highlightedStopId === pt.stop.id;
      const shortName = pt.stop.name.split("（")[0].split("&")[0].trim().slice(0, 8);
      const labelY = pt.y > height - 34 ? pt.y - 18 : pt.y + 23;

      svg += `
        <g class="map-node" data-stop-id="${escapeHtml(pt.stop.id)}" style="cursor:pointer;">
          ${isActive ? `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="19" fill="${color}" opacity="0.22" />` : ""}
          <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="13" fill="${color}" stroke="#ffffff" stroke-width="2.5" />
          <text x="${pt.x.toFixed(1)}" y="${(pt.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">${idx + 1}</text>
          <text x="${pt.x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="#1e293b" stroke="#f8f6f0" stroke-width="3" paint-order="stroke">${escapeHtml(shortName)}</text>
        </g>`;
    });

    el.routeMapSvg.innerHTML = svg;
  }

  function renderBudget(metrics) {
    const items = [
      { label: "🚕 交通路程費", value: metrics.transportCostPerPerson, color: "#0f766e" },
      { label: "🍜 美食餐飲費", value: metrics.foodCostPerPerson, color: "#d95d39" },
      { label: "🎫 門票與體驗", value: metrics.ticketCostPerPerson, color: "#4f46e5" },
      { label: "🎁 伴手禮 / 預備金", value: metrics.miscPerPerson, color: "#d97706" }
    ];

    const total = Math.max(1, metrics.perPersonTotal);
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const circles = items
      .map((item) => {
        const pct = item.value / total;
        const dash = pct * circumference;
        const circle = `<circle cx="80" cy="80" r="${radius}" fill="transparent" stroke="${item.color}" stroke-width="18" stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" />`;
        offset += dash;
        return circle;
      })
      .join("");

    el.budgetDonutSvg.innerHTML = `
      <circle cx="80" cy="80" r="${radius}" fill="transparent" stroke="#eeeae1" stroke-width="18" />
      ${circles}`;

    el.donutPerPerson.textContent = formatNTD(metrics.perPersonTotal);

    el.budgetBreakdownList.innerHTML = items
      .map((item) => {
        const pct = metrics.perPersonTotal > 0 ? Math.round((item.value / metrics.perPersonTotal) * 100) : 0;
        return `
          <li class="budget-item">
            <div class="budget-item-row">
              <span><span class="budget-dot" style="background:${item.color}"></span>${item.label}</span>
              <strong>${formatNTD(item.value)} <span class="muted">(${pct}%)</span></strong>
            </div>
            <div class="budget-bar-bg">
              <div class="budget-bar-fill" style="width:${pct}%;background:${item.color};"></div>
            </div>
          </li>`;
      })
      .join("");

    el.footerPerPerson.textContent = formatNTD(metrics.perPersonTotal);
    el.footerPeopleCount.textContent = state.peopleCount;
    el.footerTotalGroup.textContent = formatNTD(metrics.groupTotal);
  }

  function renderAll() {
    const trip = getActiveTrip();
    const metrics = computeTripMetrics(trip);
    renderTripSelect();
    renderSegmentedButtons();
    renderHeroAndKPIs(trip, metrics);
    renderTimeline(trip, metrics);
    renderFoodTab(metrics);
    renderCompareTab(trip);
    renderRouteMap(trip, metrics);
    renderBudget(metrics);
    saveState();
  }

  // Modal helpers
  function openStopModal(stopId = null) {
    const trip = getActiveTrip();
    const stop = stopId ? trip.stops.find((s) => s.id === stopId) : null;

    if (stop) {
      el.stopModalTitle.textContent = "編輯站點";
      el.editStopId.value = stop.id;
      el.stopNameInput.value = stop.name;
      el.stopCategoryInput.value = stop.category;
      el.stopDurationInput.value = stop.duration;
      el.stopTicketCostInput.value = stop.ticketCost;
      el.stopFoodCostInput.value = stop.foodCost;
      el.stopFoodItemsInput.value = (stop.foodItems || []).join(", ");
      el.stopNoteInput.value = stop.note || "";

      const leg = stop.legFromPrev;
      el.legDistanceInput.value = leg ? leg.distanceKm : 2.0;
      el.legTransitMin.value = leg ? leg.modes.transit.minutes : 20;
      el.legTransitCost.value = leg ? leg.modes.transit.cost : 25;
      el.legCarMin.value = leg ? leg.modes.car.minutes : 12;
      el.legCarCost.value = leg ? leg.modes.car.cost : 150;
      el.legScooterMin.value = leg ? leg.modes.scooter.minutes : 10;
      el.legScooterCost.value = leg ? leg.modes.scooter.cost : 30;
      el.legWalkMin.value = leg ? leg.modes.walk.minutes : 30;
      el.legRouteDescInput.value = leg ? leg.routeDesc : "";
    } else {
      el.stopModalTitle.textContent = "新增景點 / 美食站點";
      el.editStopId.value = "";
      el.stopForm.reset();
      el.stopDurationInput.value = 60;
      el.stopTicketCostInput.value = 0;
      el.stopFoodCostInput.value = 150;
      el.legDistanceInput.value = 2.5;
      el.legTransitMin.value = 20;
      el.legTransitCost.value = 25;
      el.legCarMin.value = 12;
      el.legCarCost.value = 160;
      el.legScooterMin.value = 10;
      el.legScooterCost.value = 25;
      el.legWalkMin.value = 32;
      el.legRouteDescInput.value = "市區接駁前往下一站";
    }

    el.stopModal.classList.remove("hidden");
  }

  function closeStopModal() {
    el.stopModal.classList.add("hidden");
  }

  function generateExportText() {
    const trip = getActiveTrip();
    const metrics = computeTripMetrics(trip);
    const lines = [
      `🧭 【${trip.title}】`,
      `📍 地區：${trip.region}｜人數：${state.peopleCount} 人｜出發：${trip.defaultStartTime} ～ 預計結束：${metrics.endTimeStr}`,
      `📏 總距離：${metrics.totalDistanceKm.toFixed(1)} km｜總車程：${formatDurationLabel(metrics.totalTravelMin)}`,
      `💰 預估每人總花費：${formatNTD(metrics.perPersonTotal)}（全團共 ${formatNTD(metrics.groupTotal)}）`,
      `   - 交通費：${formatNTD(metrics.transportCostPerPerson)}/人`,
      `   - 美食費：${formatNTD(metrics.foodCostPerPerson)}/人`,
      `   - 門票費：${formatNTD(metrics.ticketCostPerPerson)}/人`,
      `   - 預備金：${formatNTD(metrics.miscPerPerson)}/人`,
      "",
      "━━━ 詳細行程與交通路線 ━━━"
    ];

    metrics.scheduledStops.forEach((s, idx) => {
      if (idx > 0 && s.legInfo) {
        const meta = TRANSPORT_META[s.legInfo.mode];
        lines.push(`   ↓ ${meta.icon} ${meta.label}｜${s.legInfo.distanceKm.toFixed(1)} km・約 ${s.legInfo.minutes} 分・${formatNTD(s.legInfo.perPersonCost)}/人`);
        lines.push(`     路線：${s.legInfo.routeDesc}`);
      }
      const cat = CATEGORY_META[s.category] || CATEGORY_META.attraction;
      lines.push(`${idx + 1}. [${s.arrivalStr}-${s.departureStr}] ${cat.icon} ${s.name}（停留 ${s.duration} 分）`);
      if (s.foodItems && s.foodItems.length) {
        lines.push(`   🍴 推薦美食：${s.foodItems.join("、")}`);
      }
      if (s.note) lines.push(`   📝 筆記：${s.note}`);
      lines.push(`   💵 門票 ${formatNTD(s.ticketCost)}｜餐飲 ${formatNTD(s.foodCost)}`);
    });

    return lines.join("\n");
  }

  // Event Bindings
  el.tripSelect.addEventListener("change", (e) => {
    state.activeTripId = e.target.value;
    const trip = getActiveTrip();
    state.globalMode = trip.defaultMode || "transit";
    state.highlightedStopId = null;
    renderAll();
  });

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      state.globalMode = mode;
      const trip = getActiveTrip();
      trip.defaultMode = mode;
      trip.stops.forEach((s) => {
        if (s.legFromPrev) s.legFromPrev.selectedMode = mode;
      });
      renderAll();
      showToast(`已切換全程交通為「${TRANSPORT_META[mode].label}」`);
    });
  });

  el.startTimeInput.addEventListener("change", (e) => {
    getActiveTrip().defaultStartTime = e.target.value || "08:30";
    renderAll();
  });

  el.btnPeopleMinus.addEventListener("click", () => {
    state.peopleCount = Math.max(1, state.peopleCount - 1);
    renderAll();
  });

  el.btnPeoplePlus.addEventListener("click", () => {
    state.peopleCount = Math.min(20, state.peopleCount + 1);
    renderAll();
  });

  el.peopleCountInput.addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10);
    state.peopleCount = Number.isFinite(val) ? Math.max(1, Math.min(20, val)) : 1;
    renderAll();
  });

  el.splitCarCostToggle.addEventListener("change", (e) => {
    state.splitCarCost = e.target.checked;
    renderAll();
  });

  el.miscBudgetInput.addEventListener("change", (e) => {
    const val = Math.max(0, Number(e.target.value) || 0);
    getActiveTrip().miscBudget = val;
    renderAll();
  });

  // View Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => {
        const active = b.dataset.tab === tab;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((p) => {
        p.classList.toggle("active", p.id === `tab-${tab}`);
      });
    });
  });

  // Timeline delegated actions
  el.timelineContainer.addEventListener("change", (e) => {
    const target = e.target;
    if (target.dataset.action === "change-leg-mode") {
      const trip = getActiveTrip();
      const stop = trip.stops.find((s) => s.id === target.dataset.stopId);
      if (stop && stop.legFromPrev) {
        stop.legFromPrev.selectedMode = target.value;
        renderAll();
      }
    }
  });

  el.timelineContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const stopId = btn.dataset.stopId;
    const trip = getActiveTrip();
    const idx = trip.stops.findIndex((s) => s.id === stopId);
    if (idx === -1) return;

    if (action === "toggle-leg-compare") {
      const leg = trip.stops[idx].legFromPrev;
      if (leg) {
        leg.expandedCompare = !leg.expandedCompare;
        renderAll();
      }
    } else if (action === "pick-leg-mode") {
      const leg = trip.stops[idx].legFromPrev;
      if (leg) {
        leg.selectedMode = btn.dataset.mode;
        renderAll();
      }
    } else if (action === "move-up" && idx > 0) {
      const [item] = trip.stops.splice(idx, 1);
      trip.stops.splice(idx - 1, 0, item);
      // Ensure moved stop keeps a leg object if no longer index 0, and index 0 has null
      trip.stops.forEach((s, i) => {
        if (i === 0) s.legFromPrev = null;
        else if (!s.legFromPrev) {
          s.legFromPrev = {
            distanceKm: 2.0,
            routeDesc: "前往下一站路線",
            selectedMode: state.globalMode,
            modes: {
              transit: { minutes: 20, cost: 25, detail: "大眾運輸" },
              car: { minutes: 12, cost: 150, detail: "開車/計程車" },
              scooter: { minutes: 10, cost: 25, detail: "騎機車" },
              walk: { minutes: 30, cost: 0, detail: "步行" }
            }
          };
        }
      });
      renderAll();
    } else if (action === "move-down" && idx < trip.stops.length - 1) {
      const [item] = trip.stops.splice(idx, 1);
      trip.stops.splice(idx + 1, 0, item);
      trip.stops.forEach((s, i) => {
        if (i === 0) s.legFromPrev = null;
        else if (!s.legFromPrev) {
          s.legFromPrev = {
            distanceKm: 2.0,
            routeDesc: "前往下一站路線",
            selectedMode: state.globalMode,
            modes: {
              transit: { minutes: 20, cost: 25, detail: "大眾運輸" },
              car: { minutes: 12, cost: 150, detail: "開車/計程車" },
              scooter: { minutes: 10, cost: 25, detail: "騎機車" },
              walk: { minutes: 30, cost: 0, detail: "步行" }
            }
          };
        }
      });
      renderAll();
    } else if (action === "edit-stop") {
      openStopModal(stopId);
    } else if (action === "delete-stop") {
      trip.stops.splice(idx, 1);
      if (trip.stops.length > 0) trip.stops[0].legFromPrev = null;
      renderAll();
      showToast("已刪除站點");
    }
  });

  // Compare Tab apply button
  el.compareTableContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='apply-global-mode']");
    if (!btn) return;
    const mode = btn.dataset.mode;
    state.globalMode = mode;
    const trip = getActiveTrip();
    trip.defaultMode = mode;
    trip.stops.forEach((s) => {
      if (s.legFromPrev) s.legFromPrev.selectedMode = mode;
    });
    renderAll();
    showToast(`已將全程套用為「${TRANSPORT_META[mode].label}」`);
  });

  // Map click-to-highlight
  el.routeMapSvg.addEventListener("click", (e) => {
    const node = e.target.closest(".map-node");
    if (!node) return;
    const stopId = node.dataset.stopId;
    state.highlightedStopId = stopId;
    renderAll();
    const card = document.getElementById(`stop-card-${stopId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // Add / Edit Stop Modal
  el.btnAddStop.addEventListener("click", () => openStopModal(null));
  el.btnCloseStopModal.addEventListener("click", closeStopModal);
  el.btnCancelStopModal.addEventListener("click", closeStopModal);

  el.stopForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const trip = getActiveTrip();
    const editId = el.editStopId.value;
    const foodItems = el.stopFoodItemsInput.value
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const legObj = {
      distanceKm: Math.max(0, Number(el.legDistanceInput.value) || 0),
      routeDesc: el.legRouteDescInput.value.trim() || "前往此站路線",
      selectedMode: state.globalMode,
      expandedCompare: false,
      modes: {
        transit: { minutes: Math.max(0, Number(el.legTransitMin.value) || 0), cost: Math.max(0, Number(el.legTransitCost.value) || 0), detail: "大眾運輸" },
        car: { minutes: Math.max(0, Number(el.legCarMin.value) || 0), cost: Math.max(0, Number(el.legCarCost.value) || 0), detail: "開車/計程車" },
        scooter: { minutes: Math.max(0, Number(el.legScooterMin.value) || 0), cost: Math.max(0, Number(el.legScooterCost.value) || 0), detail: "騎機車" },
        walk: { minutes: Math.max(0, Number(el.legWalkMin.value) || 0), cost: 0, detail: "步行/單車" }
      }
    };

    if (editId) {
      const stop = trip.stops.find((s) => s.id === editId);
      if (stop) {
        const isFirst = trip.stops[0].id === stop.id;
        stop.name = el.stopNameInput.value.trim();
        stop.category = el.stopCategoryInput.value;
        stop.duration = Math.max(10, Number(el.stopDurationInput.value) || 60);
        stop.ticketCost = Math.max(0, Number(el.stopTicketCostInput.value) || 0);
        stop.foodCost = Math.max(0, Number(el.stopFoodCostInput.value) || 0);
        stop.foodItems = foodItems;
        stop.note = el.stopNoteInput.value.trim();
        if (!isFirst) {
          const prevSelected = stop.legFromPrev?.selectedMode || state.globalMode;
          stop.legFromPrev = { ...legObj, selectedMode: prevSelected };
        }
        showToast("站點已更新");
      }
    } else {
      const isFirst = trip.stops.length === 0;
      const newStop = {
        id: `custom-${Date.now()}`,
        name: el.stopNameInput.value.trim(),
        category: el.stopCategoryInput.value,
        duration: Math.max(10, Number(el.stopDurationInput.value) || 60),
        ticketCost: Math.max(0, Number(el.stopTicketCostInput.value) || 0),
        foodCost: Math.max(0, Number(el.stopFoodCostInput.value) || 0),
        foodItems,
        note: el.stopNoteInput.value.trim(),
        lat: null,
        lng: null,
        legFromPrev: isFirst ? null : legObj
      };
      trip.stops.push(newStop);
      showToast("已新增站點到行程");
    }

    closeStopModal();
    renderAll();
  });

  // New Custom Trip
  el.btnNewTrip.addEventListener("click", () => {
    const title = prompt("請輸入新的一日遊行程名稱：", "我的專屬一日遊");
    if (!title || !title.trim()) return;
    const region = prompt("請輸入地區（例如：台北信義區 / 花蓮市區）：", "自訂城市") || "自訂行程";
    const newId = `trip-${Date.now()}`;
    const newTrip = {
      id: newId,
      title: title.trim(),
      region: region.trim(),
      description: "自由規劃的專屬一日遊路線，點擊「＋ 新增景點 / 美食」建立站點。",
      defaultStartTime: "09:00",
      defaultMode: "transit",
      miscBudget: 300,
      stops: []
    };
    state.trips.unshift(newTrip);
    state.activeTripId = newId;
    state.globalMode = "transit";
    renderAll();
    showToast("已建立自訂空白行程！");
  });

  // Export & Print & Reset
  el.btnExport.addEventListener("click", () => {
    el.exportTextarea.value = generateExportText();
    el.exportModal.classList.remove("hidden");
  });

  el.btnCloseExportModal.addEventListener("click", () => {
    el.exportModal.classList.add("hidden");
  });

  el.btnCopyExport.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el.exportTextarea.value);
      showToast("已複製行程表到剪貼簿！");
    } catch {
      el.exportTextarea.select();
      document.execCommand("copy");
      showToast("已複製行程表！");
    }
  });

  el.btnPrint.addEventListener("click", () => window.print());

  el.btnReset.addEventListener("click", () => {
    if (!confirm("確定要重置所有自訂編輯並恢復預設的一日遊範例嗎？")) return;
    localStorage.removeItem(STORAGE_KEY);
    initDefaultState();
    renderAll();
    showToast("已恢復預設一日遊資料");
  });

  // Bootstrap
  loadState();
  renderAll();
})();
