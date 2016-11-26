# SPE Front Desk interface

Interface used at front desk to link booking numbers to RFID bracelets

## Overview

Front desk worker logs in using special account, this account has read/write access in firebase. Asks email of visitor, either:

- They signed up at booking terminal and booking is already on screen
- They signed up at home and worker needs to search for email to find booking

Once booking found, connects to scanner and associates any bands scanned with with selected booking. Should also allow the addition and removal of RFID ids.

Interface should also show the status of the connected scanner.

Bookings made on the booking system send a signal to the front desk interface which shows the current bookings which need to be linked.

On search should grey out results which have already linked RFIDs to reduce amount to search

## Code snippets

### Messaging between booking interface and front desk interface

[listener event docs](https://firebase.google.com/docs/database/web/lists-of-data)

```javascript
// Booking interface from terminals
// 1\. Send booking to recent_bookings database
var database = firebase.database();
var recent_booking_ref = database.ref('recent_bookings');
var recent_booking = {
  "booking_number": 123123,
};
recent_booking_ref.push(recent_booking).catch(function(error) {
  console.error('Error writing new booking to Firebase Database', error);
});

// Front desk interface
// 1.1 Watch added, changed or deleted child in recent_bookings, update interface correspondingly
var database = firebase.database();
var recent_booking_ref = database.ref('recent_bookings');

recent_booking_ref.on('child_added', function(data) {
  addCommentElement(postElement, data.key, data.val().text, data.val().author);
});

recent_booking_ref.on('child_removed', function(data) {
  deleteCommentElement(postElement, data.key, data.val().text, data.val().author);
});

// 1.2 On search, search booking table for email
// Get a reference to all recent bookings; search these; on click of search button perform full search
var email = "test@example.com".lower()

// 2\. Create user account with email if it dosen't already exist, create fake password, send verification email
// 3\. Talk to scanner and wait for RFID IDs
// 4\. When x button clicked, delete from recent_bookings if it was in there
```

### Searching emails in firebase

### Login and database rules
