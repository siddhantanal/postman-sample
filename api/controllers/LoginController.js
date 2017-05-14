/**
 * LoginController
 *
 * @description :: Server-side logic for managing Logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	login : function(req,res){
        if(req.session.token == undefined)
        {
            var url = GoogleAuth.getAuthUrl();
            return res.view('login',{url : url});
        }
        else
        {
            res.redirect('/profile');
        }
    },
    functionGoogleCall : function(req,res){
        var oauth2Client = GoogleAuth.getOAuthClient();
        var code = req.query.code;
        oauth2Client.getToken(code, function(err, tokens) {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          if(!err) {
            oauth2Client.setCredentials(tokens);
            //session["tokens"]=tokens;
            req.session.token = tokens;
            req.session.save();
            res.redirect('/profile');
          }
          else{
              res.redirect('/login');
          }
        });
    },
    
    logoutUser : function(req,res){
        req.session.destroy(function(err) {
           res.redirect('/login');
      });
    }
};

