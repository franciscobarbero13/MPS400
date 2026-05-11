const contenedorTarjetas = document.getElementById("productos-conteiner");

function crearTargetaProductosInicio(productos){
    productos.forEach(producto => {
        const nuevaPieza = document.createElement("div");
        nuevaPieza.classList = "tarjeta-producto";
        nuevaPieza.innerHTML = `
        <img src="./img/${producto.id}.png">
        <h3>Pieza ${producto.tipo}</h3>
        <p>$${producto.precio}</p>
        <button>Agregar al carrito</button>
        `
        contenedorTarjetas.appendChild(nuevaPieza);
        nuevaPieza.getElementsByTagName("button")[0].addEventListener("click", ()=> agregarAlCarrito(producto))
    });
}

getPiezas().then(piezas => {
    crearTargetaProductosInicio(piezas);
});