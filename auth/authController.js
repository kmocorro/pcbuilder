let jwt = require('jsonwebtoken');
let bodyParser = require('body-parser');
let key = require('../config').config;
let formidable = require('formidable');
let bcrypt = require('bcryptjs');
let uuidv4 = require('uuid/v4');
let nodemailer = require('nodemailer');
let mailer = require('../config').config;
let psql = require('psql');
/**
 *   Dear Future Me,
 *      I've prepared some comments to remind you how forgetful you are.
 *   Love,
 *   Me
 */
module.exports = function(app){
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    let transporter = nodemailer.createTransport(mailer.mail);

    /** GET API for user LOGIN Page */
    app.get('/login', function(req, res){

        let authenticity_token = jwt.sign({
            id: uuidv4(),
            claim: {
                signup: 'valid'
            }
        },  key.secret, {expiresIn:300});

        res.render('login', {authenticity_token});
    });

    /** GET API for user LOGOUT */
    app.get('/logout', function(req, res){
        res.cookie('auth', null);
        res.render('logout');
    });
    
    /** GET API for verifySignUp link */
    /** ================================
     *   After signing up, link will be sent to new user's email address.
     *   This will be the API to verify the signup of new user.
     * ================================
     */
    app.get('/verifysignup', function(req, res){

        let verificationLink = req.query.token;

        if(verificationLink){

            function verifyLinkToken(){
                return new Promise(function(resolve, reject){
                    jwt.verify(verificationLink, key.secret, function(err, decoded){
                        if(err){return res.status(200).render('verifysignup_expired')};

                        let verifiedClaim = decoded.claim;
                        resolve(verifiedClaim);
                    });
                });
            }

            verifyLinkToken().then(function(verifiedClaim){
                // connect to database
                // check if !user,
                // else insert user verifiedClaim + send email notification
                // release connection from db
            },  function(err){
                // err response here
            });

        }
    });


}