'use strict';
const {
  Model
} = require('sequelize');

// const groupTypes = [
//   "Art & Culture",
//   "Career & Business",
//   "Community & Environment",
//   "Dancing",
//   "Games",
//   "Health & Wellbeing",
//   "Hobbies & Passions",
//   "Identiy & Language",
//   "Movements & Politics",
//   "Music",
//   "Parents & Family",
//   "Pets & Animals",
//   "Religion & Spirituality",
//   "Science & Education",
//   "Social Activities",
//   "Sports & Fitness",
//   "Technology",
//   "Travel & Outdoor",
//   "Writing"
// ];

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsTo(models.User, { foreignKey: "organizerId", as: "Organizer" });
      Group.hasMany(models.Venue, { foreignKey: "groupId" });
      Group.belongsToMany(models.User, {
        through: models.Membership,
        foreignKey: "groupId",
        otherKey: "userId"
      });
      Group.hasMany(models.Event, { foreignKey: "groupId" });
      Group.hasMany(models.GroupImage, { foreignKey: "groupId" });
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users" }
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [1, 60]
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
          min: 50
      }
    },
    type: {
      type: DataTypes.ENUM("Online", "In person"),
      allowNull: false,
      validate: {
        isIn: [["Online", "In person"]]
      }
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
