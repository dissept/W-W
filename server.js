const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const companyInfo = {
  name: "Wise & Wisdom SL",
  services: ["Marketing", "Consulting"],
  email: "administracion_grupo777@777.enterprises",
};

const companies = [
  {
    num: "01",
    name: "Edificaciones Valdeon",
    sector: "Inmobiliario",
    img: "EV_logo.jpg",
    desc: "Empresa fundada en 1968, con más de 56 años de trayectoria en el sector inmobiliario madrileño. Especializada en el alquiler y administración de bienes inmuebles por cuenta propia. La empresa más veterana del grupo.",
    location: "Calle Gran Via 73, Madrid",
  },
  {
    num: "02",
    name: "Capital Investments Nabria",
    sector: "Financiero",
    desc: "Sociedad Anónima especializada en actividades de intermediación en operaciones con valores y otros activos financieros. Fundada en abril de 2025, con sede en Gran Vía 73, Madrid.",
    location: "Gran Vía 73, Madrid",
  },
  {
    num: "03",
    name: "Vehículos Tierra Mar y Aire",
    sector: "Automoción y Vehículos",
    desc: "Sociedad Anónima especializada en la compraventa, importación, exportación, distribución e intermediación de todo tipo de vehículos — automóviles, motocicletas, embarcaciones, aeronaves y maquinaria industrial, tanto nuevos como usados.",
    location: "Gran Vía 73, Madrid",
  },
  {
    num: "04",
    name: "4 Welfare Capital Solutions",
    sector: "Inversión y Capital",
    desc: "Sociedad constituida en enero de 2025, especializada en la adquisición, tenencia, administración y gestión de títulos, acciones y participaciones sociales en entidades mercantiles. Vehículo de inversión estratégica del grupo.",
    location: "Gran Vía 73, Madrid",
  },
  {
    num: "05",
    name: "Moprasa",
    sector: "Promoción Inmobiliaria",
    desc: "Fundada en 1989, con más de 35 años de experiencia en la promoción, construcción y gestión de activos inmobiliarios en el corazón de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "moprasa.html",
  },
  {
    num: "06",
    name: "Amompra Inversiones",
    sector: "Inmobiliario",
    desc: "Constituida en 2004, especializada en la adquisición, alquiler y gestión de bienes inmuebles por cuenta propia en las ubicaciones más estratégicas de Madrid.",
    location: "Gran Vía 73, Madrid",
    link: "amompra.html",
  },
];

app.get("/api/info", (req, res) => { res.json(companyInfo); });
app.get("/api/companies", (req, res) => { res.json(companies); });

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "peanol2020@gmail.com",
      subject: `Nuevo mensaje de ${name}`,
      html: `<h3>Nuevo mensaje desde la web</h3><p><b>Nombre:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Mensaje:</b><br/> ${message}</p>`,
    });
    console.log("📩 Email enviado correctamente");
    res.json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});


app.post("/api/denuncia", async (req, res) => {
const { tipo, empresa, descripcion, contacto } = req.body;
if (!tipo || !descripcion) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "anaberjano27@gmail.com@gmail.com",
      subject: `Nueva denuncia de ${nombre}`,
      html: `<h3>Nueva denuncia</h3><p><b>Nombre:</b> ${nombre}</p><p><b>Email:</b> ${email || 'No proporcionado'}</p><p><b>Descripción:</b><br/> ${descripcion}</p>`,
    });
    console.log("📩 Denuncia enviada correctamente");
    res.json({ message: "Denuncia registrada correctamente" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
