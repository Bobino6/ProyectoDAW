const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Client = require('../models/Cliente');
const Order = require('../models/Order'); 

// ✅ Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error });
  }
});

// ✅ DELETE cliente por ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar cliente' });
  }
});



// PUT actualizar pedido completo
router.put('/:clientId/orders/:orderId', async (req, res) => {
  const { clientId, orderId } = req.params;
  const {
    workName,
    deliveryDate,
    designWorkedHours,
    printWorkedHours,
    pieces,
    jobType
  } = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    const order = client.orders.id(orderId);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Actualizar campos
    order.workName = workName;
    order.deliveryDate = deliveryDate;
    order.designWorkedHours = designWorkedHours;
    order.printWorkedHours = printWorkedHours;
    order.pieces = pieces;
    order.jobType = jobType;

    await client.save();

    res.status(200).json({ message: 'Pedido actualizado con éxito', order });
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ✅ Obtener un cliente por su ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cliente', error: err });
  }
});

// ✅ POST para registra un nuevo cliente en la bbdd
router.post('/', async (req, res) => {
  const { name, email, company, address, phone } = req.body;

  try {
    const newClient = new Client({ name, email, company, address, phone });
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

//✅  PUT actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});


//✅ POST para guardar pedidos de un cliente
router.post('/:id/orders', async (req, res) => {
  const clientId = req.params.id;
  const newOrder = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    client.orders.push(newOrder);
    await client.save();

    res.status(201).json({ message: 'Pedido agregado correctamente', client });
  } catch (error) {
    console.error('Error al guardar pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//✅ GET para traernos los pedidos por cliente
router.get('/api/clients/:clientId/orders', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Buscar pedidos con el campo clientId
    const orders = await Order.find({ clientId });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});


//✅ DELETE para eliminar un pedido
router.delete('/:clientId/orders/:orderId', async (req, res) => {
  const { clientId, orderId } = req.params;

  try {
    // Asegúrate de que ambos son ObjectId válidos
    if (!mongoose.Types.ObjectId.isValid(clientId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const result = await Client.updateOne(
      { _id: clientId },
      { $pull: { orders: { _id: new mongoose.Types.ObjectId(orderId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.status(200).json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


// ✅ PUT para agregar comentario a un pedido
router.put('/:clientId/orders/:orderId/comment', async (req, res) => {
  const { clientId, orderId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comentario vacío' });
  }

  try {
    const client = await Client.findOne({ _id: clientId, 'orders._id': orderId });

    if (!client) return res.status(404).json({ message: 'Cliente o pedido no encontrado' });

    const order = client.orders.id(orderId);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    order.comment = {
      text,
      date: new Date()
    };

    await client.save();

    res.status(200).json({ message: 'Comentario agregado correctamente', order });
  } catch (error) {
    console.error('Error al guardar comentario:', error);
    res.status(500).json({ message: 'Error al agregar comentario' });
  }
});

module.exports = router;