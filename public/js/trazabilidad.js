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

function renderPedidos(pedidos) {
    const contenedor = document.getElementById("pedidos-contenedor");
    contenedor.innerHTML = "";

    pedidos.forEach((pedido) => {
        const pedidoItem = document.createElement("details");
        pedidoItem.className = "pedido-item";

        const fechaPedido = pedido.fecha_inicio || pedido.fecha_pedido || pedido.created_at;
        const fechaProduccion = pedido.fecha_produccion || pedido.fecha_fin || pedido.updated_at;

        pedidoItem.innerHTML = `
            <summary>
                 <div class="pedido-summary-grid">
                    <div>
                        <strong>Pedido #${pedido.id}</strong>
                        <div class="pedido-fechas">Pedido: ${formatearFecha(fechaPedido)}</div>
                        <div class="pedido-fechas">Producción: ${formatearFecha(fechaProduccion)}</div>
                    </div>
                    <div class="pedido-summary-right">
                        ${badgeEstado(pedido.estado, "pedido")}
                        <span class="total-pill">${pedido.total_piezas ?? "-"} piezas</span>
                    </div>
                </div>
            </summary>
            <div class="pedido-detalle">
                <div class="piezas-grid">
                    <p><strong>🔴 Rojas:</strong> ${pedido.rojas ?? 0}</p>
                    <p><strong>⚫ Negras:</strong> ${pedido.negras ?? 0}</p>
                    <p><strong>⚪ Plateadas:</strong> ${pedido.plateadas ?? 0}</p>
                </div>
                <h3>Lotes</h3>
                <ul class="lotes-lista">
                    ${(pedido.lotes && pedido.lotes.length > 0)
                        ? pedido.lotes.map((lote) => `
                            <li>
                                <div class="lote-head">
                                    <strong>Lote #${lote.id}</strong>
                                    ${badgeEstado(lote.estado, "lote")}
                                </div>
                                <div class="lote-meta">Piezas: ${lote.cantidad ?? lote.total_piezas ?? "-"} · Inicio: ${formatearFecha(lote.fecha_inicio || lote.created_at)}</div>
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
