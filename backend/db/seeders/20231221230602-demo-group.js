'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group } = require('../models');
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
   await Group.bulkCreate([
    {
        name: "Los Angeles Construction",
        about: "Group for construction workers",
        type: "In person",
        private: true,
        city: "Los Angeles",
        state: "CA",
        organizerId: 1
    },
    {
        name: "Fake Users Anonymous",
        about: "Group for fake users to talk about their problems",
        type: "Online",
        private: true,
        city: "Los Angeles",
        state: "CA",
        organizerId: 2
    }], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["Los Angeles Construction", "Fake Users Anonymous"]}
    });
  }
};
