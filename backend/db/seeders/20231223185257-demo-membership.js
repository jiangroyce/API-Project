'use strict';

/** @type {import('sequelize-cli').Migration} */
const { User, Group, Membership } = require("../models");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const person1 = await User.findOne({ where: { email: "demo@user.io" } });
    const person2 = await User.findOne({ where: { email: "user1@user.io" } });
    const group1 = await Group.findOne({where: {name: "Los Angeles Construction"}});
    const group2 = await Group.findOne({where: {name: "Fake Users Anonymous"}});
    await Membership.bulkCreate([
      {
        status:"host",
        userId: person1.id,
        groupId: group1.id
      },
      {
        userId: person2.id,
        groupId: group2.id
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
