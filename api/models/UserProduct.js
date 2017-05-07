/**
 * UserProduct.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

connection: 'someMysqlServer',
  attributes: {
      id : {
          type : 'integer',
          autoIncrement : true,
          primaryKey: true
      },
      order_id : {
          type : 'integer'
      },
      product_name : {
          type : 'string'
      },
      product_price : {
          type : 'integer'
      }
  }
};

