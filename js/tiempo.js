async function agregarTarea() {
    const actividad = document.getElementById("actividad").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (actividad === "" || fecha === "" || hora === "") {
        alert("Completa todos los campos");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const { error } = await supabaseClient
        .from("tareas")
        .insert([
            {
                user_id: user.id,
                actividad: actividad,
                fecha: fecha,
                hora: hora,
                estado: "Pendiente"
            }
        ]);

    if (error) {
        alert("Error al guardar: " + error.message);
        console.log(error);
        return;
    }

    alert("Actividad guardada correctamente");

    document.getElementById("actividad").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";

    listarTareas();
}

async function listarTareas() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("tareas")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true });

    if (error) {
        console.log(error);
        return;
    }

    const lista = document.getElementById("listaTareas");
    lista.innerHTML = "";

    let total = data.length;
    let completadas = 0;
    let pendientes = 0;

    data.forEach(item => {
        const fila = document.createElement("div");
        fila.classList.add("fila-registro");

        let claseEstado = "estado-pendiente";

        if (item.estado === "Completada") {
            claseEstado = "estado-bueno";
            completadas++;
        } else {
            pendientes++;
        }

        fila.innerHTML = `
            <span><strong>${item.actividad}</strong></span>
            <span>${item.hora}</span>
            <span>${item.fecha}</span>
            <span>
                <button 
                    class="${claseEstado}"
                    onclick="cambiarEstado(${item.id}, '${item.estado}')"
                >
                    ${item.estado}
                </button>
            </span>
        `;

        lista.appendChild(fila);
    });

    actualizarResumenTiempo(total, completadas, pendientes);
}

async function cambiarEstado(id, estadoActual) {
    let nuevoEstado = "";

    if (estadoActual === "Pendiente") {
        nuevoEstado = "Completada";
    } else {
        nuevoEstado = "Pendiente";
    }

    const { error } = await supabaseClient
        .from("tareas")
        .update({
            estado: nuevoEstado
        })
        .eq("id", id);

    if (error) {
        alert("Error al actualizar: " + error.message);
        console.log(error);
        return;
    }

    listarTareas();
}

function actualizarResumenTiempo(total, completadas, pendientes) {
    const totalTareas = document.getElementById("totalTareas");
    const totalCompletadas = document.getElementById("totalCompletadas");
    const totalPendientes = document.getElementById("totalPendientes");
    const porcentajeProductividad = document.getElementById("porcentajeProductividad");
    const analisisTiempo = document.getElementById("analisisTiempo");

    totalTareas.textContent = total;
    totalCompletadas.textContent = completadas;
    totalPendientes.textContent = pendientes;

    let porcentaje = 0;

    if (total > 0) {
        porcentaje = (completadas / total) * 100;
    }

    porcentajeProductividad.textContent = porcentaje.toFixed(0) + "%";

    if (total === 0) {
        analisisTiempo.textContent =
            "Registra tus actividades académicas para obtener un análisis automático sobre tu gestión del tiempo.";
        return;
    }

    if (porcentaje >= 80) {
        analisisTiempo.textContent =
            "El estudiante presenta una gestión del tiempo adecuada, con alto cumplimiento de actividades académicas.";
    } else if (porcentaje >= 50) {
        analisisTiempo.textContent =
            "El estudiante presenta una gestión del tiempo moderada. Se recomienda completar las actividades pendientes para mejorar la organización académica.";
    } else {
        analisisTiempo.textContent =
            "El estudiante presenta baja organización académica, debido a la cantidad de actividades pendientes. Se recomienda establecer horarios de estudio y priorizar tareas.";
    }
}

listarTareas();