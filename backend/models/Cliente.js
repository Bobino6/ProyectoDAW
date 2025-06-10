const mongoose = require('mongoose');


const employee = new mongoose.Schema({
 name: String,
 id: String,
});


const orderSchema = new mongoose.Schema({
  workName: String,
  designWorkedHours: { type: Number, default: 0 },
  printWorkedHours: { type: Number, default: 0 },
  pieces: { type: Number, default: 0 },
  jobType: String,
  jobDate: Date,
  employee: [employee],
  comment: {
    text: String,
    date: Date
  }
});

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  company: String,
  phone: Number,
  orders: [orderSchema]
});

module.exports = mongoose.model('Client', clientSchema, 'clients');
