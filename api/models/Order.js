/**
 * Order.js
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
      user_id : {
          type : 'integer'
      },
      total_amount : {
          type : 'integer'
      },
      status : {
          type : 'string'
      },
      token : {
          type : 'string'
      }
  }
};

