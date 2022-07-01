'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(
        models.Spot,
          { foreignKey: 'ownerId', onDelete: 'CASCADE',  hooks: true }
      );

      User.hasMany(
        models.Review,
          { foreignKey: 'userId', onDelete: 'CASCADE',  hooks: true }
      );

      User.hasMany(
        models.Booking,
          { foreignKey: 'userId', onDelete: 'CASCADE',  hooks: true }
      );
    }
  }
  User.init({
    username: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[4,30],
        isNotEmail(value){
          if(Validator.isEmail(value)){
            throw new Error("Cannot be an email!");
          }
        }
      }
    },
    firstName: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[1,256]
      }
    },
    lastName: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[1,256]
      }
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[3,256]
      }
    },
    hashedpwd: {
      type:DataTypes.STRING.BINARY,
      allowNull:false,
      validate:{
        len:[60,60]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
