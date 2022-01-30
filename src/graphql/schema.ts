export default `
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
