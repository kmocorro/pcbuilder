let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let apiController = require('./controllers/apiController');

let port = process.env.PORT || 3000;

app.use('/', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.listen(port);