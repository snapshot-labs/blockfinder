import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import blocks from './blocks';
import defaultQuery from './examples';
import typeDefs from './schema';
// import serve from '../ee';

const rootValue = {
  Query: {
    // blocks: (parent, args) => serve(JSON.stringify(args), blocks, [parent, args])
    blocks
  }
};
const schema = makeExecutableSchema({ typeDefs, resolvers: rootValue });

export default graphqlHTTP({
  schema,
  rootValue,
  graphiql: { defaultQuery }
});
