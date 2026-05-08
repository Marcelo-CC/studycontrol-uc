// REGISTRAR USUARIO
async function registrarUsuario() {
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    if (nombre === "" || correo === "" || password === "") {
        alert("Completa todos los campos");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: correo,
        password: password,
        options: {
            data: {
                nombre: nombre
            }
        }
    });

    if (error) {
        alert("Error al registrar: " + error.message);
        return;
    }

    alert("Usuario registrado correctamente. Ahora inicia sesión.");
    window.location.href = "login.html";
}


// INICIAR SESIÓN
async function iniciarSesion() {
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    if (correo === "" || password === "") {
        alert("Completa todos los campos");
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: correo,
        password: password
    });

    if (error) {
        alert("Correo o contraseña incorrectos");
        return;
    }

    alert("Bienvenido a StudyControl UC");
    window.location.href = "dashboard.html";
}