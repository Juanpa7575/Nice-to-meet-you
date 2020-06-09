const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Jurno:2981@cluster0-ny2ec.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true
})
  .then(db => console.log('db connected'))
  .catch(err => console.log(err));