async function cargarDashboard() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await cargarPerfilDashboard(user.id);
    const datos = await obtenerDatosDashboard(user.id);

    actualizarResumenDashboard(datos);
    generarAlertasDashboard(user.id, datos);
}

async function cargarPerfilDashboard(userId) {
    const { data, error } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    if (!data) return;

    document.getElementById("saludoUsuario").textContent = `Bienvenido, ${data.nombre}`;
    document.getElementById("descripcionUsuario").textContent = `Carrera: ${data.carrera} | Ciclo: ${data.ciclo}`;
    document.getElementById("badgeCarrera").textContent = data.carrera;

    document.getElementById("perfilNombre").textContent = data.nombre;
    document.getElementById("perfilCarrera").textContent = data.carrera;
    document.getElementById("perfilCiclo").textContent = data.ciclo;
    document.getElementById("perfilUniversidad").textContent = data.universidad;
}

async function obtenerDatosDashboard(userId) {
    const { data: redes } = await supabaseClient
        .from("uso_redes")
        .select("*")
        .eq("user_id", userId);

    const { data: tareas } = await supabaseClient
        .from("tareas")
        .select("*")
        .eq("user_id", userId);

    const { data: notas } = await supabaseClient
        .from("notas")
        .select("*")
        .eq("user_id", userId);

    return {
        redes: redes || [],
        tareas: tareas || [],
        notas: notas || []
    };
}

function actualizarResumenDashboard(datos) {
    let totalHorasRedes = 0;

    datos.redes.forEach(item => {
        totalHorasRedes += Number(item.horas);
    });

    const tareasPendientes = datos.tareas.filter(tarea => tarea.estado === "Pendiente").length;

    let sumaNotas = 0;

    datos.notas.forEach(item => {
        sumaNotas += Number(item.nota);
    });

    let promedio = 0;

    if (datos.notas.length > 0) {
        promedio = sumaNotas / datos.notas.length;
    }

    document.getElementById("dashHorasRedes").textContent = totalHorasRedes.toFixed(1) + " h";
    document.getElementById("dashTareasPendientes").textContent = tareasPendientes;
    document.getElementById("dashPromedio").textContent = promedio.toFixed(2);
}

async function generarAlertasDashboard(userId, datos) {
    await supabaseClient
        .from("alertas")
        .delete()
        .eq("user_id", userId);

    const alertas = [];

    let totalHorasRedes = 0;

    datos.redes.forEach(item => {
        totalHorasRedes += Number(item.horas);
    });

    const tareasPendientes = datos.tareas.filter(tarea => tarea.estado === "Pendiente").length;

    let sumaNotas = 0;

    datos.notas.forEach(item => {
        sumaNotas += Number(item.nota);
    });

    let promedio = 0;

    if (datos.notas.length > 0) {
        promedio = sumaNotas / datos.notas.length;
    }

    if (totalHorasRedes >= 8) {
        alertas.push({
            user_id: userId,
            tipo: "Redes sociales",
            mensaje: "Uso muy alto de redes sociales. Se recomienda reducir el tiempo de conexión.",
            prioridad: "Alta"
        });
    } else if (totalHorasRedes >= 5) {
        alertas.push({
            user_id: userId,
            tipo: "Redes sociales",
            mensaje: "Uso alto de redes sociales. Mantén controlado tu tiempo digital.",
            prioridad: "Media"
        });
    }

    if (tareasPendientes >= 3) {
        alertas.push({
            user_id: userId,
            tipo: "Gestión del tiempo",
            mensaje: "Tienes varias actividades pendientes. Organiza tu horario de estudio.",
            prioridad: "Media"
        });
    }

    if (promedio > 0 && promedio < 11) {
        alertas.push({
            user_id: userId,
            tipo: "Rendimiento académico",
            mensaje: "Riesgo académico detectado. Refuerza los cursos con menor calificación.",
            prioridad: "Alta"
        });
    } else if (promedio >= 14) {
        alertas.push({
            user_id: userId,
            tipo: "Rendimiento académico",
            mensaje: "Buen rendimiento académico. Mantén tus hábitos de estudio.",
            prioridad: "Baja"
        });
    }

    if (alertas.length > 0) {
        await supabaseClient
            .from("alertas")
            .insert(alertas);
    }

    mostrarAlertasDashboard(alertas);
}

function mostrarAlertasDashboard(alertas) {
    const contenedor = document.getElementById("listaAlertasDashboard");
    const totalAlertas = document.getElementById("dashTotalAlertas");

    contenedor.innerHTML = "";
    totalAlertas.textContent = alertas.length;

    if (alertas.length === 0) {
        contenedor.innerHTML = `
            <div class="alerta-item alerta-baja">
                <strong>Sin alertas</strong>
                <p>No se detectaron riesgos importantes por ahora.</p>
            </div>
        `;
        return;
    }

    alertas.forEach(alerta => {
        const div = document.createElement("div");

        let clase = "alerta-baja";

        if (alerta.prioridad === "Alta") {
            clase = "alerta-alta";
        } else if (alerta.prioridad === "Media") {
            clase = "alerta-media";
        }

        div.classList.add("alerta-item", clase);

        div.innerHTML = `
            <strong>${alerta.tipo} - Prioridad ${alerta.prioridad}</strong>
            <p>${alerta.mensaje}</p>
        `;

        contenedor.appendChild(div);
    });
}

cargarDashboard();