function App() {
    this.user = null;
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
 * Have X button to close booking elem / remove from
 */

function create_booking_element_html(snapshot) {
    console.log('create_booking_element_html');
    console.log(snapshot.val());
    var booking = snapshot.val();
    var count = 4; // TODO need booking ticket count

    var element_html = '\
        <div class="recent_booking"> \
            <span><strong>' + count + '</strong></span> \
            <span>' + booking.email + '</span> \
            <br /> \
            <input type="button" value="open"/> \
            <input type="button" value="close"/> \
        </div>';
    var element = $(element_html);
    element.attr({
        id: "recent_booking_" + snapshot.key
    });

    $('#recent-bookings-list').append(element);
}

function delete_booking_element(snapshot) {
    console.log('delete_booking_element');
    var booking_id = snapshot.val();
    $('#recent_booking_' + booking_id).remove();
}

App.prototype.create_booking_element = function(snapshot) {
    var booking_id = snapshot.val();
    firebase.database().ref('bookings/' + booking_id).once('value').then(create_booking_element_html);
}


App.prototype.search = function(query, callback) {}
App.prototype.change_focus = function(booking_id) {}
App.prototype.add_rfid = function(rfid) {}
App.prototype.close_booking_element = function() {}

window.onload = function() {
    window.app = new App();

    app.recent_bookings.on('child_added', app.create_booking_element.bind(app));
    app.recent_bookings.on('child_removed', delete_booking_element);
}
