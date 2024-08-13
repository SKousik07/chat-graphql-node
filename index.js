const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { PubSub } = require("graphql-subscriptions");
const { typeDefs } = require("./graphql/typedefs");
const { resolvers } = require("./graphql/resolvers");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const cors = require("cors");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { connect } = require("./db/dbConfig");
const pubSub = require("./graphql/pubSub");
const { verifyToken } = require("./graphql/services/authService");

async function startServer() {
  const app = express();

  connect();
  // // Use native Node.js EventEmitter with PubSub
  // class CustomPubSub extends PubSub {
  //   constructor() {
  //     super();
  //     this.ee = new EventEmitter();
  //   }
  // }

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create an HTTP server and add WebSocket support
  const httpServer = createServer(app);

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  wsServer.on("connection", (ws) => {
    console.log("WebSocket connected");
  });

  // Use WebSocket server with GraphQL server
  const serverCleanup = useServer(
    {
      schema,
      context: { pubSub },
      onConnect: async (ctx) => {
        console.log("Connected usesrver");
      },
      onDisconnect(ctx, code, reason) {
        console.log("Disconnected!");
      },
    },
    wsServer
  );

  const apolloServer = new ApolloServer({
    schema,
    context: async ({ req }) => {
      console.log("apo-context");
      const authToken = req.headers.authorization || "";
      let user = null;
      if (authToken) {
        try {
          user = verifyToken(authToken.replace("Bearer ", ""));
        } catch (error) {
          console.error("Invalid token", error);
        }
      }
      return { user, pubSub };
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Apply Express middleware to Apollo server
  await apolloServer.start();
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        console.log("mid-context");
        const authToken = req.headers.authorization || "";
        let user = null;
        if (authToken) {
          try {
            user = verifyToken(authToken.replace("Bearer ", ""));
          } catch (error) {
            console.error("Invalid token", error);
          }
        }
        return { user, pubSub };
      },
    })
  );

  // Listen to HTTP server
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}/graphql`);
  });

  //Simulate message sending for testing
  // setInterval(() => {
  //   // console.log("publish");
  //   console.log("intervalpubsub", pubSub);
  //   pubSub.publish("MESSAGE_SENT", { messageSent: "New message!" });
  // }, 5000);
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
});
