import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLScalarType, Kind } from 'graphql';
import blocks from './blocks';
import serve from '../helpers/requestDeduplicator';

function formatBlockNumber(value) {
  if (Number.isInteger(value)) {
    return parseInt(value, 10);
  } else if (value === 'latest') {
    return 'latest';
  }

  throw new TypeError('Invalid block number');
}

const LatestOrBlockNumber = new GraphQLScalarType({
  name: 'LatestOrBlockNumber',
  serialize: formatBlockNumber,
  parseValue: formatBlockNumber,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return undefined;
  }
});

const typeDefs = `
scalar LatestOrBlockNumber

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
  number: LatestOrBlockNumber
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
    blocks: (parent, args) =>
      serve(JSON.stringify(args), blocks, [parent, args])
  },
  LatestOrBlockNumber
};
const schema = makeExecutableSchema({ typeDefs, resolvers: rootValue });

export default graphqlHTTP({
  schema,
  rootValue,
  graphiql: { defaultQuery }
});
