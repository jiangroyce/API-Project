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
      Event.belongsTo(models.Group, {
        foreignKey:"groupId"
      });
      Event.belongsTo(models.Venue, { foreignKey:"venueId", as: "Venue" });
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        },
        foreignKey: "eventId",
        otherKey: "userId",
        as: "Attendees"
      });
      Event.hasMany(models.Attendance, {
        foreignKey: "eventId"
      });
      Event.hasMany(models.EventImage, {
        foreignKey: "eventId",
        onDelete: "CASCADE",
        hooks: true
      });
    }
  }
  Event.init({
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [1, 60]
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
      validate: {
        isInt: {
          args: true,
          msg: "Capacity must be an integer"
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isFloat: {
          args: true,
          msg: "Price is invalid"
        }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Venues" }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Groups" },
      onDelete: "CASCADE",
      hooks: true
    },
  }, {
    sequelize,
    modelName: 'Event',
    validate: {
      capacityValid() {
        if (this.capacity < 0) throw new Error("Capacity is invalid");
      },
      priceValid() {
        if (this.price < 0) throw new Error("Price is invalid");
      },
      startDateinFuture() {
        if (this.startDate < Date.now()) throw new Error("Start date must be in the future")
      },
      endDateAfterStartDate() {
        if (this.startDate > this.endDate) throw new Error("End date is less than start date")
      }
    },
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      }
    }
  });
  return Event;
};
