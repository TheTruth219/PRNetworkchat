$(document).ready(function() {
  // Initiating our Auth0Lock
  let lock = new Auth0Lock(
    '0meuN7nt1wo8g1G98g8JKOPrgsk63gUe',
    'thetruth219.auth0.com',
    {
      auth: {
        params: {
          scope: 'openid profile'
        },
        connectionScopes: {
          'facebook': ['email', 'user_link']
        },
        sso:false
      },
      allowAutocomplete: true,
      autoclose: true,
      closable: false,
      rememberLastLogin: true,
      allowShowPassword: true,
      theme: {
      logo: 'https://pr.network/img/logo_mobile.svg',
      primaryColor: '#35c982'
      },
    }


  );

  // Listening for the authenticated event
  lock.on("authenticated", function(authResult) {
    // Use the token in authResult to getUserInfo() and save it to localStorage
    lock.getUserInfo(authResult.accessToken, function(error, profile) {
      if (error) {
        // Handle error
        return;
      }

      localStorage.setItem('accessToken', authResult.accessToken);
      localStorage.setItem('profile', JSON.stringify(profile));
      localStorage.setItem('isAuthenticated', true);
      updateValues(profile, true);
      $("#username").html(profile.name);
    });
  });

  let profile = JSON.parse(localStorage.getItem('profile'));
  let isAuthenticated = localStorage.getItem('isAuthenticated');

  function updateValues(userProfile, authStatus) {
    profile = userProfile;
    isAuthenticated = authStatus;
  }
  $("#logout").click((e) => {
      e.preventDefault();
      logout();
  });

  function logout(){
      localStorage.clear();
      isAuthenticated = false;
      lock.logout({
          returnTo: "https://prnetwork-chat.herokuapp.com"
      });
  }
  function onMessageAdded(data) {
    let template = $("#new-message").html();
    template = template.replace("{{body}}", data.message);
    template = template.replace("{{name}}", data.name);

    $(".chat").append(template);
  }

  if (!isAuthenticated && !window.location.hash) {
    lock.show();
  } else {
    if(profile){
                $("#username").html(profile.name);
            }

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('9e1488d40e6397078fdf', {
      cluster: 'us2',
      encrypted: false
    });

    var channel = pusher.subscribe('private-chat');
    channel.bind('message-added', onMessageAdded);

  $('#btn-chat').click(function(){
        const message = $("#message").val();
        $("#message").val("");
            //send message
        $.post( "https://prnetwork-chat.herokuapp.com/message", { message, name: profile.name } );
    });
  }



});
