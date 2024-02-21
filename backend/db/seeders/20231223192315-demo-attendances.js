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
    const people = ["professor@oak.io", "giovanni@team-rocket.com", "bugcatcherjimmy@user.io", "brock@indigo-league.com"];
    const person1 = await User.findOne({ where: { email: people[0] } });
    const person2 = await User.findOne({ where: { email: people[1] } });
    const person3 = await User.findOne({ where: { email: people[2] } });
    const person4 = await User.findOne({ where: { email: people[3] } });
    const events = ["Pokedex Giveaway", "Weekend Battle Tournament", "Gym Trainer Exchange", "Caterpie catch-a-thon", "Nurse Joy Meet and Greet", "Secret Meeting"];
    const event1 = await Event.findOne({ where: {name: events[0]} });
    const event2 = await Event.findOne({ where: {name: events[1]} });
    const event3 = await Event.findOne({ where: {name: events[2]} });
    const event4 = await Event.findOne({ where: {name: events[3]} });
    const event5 = await Event.findOne({ where: {name: events[4]} });
    const event6 = await Event.findOne({ where: {name: events[5]} });
    await Attendance.bulkCreate([
      {
        eventId: event1.id,
        userId: person1.id,
      },
      {
        eventId: event2.id,
        userId: person1.id,
      },
      {
        eventId: event3.id,
        userId: person2.id,
      },
      {
        eventId: event4.id,
        userId: person3.id,
      },
      {
        eventId: event5.id,
        userId: person4.id,
      },
      {
        eventId: event6.id,
        userId: person2.id,
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
