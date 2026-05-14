function formatearFecha(valor) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";
    return fecha.toLocaleString("es-AR");
}

const ESTADOS_PEDIDO = {
    0: { texto: "En cola", clase: "estado-cola" },
    1: { texto: "Planificado", clase: "estado-planificado" },
    2: { texto: "En producción", clase: "estado-produccion" },
    3: { texto: "Terminado OK", clase: "estado-ok" },
    4: { texto: "Terminado con fallos", clase: "estado-fallo" }
};

const ESTADOS_LOTE = {
    0: { texto: "En cola", clase: "estado-cola" },
    1: { texto: "Asignado", clase: "estado-asignado" },
    2: { texto: "En producción", clase: "estado-produccion" },
    3: { texto: "Terminado OK", clase: "estado-ok" },
    4: { texto: "Terminado con fallos", clase: "estado-fallo" }
};

const PIEZA_IMAGENES = {
    rojas: "./img/1.png",
    negras: "./img/3.png",
    plateadas: "./img/2.png"
};

function resolverEstado(valor, tipo) {
    const mapa = tipo === "pedido" ? ESTADOS_PEDIDO : ESTADOS_LOTE;
    const estado = typeof valor === "number" ? mapa[valor] : null;

    if (estado) return estado;

    return {
        texto: valor ?? "Sin estado",
        clase: "estado-default"
    };
}

function badgeEstado(valor, tipo) {
    const estado = resolverEstado(valor, tipo);
    return `<span class="estado-chip ${estado.clase}">${estado.texto}</span>`;
}

function valorNumero(valor) {
    return Number.isFinite(Number(valor)) ? Number(valor) : 0;
}

function piezasEsperadasHTML(obj) {
    const piezas = [
        { key: "rojas", nombre: "Rojas", icono: "🔴" },
        { key: "negras", nombre: "Negras", icono: "⚫" },
        { key: "plateadas", nombre: "Plateadas", icono: "⚪" }
    ];

    return `
        <div class="esperadas-grid">
            ${piezas.map((pieza) => `
                <article class="esperada-card">
                    <img src="${PIEZA_IMAGENES[pieza.key]}" alt="Pieza ${pieza.nombre.toLowerCase()} esperada" />
                    <p><strong>${pieza.icono} ${pieza.nombre} esperadas:</strong> ${valorNumero(obj[pieza.key])}</p>
                </article>
            `).join("")}
        </div>
    `;
}

function detalleResultadosHTML(obj) {
    return `
        <div class="piezas-grid">
            <p><strong>✅ Rojas válidas:</strong> ${valorNumero(obj.rojas_validas)}</p>
            <p><strong>✅ Negras válidas:</strong> ${valorNumero(obj.negras_validas)}</p>
            <p><strong>✅ Plateadas válidas:</strong> ${valorNumero(obj.plateadas_validas)}</p>
        </div>
        <div class="piezas-grid">
            <p><strong>❌ Rojas fallidas:</strong> ${valorNumero(obj.rojas_fallidas)}</p>
            <p><strong>❌ Negras fallidas:</strong> ${valorNumero(obj.negras_fallidas)}</p>
            <p><strong>❌ Plateadas fallidas:</strong> ${valorNumero(obj.plateadas_fallidas)}</p>
        </div>
    `;
}

function renderPedidos(pedidos) {
    const contenedor = document.getElementById("pedidos-contenedor");
    contenedor.innerHTML = "";

    pedidos.forEach((pedido) => {
        const pedidoItem = document.createElement("details");
        pedidoItem.className = "pedido-item";

        pedidoItem.innerHTML = `
            <summary>
                 <div class="pedido-summary-grid">
                    <div>
                        <div class="pedido-fechas">Inicio: ${formatearFecha(pedido.fecha_inicio)}</div>
                        <div class="pedido-fechas">Prod. inicio: ${formatearFecha(pedido.fecha_prod_inicio)}</div>
                        <div class="pedido-fechas">Prod. fin: ${formatearFecha(pedido.fecha_prod_fin)}</div>
                    </div>
                    <div class="pedido-summary-right">
                        ${badgeEstado(pedido.estado, "pedido")}
                        <span class="total-pill">${valorNumero(pedido.total_piezas)} piezas pedidas</span>
                    </div>
                </div>
            </summary>
            <div class="pedido-detalle">
                 <h3>Piezas esperadas del pedido</h3>
                ${piezasEsperadasHTML(pedido)}
                <h3>Resultado real del pedido</h3>
                ${detalleResultadosHTML(pedido)}
                <h3>Lotes del pedido</h3>
                <ul class="lotes-lista">
                    ${(pedido.lotes && pedido.lotes.length > 0)
                        ? pedido.lotes.map((lote) => `
                            <li>
                                <div class="lote-head">
                                    <strong>Lote #${lote.n_lote ?? lote.id}</strong>
                                    ${badgeEstado(lote.estado, "lote")}
                                </div>
                                <div class="lote-meta">Inicio: ${formatearFecha(lote.fecha_inicio)} · Prod. inicio: ${formatearFecha(lote.fecha_prod_inicio)} · Prod. fin: ${formatearFecha(lote.fecha_prod_fin)}</div>
                                <h4>Piezas esperadas del lote</h4>
                                ${piezasEsperadasHTML(lote)}
                                <h4>Resultado real del lote</h4>
                                ${detalleResultadosHTML(lote)}
                            </li>
                        `).join("")
                        : "<li>Sin lotes cargados todavía.</li>"
                    }
                </ul>
            </div>
        `;

        contenedor.appendChild(pedidoItem);
    });
}

async function cargarTrazabilidad() {
    const estado = document.getElementById("estado-trazabilidad");

    try {
        const res = await fetch("/api/mis-pedidos");

        if (res.status === 401) {
            window.location.href = "/iniciar_sesion.html";
            return;
        }

        if (!res.ok) {
            estado.textContent = "No se pudo cargar la trazabilidad.";
            return;
        }

        const data = await res.json();
        const pedidos = data.pedidos || [];

        if (pedidos.length === 0) {
            estado.textContent = "Todavía no hiciste pedidos.";
            return;
        }

        estado.style.display = "none";
        renderPedidos(pedidos);
    } catch (error) {
        console.error("Error cargando trazabilidad", error);
        estado.textContent = "Error de red al cargar trazabilidad.";
    }
}

document.addEventListener("DOMContentLoaded", cargarTrazabilidad);
