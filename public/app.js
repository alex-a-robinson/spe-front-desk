function App() {
    this.user = null;
    this.current_selected = null;
    this.scanner_id = 1;
    this.new_items = false;
    this.init_firebase();
}

var new_items = false;

// Sets up shortcuts to Firebase features
App.prototype.init_firebase = function() {
    this.provider = new firebase.auth.GoogleAuthProvider(); // NOTE: change to email/password?
    firebase.auth().onAuthStateChanged(this.on_auth_state_change.bind(this));
};

App.prototype.sign_in = function() {
    if (!firebase.auth().currentUser) {
        firebase.auth().signInWithPopup(this.provider).catch(function(err) {
            console.error('Sign in failed', err);
        });
    }
}

App.prototype.on_auth_state_change = function(user) {
    if (user) {
        this.user = user;
        console.log(this.user.email + ' signed in');
    } else {
        this.user = null;
        this.sign_in();
    }
}

// Creates a booking element in the interface to display real times bookings from terminals
function create_recent_booking_element_html(snapshot) {
    var booking = snapshot.val();
    var count = 4; // TODO need booking ticket count

    var element_html = '\
        <div class="recent-booking"> \
            <span><strong>' + count + '</strong></span> \
            <span>' + booking.email + '</span> \
            <br /> \
            <input type="button" value="open" onclick="window.app.update_selected(\'' + snapshot.key + '\');"/> \
            <input type="button" value="remove" onclick="window.app.remove_booking(\'' + snapshot.key + '\');"/> \
        </div>';
    var element = $(element_html);
    element.attr({
        id: "recent-booking-" + snapshot.key
    });

    $('#recent-bookings-list').append(element);
}

// Deletes recent booking element html
function delete_recent_booking_element(snapshot) {
    var booking_id = snapshot.val();
    $('#recent-booking-' + booking_id).remove();
}

// Gets a recent booking id, finds the booking, creates the html element
App.prototype.create_recent_booking_element = function(snapshot) {
    var booking_id = snapshot.val();
    firebase.database().ref('bookings/' + booking_id).once('value').then(create_recent_booking_element_html);
}

// Updates booking zoom with selected booking details
function update_booking_element_html(snapshot) {
    var booking = snapshot.val();
    var count = 4; // TODO need booking ticket count

    $('#booking-email').text(booking.email);
    $('#booking-count').text(count);
}

// Adds the rfids to the booking zoom
function add_booking_element_rfid_html(snapshot) {
    var rfid_id = snapshot.key; // TODO date of rfid added, which scanner
    var element_html = '<li id="booking-rfid-' + rfid_id + '">' + rfid_id + '</li>'
    $('#booking-rfids').append(element_html);
}

// Deletes rfids from booking zoom
function remove_booking_element_rfid_html(snapshot) {
    var rfid_id = snapshot.key;
    $('#booking-rfid-' + rfid_id).remove();
}

// Updates the booking zoom with selected booking details
App.prototype.update_selected = function(booking_id) {

    // If something was selected before, turn off the event waters and remove styling class
    if (this.current_selected) {
        this.current_selected_rfids_ref().off('child_added');
        this.current_selected_rfids_ref().off('child_removed');
        $('#recent-booking-' + this.current_selected).removeClass('booking-selected');
    }

    // Now on the newly selcted booking
    this.current_selected = booking_id;
    // Add styling class, clear the html so we can rewrite the data
    $('#recent-booking-' + this.current_selected).addClass('booking-selected');
    $('#booking-rfids').html('');
    firebase.database().ref('bookings/' + this.current_selected).once('value').then(update_booking_element_html);

    // Add rfid event whatchers
    this.current_selected_rfids_ref().on('child_added', add_booking_element_rfid_html);
    this.current_selected_rfids_ref().on('child_removed', remove_booking_element_rfid_html);

    // Enable the button, ensure its state starts as off
    $('#booking-add-rfids').attr('disabled', false);
    this.toggle_add_rfids($('#booking-add-rfids'), 'off');
}

// Shortcut function, returns ref to the currently selected bookings rfids
App.prototype.current_selected_rfids_ref = function() {
    return firebase.database().ref('rfids').orderByChild('booking_id').equalTo(this.current_selected);
}

