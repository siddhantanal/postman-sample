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
        var amount = 500;

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
      .then(charge => 
           res.json({
          success:'yes'
      }));
    },
    functionSeven : function(req,res){
        var token = req.param('token');
        Order.query("SELECT `order`.`id`, `userproduct`.`product_name`, `userproduct`.`product_price`, `order`.`total_amount` FROM `order` LEFT JOIN `userproduct` ON `userproduct`.`order_id` = `order`.`id` WHERE `order`.`token` = ?", [token], function(err, result){
            if(!err)
            {
              res.view('payment',{cartList : result, total : result[0].total_amount});
            }
        });
    },
    functionEight : function(req,res){
        
    }
};

