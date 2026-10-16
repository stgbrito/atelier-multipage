/* ==========================================================================
   Juana de Jesús • Atelier | Lógica Principal, Carrusel Lookbook,
   Sincronización con Google Sheets & Google Drive
   ========================================================================== */

const OFFICIAL_PHONE = "18097944253";
const BRAND_NAME = "Juana de Jesús • Atelier";
const DEFAULT_GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1Sh4pLxgeu8_fhWzOBY6FSZVMOmWHk6ehTfw3rSv2qyY/gviz/tq?tqx=out:csv";

// Mapeo de archivos físicos locales descargados de Google Drive (Carga ultra rápida sin latencia)
const LOCAL_DRIVE_ASSETS = {
  "1IDsRMNFf05EBUMcfvA09rXwKMf1T2XlT": "assets/images/xv-armonia-esmeralda-jardin.jpg",
  "1Okz9XMLR_PIydqW0BuvBWWm9PEDK5w3L": "assets/images/xv-majestad-esmeralda-ilusion.jpg",
  "1M3b2EHohw6Hi2E9e-Qn7VgYXYcGIpW2o": "assets/images/xv-princesa-ensueno-mini-falda.jpg",
  "1h1m2K_LtTSFu40ztvzYhvSiTXq3S7e8F": "assets/images/xv-reina-esmeralda-encaje-espalda.jpg",
  "1ySZnEpbOE23P_dJtUGmrjWmr8PalY4iz": "assets/images/xv-esencia-botanica-princesa.jpg",
  "18rJ4m0ZriKCSrz3VvcyPZFwjJYIqXWNj": "assets/images/cumpleanos-turquesa-ilusion.jpg",
  "1--_uDFzQeqwJfouiJdUPDwLUsTlhd0QC": "assets/images/novia-reina-encaje-tul-completo.jpg",
  "18fuAyAgEN0nvZOWPOaO_U-sWkiY3wcbm": "assets/images/novia-jardin-real-imperio.jpg",
  "1HkFXkLLr_1aF8zebFfOFIfZ0IqWuAE_7": "assets/images/novia-reina-encaje-tul-corpino.jpg"
};

const CUMPLEANOS_DRIVE_IDS = new Set([
  "1h1m2K_LtTSFu40ztvzYhvSiTXq3S7e8F",
  "1M3b2EHohw6Hi2E9e-Qn7VgYXYcGIpW2o",
  "1ySZnEpbOE23P_dJtUGmrjWmr8PalY4iz",
  "1Okz9XMLR_PIydqW0BuvBWWm9PEDK5w3L",
  "1IDsRMNFf05EBUMcfvA09rXwKMf1T2XlT",
  "18rJ4m0ZriKCSrz3VvcyPZFwjJYIqXWNj"
]);

const CATEGORY_DESCRIPTIONS = {
  todos: "Desliza hacia los lados para recorrer nuestras piezas reales y toca cualquier fotografía para verla en pantalla completa.",
  cumpleanos: "Especialidad en vestidos de quinceañeras (XV años), sesiones fotográficas, cumpleaños infantiles y celebraciones especiales.",
  bodas: "Vestidos de novia a medida y cortejos nupciales armonizados (matching) para madres, madrinas y damas de honor.",
  gala: "Diseños de alta distinción para graduaciones, investiduras académicas, cenas de gala y recepciones formales.",
  ejecutiva: "Uniformes ejecutivos individuales, trajes sastre y vestimenta ministerial de dama para abogadas, maestras y líderes de iglesia."
};

