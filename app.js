function App() {
    this.user;
    //this.book_button = document.getElementById('book');
    //this.booking_quantity_input = document.getElementById('booking-quantity');
    //this.booking_email_input = document.getElementById('booking-email');

    //this.book_button.addEventListener('click', this.book.bind(this));

    this.init_firebase();
}

// Sets up shortcuts to Firebase features
App.prototype.init_firebase = function() {
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();

    //this.booking_ref = this.database.ref('bookings');
    //this.booking_ref.off();

    this.provider = new firebase.auth.GoogleAuthProvider(); // NOTE: change to email/password?
    this.auth.onAuthStateChanged(this.on_auth_state_change.bind(this));
};

App.prototype.sign_in = function() {
    this.auth.signInWithPopup(this.provider).then(function(result) {
        this.token = result.credential.accessToken;
        this.user = result.user;
    }).catch(function(err) {
        console.error('Sign in failed', err);
    });
}

App.prototype.on_auth_state_change = function(user) {
    this.user = user;
}

/* TODO
 * Create booking elem when new booking added to recent_bookings
 * Delete booking elem when booking removed from recent_bookings
 * Let worker login to special user account
 * Add search box to seearch all bookings
 * Connect to scanner and scan wrist bands in
 * Have X button to close booking elem / remove from
 */

App.prototype.create_booking_element = function(booking) {}
App.prototype.delete_booking_element = function(booking) {}
App.prototype.search = function(query, callback) {}
App.prototype.change_focus = function(booking_id) {}
App.prototype.add_rfid = function(rfid) {}
App.prototype.close_booking_element = function() {}

App.prototype.booking_from_recent_booking = function(recent_booking) {
    var booking = this.database.ref('booking/' + booking_id).once('value').then(function(snapshot) {
        snapshot.val()
    });
}

window.onload = function() {
    window.app = new App();

    app.sign_in()
}

function create_recent_booking_element(data) {
    var email = '123';
    var ticket_count = 2;
    var booking_date = '12/12/12';
    var booking_id = '123abc123';

    var container = $('<div class="recent_booking"></div>').attr({
        id: 'recent_booking_' + booking_id
    });
    var email_container = $('<span></span>').text(email);
    var ticket_count_container = $('<span></span>').text(ticket_count);
    var booking_date_container = $('<span></span>').text(booking_date);
    var open_button = $('<input type="button" value="open"/>');
    var close_button = $('<input type="button" value="close"/>');

    container
        .append(email_container)
        .append($('<br />'))
        .append(ticket_count_container)
        .append('<br />')
        .append(booking_date_container)
        .append($('<br />'))
        .append(open_button)
        .append(close_button);

    $('#recent-bookings').append(container);
}

function delete_recent_booking_element(data) {

}
