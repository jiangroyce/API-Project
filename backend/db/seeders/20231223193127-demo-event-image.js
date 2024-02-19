'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Event } = require("../models");
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
    const events = ["Pokedex Giveaway", "Weekend Battle Tournament", "Gym Trainer Exchange", "Nurse Joy Meet and Greet", "Secret Meeting"];
    const event1 = await Event.findOne({where: {name: events[0]}});
    const event2 = await Event.findOne({where: {name: events[1]}});
    const event3 = await Event.findOne({where: {name: events[2]}});
    const event4 = await Event.findOne({where: {name: events[3]}});
    const event5 = await Event.findOne({where: {name: events[4]}});
    await event1.createEventImage({
      url: "https://archives.bulbagarden.net/media/upload/thumb/6/61/DP_Pok%C3%A9dex.png/160px-DP_Pok%C3%A9dex.png",
      preview: true
    });
    await event2.createEventImage({
      url: "https://archives.bulbagarden.net/media/upload/d/d3/Pok%C3%A9mon_League_Champion_chamber_SM.png",
      preview: true
    });
    await event3.createEventImage({
      url: "https://comicvine.gamespot.com/a/uploads/scale_medium/11/114183/4353277-kanto%20gym%20leaders.jpg",
      preview: true
    });
    await event4.createEventImage({
      url: "https://static1.thegamerimages.com/wordpress/wp-content/uploads/2021/01/efa319ad51b88e1ab12e50883cb43055.png",
      preview: true
    });
    await event5.createEventImage({
      url: "https://static.wikia.nocookie.net/kidsnextdoorfanfiction/images/c/c9/Giovanni.jpg/revision/latest?cb=20150204034343",
      preview: true
    });
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
