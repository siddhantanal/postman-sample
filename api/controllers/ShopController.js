/**
 * ShopController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var google = require('googleapis');
var plus = google.plus('v1');

module.exports = {
	functionTwo : function(req,res){
        var oauth2Client = GoogleAuth.getOAuthClient();
        //console.log(req.session.token);
        if(req.session.token !== undefined)
        {
            oauth2Client.setCredentials(req.session.token);

            var p = new Promise(function (resolve, reject) {
                plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
                    resolve(response || err);
                });
            }).then(function (data) {
                res.view('profile', {
                    name:data.displayName,
                    image_url : data.image.url,
                    id : data.id
                })
            })
        }
        else
        {
            res.redirect('/login');
        }
    },
    functionFour : function(req,res){
        var products = [
            {
                name : "television",
                price : 100
            },
            {
                name : "AC",
                price : 150
            },
            {
                name : "laptop",
                price : 200
            },
            {
                name : "mobile",
                price : 120
            }
        ]
        res.view('products', { productList : products })
    }
};

