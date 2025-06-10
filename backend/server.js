const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

// rutas empleados
const employeeRoutes = require('./routes/employesRoutes');
app.use('/api/employees', employeeRoutes);
//-----
const path = require('path');
// Servir archivos estáticos desde "frontend/pages"
app.use(express.static(path.join(__dirname, '../frontend'))); 

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
  })
  .catch(err => console.error(err));