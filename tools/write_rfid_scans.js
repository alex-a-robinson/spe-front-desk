'use strict';

var admin = require("firebase-admin");


function write_rfid_scans(scanner_id, rfid, timestamp) {
    admin.database().ref('rfid_scans').push({
        rfid: rfid,
        timestamp: timestamp,
        scanner_id: scanner_id
    }).catch(function(error) {
        console.error('Error writing new rfid scan', error);
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
admin.database().ref('rfid_scans').once('value', function() {
    process.exit(0)
});
// ---- DO YOUR CHANGES HERE ----
write_rfid_scans(1, 116, 999);