function createDressSVG(primaryColor, accentColor, labelText, silhouetteType) {
  let dressPath = "";
  if (silhouetteType === "gala" || silhouetteType === "cumpleanos") {
    dressPath = `<path d="M165 95 C185 108, 215 108, 235 95 L248 165 C225 178, 175 178, 152 165 Z" fill="${primaryColor}"/>
                 <path d="M152 165 C120 260, 95 360, 75 450 L325 450 C305 360, 280 260, 248 165 Z" fill="${primaryColor}"/>`;
  } else if (silhouetteType === "bodas") {
    dressPath = `<path d="M140 110 L185 110 L195 170 L130 170 Z" fill="${primaryColor}"/>
                 <path d="M130 170 L105 445 L215 445 L195 170 Z" fill="${primaryColor}"/>
                 <path d="M215 105 L265 105 L275 170 L205 170 Z" fill="${accentColor}"/>
                 <path d="M205 170 L190 445 L295 445 L275 170 Z" fill="${accentColor}"/>`;
  } else {
    dressPath = `<path d="M150 95 L250 95 L268 235 L132 235 Z" fill="${primaryColor}"/>
                 <path d="M180 95 L200 175 L220 95" stroke="${accentColor}" stroke-width="4" fill="none"/>
                 <path d="M142 235 L135 445 L192 445 L198 285 L204 445 L265 445 L258 235 Z" fill="#2A2421"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="#EFE8DD"/>
    <circle cx="200" cy="220" r="135" fill="#FAF6F0"/>
    ${dressPath}
    <rect x="24" y="455" width="352" height="28" rx="6" fill="#1C1815" opacity="0.85"/>
    <text x="200" y="473" text-anchor="middle" fill="#FAF8F5" font-family="Georgia, serif" font-size="10.5" letter-spacing="1.4">${labelText}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function extractDriveId(rawUrl) {
  if (!rawUrl) return "";
  const m = rawUrl.trim().match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{20,})/);
  return m && m[1] ? m[1] : "";
}

function normalizeImageUrl(rawUrl) {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  const fid = extractDriveId(trimmed);
  if (fid) {
    if (LOCAL_DRIVE_ASSETS[fid]) return LOCAL_DRIVE_ASSETS[fid];
    return `https://drive.google.com/thumbnail?id=${fid}&sz=w1200`;
  }
  return trimmed;
}

