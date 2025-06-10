const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// ✅ Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener empleados', error });
  }
});

// ✅ Crear un nuevo empleado
router.post('/', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear empleado', error });
  }
});


// Endpoint para login de empleados
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Employee.findOne({ email, password });

    if (user) {
      res.status(200).json({ success: true, message: 'Login correcto', name: user.name, id: user._id, tasks: user.tasks });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});



// PATCH /api/employees/:id/assign-task
router.patch('/:id/assign-task', async (req, res) => {
  const { orderId } = req.body;
  const employeeId = req.params.id;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId es requerido' });
  }

  try {
    const result = await Employee.findByIdAndUpdate(
      employeeId,
      {
        $push: {
          tasks: {
            orderId,
            status: 'pending',
            assignedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ success: true, employee: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar tarea' });
  }
});

module.exports = router;

