'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Event, Venue } = require("../models");
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
   const venue1 = await Venue.findOne({where: {address: "111 Construction Way"}});
   const venue2 = await Venue.findOne({where: {address: "www.fakeusersanon.com"}});
    await Event.bulkCreate([
      {
        name: "LA Construction New Years Party",
        description: "Come celebrate a great year",
        type: "In person",
        capacity: 35,
        price: 5.99,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-02"),
        venueId: venue1.id,
        groupId: venue1.groupId
      },
      {
        name: "Fake Users Anon Hackathon",
        description: "Join us in our annual hackathon",
        type: "Online",
        capacity: 40,
        price: 4.99,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-01"),
        venueId: venue2.id,
        groupId: venue2.groupId
      }], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Events";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["LA Construction New Years Party", "Fake Users Anon Hackathon"]}
    });
  }
};
