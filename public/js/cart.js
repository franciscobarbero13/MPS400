const contenedorTarjetas = document.getElementById("productos-conteiner");
const unidadesElement = document.getElementById("unidades");
const precioElement = document.getElementById("precio");
const carritoVacioElement = document.getElementById("carrito-vacio");
const totalesElement = document.getElementById("totales");
const reiniciarCarritoElement = document.getElementById("reiniciar");

function crearTargetaProductosInicio(){
    contenedorTarjetas.innerHTML = "";
    const productos = JSON.parse(localStorage.getItem("piezas")) || [];
    console.log(productos)
    if(productos && productos.length > 0){
        productos.forEach(producto => {
            const nuevaPieza = document.createElement("div");
            nuevaPieza.classList = "tarjeta-producto";
            nuevaPieza.innerHTML = `
            <img src="./img/${producto.id}.png">
            <h3>Pieza ${producto.tipo}</h3>
            <p>$${producto.precio}</p>
            <div>
                <button>-</button>
                <span class="cantidad">${producto.cantidad}</span>
                <button>+</button>
            </div>
            `
            contenedorTarjetas.appendChild(nuevaPieza);
            nuevaPieza
                .getElementsByTagName("button")[1]
                .addEventListener("click", (e)=> {
                    const cuentaElement = e.target.parentElement.getElementsByTagName("span")[0];
                    cuentaElement.innerText = agregarAlCarrito(producto);
                    actualizarTotales();
                });
            nuevaPieza
                .getElementsByTagName("button")[0]
                .addEventListener("click", (e)=> {
                     restarAlCarrito(producto);
                     crearTargetaProductosInicio();
                     actualizarTotales();
                });
    });
    }
    
}

crearTargetaProductosInicio();
actualizarTotales();

function actualizarTotales(){
    const productos = JSON.parse(localStorage.getItem("piezas")) || [];
    let unidades = 0; 
    let precio = 0;
    if(productos && productos.length > 0){
        productos.forEach(producto =>{
            unidades += producto.cantidad;
            precio += producto.precio * producto.cantidad;
        })
        unidadesElement.innerText = unidades;
        precioElement.innerText = precio;
    }
    revisarMensajeVacio();
}


function revisarMensajeVacio(){
    const productos = JSON.parse(localStorage.getItem("piezas")) || [];
    carritoVacioElement.classList.toggle("escondido", productos && productos.length > 0);
    totalesElement.classList.toggle("escondido", !(productos && productos.length > 0))
}

revisarMensajeVacio();

reiniciarCarritoElement.addEventListener("click", reiniciarCarrito)
function reiniciarCarrito(){
    localStorage.removeItem("piezas");
    actualizarTotales();
    crearTargetaProductosInicio();
}


document.getElementById("comprar").addEventListener("click",()=>{
    enviarPedido();
})