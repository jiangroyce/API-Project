'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Event, User, Attendance } = require("../models");
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
    const event1 = await Event.findOne({ where: {name: "LA Construction New Years Party"} });
    const event2 = await Event.findOne({ where: {name: "Fake Users Anon Hackathon"} });
    await Attendance.bulkCreate([
      {
        eventId: event1.id,
        userId: person1.id,
        status: "attending"
      },
      {
        eventId: event1.id,
        userId: person2.id,
      },
      {
        eventId: event2.id,
        userId: person2.id,
        status: "attending",
      },
      {
        eventId: event2.id,
        userId: person1.id,
      },
    ])
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
