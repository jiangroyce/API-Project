'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(models.Group, { foreignKey:"groupId" });
      Event.belongsTo(models.Venue, { foreignKey:"venueId" });
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: "eventId",
        otherKey: "userId"
      });
      Event.hasMany(models.EventImage, { foreignKey: "groupId" });
    }
  }
  Event.init({
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        min: 60
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Online", "In person"),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter: new Date().toJSON().slice(0, 10)
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Event',
    validate: {
      endDateAfterStartDate() {
        if (this.startDate.isAfter(this.end_date)) throw new Error("End date is less than start date")
      }
    }
  });
  return Event;
};
