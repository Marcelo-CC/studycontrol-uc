async function registrarRed() {
    const redSocial = document.getElementById("redSocial").value.trim();
    const horasUso = Number(document.getElementById("horasUso").value);

    if (redSocial === "" || horasUso === "" || isNaN(horasUso)) {
        alert("Completa todos los campos correctamente");
        return;
    }

    if (horasUso < 0) {
        alert("Las horas no pueden ser negativas");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const { error } = await supabaseClient
        .from("uso_redes")
        .insert([
            {
                user_id: user.id,
                red_social: redSocial,
                horas: horasUso
            }
        ]);

    if (error) {
        alert("Error al guardar: " + error.message);
        console.log(error);
        return;
    }

    alert("Registro guardado correctamente");

    document.getElementById("redSocial").value = "";
    document.getElementById("horasUso").value = "";

    listarRedes();
}

async function listarRedes() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("uso_redes")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });

    if (error) {
        console.log(error);
        return;
    }

    const lista = document.getElementById("listaRedes");
    lista.innerHTML = "";

    let totalHoras = 0;

    data.forEach(item => {

        totalHoras += Number(item.horas);

        const fila = document.createElement("div");
        fila.classList.add("fila-registro");

        const horas = Number(item.horas);

        let estado = "";
        let claseEstado = "";

        if (horas >= 8) {
            estado = "Uso muy alto";
            claseEstado = "estado-alerta";
        } else if (horas >= 5) {
            estado = "Uso alto";
            claseEstado = "estado-pendiente";
        } else if (horas >= 3) {
            estado = "Uso moderado";
            claseEstado = "estado-moderado";
        } else {
            estado = "Uso adecuado";
            claseEstado = "estado-bueno";
        }

        fila.innerHTML = `
            <span><strong>${item.red_social}</strong></span>
            <span>${horas} horas</span>
            <span>${item.fecha}</span>
            <span class="${claseEstado}">${estado}</span>
        `;

        lista.appendChild(fila);
    });

    actualizarResumen(data.length, totalHoras);
}

function actualizarResumen(totalRegistros, totalHoras) {

    const totalHorasRedes = document.getElementById("totalHorasRedes");
    const totalRegistrosTexto = document.getElementById("totalRegistros");
    const estadoGeneral = document.getElementById("estadoGeneral");
    const analisisRedes = document.getElementById("analisisRedes");

    totalHorasRedes.textContent = totalHoras.toFixed(1) + " h";
    totalRegistrosTexto.textContent = totalRegistros;

    if (totalRegistros === 0) {

        estadoGeneral.textContent = "Sin datos";

        analisisRedes.textContent =
            "Registra el uso de tus redes sociales para obtener un análisis automático.";

        return;
    }

    if (totalHoras >= 8) {

        estadoGeneral.textContent = "Muy alto";

        analisisRedes.textContent =
            "El estudiante presenta un nivel crítico de uso de redes sociales. Esto podría afectar significativamente la concentración, productividad y rendimiento académico.";

    } else if (totalHoras >= 5) {

        estadoGeneral.textContent = "Alto";

        analisisRedes.textContent =
            "El uso de redes sociales es elevado. Se recomienda disminuir las horas de uso para evitar distracciones académicas.";

    } else if (totalHoras >= 3) {

        estadoGeneral.textContent = "Moderado";

        analisisRedes.textContent =
            "El uso de redes sociales es moderado. Mantener un control adecuado favorecerá la organización del tiempo académico.";

    } else {

        estadoGeneral.textContent = "Adecuado";

        analisisRedes.textContent =
            "El uso de redes sociales se encuentra dentro de un nivel adecuado y equilibrado.";
    }
}

listarRedes();