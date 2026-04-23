// ── COMPANY DATA ──
const companies = [
  {
    num: "01",
    name: "Edificaciones Valdeon",
    sector: "Inmobiliario",
    img: "EV_logo.jpg",
    desc: "Empresa fundada en 1968, con más de 56 años de trayectoria en el sector inmobiliario madrileño. Especializada en el alquiler y administración de bienes inmuebles por cuenta propia. La empresa más veterana del grupo.",
    location: "Calle Gran Via 73, Madrid"

  },
  {
    num: "02",
    name: "Capital Investments Nabria",
    sector: "Financiero",
    desc: "Sociedad Anónima especializada en actividades de intermediación en operaciones con valores y otros activos financieros. Fundada en abril de 2025, con sede en Gran Vía 73, Madrid.",
    location: "Gran Vía 73, Madrid"
  },
  {
    num: "03",
    name: "Vehículos Tierra Mar y Aire",
    sector: "Automoción y Vehículos",
    desc: "Sociedad Anónima especializada en la compraventa, importación, exportación, distribución e intermediación de todo tipo de vehículos — automóviles, motocicletas, embarcaciones, aeronaves y maquinaria industrial, tanto nuevos como usados.",
    location: "Gran Vía 73, Madrid"
  },
  {
    num: "04",
    name: "4 Welfare Capital Solutions",
    sector: "Inversión y Capital",
    desc: "Sociedad constituida en enero de 2025, especializada en la adquisición, tenencia, administración y gestión de títulos, acciones y participaciones sociales en entidades mercantiles. Vehículo de inversión estratégica del grupo.",
    location: "Gran Vía 73, Madrid"
  },
  {
    num: "05",
    name: "Moprasa",
    sector: "Promoción Inmobiliaria",
    desc: "Fundada en 1989, con más de 35 años de experiencia en la promoción, construcción y gestión de activos inmobiliarios en el corazón de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "moprasa.html"
  },
  {
    num: "06",
    name: "Amompra Inversiones",
    sector: "Inmobiliario",
    desc: "Constituida en 2004, especializada en la adquisición, alquiler y gestión de bienes inmuebles por cuenta propia en las ubicaciones más estratégicas de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "amompra.html"
  },
];

// ── BUILD COMPANY CARDS ──
function buildCompanyCards() {
  const grid = document.getElementById('companies-grid');
  if (!grid) return;

  grid.innerHTML = companies.map((c) => `
    <div class="flip-card" id="card-${c.num}" onclick="toggleCard('${c.num}')">
      <div class="flip-card-inner">

        <div class="flip-card-front">
        ${c.img ? `<img src="${c.img}" alt="${c.name}" style="width:270px;height:150px;object-fit:contain;margin-bottom:8px;opacity:0.85;">` : ''}
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
  ${c.link ? `<a href="${c.link}" onclick="event.stopPropagation()" style="margin-left:16px;color:var(--gold);font-size:9px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Ver web →</a>` : ''}
</div>

       </div>
          
        </div>

      </div>
    </div>
  `).join('');
}


function toggleCard(num) {
  const card = document.getElementById('card-' + num);
  if (!card) return;
  card.classList.toggle('flipped');
}

function closeCard(event, num) {
  event.stopPropagation();
  const card = document.getElementById('card-' + num);
  if (card) card.classList.remove('flipped');
}

// ── NAV SCROLL ──
function initNav() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ── REVEAL ON SCROLL ──
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── CONTACT FORM ──
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit span');
  btn.textContent = 'Enviando...';
  setTimeout(() => {
    btn.textContent = 'Mensaje enviado ✓';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Enviar mensaje'; }, 3000);
  }, 1000);
}

// ── DENUNCIA FORM ──
function handleDenuncia(e) {
  e.preventDefault();
  const cb = document.getElementById('gdpr');
  if (!cb || !cb.checked) {
    alert('Por favor, acepte la política de privacidad para continuar.');
    return;
  }
  const btn = e.target.querySelector('.btn-submit span');
  btn.textContent = 'Registrando...';
  setTimeout(() => {
    btn.textContent = 'Denuncia registrada ✓';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Enviar denuncia'; }, 4000);
  }, 1200);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  buildCompanyCards();
  initNav();
  initReveal();
});
