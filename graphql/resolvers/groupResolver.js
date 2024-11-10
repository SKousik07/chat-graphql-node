const { createGroup, findGroup } = require("../services/groupService");
// const pubSub = require("../pubSub");
const groupResolver = {
  Query: {
    getGroup: async (root, args, context) => {
      try {
        if (!context.user) {
          throw new Error("Unauthorized user");
        }
        const { combinedId } = args;
        let group = await findGroup(combinedId);
        if (!group) {
          group = await createGroup(combinedId);
        }
        await group.save();
        group = await group.populate({
          path: "messages.from",
          select: "id username email",
        });
        return group;
      } catch (error) {
        console.error("Error fetching group:", error);
        throw new Error("Failed to fetch group");
      }
    },
  },
  Mutation: {
    addMessage: async (root, args, { user, pubSub }) => {
      try {
        if (!user) {
          throw new Error("Unauthorized user");
        }
        const { content, combinedId, userId, type } = args;
        const newMessage = {
          content,
          combinedId,
          from: userId,
          userId,
          type,
        };
        let group = await findGroup(combinedId);
        if (!group) {
          group = await createGroup(combinedId);
        }
        group.messages.push(newMessage);
        await group.save();

        // Convert ObjectId fields to string before publishing
        const groupToPublish = {
          ...group.toObject(),
          id: group._id.toString(),
          messages: group.messages.map((message) => ({
            ...message.toObject(),
            id: message._id.toString(),
            from: {
              ...message.from,
              id: message.from._id.toString(), // Ensure the sender ID is converted
            },
          })),
        };
        pubSub.publish(`GROUP_UPDATED_${combinedId}`, {
          groupUpdated: groupToPublish,
        });

        return group;
      } catch (error) {
        console.error("Error adding message to group:", error);
        throw new Error("Failed to add message to group");
      }
    },
  },
  Subscription: {
    groupUpdated: {
      subscribe: (root, { combinedId }, { pubSub }) => {
        return pubSub.asyncIterator(`GROUP_UPDATED_${combinedId}`);
      },
    },

    messageSent: {
      subscribe: (root, args, { pubSub, user }) => {
        return pubSub.asyncIterator(["MESSAGE_SENT"]);
      },
    },
  },
};

module.exports = groupResolver;
