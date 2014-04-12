
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

    this.getFriends = function(cb) {
      console.log('Facebook.getFriends()');
      FB.api('/me', function(response) {
          FB.api('/me/friends', function(response_friends) {
              if(response_friends != null && response_friends.data != null) {
                    response_friends.data.push({"name": response.name, "id": response.id});
                    console.log(response_friends);
                    cb(response_friends.data);
                }
            });
      });

      // returns somethin like cb([{name:"",id:""},...]);
    }

    this.init = function() {
    /* provided FB init code, don't need to touch much at all*/

    window.fbAsyncInit = function() {

      // init the FB JS SDK
      FB.init({
        appId      : '1411613772435604',  // App ID from the app dashboard
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

  var fb = null,
      map = null;

	function initialize() {
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
  }

  var that = this,
      friendList = [],
      friendName = "Nancy Xiao";

  function initUser () {
    var firstName = fb.firstName;
    $(".userFirstName").text(firstName);

    that.initFriends( function () {
      $(".loading").hide();
      $(".loggedin").show();
    });
  }

  var cities = {
    "sf": new google.maps.LatLng(37.7749295, -122.41941550000001),
    "sea": new google.maps.LatLng(47.6062095, -122.3320708)
  }

  var selCity = "sea";

  var stopNum = 0;

  var stops = {
    "places": [
      {
        "activity": "coffee",
        "message": "Let's go get coffee at {place}! Be sure to take a selfie with {friend}!",
        "action": "selfie"
      },
      {
        "activity": "sight",
        "message": "Time to go sightseeing! Time to go check out {place}! Be sure to checkin so your friends can see where you've been!",
        "action": "checkin"
      },
      {
        "activity": "lunch",
        "message": "You're starting to get hungry. Go get lunch at {place}. You need to Venmo {friend} for it though!",
        "action": "venmo"
      }
    ]
  };

  var places = {
    "sea": {
      "coffee": [
        {
          name: "Zeitgeist Coffee",
          lat: 47.599006,
          lng: -122.331947
        }
      ],
      "sight": [
        {
          name: "Bill Speidel's Underground Tour",
          lat: 47.602219,
          lng: -122.333613
        }
      ],
      "lunch": [
        {
          name: "Dahlia Lounge",
          lat: 47.613045,
          lng: -122.340431
        }
      ]
    }
  };

  function nextPlace() {
    var stop = stops.places[stopNum];
    var place = places[selCity][stop.activity][0];

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(place.lat, place.lng),
      map: map,
      title: place.name
    });

    var a = $("#msgArea p").text( stop.message.replace("{friend}", friendName).replace("{place}", place.name) );
    $("#msgArea button").hide();

    if ( stopNum === 2 ) {
      $("#phone").hide();
      $("#phoneLost").show();
    }

    stopNum++;
  }

  function changeCity ( city ) {
    map.panTo( cities[city] );
    selCity = city;
  }

  that.getFriends = function () {
    return that.friendList;
  }

  that.friends = {};

  that.initFriends = function ( callback ) {

    that.friendList = [];

    fb.getFriends( function ( friendRsp ) { 
      console.log(friendRsp);
      for ( var i=0, l=friendRsp.length; i < l; i++ ) {
        var friend = friendRsp[i];
        that.friends[ friend.name ] = { "id": friend.id };
        that.friendList.push( friend.name );
      }

      console.log(that.friendList);

      $('#friend-select').typeahead({
        source: that.getFriends
      });

      callback();
    });
  };

  function startGame() {
    $("#splashLeft").hide("slide", { direction: "left" }, 500, function () {
      $("#splashMap").addClass("wide");
      
      map.set('draggable', true);
      map.set('scrollwheel', true);
      map.set('panControl', true);
      map.set('maxZoom', null);
      map.set('minZoom', null);
      map.set('zoom', 12);

      google.maps.event.trigger(map, 'resize');
      $("#phoneDisp").show();
      $("#msgArea").show();
    });
  }

  function goToPlace( placeType ) {
    console.log("Testing");
  }

  $(function () {
  	initialize();

    $("#city-select").on("change", function () {
      var city = $(this).val();
      changeCity(city);
    });

    $("#fb-login").on("click", function () {
      $(".loggedout").hide();
      $(".loading").show();
      fb = new Facebook( function () {
        initUser();
      });
    });

    $("#startGameBtn").on("click", function () {
      startGame();
    });

    $("#phoneDisp").on("mouseenter", function () {
      $("#phoneOverlay").hide("fade", 250);
    });

    $("#phoneDisp").on("mouseleave", function () {
      $("#phoneOverlay").show("fade", 250);
    });

    $("#nextBtn").on("click", function () {
      nextPlace();
    });

    $("#actions button").on("click", function () {
      $("#msgArea button").show();
    });

    $("#selfieBtn").on("click", function () {
      console.log("Appending...");
      $("#activityList").append("<li>You took a selfie!</li>");
    });

    $("#checkinBtn").on("click", function () {
      $("#activityList").append("<li>You checked in!</li>");
    });

    $("#venmoBtn").on("click", function () {
      $("#activityList").append("<li>You sent someone a payment via Venmo!</li>");
    });

  });
})();