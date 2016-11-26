function App() {
    this.user = null;
    this.current_selected = null;
    this.init_firebase();
}

// Sets up shortcuts to Firebase features
App.prototype.init_firebase = function() {
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    this.recent_bookings = this.database.ref('recent_bookings');
    this.bookings = this.database.ref('bookings');

    this.provider = new firebase.auth.GoogleAuthProvider(); // NOTE: change to email/password?
    this.auth.onAuthStateChanged(this.on_auth_state_change.bind(this));
};

App.prototype.sign_in = function() {
    if (!this.auth.currentUser) {
        this.auth.signInWithPopup(this.provider).catch(function(err) {
            console.error('Sign in failed', err);
        });
    }
}

App.prototype.on_auth_state_change = function(user) {
    if (user) {
        this.user = user;
        console.log(this.user.email + ' signed in');
    } else {
        this.sign_in();
    }
}

/* TODO
 * Create booking elem when new booking added to recent_bookings
 * Delete booking elem when booking removed from recent_bookings
 * Let worker login to special user account
 * Add search box to seearch all bookings
 * Connect to scanner and scan wrist bands in
 * Create new user from booking
 */

function create_booking_element_html(snapshot) {
    console.log('create_booking_element_html 5');
    console.log(snapshot.val());
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

function delete_booking_element(snapshot) {
    console.log('delete_booking_element');
    var booking_id = snapshot.val();
    $('#recent-booking-' + booking_id).remove();
}

App.prototype.create_booking_element = function(snapshot) {
    var booking_id = snapshot.val();
    firebase.database().ref('bookings/' + booking_id).once('value').then(create_booking_element_html);
}

function update_booking_element_html(snapshot) {
    var booking = snapshot.val();
    var count = 4; // TODO need booking ticket count

    $('#booking-email').text(booking.email);
    $('#booking-count').text(count);
}

function add_booking_element_rfid_html(snapshot) {
    var rfid_id = snapshot.key; // TODO date of rfid added, which scanner
    var element_html = '<li id="booking-rfid-' + rfid_id + '">' + rfid_id + '</li>'
    $('#booking-rfids').append(element_html);
}

function remove_booking_element_rfid_html(snapshot) {
    var rfid_id = snapshot.key;
    $('#booking-rfid-' + rfid_id).remove();
}

App.prototype.update_selected = function(booking_id) {
    if (this.current_selected) {
        this.current_selected_rfids_ref().off('child_added');
        this.current_selected_rfids_ref().off('child_removed');
        $('#recent-booking-' + this.current_selected).removeClass('booking-selected');
    }
    this.current_selected = booking_id;
    $('#recent-booking-' + this.current_selected).addClass('booking-selected');
    $('#booking-rfids').html('');
    firebase.database().ref('bookings/' + this.current_selected).once('value').then(update_booking_element_html);
    this.current_selected_rfids_ref().on('child_added', add_booking_element_rfid_html);
    this.current_selected_rfids_ref().on('child_removed', remove_booking_element_rfid_html);

}

App.prototype.current_selected_rfids_ref = function() {
    return firebase.database().ref('rfids').orderByChild('booking_id').equalTo(this.current_selected);
}

App.prototype.nothing_selected = function() {
    this.current_selected = null;
    $('#booking-email').text('n/a');
    $('#booking-count').text('n/a');
    $('#booking-rfids').html('');
}

App.prototype.remove_booking = function(booking_id) {
    if (this.current_selected == booking_id) {
        this.nothing_selected();
    }
    console.log(booking_id);
    firebase.database().ref('recent_bookings/' + booking_id).remove(function(err) {
        console.error('Error deleteing recent_booking', err);
    });
}

App.prototype.select_search = function(booking_id) {
    this.update_selected(booking_id);
    $('#search-results').remove();
}

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

App.prototype.search = function(query) {
    firebase.database().ref('bookings').orderByChild("email").equalTo(query).once('value').then(create_search_results_element_html);
}
App.prototype.change_focus = function(booking_id) {}
App.prototype.add_rfid = function(rfid) {}
App.prototype.close_booking_element = function() {}

window.onload = function() {
    window.app = new App();

    app.recent_bookings.on('child_added', app.create_booking_element.bind(app));
    app.recent_bookings.on('child_removed', delete_booking_element);

    $('#search').keypress(function(evt) {
        if (evt.which == 13) app.search($('#search').val())
    });
}
