'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User, { foreignKey: "userId" });
      Attendance.belongsTo(models.Event, { foreignKey: "eventId" });
    }
  }
  Attendance.init({
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model: "Events"},
      onDelete: "CASCADE",
      hooks: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {model: "Users"},
      onDelete: "CASCADE",
      hooks: true
    },
    status: {
      type: DataTypes.ENUM("pending", "attending", "waitlist"),
      defaultValue: "pending"
    },
  }, {
    sequelize,
    modelName: 'Attendance',
    defaultScope: {
      attributes: {
        include: ["id"],
        exclude: ["createdAt", "updatedAt"]
      }
    }
  });
  return Attendance;
};
