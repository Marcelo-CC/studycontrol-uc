function iniciarSesion() {
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    if (usuario === "admin" && password === "1234") {
        alert("Bienvenido a StudyControl UC");
        window.location.href = "dashboard.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function registrarRed() {
    let red = document.getElementById("redSocial").value;
    let horas = document.getElementById("horasUso").value;
    let lista = document.getElementById("listaRedes");

    if (red === "" || horas === "") {
        alert("Completa todos los campos");
        return;
    }

    let item = document.createElement("li");
    item.textContent = red + " - " + horas + " horas de uso";

    if (horas >= 3) {
        item.textContent += " ⚠ Uso elevado";
        alert("Alerta: estás usando demasiado tiempo las redes sociales.");
    }

    lista.appendChild(item);

    document.getElementById("redSocial").value = "";
    document.getElementById("horasUso").value = "";
}

function agregarTarea() {
    let tarea = document.getElementById("tarea").value;
    let hora = document.getElementById("hora").value;
    let lista = document.getElementById("listaTareas");

    if (tarea === "" || hora === "") {
        alert("Completa todos los campos");
        return;
    }

    let item = document.createElement("li");
    item.textContent = hora + " - " + tarea;

    lista.appendChild(item);

    document.getElementById("tarea").value = "";
    document.getElementById("hora").value = "";
}

function agregarNota() {
    let curso = document.getElementById("curso").value;
    let nota = document.getElementById("nota").value;
    let lista = document.getElementById("listaNotas");

    if (curso === "" || nota === "") {
        alert("Completa todos los campos");
        return;
    }

    let item = document.createElement("li");
    item.textContent = curso + " - Nota: " + nota;

    if (nota < 11) {
        item.textContent += " ⚠ Riesgo académico";
        alert("Alerta: necesitas reforzar este curso.");
    }

    lista.appendChild(item);

    document.getElementById("curso").value = "";
    document.getElementById("nota").value = "";
}