const { User } = require("../../db/models/userModel");

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const findUserById = async (id) => {
  return await User.findOne({ _id: id });
};

const createUser = async (input) => {
  const newUser = await new User(input);
  return newUser.save();
};

const findUsers = async () => {
  return await User.find();
};

const findOtherUsers = async (userId) => {
  console.log("userId", userId);
  return await User.find({ _id: { $ne: userId } });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  findUsers,
  findOtherUsers,
};