// Obras Reales Integradas de la carpeta de Google Drive
const REAL_UPLOADED_ITEMS = [
  {
    id: 909,
    driveId: "1IDsRMNFf05EBUMcfvA09rXwKMf1T2XlT",
    title: "Vestido de XV 'Armonía Esmeralda Real' (Gala en Jardín)",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Tul Imperial Verde Esmeralda y Recamado Dorado • A Medida",
    desc: "Diseño de quinceañera a medida con escote hombros caídos y medallones bordados en hilo dorado sobre falda princesa de gran volumen.",
    image: LOCAL_DRIVE_ASSETS["1IDsRMNFf05EBUMcfvA09rXwKMf1T2XlT"]
  },
  {
    id: 905,
    driveId: "1Okz9XMLR_PIydqW0BuvBWWm9PEDK5w3L",
    title: "Vestido de XV 'Majestad Esmeralda' (Escote Ilusión)",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Tul Esmeralda, Bordados y Transparencia Geométrica • A Medida",
    desc: "Exclusivo diseño de quince años confeccionado a la medida, presentando un corpiño con escote redondo y transparencias frontales estratégicas, falda amplia de tul con brillo y acabado de alta costura.",
    image: LOCAL_DRIVE_ASSETS["1Okz9XMLR_PIydqW0BuvBWWm9PEDK5w3L"]
  },
  {
    id: 907,
    driveId: "1M3b2EHohw6Hi2E9e-Qn7VgYXYcGIpW2o",
    title: "Vestido de Cumpleaños y XV 'Princesa de Ensueño'",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Corsé Estructurado con Varillas y Mini Falda de Tul • A Medida",
    desc: "Obra exclusiva de nuestro Atelier: conjunto de corsé con varillas expuestas en tonos nude/crema, acompañado de una falda corta de tul en capas ideal para cumpleaños y sesión fotográfica.",
    image: LOCAL_DRIVE_ASSETS["1M3b2EHohw6Hi2E9e-Qn7VgYXYcGIpW2o"]
  },
  {
    id: 908,
    driveId: "1h1m2K_LtTSFu40ztvzYhvSiTXq3S7e8F",
    title: "Vestido de XV 'Reina Esmeralda y Encaje' (Corsé Espalda)",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Encaje Floral Dorado, Corsé Ajustable y Tul Esmeralda • A Medida",
    desc: "Obra real confeccionada en nuestro Atelier: corpiño estilo corsé con escote hombros caídos, espalda ajustable con lazo decorativo y falda amplia de tul esmeralda con destellos dorados.",
    image: LOCAL_DRIVE_ASSETS["1h1m2K_LtTSFu40ztvzYhvSiTXq3S7e8F"]
  },
  {
    id: 906,
    driveId: "1ySZnEpbOE23P_dJtUGmrjWmr8PalY4iz",
    title: "Vestido de XV 'Esencia Botánica' (Silueta Princesa)",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Tul Esmeralda con Bordados Dorados y Cauda • A Medida",
    desc: "Captura de nuestra obra en exteriores: toma de perfil destacando la caída fluida de la falda de tul verde esmeralda y bordados artesanales.",
    image: LOCAL_DRIVE_ASSETS["1ySZnEpbOE23P_dJtUGmrjWmr8PalY4iz"]
  },
  {
    id: 904,
    driveId: "18rJ4m0ZriKCSrz3VvcyPZFwjJYIqXWNj",
    title: "Vestido de Cumpleaños y Ceremonia 'Turquesa Ilusión'",
    category: "cumpleanos",
    categoryLabel: "Cumpleaños y XV Años",
    meta: "Organza Tornasolada, Fajín Satinado y Lazo con Broche • A Medida",
    desc: "Obra real confeccionada en nuestro Atelier: diseño infantil y juvenil en organza turquesa de caída vaporosa, fajín estructurado y lazo artesanal con aplique de pedrería para cumpleaños y ceremonias.",
    image: LOCAL_DRIVE_ASSETS["18rJ4m0ZriKCSrz3VvcyPZFwjJYIqXWNj"]
  },
  {
    id: 903,
    driveId: "1--_uDFzQeqwJfouiJdUPDwLUsTlhd0QC",
    title: "Vestido de Novia 'Reina de Encaje y Tul' (Cuerpo Completo)",
    category: "bodas",
    categoryLabel: "Bodas y Cortejos",
    meta: "Encaje Floral Bordado, Perlas y Tul Ilusión • A Medida",
    desc: "Obra real confeccionada en nuestro Atelier: corpiño de encaje bordado con escote hombros caídos, cinturón de perlas a mano y falda amplia de tul con destellos.",
    image: LOCAL_DRIVE_ASSETS["1--_uDFzQeqwJfouiJdUPDwLUsTlhd0QC"]
  },
  {
    id: 902,
    driveId: "18fuAyAgEN0nvZOWPOaO_U-sWkiY3wcbm",
    title: "Vestido Nupcial 'Jardín Real' (Corte Imperio y Tul)",
    category: "bodas",
    categoryLabel: "Bodas y Cortejos",
    meta: "Encaje Texturizado y Tul Suave de Caída Libre • A Medida",
    desc: "Diseño nupcial real confeccionado a las medidas exactas de la novia, con bustier de encaje floral, tirantes delicados y falda vaporosa ideal para ceremonias al aire libre o salón.",
    image: LOCAL_DRIVE_ASSETS["18fuAyAgEN0nvZOWPOaO_U-sWkiY3wcbm"]
  },
  {
    id: 901,
    driveId: "1HkFXkLLr_1aF8zebFfOFIfZ0IqWuAE_7",
    title: "Vestido de Novia 'Reina de Encaje y Tul' (Detalle Corpiño)",
    category: "bodas",
    categoryLabel: "Bodas y Cortejos",
    meta: "Encaje Floral Bordado y Cinturón de Perlas • A Medida",
    desc: "Detalle de entalle artesanal: corpiño de encaje bordado con escote hombros caídos y cinturón de perlas cosido a mano en nuestro Atelier.",
    image: LOCAL_DRIVE_ASSETS["1HkFXkLLr_1aF8zebFfOFIfZ0IqWuAE_7"]
  }
];

