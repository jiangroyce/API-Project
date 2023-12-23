'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Venue } = require("../models");
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
   await Venue.bulkCreate([
    {
      address: "111 Construction Way",
      city: "Los Angeles",
      state: "CA",
      lat: 34.0549,
      lng: 118.2426,
      groupId: 1
    },
    {
      address: "www.fakeusersanon.com",
      city: "Online",
      state: "Online",
      lat: 0,
      lng: 0,
      groupId: 2
    },
   ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Venues";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: { [Op.in]: ["111 Construction Way", "www.fakeusersanon.com"]}
    });
  }
};
