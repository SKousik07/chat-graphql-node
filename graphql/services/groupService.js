const { Group } = require("../../db/models/groupModel");

const findGroup = async (combinedId) => {
  return Group.findOne({ combinedId });
};

const createGroup = async (combinedId) => {
  return new Group({ combinedId, messages: [] });
};

module.exports = { findGroup, createGroup };
