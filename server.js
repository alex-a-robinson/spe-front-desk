'use strict';

var admin = require("firebase-admin");
var http = require('http');
var url = require('url');


function write_rfid_scans(scanner_id, rfid, timestamp) {
    admin.database().ref('rfid_scans/' + scanner_id).push({
        rfid: rfid,
        timestamp: timestamp,
    }).catch(function(error) {
        console.error('Error writing new rfid scan', error);
    });
}

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

//We need a function which handles requests and send response
function handle_request(req, res) {
    var url_parts = url.parse(req.url, true);
    var email = url_parts.query.email;

    console.log(email);


    if (email === undefined) {
        res.statusCode = 400;
        res.end('please enter an email in the email GET parameter');
        return;
    }

    uid_from_email(email, function(uid) {
        res.statusCode = 200;
        res.end(uid);
    }, function(err) {
        res.statusCode = 501;
        res.end('an error occured:', err);
        console.log('ERROR');
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

var server = http.createServer(handle_request);
server.listen(3001, function() {
    console.log("Server listening on: http://localhost:%s", 3001);
});
