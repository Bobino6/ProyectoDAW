
const tableBody = document.getElementById('clients-table-body');
const form = document.getElementById('client-form');
const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// Mostrar modal
openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

// Cerrar modal
closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

const searchInput = document.getElementById('search-input');
let allClients = [];

const employeeId = localStorage.getItem('EmployeeId');

// Obtener clientes
async function fetchClients() {
  const res = await fetch('http://localhost:5000/api/clients');
  const clients = await res.json();


 // Filtrar clientes por si alguno de sus pedidos tiene ese empleado
  const filteredClients = clients.filter(client =>
    client.orders.some(order =>
      order.employee.some(emp => emp.id === employeeId)
    )
  );

  if(employeeId !== '684721407cbd6837a180f01b') {
    allClients = filteredClients;
  } else {
    allClients = clients;
  }
  
  renderClients(allClients);
}

function renderClients(clients) {
  tableBody.innerHTML = '';
  clients.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="client-detail.html?id=${client._id}">${client.name}</a></td>
      <td>${client.email}</td>
      <td>${client.company}</td>
    `;
    tableBody.appendChild(tr);
  });
}

//logica buscador
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allClients.filter(client =>
    client.name.toLowerCase().includes(query) ||
    client.email.toLowerCase().includes(query) ||
    client.company.toLowerCase().includes(query)
  );
  renderClients(filtered);
});

// Crear cliente
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const company = document.getElementById('company').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  const res = await fetch('http://localhost:5000/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, company, address, phone })
  });

  if (res.ok) {
    form.reset();
    modal.classList.add('hidden');
    fetchClients();
  } else {
    alert('Error al crear cliente');
  }
});

fetchClients();

  