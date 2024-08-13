const mongooose = require("mongoose");
require("dotenv").config();

const connect = () => {
  try {
    console.log(process.env.MONGO_URL);
    mongooose.connect(process.env.MONGO_URL);
    const connection = mongooose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected");
    });
    connection.on("error", (err) => {
      console.log(err);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connect };
