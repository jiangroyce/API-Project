'use strict';

/** @type {import('sequelize-cli').Migration} */
const { User } = require('../models');
const bcrypt = require('bcryptjs');
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
    await User.bulkCreate([
      {
        email: 'professor@oak.io',
        firstName: "Samuel",
        lastName: "Oak",
        username: 'ProfessorOak',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'giovanni@team-rocket.com',
        firstName: "Giovanni",
        lastName: "Sakaki",
        username: 'GiovanniR',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'bugcatcherjimmy@user.io',
        firstName: "Jimmy",
        lastName: "Sparks",
        username: 'BugCatcherJimmy',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'brock@indigo-league.com',
        firstName: "Brock",
        lastName: "Takeshi",
        username: 'NurseJoyNo1Fan',
        hashedPassword: bcrypt.hashSync('password')
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
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      email: { [Op.in]: ["professor@oak.io", "giovanni@team-rocket.com", "bugcatcherjimmy@user.io", "brock@indigo-league.com"] }
    }, {})
  }
};
