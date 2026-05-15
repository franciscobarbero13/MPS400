const STORAGE_KEY = "forgotPasswordAttempt";
const imageElement = document.getElementById("imagen-contrasena");

const attempt = Number(localStorage.getItem(STORAGE_KEY) || "0");
const imageName = attempt % 2 === 0 ? "Contraseña1.jpeg" : "Contraseña2.jpeg";

imageElement.src = `./img/${imageName}`;
localStorage.setItem(STORAGE_KEY, String(attempt + 1));

setTimeout(() => {
    window.location.href = "./iniciar_sesion.html";
}, 1000);
