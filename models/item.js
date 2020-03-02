const mongoose = require('mongoose');

// item schema

let itemSchema = mongoose.Schema({
  day:{
    type: String,
    required: true
  },
  month:{
    type: String,
    required: true
  },
  year:{
    type: String,
    required: true
  },
  itemName:{
    type: String,
    required: true
  },
  itemPrice:{
    type: Number,
    required: true
  },
  paidBy:{
    type: String,
    required: true
  },
  userID:{
    type: String,
    required: true
  }
});

let Item = module.exports = mongoose.model('Item',itemSchema);