import express from "express";
import cors from "cors";
import { db } from "./db.js";
import session from "express-session";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(session({
  name: "mps400.sid",
  secret: "mps400-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}));

app.use(express.static("public"));

app.get("/api/me", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.json({ logged: false });
    }

    try {
        const [rows] = await db.execute(
            "SELECT id, username FROM usuarios WHERE id = ?",
            [req.session.userId]
        );

        if (rows.length === 0) {
            return res.json({ logged: false });
        }

        res.json({
            logged: true,
            user: rows[0],
            username: rows[0].username
        });

    } catch (error) {
        console.error("Error en /api/me:", error);
        res.status(500).json({ logged: false });
    }
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.error("Error al cerrar sesion", err);
            return res.status(500).json({ ok: false });
        }

        res.clearCookie("mps400.sid");
        res.json({ ok: true });
    });
});

app.post("/api/pedidos", async (req, res) => {

    if(!req.session || !req.session.userId){
        return res.status(401).json({ error: "No autorizado" });
    }

    const carrito = req.body.carrito
    if(!carrito || carrito.length === 0){
        return res.status(400).json({ error: "Carrito vacio" });
    }

    try{
        const[pedidoResult] = await db.execute(
            "INSERT INTO pedidos(usuario_id) VALUES (?)",
            [req.session.userId]
        );

        const pedidoId = pedidoResult.insertId;
        for(const item of carrito){
            await db.execute(
                "INSERT INTO pedido_items (pedido_id, tipo, cantidad) VALUES (?, ?, ?)", 
                [pedidoId, item.id, item.cantidad]
            );
        }
        
        res.json({ ok: true, idPedido: pedidoId });
    }catch(error){
        console.error("Error guardando pedido", error);
        res.status(500).json({ error: "Error guardando pedido" });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    
    if(!username || !password){
        return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    try{
        await db.execute(
            "INSERT INTO usuarios (username, password) VALUES (?, ?)",
            [username, password]
        );

        res.json({ ok: true });
    }catch (error){
        if(error.code === "ER_DUP_ENTRY"){
            return res.status(409).json({ ok: false, error: "Usuario ya existe" })
        }
        res.status(500).json({ ok: false })
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.execute(
        "SELECT id FROM usuarios WHERE username = ? AND password = ?",
        [username, password]
    );

    if(rows.length === 0){
        return res.status(401).json({ ok: false });
    }

    req.session.userId = rows[0].id;
    res.json({ ok: true });
});

app.get("/api/pedidos", async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM pedidos ORDER BY id DESC");
    res.json(rows);
})

app.get("/api/piezas", async (req, res) => {
    try{
        const [rows] = await db.execute("SELECT * FROM piezas");
        res.json(rows);
    } catch(err){
        console.error(err);
        res.status(500).json({ error: "Error al obtener piezas" });
    }
});


app.listen(PORT, () => {
    console.log("Servidor funcionando en http://localhost:3000")
})  
