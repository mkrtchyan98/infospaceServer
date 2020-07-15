const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const isEmail = require('isemail');
const resolvers = require('./resolvers');
require('dotenv').config()
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

	const server = new ApolloServer({
    cors:true,
  context: async ({ req }) => {
    const auth = req.headers && req.headers.authorization || ''; 
       const email = Buffer.from(auth, 'base64').toString('ascii'); 
          if (!isEmail.validate(email)) 
          return { user: null };  
      	 const users = await store.users.findOrCreate({ where: { email } });
      	     const user = users && users[0] || null;   
      	  return { user: { ...user.dataValues }
      	   }; 
      	    },
  typeDefs,
  resolvers,
    engine: {
    reportSchema: true
  },
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  }),
});

server.listen({ port: process.env.MY_PORT || 5000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});