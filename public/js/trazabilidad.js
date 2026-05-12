function formatearFecha(valor) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";
    return fecha.toLocaleString("es-AR");
}

function obtenerEstadoLote(lote) {
    if (typeof lote.estado === "number") {
        if (lote.estado === 0) return "Pendiente";
        if (lote.estado === 1) return "En producción";
        if (lote.estado === 2) return "Completado";
    }
    return lote.estado ?? "Sin estado";
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
                <strong>Pedido #${pedido.id}</strong> ·
                Fecha pedido: ${formatearFecha(fechaPedido)} ·
                Producción: ${formatearFecha(fechaProduccion)} ·
                Total piezas: ${pedido.total_piezas ?? "-"}
            </summary>
            <div class="pedido-detalle">
                <p><strong>Rojas:</strong> ${pedido.rojas ?? 0}</p>
                <p><strong>Negras:</strong> ${pedido.negras ?? 0}</p>
                <p><strong>Plateadas:</strong> ${pedido.plateadas ?? 0}</p>
                <p><strong>Estado pedido:</strong> ${pedido.estado ?? "-"}</p>
                <h3>Lotes</h3>
                <ul>
                    ${(pedido.lotes && pedido.lotes.length > 0)
                        ? pedido.lotes.map((lote) => `
                            <li>
                                Lote #${lote.id} · Estado: ${obtenerEstadoLote(lote)} ·
                                Piezas: ${lote.cantidad ?? lote.total_piezas ?? "-"} ·
                                Inicio: ${formatearFecha(lote.fecha_inicio || lote.created_at)}
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
