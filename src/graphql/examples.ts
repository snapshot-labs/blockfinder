export default `
query {
  blocks (where: { ts: 1640000000, network_in: ["1", "100", "137"] }) {
    network
    number
  }
}
`;
