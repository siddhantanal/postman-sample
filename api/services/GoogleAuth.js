var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

const ClientId = '79710104692-akiaf29v078cs467qkpa3vgb61dp25n6.apps.googleusercontent.com';
const ClientSecret = 'Jfvt-QQ4toiU8gEjq8O8ViQk';
const RedirectionUrl = "http://localhost:1337/auth/google/callback";

module.exports = {
    
    getOAuthClient : function() {
        return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
    },

    getAuthUrl : function  () {
        var oauth2Client = this.getOAuthClient();
        var scopes = ['email', 'profile'];

        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });

        return url;
    }
}