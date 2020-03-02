const mongoose = require('mongoose');

// article schema

let peopleSchema = mongoose.Schema({
  person:{
    type: String,
    required: true
  },
  userID:{
    type: String,
    required: true
  }
});

let People = module.exports = mongoose.model('People',peopleSchema);