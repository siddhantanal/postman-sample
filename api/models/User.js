/**
 * User.js
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
      google_id : {
          type : 'string'
      },
      name : {
          type : 'string'
      },
      image_url : {
          type : 'string'
      },
      credits : {
          type : 'integer',
          defaultsTo : 0
      },
      stripe_customer_id : {
          type : 'string'
      }
  }
};

