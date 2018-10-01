const express = require('express')
const app = express();

app.use(express.static('./www'));

const server = app.listen(80, function(){
  console.log("Express server has started on port 3000")
});