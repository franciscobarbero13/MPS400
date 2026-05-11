

function agregarAlCarrito(producto){
    const memoria = JSON.parse(localStorage.getItem("piezas")) || [];
    console.log(memoria);
    let cuenta = 0;
    if(!memoria){
        const nuevoProducto = getNuevoProductoParaMemoria(producto);
        localStorage.setItem("piezas",JSON.stringify([nuevoProducto]));
        cuenta = 1;
    }else{
        const indiceProducto = memoria.findIndex(pieza => pieza.id === producto.id);
        console.log(indiceProducto)
        const nuevaMemoria = [...memoria];
        if(indiceProducto === -1){
            nuevaMemoria.push(getNuevoProductoParaMemoria(producto));
            cuenta = 1;
        }else{
            nuevaMemoria[indiceProducto].cantidad ++;
            cuenta = nuevaMemoria[indiceProducto].cantidad;
        }
        localStorage.setItem("piezas",JSON.stringify(nuevaMemoria))
    }
    actualizarNumeroCarrito();
    return cuenta;
}

function restarAlCarrito(producto){
    const memoria = JSON.parse(localStorage.getItem("piezas")) || [];
    const indiceProducto = memoria.findIndex(pieza => pieza.id === producto.id);
    if(memoria[indiceProducto].cantidad === 1){
        memoria.splice(indiceProducto,1);
    }else{
        memoria[indiceProducto].cantidad--;
    }
    localStorage.setItem("piezas",JSON.stringify(memoria));
    actualizarNumeroCarrito();
}

function getNuevoProductoParaMemoria(producto){
    const nuevoProducto = producto;
    nuevoProducto.cantidad = 1;
    return nuevoProducto;
}


const cuentaCarritoElement = document.getElementById("cuenta-carrito");
function actualizarNumeroCarrito(){
    const memoria = JSON.parse(localStorage.getItem("piezas")) || [];;
    if(memoria && memoria.length > 0){
        const cuenta = memoria.reduce((acum, current) => acum+current.cantidad,0 );
        cuentaCarritoElement.innerText = cuenta;
    }else{
        cuentaCarritoElement.innerText = 0;
    }
}

actualizarNumeroCarrito();


function enviarPedido(){
    const carrito = JSON.parse(localStorage.getItem("piezas"));

    if(!carrito || carrito.length === 0){
        console.warn("El carrito esta vacio");
        return;
    }

    fetch("/api/pedidos", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ carrito })
    })
    .then(res => {
        if (res.status === 401) {
            alert("Tenés que iniciar sesión para realizar una compra");
            window.location.href = "/iniciar_sesion.html";
            return null;
        }

        if (!res.ok) {
            alert("Error al enviar el pedido");
            return null;
        }

        return res.json();
    })
    .then(data => {
        if (!data) return;

        console.log("Pedido enviado:", data);

        reiniciarCarrito();
        window.location.href = "/compra-exitosa.html";
    })
    .catch(err => {
        console.error("Error de red:", err);
        alert("No se pudo conectar con el servidor");
    });
}