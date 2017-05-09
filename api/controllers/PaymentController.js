/**
 * PaymentController
 *
 * @description :: Server-side logic for managing Payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const keyPublishable = 'pk_test_EFauhL4VIeoeTDQUBdETeCmj';
const keySecret = 'sk_test_hTeniJlmahot2gL2vBTNmEox';

const stripe = require("stripe")(keySecret);

module.exports = {
	functionFive : function(req,res){
        console.log(req.body);
        
        Order.find().where({
            token : req.body.token
        })
            .exec(function(err,obj){
                var amount = obj[0].total_amount;
                console.log(obj);
                stripe.customers.create({
                    email: req.body.stripeEmail,
                    source: req.body.stripeToken
                  })
                  .then(customer =>
                    stripe.charges.create({
                      amount,
                      description: "Sample Charge",
                         currency: "usd",
                         customer: customer.id
                    }))
                  .then(function(charge){ 
                User.update({ id : req.session.user_id }, { credits : 0 }).exec(function(err,obj){
                    if(!err){
                        req.session.wallet = 0;
                        req.session.save();
                        Order.update({token:req.body.token},{status:'complete'}).exec(function(err,obj){
                            if(!err){
                                res.redirect('/generateRecipt/'+req.body.token);
                            }
                        });
                    }
                });
                });
            });
    },
    functionSeven : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err)
            {
                var payFromWallet = false;
                var toBePayed = result[0].total_amount;
                var creditLeft = req.session.wallet;
                if(result[0].total_amount <= req.session.wallet){
                    payFromWallet = true;
                    toBePayed = 0;
                    creditLeft = parseInt(req.session.wallet) - parseInt(result[0].total_amount);
                }
                else{
                    toBePayed = parseInt(result[0].total_amount)-parseInt(req.session.wallet);
                    creditLeft = 0;
                }
              res.view('payment',{
                  cartList : result, 
                  total : result[0].total_amount,
                  toBePayed : toBePayed,
                  token:token, 
                  payFromWallet: payFromWallet,
                  credits : req.session.wallet,
                  creditLeft : creditLeft
                });
            }
        });
    },
    functionTen : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount`, `order`.`status` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err)
            {
              res.view('recipt',{cartList : result, total : result[0].total_amount, status:result[0].status});
            }
        });
    },
    functionFourteen : function(req,res){

        Order.find().where({
            token : req.body.token
        }).exec(function(err,obj){
            if(!err){
                var amount = obj[0].total_amount;
                console.log(obj);
                var credits = parseInt(req.session.wallet) - parseInt(amount);
                //reduce credits
                User.update({ id : req.session.user_id }, { credits : credits }).exec(function(err,obj){
                    if(!err){
                        req.session.wallet = credits;
                        req.session.save();
                        Order.update({token:req.body.token},{status:'complete'}).exec(function(err,obj){
                            if(!err){
                                res.redirect('/generateRecipt/'+req.body.token);
                            }
                        });
                    }
                });
            }       
        });
        
    }
};

