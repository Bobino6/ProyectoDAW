const mongoose = require('mongoose');

const employeSchema = new mongoose.Schema({
  name: String,
  email: String,
  pasword: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

module.exports = mongoose.model('Employe', employeSchema, 'employes');
