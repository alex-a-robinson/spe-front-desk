'use strict';

var admin = require("firebase-admin");


function write_rfid_scans(scanner_id, rfid, timestamp) {
    admin.database().ref('rfid_scans/' + scanner_id).push({
        rfid: rfid,
        timestamp: timestamp,
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
//write_rfid_scans(1, 12347, 789);
write_rfid_scans(1, 6, 789);
//write_rfid(123, '-KXWCZdiHCVhvCMLx6be', "KDIQpU8ExIV9ynccO1irk4y01q82");
//write_rfid(1234, '-KXWCZdiHCVhvCMLx6be', "KDIQpU8ExIV9ynccO1irk4y01q82");
//write_rfid(12345, '-KXWCZdiHCVhvCMLx6be', "KDIQpU8ExIV9ynccO1irk4y01q82");
