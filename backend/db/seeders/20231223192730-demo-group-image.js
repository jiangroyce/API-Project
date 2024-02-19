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
    const groups = ["Kanto Pokemon Trainers", "Indigo League Gym Association", "Bug Catchers United", "Nurse Joy Fan Club", "Team Rocket"];
    const group1 = await Group.findOne({where: {name: groups[0]}});
    const group2 = await Group.findOne({where: {name: groups[1]}});
    const group3 = await Group.findOne({where: {name: groups[2]}});
    const group4 = await Group.findOne({where: {name: groups[3]}});
    const group5 = await Group.findOne({where: {name: groups[4]}});
    await group1.createGroupImage({
      url: "https://pbs.twimg.com/media/CW2vaPMWsAACKK6.jpg",
      preview: true
    });
    await group2.createGroupImage({
      url: "https://archives.bulbagarden.net/media/upload/thumb/3/34/Indigo_Plateau_PE.png/300px-Indigo_Plateau_PE.png",
      preview: true
    });
    await group3.createGroupImage({
      url: "https://i.pinimg.com/736x/9d/87/d4/9d87d4485ba686c283345532c883d0cb.jpg",
      preview: true
    })
    await group4.createGroupImage({
      url: "https://archives.bulbagarden.net/media/upload/thumb/d/d8/Nurse_Joy_JN.png/250px-Nurse_Joy_JN.png",
      preview: true
    })
    await group5.createGroupImage({
      url: "https://archives.bulbagarden.net/media/upload/thumb/4/47/HeartGold_SoulSilver_Team_Rocket_Grunt.png/250px-HeartGold_SoulSilver_Team_Rocket_Grunt.png",
      preview: true
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
