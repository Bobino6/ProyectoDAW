const form = document.getElementById('login-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements[0].value;
    const password = form.elements[1].value;

    try {
      const res = await fetch('http://localhost:5000/api/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        alert(`¡Bienvenido, ${data.name}!`);
        localStorage.setItem("EmployeeId", data.id);
        localStorage.setItem("EmployeeName", data.name);
        // Redirigir a clients.html
        window.location.href = 'D:/Proyecto-Edu-app/frontend/pages/clientes.html';
      } else {
        alert('Correo o contraseña incorrectos.');
      }
    } catch (error) {
      alert('Error al conectar con el servidor.');
    }
  });