// ── COMPANY DATA ──
const companies = [
  {
    num: "01",
    name: "Edificaciones Valdeon",
    sector: "Inmobiliario",
    img: "EV_logo.jpg",
    desc: "Empresa fundada en 1968, con más de 56 años de trayectoria en el sector inmobiliario madrileño. Especializada en el alquiler y administración de bienes inmuebles por cuenta propia. La empresa más veterana del grupo.",
    location: "Av. del Valle 15, Madrid",
  },
  {
    num: "02",
    name: "Moprasa",
    sector: "Promoción Inmobiliaria",
    img: "moprasa.png",
    desc: "Fundada en 1989, con más de 35 años de experiencia en la promoción, construcción y gestión de activos inmobiliarios en el corazón de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "moprasa.html",
  },
  {
    num: "03",
    name: "Amompra Inversiones",
    sector: "Inmobiliario",
    img: "amompra.png",
    desc: "Constituida en 2004, especializada en la adquisición, alquiler y gestión de bienes inmuebles por cuenta propia en las ubicaciones más estratégicas de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "amompra.html",
  },
  {
    num: "04",
    name: "Invermompra",
    sector: "Inmobiliario",
    img: "innova.png",
    desc: "Fundada en 2005, dedicada a la adquisición, venta, promoción, construcción y gestión de toda clase de bienes inmuebles y patrimonios en Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "invermompra.html",
  },
  {
    num: "05",
    name: "Capital Investments Nabria",
    sector: "Financiero",
    img: "nabria.png",
    desc: "Sociedad Anónima fundada en abril de 2025, especializada en actividades de intermediación en operaciones con valores y otros activos financieros.",
    location: "Gran Vía 73, Madrid",
  },
  {
    num: "06",
    name: "Vehículos Tierra Mar y Aire",
    sector: "Automoción y Vehículos",
    img: "VTAM.png",
    desc: "Especializada en la compraventa, importación, exportación y distribución de todo tipo de vehículos — automóviles, motocicletas, embarcaciones, aeronaves y maquinaria industrial, tanto nuevos como usados.",
    location: "Gran Vía 73, Madrid",
  },
  {
    num: "07",
    name: "4 Welfare Capital Solutions",
    sector: "Inversión y Capital",
    img: "4welfare.png",
    desc: "Constituida en enero de 2025, especializada en la adquisición, tenencia y gestión de participaciones sociales y acciones en entidades mercantiles. Vehículo de inversión estratégica del grupo.",
    location: "Gran Vía 73, Madrid",
  },
];

// ── BUILD COMPANY CARDS ──
function buildCompanyCards() {
  const grid = document.getElementById("companies-grid");
  if (!grid) return;
  grid.innerHTML = companies
    .map(
      (c) => `
    <div class="flip-card" id="card-${c.num}" onclick="toggleCard('${c.num}')">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <div class="card-front-img-wrap" style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;">
            ${c.img ? `<img src="${c.img}" alt="${c.name}" style="width:170px;height:170px;object-fit:contain;opacity:0.85;">` : ""}
          </div>
          <div class="card-front-name">${c.name}</div>
          <div class="card-front-sector">${c.sector}</div>
          <div class="card-front-cta">Ver más</div>
        </div>
        <div class="flip-card-back">
          <div class="card-back-header">
            <div class="card-back-name">${c.name}</div>
            <span class="card-back-close" onclick="closeCard(event, '${c.num}')">✕</span>
          </div>
          <div class="card-back-divider"></div>
          <div class="card-back-desc">${c.desc}</div>
          <div class="card-back-footer">
            📍 ${c.location}
            ${c.link ? `<a href="${c.link}" onclick="event.stopPropagation()" style="margin-left:16px;color:var(--gold);font-size:9px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Ver web →</a>` : ""}
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ── CAROUSEL ──
const GAP = 24;
let carouselCurrent = 0;

function getVisible() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function getCardWidth() {
  const container = document.querySelector(".carousel-track-container");
  if (!container) return 0;
  const v = getVisible();
  return (container.offsetWidth - GAP * (v - 1)) / v;
}

function setCardWidths() {
  const cards = document.querySelectorAll(".flip-card");
  const width = getCardWidth();
  if (!width) return;
  cards.forEach((card) => {
    card.style.width = width + "px";
    card.style.minWidth = width + "px";
    card.style.flex = "none";
  });
}

function initCarousel() {
  const total = companies.length;
  const maxSlide = Math.max(0, total - getVisible());
  const dotsEl = document.getElementById("carousel-dots");
  document.getElementById("carousel-total").textContent = total;
  dotsEl.innerHTML = Array.from(
    { length: maxSlide + 1 },
    (_, i) =>
      `<div class="dot ${i === 0 ? "active" : ""}" onclick="goTo(${i})"></div>`,
  ).join("");
  document.getElementById("prev").disabled = true;
  setCardWidths();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      carouselCurrent = Math.min(
        carouselCurrent,
        Math.max(0, companies.length - getVisible()),
      );
      rebuildDots();
      setCardWidths();
      updateCarousel();
    }, 100);
  });
}

