const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Jurno:2981@n2mu-cl-yimem.mongodb.net/n2mu-db?retryWrites=true&w=majority', {
    useNewUrlParser: true
})
  .then(db => console.log('db connected'))
  .catch(err => console.log(err));