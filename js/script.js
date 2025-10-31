// NASA Space Explorer App – JSON Edition

const CDN_URL = "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

const galleryEl = document.getElementById("gallery");
const getImageBtn = document.getElementById("getImageBtn");

let apodItems = [];

function clearGallery() {
  galleryEl.innerHTML = "";
}

function setLoading(isLoading) {
  if (isLoading) {
    galleryEl.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🚀</div>
        <p>Fetching the cosmos…</p>
      </div>`;
  } else if (!apodItems.length) {
    galleryEl.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>Click "Fetch Space Images" to explore the cosmos!</p>
      </div>`;
  }
}

// ✅ Use smaller image URLs in the grid
function getBestImageUrl(item) {
  if (item.media_type === "image") {
    return item.url;
  }
  if (item.media_type === "video") {
    return item.thumbnail_url || null;
  }
  return null;
}

function renderGallery(items) {
  clearGallery();
  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open details for ${item.title} (${item.date})`);

    const mediaUrl = getBestImageUrl(item);
    const isVideo = item.media_type === "video";

    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "card-media";

    if (mediaUrl) {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.alt = isVideo
        ? `${item.title} (video thumbnail)`
        : item.title || "Astronomy image";
      img.loading = "lazy";
      mediaWrapper.appendChild(img);

      if (isVideo) {
        const playBadge = document.createElement("div");
        playBadge.className = "play-badge";
        playBadge.textContent = "▶";
        mediaWrapper.appendChild(playBadge);
      }
    }

    const info = document.createElement("div");
    info.className = "card-info";

    const h3 = document.createElement("h3");
    h3.textContent = item.title || "Untitled";

    const meta = document.createElement("p");
    meta.className = "card-meta";
    meta.textContent = item.date || "";

    info.appendChild(h3);
    info.appendChild(meta);

    card.appendChild(mediaWrapper);
    card.appendChild(info);

    card.addEventListener("click", () => openModal(item));

    frag.appendChild(card);
  });

  galleryEl.appendChild(frag);
}

async function fetchApod() {
  try {
    setLoading(true);
    const res = await fetch(CDN_URL);
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();
    apodItems = Array.isArray(data)
      ? data.sort((a, b) => (a.date < b.date ? 1 : -1))
      : [];

    setLoading(false);
    renderGallery(apodItems);
  } catch (err) {
    galleryEl.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🛠️</div>
        <p>Error loading data.<br/><small>${err.message}</small></p>
      </div>`;
  }
}

// ✅ Modal uses HD image if available
function openModal(item) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const modal = document.createElement("div");
  modal.className = "modal";

  const header = document.createElement("header");
  header.className = "modal-header";
  const title = document.createElement("h2");
  title.textContent = item.title || "Untitled";
  const date = document.createElement("div");
  date.className = "modal-date";
  date.textContent = item.date || "";
  const close = document.createElement("button");
  close.className = "modal-close";
  close.textContent = "✕";
  close.addEventListener("click", () => overlay.remove());
  header.append(title, date, close);

  const body = document.createElement("div");
  body.className = "modal-body";

  if (item.media_type === "image") {
    const img = document.createElement("img");
    img.src = item.hdurl || item.url;
    img.alt = item.title || "Astronomy image";
    body.appendChild(img);
  } else if (item.media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = item.url;
    iframe.className = "modal-video";
    iframe.allowFullscreen = true;
    body.appendChild(iframe);
  }

  const desc = document.createElement("p");
  desc.className = "modal-explanation";
  desc.textContent = item.explanation || "";
  body.appendChild(desc);

  modal.append(header, body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

getImageBtn.addEventListener("click", fetchApod);
