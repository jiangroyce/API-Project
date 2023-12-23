'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Event } = require("../models");
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
    const event1 = await Event.findOne({where: {name: "LA Construction New Years Party"}});
    const event2 = await Event.findOne({where: {name: "Fake Users Anon Hackathon"}});
    await event1.createEventImage({
      url: "www.google.com",
      preview: true
    });
    await event2.createEventImage({
      url: "www.google.com",
      preview: false
    })
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
