'use strict';

var admin = require("firebase-admin");
var express = require('express');
var app = express();

function uid_from_email(email, success_callback, failure_callback) {
    var errorstatus;
    admin.auth().getUserByEmail(email)
        .then(function(userRecord) {
            console.log("User account found:", userRecord.toJSON());
            success_callback(userRecord.uid);
        })
        .catch(function(error) {
            console.log("Error getting user record:", error);
            errorstatus = error.errorInfo.code;
        }).then(function() {
            if (errorstatus == 'auth/user-not-found') {
                console.log("User not found, creating account");

                admin.auth().createUser({
                        email: email,
                        emailVerified: false,
                        //TODO: Make the password secure using a crypto library (Math.random() is not secured)
                        password: (Math.random() + 1).toString(36).slice(2) + (Math.random() + 1).toString(36).slice(2),
                        disabled: false
                    })
                    .then(function(userRecord) {
                        console.log("Successfully created new user:", userRecord.uid);
                        console.log(userRecord.toJSON());
                        success_callback(userRecord.uid);
                    })
                    .catch(function(error) {
                        console.log("Error creating new user:", error);
                        failure_callback(error);
                    });
            } else {
                failure_callback();
            }
        });
}

admin.initializeApp({
    databaseURL: "https://spe-elabs.firebaseio.com",
    credential: admin.credential.cert(require("service.json")),
    databaseAuthVariableOverride: {
        uid: "booking-service"
    }
});
admin.auth();

app.get('/', function(req, res) {
    var email = req.query.email;
    if (email === undefined) {
        res.status(400).jsonp({
            error: 'please enter an email in the email GET parameter'
        });
        return;
    }

    uid_from_email(email, function(uid) {
        res.jsonp({
            uid: uid
        });
    }, function(err) {
        res.status(501).jsonp({
            error: 'an error occured'
        });
        console.log('ERROR');
    });
});

app.listen(3001, function() {
    console.log("Server listening on: http://localhost:%s", 3001);
});
