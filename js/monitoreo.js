async function agregarNota() {
    const curso = document.getElementById("curso").value.trim();
    const nota = Number(document.getElementById("nota").value);

    if (curso === "" || isNaN(nota)) {
        alert("Completa todos los campos correctamente");
        return;
    }

    if (nota < 0 || nota > 20) {
        alert("La nota debe estar entre 0 y 20");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const { error } = await supabaseClient
        .from("notas")
        .insert([
            {
                user_id: user.id,
                curso: curso,
                nota: nota
            }
        ]);

    if (error) {
        alert("Error al guardar: " + error.message);
        console.log(error);
        return;
    }

    alert("Nota registrada correctamente");

    document.getElementById("curso").value = "";
    document.getElementById("nota").value = "";

    listarNotas();
}

async function listarNotas() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("notas")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });

    if (error) {
        console.log(error);
        return;
    }

    const lista = document.getElementById("listaNotas");
    lista.innerHTML = "";

    let sumaNotas = 0;
    let cursosRiesgo = 0;

    data.forEach(item => {
        const fila = document.createElement("div");
        fila.classList.add("fila-registro");

        const notaNumero = Number(item.nota);
        sumaNotas += notaNumero;

        let estado = "";
        let claseEstado = "";

        if (notaNumero < 11) {
            estado = "Riesgo";
            claseEstado = "estado-alerta";
            cursosRiesgo++;
        } else if (notaNumero < 14) {
            estado = "Regular";
            claseEstado = "estado-pendiente";
        } else if (notaNumero < 17) {
            estado = "Bueno";
            claseEstado = "estado-moderado";
        } else {
            estado = "Excelente";
            claseEstado = "estado-bueno";
        }

        fila.innerHTML = `
            <span><strong>${item.curso}</strong></span>
            <span>${notaNumero}</span>
            <span>${item.fecha}</span>
            <span class="${claseEstado}">${estado}</span>
        `;

        lista.appendChild(fila);
    });

    actualizarResumenAcademico(data.length, sumaNotas, cursosRiesgo);
}

function actualizarResumenAcademico(totalCursos, sumaNotas, cursosRiesgo) {
    const promedioGeneral = document.getElementById("promedioGeneral");
    const totalCursosTexto = document.getElementById("totalCursos");
    const cursosRiesgoTexto = document.getElementById("cursosRiesgo");
    const estadoAcademico = document.getElementById("estadoAcademico");
    const analisisAcademico = document.getElementById("analisisAcademico");

    totalCursosTexto.textContent = totalCursos;
    cursosRiesgoTexto.textContent = cursosRiesgo;

    if (totalCursos === 0) {
        promedioGeneral.textContent = "0";
        estadoAcademico.textContent = "Sin datos";
        analisisAcademico.textContent =
            "Registra tus notas para obtener un análisis automático de tu rendimiento académico.";
        return;
    }

    const promedio = sumaNotas / totalCursos;
    promedioGeneral.textContent = promedio.toFixed(2);

    if (promedio < 11) {
        estadoAcademico.textContent = "Riesgo";
        analisisAcademico.textContent =
            "El estudiante presenta riesgo académico. Se recomienda reforzar los cursos con menor calificación y mejorar los hábitos de estudio.";
    } else if (promedio < 14) {
        estadoAcademico.textContent = "Regular";
        analisisAcademico.textContent =
            "El estudiante presenta un rendimiento académico regular. Se recomienda organizar mejor el tiempo de estudio y cumplir las actividades pendientes.";
    } else if (promedio < 17) {
        estadoAcademico.textContent = "Bueno";
        analisisAcademico.textContent =
            "El estudiante presenta un buen rendimiento académico. Se recomienda mantener una adecuada gestión del tiempo y controlar el uso de redes sociales.";
    } else {
        estadoAcademico.textContent = "Excelente";
        analisisAcademico.textContent =
            "El estudiante presenta un rendimiento académico excelente. Mantener los hábitos actuales contribuirá a conservar este desempeño.";
    }

    if (cursosRiesgo > 0) {
        analisisAcademico.textContent +=
            " Además, existen cursos en riesgo que requieren atención prioritaria.";
    }
}

listarNotas();