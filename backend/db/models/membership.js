'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Membership.init({
    status: {
      type: DataTypes.ENUM("pending", "member", "co-host"),
      defaultValue: "co-host"
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model: "Users"},
      onDelete: "CASCADE",
      hooks: true
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model: "Groups"},
      onDelete: "CASCADE",
      hooks: true
    },
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
