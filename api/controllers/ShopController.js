/**
 * ShopController
 *
 * @description :: Server-side logic for managing Shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var google = require('googleapis');
var plus = google.plus('v1');
const keyPublishable = 'pk_test_EFauhL4VIeoeTDQUBdETeCmj';
const keySecret = 'sk_test_hTeniJlmahot2gL2vBTNmEox';

const stripe = require("stripe")(keySecret);

module.exports = {
	getUserProfile : function(req,res){
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
                User.findOrCreate({google_id:data.id}, {
                    name:data.displayName,
                    image_url : data.image.url,
                    google_id : data.id
                },function(err,user){
                    if(!err)
                    {
                        req.session.email = data.emails[0].value;
                        req.session.user_id = user.id;
                        req.session.wallet = user.credits;
                        req.session.stripe_id = user.stripe_customer_id;
                        req.session.save();
                        console.log(user);
                        res.view('profile', {
                            name:data.displayName,
                            image_url : data.image.url,
                            id : data.id,
                            email : data.emails[0].value,
                            wallet : user.credits
                        });
                    }
                    else{
                        console.log(user.length);
                        res.view('error',{
                            msg: "Error Occured, login error or profile cannot be loaded"
                        });
                    }
                });
                
            });
        }
        else
        {
            res.redirect('/login');
        }
    },
    viewProducts : function(req,res){
        res.view('products');//, { productList : products })
    },
    generateOrderSummary : function(req,res){
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
    getOrderDetail : function(req,res){
        var id = req.param('id');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`id` = ?", [id], function(err, result){
            if(!err && result.length > 0){
                res.json({cartList : result, total : result[0].total_amount});
            }
            else{
                res.view('error',{
                    msg: "Token mismatch"
                });
            }
        });
    },
    getUserPurchaseHistory : function(req,res){
        //get purchase history
        Order.find().where({
                user_id : req.session.user_id
            }).where({
                status : 'complete'
            }).exec(function(err,obj){
                console.log(err);
                console.log(obj);
                res.json({ purchaseHistory : obj});
        });
        
    },
    getUserSavedCards : function(req,res){
        Cards.find().where({
                user_id : req.session.user_id
            }).exec(function(err,obj){
                console.log(err);
                console.log(obj);
                if(!err){
                    res.view('cards', { cardList : obj});
                }
                else{
                    res.view('error',{
                        msg: "Cards not found"
                    });
                }
        });
    },
    addNewCard : function(req,res){
        Cards.create({
            user_id : req.session.user_id,
            name : req.body.name,
            card_number : req.body.card_number
        }).exec(function(err,obj){
            if(!err){
                res.redirect('/cards');
            }
            else{
                res.view('error',{
                    msg: "Error Occured, card cannot be saved"
                });
            }
        });
    }
};

