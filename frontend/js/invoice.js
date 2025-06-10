let client = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('id');

  const res = await fetch(`http://localhost:5000/api/clients/${clientId}`);
  client = await res.json();

  const orders = client.orders; // array de pedidos

  const invoiceDiv = document.getElementById('invoice-content');
  const orderSelect = document.getElementById('order-select');

  // Pinta las opciones en el select
  orders.forEach((order, index) => {
    const option = document.createElement('option');
    option.value = index; // usamos el índice para acceder luego
    option.textContent = `${order.workName || 'Pedido sin nombre'} - ${order.jobDate?.split('T')[0] || 'Sin fecha'}`;
    orderSelect.appendChild(option);
  });

  // Función para mostrar el pedido en pantalla
  const formatDate = (isoDate) => {
    if (!isoDate) return 'Fecha no introducida';
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const renderInvoice = (order) => {
    invoiceDiv.innerHTML = `
      <div id="invoice-header">
        <div class="company-info">
          <strong>Posibilidades3D S.L.</strong><br>
          Avenida Europa 123<br>
          41089 Sevilla, España<br>
          CIF: B12345678<br>
          contacto@posibilidades3d.com
        </div>
        <h1>Factura</h1>
      </div>

      <div class="client-info">
        <span class="section-title">Datos del Cliente</span>
        <div class="info-group">
          <p><strong>Nombre:</strong> ${client.name}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Empresa:</strong> ${client.company || '-'}</p>
          <p><strong>Dirección:</strong> ${client.address || '-'}</p>
        </div>
      </div>

      <div class="work-details">
        <span class="section-title">Detalles del pedido</span>
        <div class="info-group">
          <p><strong>Concepto del trabajo:</strong> ${order.workName || '-'}</p>
          <p><strong>Tipo de trabajo:</strong> ${order.jobType || '-'}</p>
          <p><strong>Horas de diseño:</strong> ${order.designWorkedHours || 0}</p>
          <p><strong>Horas de impresión:</strong> ${order.printWorkedHours || 0}</p>
          <p><strong>Número de piezas:</strong> ${order.pieces || 0}</p>
          <p><strong>Fecha del trabajo:</strong> ${formatDate(order.jobDate)}</p>
        </div>
      </div>

      <div id="price-section">
        <span class="section-title">Presupuesto</span>
        <label for="price-type"><strong>Tipo de precio:</strong></label><br>
        <select id="price-type">
          <option value="">-- Selecciona una opción --</option>
          <option value="pieza">Precio por pieza</option>
          <option value="diseño">Precio por diseño</option>
          <option value="ambos">Precio por ambos</option>
        </select>

        <div id="price-input-container" style="margin-top: 10px; display: none;">
          <label for="price-value"><strong>Precio (€):</strong></label><br>
          <input type="number" id="price-value" min="0" step="0.01" />
        </div>

        <div id="price-breakdown" style="margin-top: 10px;"></div>
        <p id="total-amount" style="font-weight: bold;"></p>
      </div>
    `;

    setupPriceCalculator(order); // ← Añadimos esto para activar cálculo dinámico
  };

  // Evento para cuando el usuario selecciona un pedido
  orderSelect.addEventListener('change', (e) => {
    const selectedOrder = orders[parseInt(e.target.value)];
    if (selectedOrder) {
      renderInvoice(selectedOrder);
    } else {
      invoiceDiv.innerHTML = '';
    }
  });
});


function setupPriceCalculator(order) {
  const typeSelect = document.getElementById('price-type');
  const priceInputContainer = document.getElementById('price-input-container');
  const priceInput = document.getElementById('price-value');
  const breakdownEl = document.getElementById('price-breakdown');
  const totalEl = document.getElementById('total-amount');

  const format = (num) => `${num.toFixed(2)} €`;

  const calculate = () => {
    const type = typeSelect.value;
    const price = parseFloat(priceInput.value);
    if (!type || isNaN(price)) {
      breakdownEl.innerHTML = '';
      totalEl.textContent = '';
      return;
    }

    let total = 0;
    breakdownEl.innerHTML = '';

    if (type === 'pieza') {
      total = price * (order.pieces || 0);
      breakdownEl.innerHTML = `<p><strong>${order.pieces || 0}</strong> piezas × <strong>${format(price)}</strong> = <strong>${format(total)}</strong></p>`;
    } else if (type === 'diseño') {
      total = price * (order.designWorkedHours || 0);
      breakdownEl.innerHTML = `<p><strong>${order.designWorkedHours || 0}</strong> h diseño × <strong>${format(price)}</strong> = <strong>${format(total)}</strong></p>`;
    } else if (type === 'ambos') {
      const diseño = price * (order.designWorkedHours || 0);
      const impresion = price * (order.printWorkedHours || 0);
      const piezas = price * (order.pieces || 0);
      total = diseño + impresion + piezas;
      breakdownEl.innerHTML = `
        <p><strong>${order.designWorkedHours || 0}</strong> h diseño × <strong>${format(price)}</strong> = ${format(diseño)}</p>
        <p><strong>${order.printWorkedHours || 0}</strong> h impresión × <strong>${format(price)}</strong> = ${format(impresion)}</p>
        <p><strong>${order.pieces || 0}</strong> piezas × <strong>${format(price)}</strong> = ${format(piezas)}</p>
      `;
    }

    totalEl.textContent = `Total: ${format(total)}`;
  };

  // Eventos
  typeSelect.addEventListener('change', () => {
    priceInputContainer.style.display = typeSelect.value ? 'block' : 'none';
    calculate();
  });

  priceInput.addEventListener('input', calculate);
}

// const priceTypeSelect = document.getElementById('price-type');
 document.getElementById('download-pdf').addEventListener('click', async () => {
  const priceTypeSelect = document.getElementById('price-type'); // ⬅️ Aquí sí existirá
  const priceValueInput = document.getElementById('price-value');
  const invoiceDiv = document.getElementById('invoice-content');

  if (!priceTypeSelect || !priceValueInput || !invoiceDiv) {
    alert('Faltan elementos necesarios en el DOM para generar la factura');
    return;
  }

  const jsPDFModule = await import('https://cdn.skypack.dev/jspdf');
  const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;

  const priceType = priceTypeSelect.options[priceTypeSelect.selectedIndex].textContent;
  const priceValue = priceValueInput.value;

  const extraInfo = document.createElement('p');
  extraInfo.innerHTML = `<strong>${priceType}:</strong> ${priceValue ? `${priceValue} €` : 'No especificado'}`;
  document.getElementById('price-section').appendChild(extraInfo);

  const totalEl = document.getElementById('total-amount');
  const clone = invoiceDiv.cloneNode(true);
  if (totalEl && totalEl.textContent.trim()) {
    const extra = document.createElement('p');
    extra.innerHTML = `<strong>${totalEl.textContent}</strong>`;
    clone.appendChild(extra);
  }

  const canvas = await html2canvas(invoiceDiv, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDFModule.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 40;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  pdf.save(`factura_${client?.name || 'sin_nombre'}.pdf`);

  extraInfo.remove();
});