const DEFAULT_ITEMS = [
  ...REAL_UPLOADED_ITEMS,
  {
    id: 1,
    title: "Vestido de Graduación y Ceremonia 'Terracota Imperial'",
    category: "gala",
    categoryLabel: "Graduaciones y Gala",
    meta: "Crepé de Seda & Drapeado Manual • 3 a 4 semanas",
    desc: "Diseño de gala a medida para graduaciones, investiduras universitarias, cenas de gala y ceremonias especiales con entalle de corsetería interna.",
    image: "assets/images/gala-terracota.svg"
  },
  {
    id: 2,
    title: "Traje Sastre y Uniforme Ejecutivo Individual 'Magistrada'",
    category: "ejecutiva",
    categoryLabel: "Sastrería Ejecutiva",
    meta: "Crepé Sastre y Lino Estructurado • 2 a 3 semanas",
    desc: "Sastrería femenina y uniforme individual a medida para abogadas, maestras, directoras académicas y ejecutivas que buscan ir con porte distinguido.",
    image: "assets/images/sastreria-ejecutiva.svg"
  },
  {
    id: 3,
    title: "Conjunto Ministerial y Líder de Iglesia 'Gracia Real'",
    category: "ejecutiva",
    categoryLabel: "Sastrería Ministerial",
    meta: "Mikado y Crepé de Alta Caída • 2 a 3 semanas",
    desc: "Diseño elegante, sobrio y distinguido confeccionado a las medidas exactas para pastoras, líderes de iglesia, adoradoras y congresos eclesiásticos.",
    image: "assets/images/sastreria-ministerial.svg"
  },
  {
    id: 4,
    title: "Vestido de Ceremonia y Recepción 'Esmeralda Real'",
    category: "gala",
    categoryLabel: "Graduaciones y Gala",
    meta: "Mikado de Seda & Acabado Artesanal • 3 semanas",
    desc: "Silueta midi de alta distinción para ceremonias académicas, actos formales, aniversarios y recepciones de tarde o noche.",
    image: "assets/images/graduacion-gala.svg"
  },
  {
    id: 5,
    title: "Armonía Nupcial (Cortejos de Boda y Madrinas Matching)",
    category: "bodas",
    categoryLabel: "Bodas y Cortejos",
    meta: "Paleta Coordinada a Medida • Reserva con 6 a 8 semanas",
    desc: "Especialidad en vestidos coordinados (matching) para madres de los novios, madrinas y cortejo de damas, adaptando el diseño a cada silueta femenina.",
    image: "assets/images/novias-cortejo.svg"
  }
];

let portfolioItems = [...DEFAULT_ITEMS];
let currentFilter = "todos";
let currentLightboxIndex = 0;

function safeGetStorage(key) {
  try { return localStorage.getItem(key) || ""; } catch (_) { return ""; }
}

function safeSetStorage(key, val) {
  try { localStorage.setItem(key, val); } catch (_) {}
}

function safeRemoveStorage(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}

function getCurrentFilteredItems() {
  return currentFilter === "todos"
    ? portfolioItems
    : portfolioItems.filter(item => item.category === currentFilter);
}

function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentVal += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentVal += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentVal);
        currentVal = "";
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        currentRow.push(currentVal);
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
      } else {
        currentVal += ch;
      }
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}

