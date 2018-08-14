let jwt = require('jsonwebtoken');
let bodyParser = require('body-parser');
let key = require('../config').config;
let formidable = require('formidable');
let bcrypt = require('bcryptjs');
let uuidv4 = require('uuid/v4');
let nodemailer = require('nodemailer');
let mailer = require('../config').config;
let pool = require('../config').pool;
let client = require('../config').client;

/**
 *   Dear Future Me,
 *      I've prepared some comments to remind you how forgetful you are.
 *   Hehe,
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
    
    /**  GET API for verifySignUp link
     *   - After signing up, link will be sent to new user's email address.
     *   This will be the API to verify signup of new user.
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

                function userExistence(){
                    return new Promise(function(resolve, reject){
                        let isActive = 1;

                        let query_select_new_user = {
                            name: 'check-user-existence',
                            text: 'SELECT * FROM tbl_usr_credentials WHERE username = $1 AND email = $2',
                            values: [verifiedClaim.username, verifiedClaim.email] 
                        };

                        let query_insert_new_user = {
                            text: 'INSERT INTO tbl_usr_credentials(registration_date, firstname, lastname, username, email, isActive, password) VALUES($1, $2, $3, $4, $5, $6, $7)',
                            values: [verifiedClaim.registration_date, verifiedClaim.firstname, verifiedClaim.lastname, verifiedClaim.username, verifiedClaim.email, isActive, verifiedClaim.password]
                        };

                        pool.query(query_select_new_user)
                        .then(function(results){

                            if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){
                                reject('Username or email already exists.');
                            } else {

                                pool.query(query_insert_new_user)
                                .then(function(results){

                                    // nodemailer send approved email notification.
                                    resolve(results);
                                    
                                }).catch(function(err){
                                    reject(err);
                                });
                            }

                        }).catch(function(err){
                            reject(err);
                        });
                    });
                }

                userExistence().then(function(results){
                    res.send('Registration for ' + results + 'has been approved.') // check results.rows[]
                },  function(err){
                    res.send(reject(err));
                });

            });

        }
    });

    


}