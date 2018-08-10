let bodyParser = require('body-parser');
let moment = require('moment');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let formidable = require('formidable');
let verifyToken = require('../auth/verifyToken');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    /**
     * front page.
     */
    app.get('/', verifyToken, function(req, res){

    });

}