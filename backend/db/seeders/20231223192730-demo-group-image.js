'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group } = require("../models");
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
    const group1 = await Group.findOne({where: {name: "Los Angeles Construction"}});
    const group2 = await Group.findOne({where: {name: "Fake Users Anonymous"}});
    await group1.createGroupImage({
      url: "www.google.com",
      preview: true
    });
    await group2.createGroupImage({
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
