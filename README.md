# SPE Front Desk interface

Interface used at front desk to link booking numbers to RFID bracelets

## Overview

Front desk worker logs in using special account, this account has read/write access in firebase. Asks email of visitor, either:

- They signed up at booking terminal and booking is already on screen
- They signed up at home and worker needs to search for email to find booking

Once booking found, connects to scanner and associates any bands scanned with with selected booking.

## How to run

We use a special user account and hard code the uid in the database rules file `database.rules.json` (and online rules) e.g. `auth.uid === 'rxvoyifq2nM7b7lPW1ZyF1Gcfht1'`. To test you should create your own account, find its uid and change the database rules file to match. To add an account follow the start the web server and a google signup popup should open, once signed in head to [firebase authentication](https://console.firebase.google.com/project/spe-elabs/authentication/users) find your newly created user and copy the user uid.

```bash
$ git clone https://github.com/begly/spe-front-desk.git
$ cd spe-front-desk
$ npm install -g firebase-tools
$ firebase signin

-- Start the firebase dev server, just serves static index.html file
$ firebase serve

-- Start the privilege server
$ node server.js
```

Navigate to <http://localhost:5000/>, the interface has three sections.

- Header has an email search, press enter to search, exact matches only, it will display all matches as we can have multiple bookings with the same email. Click one of the results to view it
- Recent bookings panel (LEFT panel), watches the recent_bookings table, adds & removes bookings automatically. `open` button opens in booking view panel, `remove` button removes from recent_bookings table and interface (done when all RFIDs are linked). Selected bookings are highlighted in red.
- Booking view panel (RIGHT panel), shows currently selected booking info. Watches rfids table and adds and removes RFIDs as the table updates. `Add RFIDs` button starts to watch rfids_scans table, it will associate any RFID which is scanned by scanner 1 (Change in `app.js scanner_id variable`) to the selected booking (these will automatically appear in the interface) until the button is clicked again.

### Limitations

Completely written in client side firebase js code except for getting a users UID from their email, for this we do an ajax request to server.js node server which has firebase-admin and creates a new user if needed and returns the uid.

### server.js

Navigate to <http://localhost:3001/>, add `?email=<email>` and the server will create an account if needed and return the uid. We return JSONP values.

### Tools

Tools use a service account which should be included, if not download from [firebase](https://console.firebase.google.com/project/spe-elabs/settings/serviceaccounts/adminsdk) and rename `service.json`

- Write a booking, open `tools/write_booking.js` and edit last line then run `node tools/write_booking.js`. This also adds the booking to the recent_bookings table. Notice if you run this while the interface is open it will auto update.
- Write a RFID scan, open `tools/write_rfid_scans.js` and edit last line then run `node tools/write_rfid_scans.js`. If you write a scan while `Add RFIDs` button pressed on interface then the RFIDs will be linked with the selected booking and show in the interface.

## TODO

- Interface should show which scanner it is connected to
- Interface should allow removal of RFID
- On search should grey out results which have already linked RFIDs to reduce amount to search
- Cleanup database and fix permissions
- Add testing service account with read/write to everything
