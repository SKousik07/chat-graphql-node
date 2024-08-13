const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
};

const validatePassword = async (inputPassword, storedPassword) => {
  return await bcryptjs.compare(inputPassword, storedPassword);
};

const createToken = async (tokenData) => {
  return await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = async (token) => {
  return await jwt.verify(token, process.env.TOKEN_SECRET);
};

module.exports = { hashPassword, validatePassword, createToken, verifyToken };
