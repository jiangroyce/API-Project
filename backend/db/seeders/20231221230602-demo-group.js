'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group, User } = require('../models');
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
   const users = ["professor@oak.io", "giovanni@team-rocket.com", "bugcatcherjimmy@user.io", "brock@indigo-league.com"]
   const person1 = await User.findOne({ where: { email: users[0] } });
   const person2 = await User.findOne({ where: { email: users[1] } });
   const person3 = await User.findOne({ where: { email: users[2] } });
   const person4 = await User.findOne({ where: { email: users[3] } });
   await Group.bulkCreate([
    {
        name: "Kanto Pokemon Trainers",
        about: "Hello trainers, welcome to the Kanto Pokmon Trainers meetup group. This group is for you to meet with other trainers who are also on their journey through the beautiful Kanto region.",
        type: "In person",
        private: false,
        city: "Pallet Town",
        state: "Kanto",
        organizerId: person1.id
    },
    {
        name: "Indigo League Gym Association",
        about: "Welcome! This group is for all gym leaders and gym trainers of the Kanto region.",
        type: "In person",
        private: true,
        city: "Viridian City",
        state: "Kanto",
        organizerId: person2.id
    },
    {
        name: "Bug Catchers United",
        about: "Bug pokemon are the best! Join our group if you think so too!",
        type: "In person",
        private: false,
        city: "Viridian Forest",
        state: "Kanto",
        organizerId: person3.id
    },
    {
      name: "Nurse Joy Fan Club",
      about: "This group is dedicated to our favorite Nurse Joy! Join us to show appreciation to the best nurse around.",
      type: "Online",
      private: false,
      city: "Pewter City",
      state: "Kanto",
      organizerId: person4.id
    },
    {
      name: "Team Rocket",
      about: "Steal Pokémon for profit. Exploit Pokémon for profit. All Pokémon exist for the glory of Team Rocket.",
      type: "Online",
      private: true,
      city: "Celadon City",
      state: "Kanto",
      organizerId: person2.id
    }
  ], { validate: true })
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
      name: { [Op.in]: ["Kanto Pokemon Trainers", "Indigo League Gym Association", "Bug Catchers United", "Nurse Joy Fan Club", "Team Rocket"]}
    });
  }
};
