async function getPiezas() {
    const res = await fetch("/api/piezas")
    const resJson = await res.json();
    return resJson;
}