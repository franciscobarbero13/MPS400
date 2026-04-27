
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();

    if(data.ok){
        alert("Usuario creado correctamente");
        window.location.href = "/iniciar_sesion.html";
    }else{
        alert(data.error || "Error al registrar");
    }
});