// No bookings selected, called to reset booking zoom
App.prototype.nothing_selected = function() {
    this.current_selected = null;
    $('#booking-email').text('n/a');
    $('#booking-count').text('n/a');
    $('#booking-rfids').html('');
    $('#booking-add-rfids').attr('disabled', true);
    this.toggle_add_rfids($('#booking-add-rfids'), 'off');
}

// Delete a booking from the interface (when remove button pressed)
App.prototype.remove_booking = function(booking_id) {
    if (this.current_selected == booking_id) {
        this.nothing_selected();
    }
    firebase.database().ref('recent_bookings/' + booking_id).remove();
}

// Select a result from search rather then recent bookings, delete search results popup
App.prototype.select_search = function(booking_id) {
    this.update_selected(booking_id);
    $('#search-results').remove();
}

// Create the search results popup element
function create_search_results_element_html(snapshot) {
    var results_html = '';
    snapshot.forEach(function(child) {
        var booking = child.val();
        var count = 4; // TODO: count
        results_html += '<li><a href="#" onclick="window.app.select_search(\'' + child.key + '\')">' + booking.email + ' - ' + count + ' - ' + booking.timestamp + '</a></li>';
    }.bind(this));
    var element_html = '<div id="search-results"><ul>' + results_html + '</ul></div>';
    $('body').append(element_html);
}

// Search by query, called when enter is pressed in search box
App.prototype.search = function(query) {
    // TODO Should order these by timestamp, most recent first
    firebase.database().ref('bookings').orderByChild("email").equalTo(query).once('value').then(create_search_results_element_html);
}

// Toggle "Add RFIDs" button
App.prototype.toggle_add_rfids = function(elem, force_state) {
    elem = $(elem);
    var state;
    if (force_state === undefined) {
        state = $(elem).attr('data-toggle');
    } else {
        state = force_state;
    }

    if (state == 'off') {
        elem.text('Add RFIDs');
        state = 'on';
        this.stop_adding_rfids();
    } else {
        elem.text('Stop adding RFIDs');
        state = 'off';
        this.add_rfids();
    }
    $(elem).attr('data-toggle', state);
}

// Adds listeners so any RFID scanned by this.scanner_id is added to selected booking
App.prototype.add_rfids = function() {
    // We only want newly scanned rfids rather then all previous ones, new_items does this
    new_items = false;
    firebase.database().ref('rfid_scans').orderByChild('scanner_id').equalTo(this.scanner_id).on('child_added', this.add_rfid.bind(this));
    firebase.database().ref('rfid_scans').orderByChild('scanner_id').equalTo(this.scanner_id).once('child_added').then(function() {
        new_items = true;
    });
}

// Disable the RFID event watcher
App.prototype.stop_adding_rfids = function() {
    firebase.database().ref('rfid_scans').orderByChild('scanner_id').equalTo(this.scanner_id).off('child_added');
}

// Calls admin server to get uid from email
App.prototype.get_current_selected_uid = function(callback) {
    var errorstatus = null;

    // Get the email, then either create a user or get user
    firebase.database().ref('bookings/' + this.current_selected).once('value').then(function(snapshot) {
        var email = snapshot.val().email;
        //callback(123); // TODO, uid cannot be got from client
        $.ajax({
            url: 'http://localhost:3001/?email=' + email,
            success: callback,
            dataType: 'jsonp',
            crossOrigin: true,
        });
    });
}

// Add RFID to currently selected booking
App.prototype.add_rfid = function(snapshot) {
    if (!new_items) return;

    var rfid = snapshot.val();
    var booking_id = this.current_selected;

    this.get_current_selected_uid(function(uid) {
        uid = uid.uid;
        firebase.database().ref('rfids/' + rfid.rfid).set({
            booking_id: booking_id,
            uid: uid,
        }).catch(function(err) {
            console.error('Error writing rfid', err);
        });
    })
}

window.onload = function() {
    window.app = new App();

    // Setup recent booking event watchers
    firebase.database().ref('recent_bookings').on('child_added', app.create_recent_booking_element.bind(app));
    firebase.database().ref('recent_bookings').on('child_removed', delete_recent_booking_element);

    // When enter key pressed in search box
    $('#search').keypress(function(evt) {
        if (evt.which == 13) app.search($('#search').val())
    });
}
