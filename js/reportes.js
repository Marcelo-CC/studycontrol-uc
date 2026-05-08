let graficoRedes = null;
let graficoTareas = null;
let graficoNotas = null;

async function cargarReportes() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const redes = await obtenerUsoRedes(user.id);
    const tareas = await obtenerTareas(user.id);
    const notas = await obtenerNotas(user.id);

    generarReporte(redes, tareas, notas);
    generarGraficos(redes, tareas, notas);
}

async function obtenerUsoRedes(userId) {
    const { data, error } = await supabaseClient
        .from("uso_redes")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.log(error);
        return [];
    }

    return data;
}

async function obtenerTareas(userId) {
    const { data, error } = await supabaseClient
        .from("tareas")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.log(error);
        return [];
    }

    return data;
}

async function obtenerNotas(userId) {
    const { data, error } = await supabaseClient
        .from("notas")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.log(error);
        return [];
    }

    return data;
}

function generarReporte(redes, tareas, notas) {
    let totalHorasRedes = 0;

    redes.forEach(item => {
        totalHorasRedes += Number(item.horas);
    });

    const tareasCompletadas = tareas.filter(tarea => tarea.estado === "Completada").length;
    const tareasPendientes = tareas.filter(tarea => tarea.estado === "Pendiente").length;

    let sumaNotas = 0;

    notas.forEach(item => {
        sumaNotas += Number(item.nota);
    });

    let promedio = 0;

    if (notas.length > 0) {
        promedio = sumaNotas / notas.length;
    }

    document.getElementById("totalRedes").textContent = totalHorasRedes.toFixed(1) + " h";
    document.getElementById("tareasCompletadas").textContent = tareasCompletadas;
    document.getElementById("tareasPendientes").textContent = tareasPendientes;
    document.getElementById("promedioAcademico").textContent = promedio.toFixed(2);

    generarAnalisis(totalHorasRedes, tareasCompletadas, tareasPendientes, promedio);
}

function generarAnalisis(totalHorasRedes, tareasCompletadas, tareasPendientes, promedio) {
    const analisisGeneral = document.getElementById("analisisGeneral");
    const listaRecomendaciones = document.getElementById("listaRecomendaciones");

    listaRecomendaciones.innerHTML = "";

    let analisis = "";

    if (totalHorasRedes >= 8 && promedio < 14) {
        analisis =
            "El estudiante presenta un uso muy alto de redes sociales y un rendimiento académico regular o bajo. Esto puede indicar que las distracciones digitales están afectando su desempeño académico.";
    } else if (totalHorasRedes >= 5 && promedio < 14) {
        analisis =
            "El estudiante presenta un uso alto de redes sociales y necesita reforzar sus hábitos académicos para mejorar su rendimiento.";
    } else if (totalHorasRedes < 5 && promedio >= 14) {
        analisis =
            "El estudiante mantiene un uso controlado de redes sociales y un rendimiento académico favorable. Esto refleja una adecuada gestión del tiempo.";
    } else {
        analisis =
            "El estudiante presenta una situación académica intermedia. Se recomienda seguir registrando información para obtener un análisis más preciso.";
    }

    if (tareasPendientes > tareasCompletadas) {
        analisis +=
            " Además, se observa una mayor cantidad de tareas pendientes, lo cual puede afectar la organización académica.";
    } else if (tareasCompletadas > 0) {
        analisis +=
            " También se observa cumplimiento de actividades académicas, lo cual favorece la gestión del tiempo.";
    }

    analisisGeneral.textContent = analisis;

    agregarRecomendaciones(totalHorasRedes, tareasCompletadas, tareasPendientes, promedio);
}

function agregarRecomendaciones(totalHorasRedes, tareasCompletadas, tareasPendientes, promedio) {
    const lista = document.getElementById("listaRecomendaciones");

    if (totalHorasRedes >= 8) {
        agregarItem(lista, "Reducir urgentemente el tiempo de uso de redes sociales, especialmente durante horas de estudio.");
    } else if (totalHorasRedes >= 5) {
        agregarItem(lista, "Establecer límites diarios para el uso de redes sociales.");
    }

    if (tareasPendientes > 0) {
        agregarItem(lista, "Priorizar las tareas pendientes y organizar un horario académico semanal.");
    }

    if (promedio < 11) {
        agregarItem(lista, "Reforzar los cursos con bajo rendimiento y solicitar apoyo académico.");
    } else if (promedio < 14) {
        agregarItem(lista, "Mejorar los hábitos de estudio para elevar el promedio académico.");
    }

    if (totalHorasRedes < 5 && tareasPendientes === 0 && promedio >= 14) {
        agregarItem(lista, "Mantener los hábitos actuales de organización y control del uso de redes sociales.");
    }

    if (lista.children.length === 0) {
        agregarItem(lista, "Registrar más información para generar recomendaciones más precisas.");
    }
}

function agregarItem(lista, texto) {
    const li = document.createElement("li");
    li.textContent = texto;
    lista.appendChild(li);
}

function generarGraficos(redes, tareas, notas) {
    generarGraficoRedes(redes);
    generarGraficoTareas(tareas);
    generarGraficoNotas(notas);
}

function generarGraficoRedes(redes) {
    const resumenRedes = {};

    redes.forEach(item => {
        const red = item.red_social;

        if (!resumenRedes[red]) {
            resumenRedes[red] = 0;
        }

        resumenRedes[red] += Number(item.horas);
    });

    const labels = Object.keys(resumenRedes);
    const valores = Object.values(resumenRedes);

    const ctx = document.getElementById("graficoRedes");

    if (graficoRedes) {
        graficoRedes.destroy();
    }

    graficoRedes = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels.length > 0 ? labels : ["Sin datos"],
            datasets: [
                {
                    label: "Horas registradas",
                    data: valores.length > 0 ? valores : [0],
                    backgroundColor: "#0d6efd",
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generarGraficoTareas(tareas) {
    const completadas = tareas.filter(tarea => tarea.estado === "Completada").length;
    const pendientes = tareas.filter(tarea => tarea.estado === "Pendiente").length;

    const ctx = document.getElementById("graficoTareas");

    if (graficoTareas) {
        graficoTareas.destroy();
    }

    graficoTareas = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completadas", "Pendientes"],
            datasets: [
                {
                    data: [completadas, pendientes],
                    backgroundColor: ["#198754", "#ffc107"]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function generarGraficoNotas(notas) {
    const labels = notas.map(item => item.curso);
    const valores = notas.map(item => Number(item.nota));

    const ctx = document.getElementById("graficoNotas");

    if (graficoNotas) {
        graficoNotas.destroy();
    }

    graficoNotas = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.length > 0 ? labels : ["Sin datos"],
            datasets: [
                {
                    label: "Notas",
                    data: valores.length > 0 ? valores : [0],
                    borderColor: "#0d6efd",
                    backgroundColor: "rgba(13, 110, 253, 0.15)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20
                }
            }
        }
    });
}

cargarReportes();