function rebuildDots() {
  const maxSlide = Math.max(0, companies.length - getVisible());
  const dotsEl = document.getElementById("carousel-dots");
  if (!dotsEl) return;
  dotsEl.innerHTML = Array.from(
    { length: maxSlide + 1 },
    (_, i) =>
      `<div class="dot ${i === carouselCurrent ? "active" : ""}" onclick="goTo(${i})"></div>`,
  ).join("");
}

function updateCarousel() {
  const track = document.getElementById("companies-grid");
  if (!track || !track.children.length) return;
  const cardWidth = getCardWidth();
  const maxSlide = Math.max(0, companies.length - getVisible());
  const offset = carouselCurrent * (cardWidth + GAP);
  track.style.transform = `translateX(-${offset}px)`;
  document
    .querySelectorAll(".dot")
    .forEach((d, i) => d.classList.toggle("active", i === carouselCurrent));
  document.getElementById("carousel-current").textContent = carouselCurrent + 1;
  document.getElementById("prev").disabled = carouselCurrent === 0;
  document.getElementById("next").disabled = carouselCurrent >= maxSlide;
}

function slide(dir) {
  carouselCurrent = Math.max(
    0,
    Math.min(companies.length - getVisible(), carouselCurrent + dir),
  );
  updateCarousel();
}

function goTo(i) {
  carouselCurrent = i;
  updateCarousel();
}

function toggleCard(num) {
  const card = document.getElementById("card-" + num);
  if (!card) return;
  card.classList.toggle("flipped");
}

function closeCard(event, num) {
  event.stopPropagation();
  const card = document.getElementById("card-" + num);
  if (card) card.classList.remove("flipped");
}

// ── NAV SCROLL ──
function initNav() {
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ── REVEAL ON SCROLL ──
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ── CONTACT FORM ──
async function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector(".btn-submit span");
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };
  btn.textContent = "Enviando...";
  try {
    const res = await fetch(
      "https://ww-backend.anaberjano27.workers.dev/api/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    const result = await res.json();
    btn.textContent = res.ok ? "Mensaje enviado ✓" : result.message || "Error";
    if (res.ok) form.reset();
  } catch (err) {
    btn.textContent = "Server error";
  }
  setTimeout(() => {
    btn.textContent = "Enviar mensaje";
  }, 3000);
}

// ── DENUNCIA FORM ──
async function handleDenuncia(e) {
  e.preventDefault();
  const cb = document.getElementById("gdpr");
  if (!cb || !cb.checked) {
    alert("Por favor, acepte la política de privacidad para continuar.");
    return;
  }
  const form = e.target;
  const btn = form.querySelector(".btn-submit span");
  const data = {
    tipo: form.querySelectorAll("select")[0].value,
    empresa: form.querySelectorAll("select")[1].value,
    descripcion: form.querySelector("textarea").value,
    contacto: form.querySelector('input[type="text"]').value,
  };
  if (!data.tipo || !data.descripcion) {
    alert("Por favor, complete los campos obligatorios.");
    return;
  }
  btn.textContent = "Registrando...";
  try {
    const res = await fetch(
      "https://ww-backend.anaberjano27.workers.dev/api/denuncia",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    const result = await res.json();
    btn.textContent = res.ok
      ? "Denuncia registrada ✓"
      : result.message || "Error";
    if (res.ok) form.reset();
  } catch (err) {
    btn.textContent = "Server error";
  }
  setTimeout(() => {
    btn.textContent = "Enviar denuncia";
  }, 4000);
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  buildCompanyCards();
  initCarousel();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setCardWidths();
      updateCarousel();
    });
  });
  initNav();
  initReveal();
});