function resolveItemCategory(catRaw, title, desc, fid) {
  const raw = (catRaw || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const combinedText = `${title} ${desc}`.toLowerCase();
  if (
    CUMPLEANOS_DRIVE_IDS.has(fid) ||
    raw.includes("cumple") ||
    raw.includes("xv") ||
    raw.includes("quince") ||
    raw.includes("celebracion") ||
    /\bxv\b|quincea|cumplea/i.test(combinedText)
  ) {
    return "cumpleanos";
  }
  if (raw.includes("boda") || raw.includes("novia")) return "bodas";
  if (raw.includes("ejecutiv") || raw.includes("sastrer") || raw.includes("iglesia") || raw.includes("uniforme") || raw.includes("ministeri")) return "ejecutiva";
  if (raw === "caballeros") return "skip";
  return "gala";
}

function parseRowsToItems(rows, startId) {
  const categoryMap = {
    cumpleanos: "Cumpleaños y XV Años",
    bodas: "Bodas y Cortejos",
    gala: "Graduaciones y Gala",
    ejecutiva: "Sastrería Ejecutiva e Iglesia"
  };
  if (!rows || rows.length <= 1) return [];
  const header0 = (rows[0][0] || "").toLowerCase();
  const offset = (header0.includes("marca temporal") || header0.includes("timestamp")) ? 1 : 0;

  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = r[offset] || "";
    const catRaw = r[offset + 1] || "gala";
    const meta = r[offset + 2] || "";
    const desc = r[offset + 3] || "";
    const fotoUrl = r[offset + 4] || "";
    const activo = r[offset + 5] || "SI";

    if (!title.trim() || activo.trim().toUpperCase() === "NO") continue;
    const fid = extractDriveId(fotoUrl);
    const category = resolveItemCategory(catRaw, title, desc, fid);
    if (category === "skip") continue;

    items.push({
      id: startId + i,
      driveId: fid,
      title: title.trim(),
      category,
      categoryLabel: categoryMap[category] || "Alta Costura",
      meta: meta.trim() || "Confección a Medida • Bajo Cita",
      desc: desc.trim() || "Diseño exclusivo confeccionado a medida en nuestro Atelier.",
      image: normalizeImageUrl(fotoUrl) || createDressSVG("#8C4A32", "#B89158", title.toUpperCase().slice(0, 22), category)
    });
  }
  return items;
}

async function fetchSheetTabCSV(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) return [];
    return parseCSV(text);
  } catch (_) {
    return [];
  }
}

