async function guardarPerfil() {

    const nombre = document.getElementById("nombre").value.trim();
    const carrera = document.getElementById("carrera").value.trim();
    const ciclo = document.getElementById("ciclo").value.trim();
    const universidad = document.getElementById("universidad").value.trim();

    if (
        nombre === "" ||
        carrera === "" ||
        ciclo === "" ||
        universidad === ""
    ) {
        alert("Completa todos los campos");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    const { data: perfilExistente } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (perfilExistente) {

        const { error } = await supabaseClient
            .from("perfiles")
            .update({
                nombre,
                carrera,
                ciclo,
                universidad
            })
            .eq("user_id", user.id);

        if (error) {
            alert("Error al actualizar perfil");
            console.log(error);
            return;
        }

    } else {

        const { error } = await supabaseClient
            .from("perfiles")
            .insert([
                {
                    user_id: user.id,
                    nombre,
                    carrera,
                    ciclo,
                    universidad
                }
            ]);

        if (error) {
            alert("Error al guardar perfil");
            console.log(error);
            return;
        }
    }

    alert("Perfil guardado correctamente");

    cargarPerfil();
}

async function cargarPerfil() {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== "PGRST116") {
        console.log(error);
        return;
    }

    if (!data) return;

    document.getElementById("datoNombre").textContent =
        data.nombre || "No registrado";

    document.getElementById("datoCarrera").textContent =
        data.carrera || "No registrado";

    document.getElementById("datoCiclo").textContent =
        data.ciclo || "No registrado";

    document.getElementById("datoUniversidad").textContent =
        data.universidad || "No registrado";

    document.getElementById("nombre").value =
        data.nombre || "";

    document.getElementById("carrera").value =
        data.carrera || "";

    document.getElementById("ciclo").value =
        data.ciclo || "";

    document.getElementById("universidad").value =
        data.universidad || "";
}

cargarPerfil();