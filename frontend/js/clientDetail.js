// genera la ruta para la vista generar factura
document.querySelector('.invoiceButton').addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  window.location.href = `invoice.html?id=${clientId}`;
});


let client;
const params = new URLSearchParams(window.location.search);
const clientId = params.get('id');
const deleteClientBtn = document.getElementById('delete-client-button');

deleteClientBtn?.addEventListener('click', async () => {
  const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este cliente?');

  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(`Error al eliminar cliente: ${errorData.message}`);
      return;
    }

    alert('Cliente eliminado correctamente');
    // Redirigir a la lista de clientes
    window.history.back();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    alert('Hubo un error al intentar eliminar el cliente');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');

  const detailDiv = document.getElementById('client-detail');
  const form = document.getElementById('update-client-form');

  if (!clientId) {
    detailDiv.textContent = 'ID de cliente no proporcionado.';
    return;
  }

  async function cargarEmpleados() {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      const empleados = await res.json();

      const select = document.getElementById('employeId');

      const editSelect = document.getElementById('editEmployee');
      
      editSelect.innerHTML = '<option value="">selecciona trabajador</option>'; 
      select.innerHTML = '<option value="">selecciona trabajador</option>'; // limpiar

      empleados.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp._id;
        option.textContent = emp.name;
        select.appendChild(option);
      });
      empleados.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp._id;
        option.textContent = emp.name;
        editSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  cargarEmpleados()

 
  try {
    // Obtener datos del cliente
    const res = await fetch(`http://localhost:5000/api/clients/${clientId}`);
    client = await res.json();

    const formattedDate = client.jobDate
    ? new Date(client.jobDate).toLocaleDateString('es-ES')
    : 'Fecha no introducida';

    // Mostrar detalles del cliente
    detailDiv.innerHTML = `
      <p><strong>Nombre:</strong> ${client.name}</p>
      <p><strong>Email:</strong> ${client.email}</p>
      <p><strong>Compañía:</strong> ${client.company}</p>
      <p><strong>Dirección:</strong> ${client.address}</p>
      <p><strong>Teléfono:</strong> ${client.phone || 'No proporcionado'}</p>
      <br>
    `;
    const ordersContainer = document.getElementById('orders-container');

if (client.orders && client.orders.length > 0) {
  client.orders.forEach((order, index) => {
    const formattedDate = order.jobDate
      ? new Date(order.jobDate).toLocaleDateString('es-ES')
      : 'Sin fecha';

    const orderElement = document.createElement('div');
    orderElement.classList.add('accordion-item');

    orderElement.innerHTML = `
      <div class="accordion-header">Pedido #${order._id} - ${order.workName || 'Sin concepto'} (${formattedDate})</div>
      <div class="accordion-content">
        <p><strong>Concepto:</strong> ${order.workName || 'No definido'}</p>
        <p><strong>Fecha de entrega:</strong> ${formattedDate}</p>
        <p><strong>Horas diseño:</strong> ${order.designWorkedHours || 0}</p>
        <p><strong>Horas impresión:</strong> ${order.printWorkedHours || 0}</p>
        <p><strong>Piezas:</strong> ${order.pieces || 0}</p>
        <p><strong>Tipo de trabajo:</strong> ${order.jobType || 'No especificado'}</p>
        <p><strong>Empleado a cargo de este pedido:</strong> ${order?.employee[0]?.name || 'No especificado'}</p>
        <p><strong>Comentario:</strong> ${order?.comment?.text || 'No especificado'} </p>
        <p><strong>Fecha del comentario:</strong> ${order?.comment?.date || 'No especificado'}</p>
        <p><strong>Comentario sobre el pedido:</strong> <input type="textarea" class="comentarioInput"></input></p>
        <div class="pedidoInfo">
          <button id="delete-order-btn" class="delete-order-btn" data-order-id="${order._id}">Eliminar pedido</button>
          <button id="update-order-btn" class="saveButton" data-order-id="${order._id}">Guardar comentario</button>
          <button class="editOrderButton" data-order-id="${order._id}">Editar pedido</button>
        </div>
        
      </div>
      `
    ;


    orderElement.querySelector('.editOrderButton').addEventListener('click', () => {
      const modal = document.getElementById('editOrderModal');

      // Rellenar valores
      document.getElementById('editOrderId').value = order._id;
      document.getElementById('editWorkName').value = order.workName || '';
      document.getElementById('editDeliveryDate').value = order.deliveryDate?.slice(0, 10) || '';
      document.getElementById('editDesignHours').value = order.designWorkedHours || 0;
      document.getElementById('editPrintHours').value = order.printWorkedHours || 0;
      document.getElementById('editPieces').value = order.pieces || 0;
      document.getElementById('editJobType').value = order.jobType || '';
      document.getElementById('editEmployee').value = order.employee?.[0]?.name || '';

      modal.classList.add('show');
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
      document.getElementById('editOrderModal').classList.remove('show');
    });



  // logica editar pedido

  document.getElementById('editOrderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const orderId = document.getElementById('editOrderId').value;
  const clientId = client._id;

  const select = document.getElementById('editEmployee');
  const data = {
    workName: document.getElementById('editWorkName').value,
    deliveryDate: document.getElementById('editDeliveryDate').value,
    designWorkedHours: parseFloat(document.getElementById('editDesignHours').value),
    printWorkedHours: parseFloat(document.getElementById('editPrintHours').value),
    pieces: parseInt(document.getElementById('editPieces').value),
    jobType: document.getElementById('editJobType').value,
    employee: [
    {
      name: document.getElementById('editEmployee').options[select.selectedIndex].text,
      id: document.getElementById('editEmployee').value,
    },
  ],
  };

  try {
    const response = await fetch(`http://localhost:5000/api/clients/${clientId}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Error actualizando pedido');

    alert('Pedido actualizado correctamente');
    document.getElementById('editOrderModal').classList.remove('show');
    location.reload();
  } catch (error) {
    console.error(error);
    alert('Hubo un problema al guardar los cambios');
  }
});

    // logica guardar comentario
    orderElement.querySelector('.saveButton').addEventListener('click', async (e) => {
      const orderId = e.target.dataset.orderId;
      const clientId = client._id; /* aquí necesitas tener el clientId disponible */
      const comentarioInput = orderElement.querySelector('.comentarioInput');
      const comentarioTexto = comentarioInput.value.trim();

      if (!comentarioTexto) {
        alert('Por favor escribe un comentario');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/clients/${clientId}/orders/${orderId}/comment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: comentarioTexto }),
        });

        if (!response.ok) throw new Error('Error al guardar comentario');

        const data = await response.json();
        alert('Comentario guardado correctamente');
        comentarioInput.value = ''; // Limpiar input
        location.reload();
      } catch (err) {
        console.error(err);
        alert('Hubo un problema al guardar el comentario');
      }
    });

    ordersContainer.appendChild(orderElement);
  });

  //logica para eliminar un pedido// Añadimos listener a todos los botones de eliminar
document.querySelectorAll('.delete-order-btn').forEach(button => {
  button.addEventListener('click', async (event) => {

   const orderId = event.target.dataset.orderId;

   console.log('orderId', orderId)
    const confirmed = confirm('¿Seguro que quieres eliminar este pedido?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/clients/${client._id}/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.log('error'. error);
        throw new Error('Error al eliminar el pedido.');
      }


      alert('Pedido eliminado correctamente.');
      location.reload(); // o vuelve a cargar los pedidos dinámicamente si prefieres
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar el pedido.');
    }
    });
  });

  // Agrega funcionalidad de acordeón
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      content.classList.toggle('active');
    });
  });
} else {
  ordersContainer.innerHTML = '<p>Este cliente aún no tiene pedidos registrados.</p>';
}

  } catch (error) {
    detailDiv.textContent = 'Error al cargar los datos del cliente.';
    console.error(error);
  }
});



document.getElementById('add-order-button').addEventListener('click', () => {
  const form = document.getElementById('new-order-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const clientId = new URLSearchParams(window.location.search).get('id');


  const select = document.getElementById('employeId');
  const employeeId = select.value;
  const employeeName = select.options[select.selectedIndex].text;

  const newOrder = {
    workName: document.getElementById('newWorkName').value,
    designWorkedHours: parseInt(document.getElementById('newDesignHours').value || '0'),
    printWorkedHours: parseInt(document.getElementById('newPrintHours').value || '0'),
    jobDate: document.getElementById('newJobDate').value,
    pieces: parseInt(document.getElementById('newPieces').value || '0'),
    jobType: document.getElementById('newJobType').value,
    employee: {
      id: employeeId,
      name: employeeName,
    },

  };

  try {
    const res = await fetch(`http://localhost:5000/api/clients/${clientId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });

    if (res.ok) {
      alert('Pedido agregado con éxito');
      location.reload();
    } else {
      alert('Error al agregar el pedido');
    }
  } catch (error) {
    console.error('Error de red al guardar el pedido:', error);
    alert('Error al enviar el pedido');
  }
});
