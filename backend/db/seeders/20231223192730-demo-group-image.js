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
      url: "https://xf-assets.pokecharms.com/data/attachment-files/2017/02/456066_all_male_pokemon_trainers.png",
      preview: true
    });
    await group2.createGroupImage({
      url: "https://comicvine.gamespot.com/a/uploads/scale_medium/11/114183/4353277-kanto%20gym%20leaders.jpg",
      preview: true
    });
    await group3.createGroupImage({
      url: "https://i.pinimg.com/736x/9d/87/d4/9d87d4485ba686c283345532c883d0cb.jpg",
      preview: true
    })
    await group4.createGroupImage({
      url: "https://static1.thegamerimages.com/wordpress/wp-content/uploads/2021/01/efa319ad51b88e1ab12e50883cb43055.png",
      preview: true
    })
    await group5.createGroupImage({
      url: "https://e0.pxfuel.com/wallpapers/66/512/desktop-wallpaper-team-rocket-for-your.jpg",
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
