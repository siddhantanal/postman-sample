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
	inititatePayment : function(req,res){
        console.log(req.body);
        
        Order.find().where({
            token : req.body.token
        }).exec(function(err,obj){
            if(!err && obj.length > 0 ){
                var amount = obj[0].total_amount;
                console.log(obj);
                if(obj[0].status === 'complete'){
                    res.view('error',{
                        msg: "Order Already completed or rejected"
                    });
                }
                else{
                    if(req.session.wallet > amount){
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
                                    else{
                                        res.view('error',{
                                            msg: "Error Occured, transaction incomplete"
                                        });
                                    }
                                });
                            }
                            else{
                                res.view('error',{
                                    msg: "Error Occured, transaction incomplete"
                                });
                            }
                        });
                    }
                    else{
                        var amount = parseInt(obj[0].total_amount)-parseInt(req.session.wallet);
                        if(req.session.stripe_id == null){
                            var promise = stripe.customers.create({
                                email: req.body.stripeEmail,
                                source: req.body.stripeToken
                            }); 
                            promise.then(function(customer){
                                User.update({ id : req.session.user_id }, { stripe_customer_id:customer.id }).exec(function(err,obj){
                                    if(!err){
                                        console.log('id : ');
                                        console.log(req.session.stripe_id);
                                        stripe.charges.create({
                                                amount,
                                                description: "Sample Charge",
                                                currency: "usd",
                                                customer: customer.id
                                            }).then(function(charge){ 
                                                console.log("charge");
                                                console.log(charge);
                                            User.update({ id : req.session.user_id }, { credits : 0 }).exec(function(err,obj){
                                                if(!err){
                                                    req.session.wallet = 0;
                                                    req.session.save();
                                                    Order.update({token:req.body.token},{status:'complete'}).exec(function(err,obj){
                                                        if(!err){
                                                            res.redirect('/generateRecipt/'+req.body.token);
                                                        }
                                                        else{
                                                            res.view('error',{
                                                                msg: "Error Occured, transaction incomplete"
                                                            });
                                                        }
                                                    });
                                                }
                                                else{
                                                    res.view('error',{
                                                        msg: "Error Occured, transaction incomplete"
                                                    });
                                                }
                                            });
                                        });
                                    }
                                    else{
                                        res.view('error',{
                                            msg: "Error Occured, Unable to update user details"
                                        });
                                    }
                                });
                            });
                        }
                        else{
                            var promise = stripe.charges.create({
                                                amount,
                                                description: "Sample Charge",
                                                currency: "usd",
                                                customer: req.session.stripe_id
                                            });
                            promise.then(function(charge){
                                User.update({ id : req.session.user_id }, { credits : 0 }).exec(function(err,obj){
                                    if(!err){
                                        req.session.wallet = 0;
                                        req.session.save();
                                        Order.update({token:req.body.token},{status:'complete'}).exec(function(err,obj){
                                            if(!err){
                                                res.redirect('/generateRecipt/'+req.body.token);
                                            }
                                            else{
                                                res.view('error',{
                                                    msg: "Error Occured, transaction incomplete"
                                                });
                                            }
                                        });
                                    }
                                    else{
                                        res.view('error',{
                                            msg: "Error Occured, transaction incomplete"
                                        });
                                    }
                                });
                            });
                        }
                    }
                }
            }
            else{
                res.view('error',{
                    msg: "Token mismatch"
                });
            }
        });
    },
    paymentToWallet : function(req,res){
        //add to wallet function
        var amount = req.body.credits;
        if(amount > 0)
        {
            if(req.session.stripe_id == null){
                var promise = stripe.customers.create({
                    email: req.body.stripeEmail,
                    source: req.body.stripeToken
                }); 
                promise.then(function(customer){
                    User.update({ id : req.session.user_id }, { stripe_customer_id:customer.id }).exec(function(err,obj){
                        if(!err){
                            stripe.charges.create({
                                amount,
                                description: "Sample Charge",
                                    currency: "usd",
                                    customer: customer.id
                            }).then(function(charge){ 
                                var credits = parseInt(req.session.wallet) + parseInt(amount);
                                User.update({id:req.session.user_id},{credits: credits}).exec(function(err,obj){
                                        if(!err){
                                            res.redirect('/profile');
                                        }
                                        else{
                                            res.view('error',{
                                                msg: "Error Occured, transaction incomplete"
                                            });
                                        }
                                    });
                            });
                        }
                        else{
                            res.view('error',{
                                msg: "Error Occured, no amount entered"
                            });
                        }
                    }); 
                });
            }
            else{
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
                        var credits = parseInt(req.session.wallet) + parseInt(amount);
                        User.update({id:req.session.user_id},{credits: credits}).exec(function(err,obj){
                            if(!err){
                                res.redirect('/profile');
                            }
                            else{
                                res.view('error',{
                                    msg: "Error Occured, transaction incomplete"
                                });
                            }
                        });
                });
            }
        }
        else{
            res.view('error',{
                msg: "Error Occured, no amount entered"
            });
        }
    },
    getOrderSummary : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount`, `order`.`status` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err && result.length > 0)
            {
                console.log(result);
                if(result[0].status === 'complete'){
                    res.view('error',{
                        msg: "Order Already completed or rejected"
                    });
                }
                else{
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
            }
            else{
                res.view('error',{
                    msg: "Token mismatch"
                });
            }
        });
    },
    generateOrderRecipt : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount`, `order`.`status` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err && result.length > 0)
            {
              res.view('recipt',{cartList : result, total : result[0].total_amount, status:result[0].status});
            }
            else{
                res.view('error',{
                    msg: "Token Mismatch"
                });
            }
        });
    }
};

