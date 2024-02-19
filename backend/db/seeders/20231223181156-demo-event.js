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
   const venues = ["Professor Oak's Lab", "Viridian City Gym", "Viridian Forest Entrance", "Pewter City Pokemon Center", "Team Rocket Hideout"];
   const venue1 = await Venue.findOne({where: {address: venues[0]}});
   const venue2 = await Venue.findOne({where: {address: venues[1]}});
   const venue3 = await Venue.findOne({where: {address: venues[2]}});
   const venue4 = await Venue.findOne({where: {address: venues[3]}});
   const venue5 = await Venue.findOne({where: {address: venues[4]}});
    await Event.bulkCreate([
      {
        name: "Pokedex Giveaway",
        description: "Come get your free Pokedex and start your own pokemon journey!",
        type: "In person",
        capacity: 36,
        price: 0,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-02"),
        venueId: venue1.id,
        groupId: venue1.groupId
      },
      {
        name: "Weekend Battle Tournament",
        description: "Join us in weekly Pokemon battle tournament! Winners will get rare prizes",
        type: "In person",
        capacity: 36,
        price: 4.99,
        startDate: new Date("2024-03-02"),
        endDate: new Date("2024-03-03"),
        venueId: venue1.id,
        groupId: venue1.groupId
      },
      {
        name: "Gym Trainer Exchange",
        description: "We are excited to announce a inter-gym trainer exchange event. Please join this meeting to discuss!",
        type: "Online",
        capacity: 36,
        price: 0.99,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-01"),
        venueId: venue2.id,
        groupId: venue2.groupId
      },
      {
        name: "Caterpie catch-a-thon",
        description: "Join us in our annual catch-a-thon where we see who can catch the most Caterpie in under 1 hour. Food and drink provided!",
        type: "In person",
        capacity: 36,
        price: 5.99,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-01"),
        venueId: venue3.id,
        groupId: venue3.groupId
      },
      {
        name: "Nurse Joy Meet and Greet",
        description: "Nurse Joy finally agreed to host a meet and greet! All proceeds will be donated to the Pokemon Center Nurse Union.",
        type: "In person",
        capacity: 36,
        price: 5.99,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-01"),
        venueId: venue4.id,
        groupId: venue4.groupId
      },
      {
        name: "Secret Meeting",
        description: "We will be discussing our plans for world domination",
        type: "Online",
        capacity: 150,
        price: 2.99,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-01"),
        venueId: venue5.id,
        groupId: venue5.groupId
      },
  ], { validate: false })
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
      name: { [Op.in]: ["Pokedex Giveaway", "Weekend Battle Tournament", "Gym Trainer Exchange", "Nurse Joy Meet and Greet", "Secret Meeting"]}
    });
  }
};
