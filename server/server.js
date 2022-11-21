const express = require('express');
const path = require('path');
const db = require('./config/connection');
const schemas = require('./schemas');
//require ApolloServer
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require('./utils/auth');

//typeDefs, resolvers, config/connection
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;
//add ApolloServer
async function startApolloServer(typeDefs, resolvers) {
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
await server.start();
const app = express();
//applyMiddleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  console.log(
    `GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
});
};