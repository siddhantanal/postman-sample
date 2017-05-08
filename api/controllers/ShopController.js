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
                User.findOrCreate({google_id:data.id}, {name:data.displayName,
                    image_url : data.image.url,
                    google_id : data.id
                     },function(err,user){
                   if(!err)
                       {
                           console.log(user);
                            req.session.email = data.emails[0].value;
                            req.session.user_id = user.id;
                            req.session.save();
                           res.view('profile', {
                                name:data.displayName,
                                image_url : data.image.url,
                                id : data.id,
                               email : data.emails[0].value
                            });
                       }
                    else
                    {
                        res.json({err:"yes"});
                    }
                });
                
            });
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
        res.view('products');//, { productList : products })
    },
    functionSix : function(req,res){
        var token = Utility.randomString(20);
        var cartList = req.body.products;
        var orderID = "";
        Order.create({
            user_id : req.session.user_id, 
            token : token, 
            status : 'pending', 
            total_amount : req.body.total
        }).exec(function(err, orderObj){
           if(!err){
              orderID = orderObj.id;
               var result = Promise.all(cartList.map(function(item){
                   return new Promise(function (resolve,reject){
                       UserProduct.create({
                        order_id : orderID,
                        product_name : item.name,
                        product_price : item.price
                    }).exec(function(err,obj){
                           if(!err)
                               {
                                   return resolve(obj);
                               }
                           else
                               {
                                   return reject(err);
                               }
                    })
                   });
                })).then(function(data){
                   res.json({
                        token : token,
                        order_id : orderID
                    });
               });
           } 
        });
        
    },
    functionNine : function(req,res){
        //get purchase history
        Order.find().where({
                user_id : req.session.user_id
            }).where({
                status : 'complete'
            }).exec(function(err,obj){
            console.log(err);
            console.log(obj);
            res.view('history',{ purchaseHistory : obj});
        });
        
    }
};

