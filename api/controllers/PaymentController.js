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
                        Order.update({token:req.body.token},{status:'complete'}).exec(function(err,obj){
                            res.redirect('/generateRecipt/'+req.body.token);
                        });
                });
            });
    },
    functionSeven : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err)
            {
              res.view('payment',{cartList : result, total : result[0].total_amount, token:token});
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
    }
};