async function loadGoogleSheetCatalog() {
  const showcaseImg = document.getElementById("heroShowcaseImg");
  if (showcaseImg) {
    showcaseImg.src = LOCAL_DRIVE_ASSETS["1IDsRMNFf05EBUMcfvA09rXwKMf1T2XlT"];
  }

  renderPortfolio();

  const csvInput = document.getElementById("sheetCsvUrlInput");
  const csvUrl = safeGetStorage("atelier_sheet_csv_url") || DEFAULT_GOOGLE_SHEET_CSV_URL;
  if (csvInput) csvInput.value = csvUrl;
  if (!csvUrl) return;

  try {
    const sheetIdMatch = csvUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    let combined = [];
    if (sheetIdMatch && sheetIdMatch[1]) {
      const sid = sheetIdMatch[1];
      const baseGviz = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv`;
      const [formRowsEn, formRowsEs, baseRows] = await Promise.all([
        fetchSheetTabCSV(`${baseGviz}&sheet=${encodeURIComponent("Form Responses 1")}`),
        fetchSheetTabCSV(`${baseGviz}&sheet=${encodeURIComponent("Respuestas de formulario 1")}`),
        fetchSheetTabCSV(baseGviz)
      ]);
      const formItemsEn = parseRowsToItems(formRowsEn, 2000).reverse();
      const formItemsEs = parseRowsToItems(formRowsEs, 1000).reverse();
      const baseItems = parseRowsToItems(baseRows, 1);

      const seenDriveIds = new Set();
      const seenTitles = new Set();
      for (const item of [...formItemsEn, ...formItemsEs, ...REAL_UPLOADED_ITEMS, ...baseItems]) {
        if (item.driveId && seenDriveIds.has(item.driveId)) continue;
        const titleKey = item.title.toLowerCase();
        if (seenTitles.has(titleKey)) continue;
        if (item.driveId) seenDriveIds.add(item.driveId);
        seenTitles.add(titleKey);
        combined.push(item);
      }
    } else {
      const rows = await fetchSheetTabCSV(csvUrl);
      combined = parseRowsToItems(rows, 1);
    }
    if (combined.length > 0) {
      portfolioItems = combined;
      renderPortfolio();
    }
  } catch (e) {
    console.info("Mostrando catálogo base integrado:", e.message);
  }
}

/* ==========================================================================
   Carousel Lookbook Navigation
   ========================================================================== */
function scrollLookbook(direction) {
  const carousel = document.getElementById("portfolioGrid");
  if (!carousel) return;
  const scrollAmount = Math.max(310, Math.round(carousel.clientWidth * 0.72));
  carousel.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

function updateCarouselProgress() {
  const carousel = document.getElementById("portfolioGrid");
  const bar = document.getElementById("carouselProgressBar");
  if (!carousel || !bar) return;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  if (maxScroll <= 5) {
    bar.style.width = "100%";
    return;
  }
  const ratio = Math.min(1, Math.max(0, carousel.scrollLeft / maxScroll));
  const pct = 20 + Math.round(ratio * 80);
  bar.style.width = pct + "%";
}

function filterPortfolio(category, btnEl) {
  currentFilter = category;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  const noteEl = document.getElementById("categoryContextNote");
  if (noteEl && CATEGORY_DESCRIPTIONS[category]) {
    noteEl.textContent = CATEGORY_DESCRIPTIONS[category];
  }
  renderPortfolio();
  const carousel = document.getElementById("portfolioGrid");
  if (carousel) carousel.scrollTo({ left: 0, behavior: "smooth" });
}

function renderPortfolio() {
  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const filtered = getCurrentFilteredItems();

  const countEl = document.getElementById("carouselCountLabel");
  if (countEl) {
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "pieza" : "piezas"}`;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "portfolio-card";
    const safeTitle = item.title.replace(/'/g, "\\'");
    card.innerHTML = `
      <div class="card-media" onclick="openLightbox(${item.id})" title="Toca para ampliar foto">
        <span class="card-tag sans">${item.categoryLabel}</span>
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <span class="zoom-hint sans">🔍 Toca para ampliar</span>
      </div>
      <div class="card-body sans">
        <div>
          <h3>${item.title}</h3>
          <div class="card-meta">${item.meta}</div>
        </div>
        <div class="card-footer-actions">
          <button class="card-link-view" onclick="openLightbox(${item.id})">🔍 Ver en grande</button>
          <button class="card-link-wa" onclick="inquireItemWhatsApp('${safeTitle}', '${item.categoryLabel}')">
            💬 Consultar
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  updateCarouselProgress();
}

/* ==========================================================================
   Lightbox Full-Screen Photo Modal
   ========================================================================== */
function renderLightboxSlide() {
  const items = getCurrentFilteredItems();
  if (!items.length) return;
  if (currentLightboxIndex < 0) currentLightboxIndex = items.length - 1;
  if (currentLightboxIndex >= items.length) currentLightboxIndex = 0;

  const item = items[currentLightboxIndex];
  const imgEl = document.getElementById("lightboxImg");
  if (!imgEl) return;

  imgEl.style.opacity = "0.35";
  setTimeout(() => {
    imgEl.src = item.image;
    imgEl.alt = item.title;
    imgEl.style.opacity = "1";
  }, 70);

  const catEl = document.getElementById("lightboxCategory");
  const titleEl = document.getElementById("lightboxTitle");
  const descEl = document.getElementById("lightboxDesc");
  const metaEl = document.getElementById("lightboxMeta");
  const counterEl = document.getElementById("lightboxCounter");
  const waBtn = document.getElementById("lightboxWaBtn");

  if (catEl) catEl.textContent = item.categoryLabel;
  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.desc;
  if (metaEl) metaEl.textContent = item.meta;
  if (counterEl) counterEl.textContent = `${currentLightboxIndex + 1} / ${items.length} • Desliza ‹ ›`;
  if (waBtn) {
    waBtn.onclick = function() {
      inquireItemWhatsApp(item.title, item.categoryLabel);
    };
  }
}

function openLightbox(itemId) {
  const modal = document.getElementById("lightboxModal");
  if (!modal) return;
  const items = getCurrentFilteredItems();
  const idx = items.findIndex(i => Number(i.id) === Number(itemId));
  currentLightboxIndex = idx >= 0 ? idx : 0;
  renderLightboxSlide();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function navigateLightbox(direction) {
  const items = getCurrentFilteredItems();
  if (!items.length) return;
  currentLightboxIndex = (currentLightboxIndex + direction + items.length) % items.length;
  renderLightboxSlide();
}

function closeLightbox() {
  const modal = document.getElementById("lightboxModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

/* ==========================================================================
   Header Mobile Menu & Form Presets
   ========================================================================== */
function toggleMobileMenu() {
  const nav = document.getElementById("mainNav");
  const btn = document.querySelector(".menu-toggle");
  if (!nav) return;
  nav.classList.toggle("open");
  if (btn) {
    btn.textContent = nav.classList.contains("open") ? "✕ Cerrar" : "☰ Menú";
  }
}

function presetServiceMode(modeValue) {
  const select = document.getElementById("clientMode");
  if (!select) return;
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.includes(modeValue.split(" ")[0])) {
      select.selectedIndex = i;
      break;
    }
  }
  handleModeChange();
}

function handleModeChange() {
  const modeEl = document.getElementById("clientMode");
  const alertBox = document.getElementById("domicilioAlert");
  const citySelect = document.getElementById("clientCity");
  if (!modeEl || !alertBox || !citySelect) return;

  const isDomicilio = modeEl.value.includes("Domicilio");
  alertBox.style.display = isDomicilio ? "block" : "none";

  if (isDomicilio) {
    citySelect.innerHTML = `
      <option value="Santo Domingo">Santo Domingo (Domicilio con pago adelantado)</option>
      <option value="Bonao">Bonao (Domicilio con pago adelantado)</option>
      <option value="Santiago">Santiago (Domicilio con pago adelantado)</option>
    `;
  } else {
    citySelect.innerHTML = `
      <option value="Villa Altagracia">Villa Altagracia</option>
      <option value="Santo Domingo">Santo Domingo (Visita al Atelier)</option>
      <option value="Bonao">Bonao (Visita al Atelier)</option>
      <option value="Santiago">Santiago (Visita al Atelier)</option>
      <option value="San Cristóbal">San Cristóbal (Visita al Atelier)</option>
      <option value="Otra ciudad">Otra ciudad (Visita al Atelier)</option>
    `;
  }
}

function handleServiceChange() {
  const serviceEl = document.getElementById("clientService");
  const notes = document.getElementById("clientNotes");
  if (!serviceEl || !notes) return;
  const val = serviceEl.value;
  const label = notes.previousElementSibling;
  if (val.startsWith("Otros")) {
    notes.required = true;
    notes.placeholder = "Por favor descríbenos qué tipo de prenda femenina deseas confeccionar...";
    if (label) label.textContent = "Detalles de tu Idea * (Requerido para 'Otros')";
    notes.focus();
  } else {
    notes.required = false;
    notes.placeholder = "Cuéntanos colores, idea del diseño o tipo de celebración...";
    if (label) label.textContent = "Detalles de tu Idea (Opcional)";
  }
}

function inquireItemWhatsApp(title, categoryLabel) {
  const msg = `Hola *${BRAND_NAME}*, vi en su lookbook el diseño *"${title}"* (${categoryLabel}) y me gustaría recibir información sobre citas y confección a medida.`;
  window.open(`https://wa.me/${OFFICIAL_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

function sendClientWhatsApp(e) {
  e.preventDefault();
  const name = document.getElementById("clientName").value.trim();
  const mode = document.getElementById("clientMode").value;
  const city = document.getElementById("clientCity").value;
  const date = document.getElementById("clientDate").value || "Por definir";
  const service = document.getElementById("clientService").value;
  const notes = document.getElementById("clientNotes").value.trim() || "Sin notas adicionales";

  const msg = `Hola *${BRAND_NAME}*, deseo agendar una consulta de confección a medida:\n\n` +
              `• *Nombre:* ${name}\n` +
              `• *Modalidad:* ${mode}\n` +
              `• *Ciudad:* ${city}\n` +
              `• *Tipo de prenda:* ${service}\n` +
              `• *Fecha del evento:* ${date}\n` +
              `• *Detalles:* ${notes}`;
  window.open(`https://wa.me/${OFFICIAL_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

function sendCareerWhatsApp(e) {
  e.preventDefault();
  const name = document.getElementById("candName").value.trim();
  const sector = document.getElementById("candSector").value.trim();
  const exp = document.getElementById("candExp").value;
  const avail = document.getElementById("candAvail").value;
  const motivation = document.getElementById("candMotivation").value.trim() || "Me apasiona la costura y deseo integrarme al Atelier.";

  const msg = `Hola *${BRAND_NAME}*, deseo postularme a la vacante de *Costura / Asistente de Atelier* en Villa Altagracia:\n\n` +
              `• *Nombre:* ${name}\n` +
              `• *Sector en Villa Altagracia:* ${sector}\n` +
              `• *Experiencia:* ${exp}\n` +
              `• *Disponibilidad:* ${avail}\n` +
              `• *Motivación:* ${motivation}`;
  window.open(`https://wa.me/${OFFICIAL_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
}

function openCmsModal() {
  const modal = document.getElementById("cmsModal");
  if (modal) modal.classList.add("open");
}

function closeCmsModal() {
  const modal = document.getElementById("cmsModal");
  if (modal) modal.classList.remove("open");
}

function saveSheetCsvUrl() {
  const input = document.getElementById("sheetCsvUrlInput");
  if (!input) return;
  const url = input.value.trim();
  safeSetStorage("atelier_sheet_csv_url", url);
  closeCmsModal();
  loadGoogleSheetCatalog();
}

function initUrlPresets() {
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("modo");
  const serviceParam = params.get("servicio");

  if (modeParam) presetServiceMode(modeParam);
  if (serviceParam) {
    const serviceSelect = document.getElementById("clientService");
    if (serviceSelect) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value.toLowerCase().includes(serviceParam.toLowerCase())) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
}

function initKeyboardAndTouch() {
  document.addEventListener("keydown", (e) => {
    const lbModal = document.getElementById("lightboxModal");
    const isLbOpen = lbModal && lbModal.classList.contains("open");
    if (e.key === "Escape") {
      closeLightbox();
      closeCmsModal();
    } else if (isLbOpen && e.key === "ArrowRight") {
      e.preventDefault();
      navigateLightbox(1);
    } else if (isLbOpen && e.key === "ArrowLeft") {
      e.preventDefault();
      navigateLightbox(-1);
    }
  });

  const touchArea = document.getElementById("lightboxTouchArea");
  let touchStartX = 0;
  let touchStartY = 0;
  if (touchArea) {
    touchArea.addEventListener("touchstart", (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }
    }, { passive: true });

    touchArea.addEventListener("touchend", (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            navigateLightbox(1);
          } else {
            navigateLightbox(-1);
          }
        }
      }
    }, { passive: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadGoogleSheetCatalog();
  initUrlPresets();
  initKeyboardAndTouch();
});
