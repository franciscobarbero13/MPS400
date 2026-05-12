
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/me")
    .then(res => res.json())
    .then(data => {
        if (data.logged) {
                document.querySelectorAll(".guest-only")
                    .forEach(el => el.style.display = "none");

                const userInfo = document.getElementById("user-info");
                userInfo.style.display = "flex";
                document.getElementById("username-info").textContent = data.username;

                const trazabilidadBtn = document.getElementById("btn-trazabilidad");
                if (trazabilidadBtn) trazabilidadBtn.style.display = "inline";

            } else {
                document.querySelectorAll(".guest-only")
                    .forEach(el => el.style.display = "inline");

                document.getElementById("username-info").style.display = "none";

                const trazabilidadBtn = document.getElementById("btn-trazabilidad");
                if (trazabilidadBtn) trazabilidadBtn.style.display = "none";
            }
    })
    .catch(err => console.error("Error verificando sesion", err));
});

const logoutbtn = document.getElementById("logout-btn");

if(logoutbtn){
    logoutbtn.addEventListener("click", async () => {
        try{
            const res = await fetch("/api/logout", {
                method: "POST"
            });

            const data = await res.json();

            if(data.ok){
                window.location.href = "/index.html";
            }
        } catch(err){
            console.error("Error al cerrar sesion", err)
        }
    });
}