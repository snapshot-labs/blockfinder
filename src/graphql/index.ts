import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import blocks from './blocks';
import serve from '../helpers/requestDeduplicator';

const typeDefs = `
type Query {
  blocks(where: Where): [Block]
}

input Where {
  ts: Int
  network: String
  network_in: [String]
}

type Block {
  network: String
  number: Int
}
`;

const defaultQuery = `
query {
  blocks (where: { ts: 1640000000, network_in: ["1", "100", "137"] }) {
    network
    number
  }
}
`;

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
