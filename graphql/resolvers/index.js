const { PubSub } = require("graphql-subscriptions");
const authResolver = require("./authResolver");
const groupResolver = require("./groupResolver");

const myResolvers = [authResolver, groupResolver];

const queries = {};
const mutations = {};
const subscriptions = {};

for (const resolver of myResolvers) {
  if ("Query" in resolver) {
    Object.assign(queries, resolver.Query);
  }
  if ("Mutation" in resolver) {
    Object.assign(mutations, resolver.Mutation);
  }
  if ("Subscription" in resolver) {
    Object.assign(subscriptions, resolver.Subscription);
  }
}

const resolvers = {
  Query: queries,
  Mutation: mutations,
  Subscription: subscriptions,
};

module.exports = { resolvers };
