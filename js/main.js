
var Facebook = function ( callback ) {
  var that = this; // note this usefull trick!

	this.login = function() {
    console.log('Facebook.login()');
    FB.login(function(response) {
          if (response.authResponse) {
              console.log(response);
              that.firstName = response.first_name;
              that.fetchInfo( callback );
          } else {
              // Failed to log in
          }
      },
      {
          scope:'friends_activities, friends_location, friends_photos, friends_status, user_activities, user_location, user_photos, user_status'
      });
  // login a user and call callback() if successfull
  // be sure to provide appropriate {scopes: "scopes,go,here"}
    }

    this.currentUser = 0;
    this.firstName = "";

    this.fetchInfo = function ( cb ) {
      FB.api('/me', function(response) {
                      that.firstName = response.first_name;
                      console.log(response);
                      console.log('Good to see you, ' + response.name + '. Your ID: ' + response.id);
                      that.currentUser = response.id;
                      if ( typeof cb !== "undefined" ) {
                        cb();
                      }
                    });
    };

    this.init = function() {
    /* provided FB init code, don't need to touch much at all*/

    window.fbAsyncInit = function() {

      // init the FB JS SDK
      FB.init({
        appId      : '1424028607819128',  // App ID from the app dashboard
        channelUrl : '/channel.html',   // Channel file for x-domain comms
        status     : true,        // Check Facebook Login status
        xfbml      : true       // Look for social plugins on the page
      });

      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          // the user is logged in and has authenticated
          console.log('Welcome!  Fetching your information.... ');
          that.fetchInfo( callback );
        } else if (response.status === 'not_authorized') {
          // the user is logged in to Facebook,
          // but has not authenticated your app
        } else {
          // the user isn't logged in to Facebook.
          console.log('Not logged in');
          that.login();
        }
      });
    };

    // Load the SDK asynchronously - ignore this Magic!
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  this.init();
}

var game = (function () {

	geocoder = new google.maps.Geocoder();

  	function codeAddress( cb ) {
	    //In this case it gets the address from an element on the page, but obviously you  could just pass it to the method instead
	    var address = "New York, NY";

	    geocoder.geocode( { 'address': address }, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	        //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
	        cb(results[0].geometry.location);
          console.log(results[0].geometry.location);
	      } else {
	        alert("Geocode was not successful for the following reason: " + status);
	      }
    	});
    }

  var fb = null,
      map = null;

	function initialize() {
		codeAddress( function (loc) {
		  var mapOptions = {
		    center: new google.maps.LatLng(37.7749295, -122.41941550000001),
        draggable: false,
        scrollwheel: false,
        panControl: false,
        maxZoom: 10,
        minZoom: 10,
        zoom: 10,
		  };
		  map = new google.maps.Map(document.getElementById("splashMap"), mapOptions);
    });
  }

  function initUser () {
    var firstName = fb.firstName;
    $("#userFirstName").text(firstName);
    $(".loading").hide();
    $(".loggedin").show();
  }

  var cities = {
    "sf": new google.maps.LatLng(37.7749295, -122.41941550000001),
    "ny": new google.maps.LatLng(40.7143528, -74.0059731)
  }

  function changeCity ( city ) {
    map.panTo( cities[city] );
  }

  var that = this;

  $(function () {
  	initialize();

    $("#city-select").on("change", function () {
      var city = $(this).val();

      if ( city === "sf" || city === "ny" ) {
        changeCity(city);
      }
    });

    $("#fb-login").on("click", function () {
      $(".loggedout").hide();
      $(".loading").show();
      fb = new Facebook( function () {
        initUser();
      });
    });
  });
})();