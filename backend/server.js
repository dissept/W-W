const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://wiseandwisdom.netlify.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ROOT
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ✅ CONTACT FORM → EMAIL
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    await transporter.sendMail({
      from: `"Web Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <h3>Nuevo mensaje desde la web</h3>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b><br/> ${message}</p>
      `,
    });
    console.log("📩 Email enviado correctamente");
    res.json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// ✅ DENUNCIA FORM → EMAIL
app.post("/api/denuncia", async (req, res) => {
  const { tipo, empresa, descripcion, contacto } = req.body;
  if (!tipo || !descripcion) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }
  try {
    await transporter.sendMail({
      from: `"Canal de Denuncias" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🔒 Nueva denuncia: ${tipo}`,
      html: `
        <h3>Nueva denuncia recibida</h3>
        <p><b>Tipo:</b> ${tipo}</p>
        <p><b>Empresa afectada:</b> ${empresa || "No especificada"}</p>
        <p><b>Descripción:</b><br/>${descripcion}</p>
        <p><b>Contacto:</b> ${contacto || "Anónimo"}</p>
        <hr/>
        <p style="color:gray;font-size:12px;">
          Recibido el ${new Date().toLocaleString("es-ES")} — Canal confidencial Wise & Wisdom
        </p>
      `,
    });
    console.log("📩 Denuncia enviada correctamente");
    res.json({ message: "Denuncia registrada correctamente" });
  } catch (error) {
    console.error("❌ Error enviando denuncia:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
