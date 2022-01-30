import path from 'path';
import fs from 'fs';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import blocks from './blocks';
import defaultQuery from './examples';
import serve from '../ee';

const schemaFile = path.join(__dirname, './schema.gql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');
const rootValue = {
  Query: {
    blocks: (parent, args) => serve(JSON.stringify(args), blocks, [parent, args])
  }
};
const schema = makeExecutableSchema({ typeDefs, resolvers: rootValue });

export default graphqlHTTP({
  schema,
  rootValue,
  graphiql: { defaultQuery }
});
