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
    const users = ["professor@oak.io", "giovanni@team-rocket.com", "bugcatcherjimmy@user.io", "brock@indigo-league.com"];
    const person1 = await User.findOne({ where: { email: users[0] } });
    const person2 = await User.findOne({ where: { email: users[1] } });
    const person3 = await User.findOne({ where: { email: users[2] } });
    const person4 = await User.findOne({ where: { email: users[3] } });
    const groups = ["Kanto Pokemon Trainers", "Indigo League Gym Association", "Bug Catchers United", "Nurse Joy Fan Club", "Team Rocket"];
    const group1 = await Group.findOne({ where: { name: groups[0] } });
    const group2 = await Group.findOne({ where: { name: groups[1] } });
    const group3 = await Group.findOne({ where: { name: groups[2] } });
    const group4 = await Group.findOne({ where: { name: groups[3] } });
    const group5 = await Group.findOne({ where: { name: groups[4] } });
    await Membership.bulkCreate([
      {
        userId: person1.id,
        groupId: group1.id
      },
      {
        userId: person2.id,
        groupId: group2.id
      },
      {
        userId: person3.id,
        groupId: group3.id
      },
      {
        userId: person4.id,
        groupId: group4.id
      },
      {
        userId: person2.id,
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
  }
};
