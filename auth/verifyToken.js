let jwt = require('jsonwebtoken');
let key = require('../config').config;
let uuidv4 = require('uuid/v4');

function verifyToken(req, res, next){
    let token = req.cookies.auth;

    if(!token){
        let authenticity_token = jwt.sign({
            id: uuidv4(),
            claim: {
                signup: 'valid'
            }
        }, key.secret, { expiresIn: 300 });

        return res.status(200).render('login', {authenticity_token});

    } else { 
        
        jwt.verify(token, config.secret, function(err, decoded){
            if(err){
                let authenticity_token = jwt.sign({
                    id: uuidv4(),
                    claim: {
                        signup: 'valid'
                    }
                },  key.secret, { expiresIn: 300 });

                return res.status(200).render('login', {authenticity_token});

            } else {

                req.userID = decoded.id;
                req.claim = decoded.claim;
                next();

            }
        });

    }

}

module.exports = verifyToken;
