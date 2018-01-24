var express = require('express');
var router = express.Router();
var db = require('../models');
var nodemailer = require('nodemailer');
var bCrypt = require('bcrypt-nodejs');
var emailAddress;

router.route('/')
    .get(function(req, res) {
        res.render('./login/forgot-password');
    })

    .post(function(req, res) {
        emailAddress = req.body.email;
        db.user.findOne({
            where: {
                email: emailAddress
            }
        }).then(function(data) {
            if(!data) {
                // FLASH MESSAGE HERE
            } else {
                var transporter = nodemailer.createTransport({
                    service: 'yahoo',
                    auth: {
                        user: 'EXAMPLE@EXAMPLE.COM',
                        pass: 'PASSWORD',
                    }
                });
                var mailOptions = {
                    from: 'EXAMPLE@EXAMPLE.COM',
                    to: data.email,
                    subject: 'Forgot Password',
                    html: '<p>Go here to reset password<p>' +
                    '<br>' + '<a href="http://localhost:3000/forgot/new"><p>Rotten Potatoes reset password</p></a>'
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) {
                        console.log(error);
                        res.json(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.render('./login/check-email');
                    }
                })
            } // end of mail
        });
    });

router.route('/new')
    .get(function(req, res) {
        res.render('./login/new-password');
    })

    .post(function(req, res) {
        if(req.body.newPass === req.body.confirmPass) {
            var generateHash = function(password) {
				return bCrypt.hashSync(password, bCrypt.genSaltSync(8),null)
            }
            db.user.update({
                password: generateHash(req.body.newPass)
            }, {
                where: {
                    email: emailAddress
                }
            }).then(function(error, info) {
                if(error) {
                    console.log(error);
                    // flash error here? password not updated or something
                } else {
                    console.log("Password Updated:" + info.response);
                    res.redirect('/login');
                }
            });
        } else {
            return "Your passwords don't match";
        }
    })
module.exports = router;