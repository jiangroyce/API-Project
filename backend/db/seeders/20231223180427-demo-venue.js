'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Venue, Group } = require("../models");
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
    const groups = ["Kanto Pokemon Trainers", "Indigo League Gym Association", "Bug Catchers United", "Nurse Joy Fan Club", "Team Rocket"];
    const group1 = await Group.findOne({where: {name: groups[0]}});
    const group2 = await Group.findOne({where: {name: groups[1]}});
    const group3 = await Group.findOne({where: {name: groups[2]}});
    const group4 = await Group.findOne({where: {name: groups[3]}});
    const group5 = await Group.findOne({where: {name: groups[4]}});
    await Venue.bulkCreate([
      {
        address: "Professor Oak's Lab",
        city: "Pallet Town",
        state: "Kanto",
        lat: 34.0549,
        lng: 118.2426,
        groupId: group1.id
      },
      {
        address: "Viridian City Gym",
        city: "Viridian City",
        state: "Kanto",
        lat: 0,
        lng: 0,
        groupId: group2.id
      },
      {
        address: "Viridian Forest Entrance",
        city: "Viridian Forest",
        state: "Kanto",
        lat: 0,
        lng: 0,
        groupId: group3.id
      },
      {
        address: "Pewter City Pokemon Center",
        city: "Pewter City",
        state: "Kanto",
        lat: 0,
        lng: 0,
        groupId: group4.id
      },
      {
        address: "Team Rocket Hideout",
        city: "Cerulean City",
        state: "Kanto",
        lat: 0,
        lng: 0,
        groupId: group5.id
      },
    ], { validate: true });
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
      address: { [Op.in]: ["Professor Oak's Lab", "Viridian City Gym", "Viridian Forest Entrance", "Pewter City Pokemon Center", "Team Rocket Hideout"]}
    });
  }
};
