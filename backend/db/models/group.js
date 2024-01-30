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
      Group.belongsTo(models.User, {
        foreignKey: "organizerId",
        as: "Organizer"
      });
      Group.hasMany(models.Venue, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
      });
      Group.belongsToMany(models.User, {
        through: models.Membership,
        foreignKey: "groupId", // as Membership & include, migrations foreign keys cascade, hasManys cascade
        otherKey: "userId",
        as: "Members"
      });
      Group.hasMany(models.Event, {
        foreignKey: "groupId",
        onDelete: "CASCADE",
        hooks: true
      });
      Group.hasMany(models.GroupImage, {
        foreignKey: "groupId",
        as: "GroupImages",
        onDelete: "CASCADE",
        hooks: true
      });
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users" },
      onDelete: "CASCADE",
      hooks: true
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [1, 60],
          msg: "Name must be 60 characters or less"
        }
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
          min: {
            args: 50,
            msg: "About must be 50 characters or more"
          }
      }
    },
    type: {
      type: DataTypes.ENUM("Online", "In person"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Online", "In person"]],
          msg: "Type must be 'Online' or 'In person'"
        }
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
    modelName: 'Group'
    // scopes: {
    //   getGroups: {
    //     include: [
    //       {
    //         model: User,
    //         attributes
    //       }
    //     ]
    //   }
    // }
  });
  return Group;
};
