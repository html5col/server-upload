// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'githubAuth' : {
        'clientID'      : '93e348384072ea037f57', // your App ID
        'clientSecret'  : '5b127f734178ec3d3e3f3d69686acdc92524a7ee', // your App Secret
        'callbackURL'   : '/auth/github/callback'
    },

    'googleAuth' : {
        'clientID'      : '686520850572-u203iegsat9i5nn3136j2igfsobf9hv7.apps.googleusercontent.com',
        'clientSecret'  : 'otw5yuDlG1sSnubxc3pYDa_y',
        'callbackURL'   : '/auth/google/callback'
    }

};