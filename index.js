const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const VALID_TOKEN = "O5GZF-HMDGI-6N32S-18VGK-H6CWI-CPPB6";

function cargarListas() {
  if (!fs.existsSync("listas.json")) return {};
  const data = fs.readFileSync("listas.json", "utf8");
  return JSON.parse(data);
}

function guardarListas(listas) {
  fs.writeFileSync("listas.json", JSON.stringify(listas, null, 2), "utf8");
}

app.post("/agregar", (req, res) => {
  const { lista, enlaces } = req.body;
  if (!lista || !enlaces) return res.status(400).json({ error: "Faltan datos." });

  const nuevos = enlaces
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e);

  const listas = cargarListas();
  if (!listas[lista]) listas[lista] = [];
  listas[lista].push(...nuevos);

  guardarListas(listas);

  res.json({
    mensaje: `Se agregaron ${nuevos.length} enlaces a la lista "${lista}".`,
    total: listas[lista].length,
  });
});

app.get("/api.php", (req, res) => {
  const token = req.query.api_token;
  const action = req.query.action;
  const lista = req.query.lista;

  if (token !== VALID_TOKEN) return res.status(401).json({ error: "Token inválido" });

  if (action === "link") {
    const listas = cargarListas();
    if (!listas[lista] || listas[lista].length === 0) {
      return res.status(404).json({ error: "Lista no encontrada o vacía" });
    }

    const index = Math.floor(Math.random() * listas[lista].length);
    const enlace = listas[lista].splice(index, 1)[0];
    guardarListas(listas);

    return res.json({ enlace, cantidadRestante: listas[lista].length });
  }

  return res.status(400).json({ error: "Acción no válida" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});