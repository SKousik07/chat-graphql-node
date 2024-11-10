const {
  createToken,
  hashPassword,
  validatePassword,
} = require("../services/authService");
const {
  createUser,
  findOtherUsers,
  findUserByEmail,
  findUserById,
  findUsers,
} = require("../services/userService");

const authResolver = {
  Query: {
    hello: () => "Hello world!",
    user: async (root, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized user");
        }
        const user = await findUserById(id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        return {
          error: error.message,
        };
      }
    },

    users: async (root, args, context) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized user");
        }
        const users = await findUsers();
        if (!users) {
          throw new Error("Users not found");
        }
        return {
          users,
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    },

    otherUsers: async (root, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized user");
        }
        const users = await findOtherUsers(id);
        if (!users) {
          throw new Error("Users not found");
        }
        return {
          users,
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    },
  },
  Mutation: {
    signup: async (root, { email, password, username }, context) => {
      try {
        //check user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          throw new Error("User already exists");
        }
        //hash password
        const hashedPassword = await hashPassword(password);
        //create user
        const newUser = {
          username,
          email,
          password: hashedPassword,
        };
        const savedUser = await createUser(newUser);
        return {
          message: "User created successfully",
          success: true,
        };
      } catch (error) {
        return {
          message: error.message,
          success: false,
        };
      }
    },

    login: async (root, { email, password }, context) => {
      try {
        //check user exists or not
        const existingUser = await findUserByEmail(email);
        if (!existingUser) {
          throw new Error("User does not exist");
        }
        //validate the passwords
        const isValid = await validatePassword(password, existingUser.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        //create token
        const tokenData = {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        };
        const token = await createToken(tokenData);

        return {
          message: "Login successful",
          token: token,
          success: true,
        };
      } catch (error) {
        return {
          message: error.message,
          success: false,
        };
      }
    },
  },
};

module.exports = authResolver;
