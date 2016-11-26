function App() {
    this.user;
    this.book_button = document.getElementById('book');
    this.booking_quantity_input = document.getElementById('booking-quantity');
    this.booking_email_input = document.getElementById('booking-email');

    this.book_button.addEventListener('click', this.book.bind(this));

    this.init_firebase();
}

// Sets up shortcuts to Firebase features
App.prototype.init_firebase = function() {
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth()

    this.booking_ref = this.database.ref('bookings');
    this.booking_ref.off();

    this.auth.onAuthStateChanged(this.on_auth_state_change.bind(this));
};

App.prototype.sign_in = function() {
    firebase.auth().signInAnonymously().catch(function(error) {
        console.error('Sign in failed', error);
    });
}

App.prototype.on_auth_state_change = function(user) {
    this.user = user;
}

App.prototype.get_booking_input = function() {
    return {
        quantity: this.booking_quantity_input.value,
        email: this.booking_email_input.value
    };
}

App.prototype.clear_booking_input = function() {
    this.booking_quantity_input.value = this.booking_quantity_input.getAttribute('data-default');
    this.booking_email_input.value = this.booking_email_input.getAttribute('data-default');
}

App.prototype.book = function() {
    var booking_data = this.get_booking_input();

    var booking = this.save_booking(booking_data);
    this.booked(booking_data);
    this.clear_booking_input();
}

App.prototype.save_booking = function(booking_data) {
    booking_data.date = firebase.database.ServerValue.TIMESTAMP;
    return this.booking_ref.push(booking_data).catch(function(error) {
        console.error('Error writing new booking to Firebase Database', error);
    });
}

App.prototype.booked = function(booking) {
    console.log('Booked ' + booking.quantity + ' tickets under ' + booking.email);
}

window.onload = function() {
    window.app = new App();

    app.auth.signInAnonymously()
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

App.prototype.booking_from_recent_booking = function(recent_booking) {
    var booking = this.database.ref('booking/' + booking_id).once('value').then(function(snapshot) {
        snapshot.val()
    });
}
