import request from 'supertest';

const HOST = `http://localhost:${process.env.PORT || 3034}`;

describe('POST /', () => {
  it('boots a graphql instance', async () => {
    const response = await request(HOST).post('/').set('Content-type', 'application/json');

    expect(response.body).toEqual({ errors: [{ message: 'Must provide query string.' }] });
  });

  it('returns the blocknumber from the timestamp', async () => {
    const response = await request(HOST)
      .post('/')
      .set('Content-type', 'application/json')
      .send(
        JSON.stringify({
          query:
            'query {  blocks (where: { ts: 1640000000, network_in: ["1", "100", "137"] }) {network number}}',
          variables: null
        })
      );

    expect(response.body).toEqual({
      data: {
        blocks: [
          {
            network: '1',
            number: 13841761
          },
          {
            network: '100',
            number: 19675612
          },
          {
            network: '137',
            number: 22747386
          }
        ]
      }
    });
  }, 15e3);

  it('returns a GraphQLError when giving invalid network', async () => {
    const response = await request(HOST)
      .post('/')
      .set('Content-type', 'application/json')
      .send(
        JSON.stringify({
          query:
            'query {  blocks (where: { ts: 1640000000, network_in: ["1", "4"] }) {network number}}',
          variables: null
        })
      );

    expect(response.body.errors).toEqual([
      {
        extensions: {
          code: 'INVALID_NETWORK'
        },
        locations: [
          {
            column: 10,
            line: 1
          }
        ],
        message: 'invalid network',
        path: ['blocks']
      }
    ]);
  }, 15e3);

  it.each([
    ['in the future', Math.floor((Date.now() + 1000 * 60) / 1000)],
    ['0', 0],
    ['negative', -500]
  ])(
    'returns a GraphQLError when timestamp is %s',
    async (title, ts) => {
      const response = await request(HOST)
        .post('/')
        .set('Content-type', 'application/json')
        .send(
          JSON.stringify({
            query: `query {  blocks (where: { ts: ${ts}, network_in: ["1"] }) {network number}}`,
            variables: null
          })
        );

      expect(response.body.errors).toEqual([
        {
          extensions: {
            code: 'INVALID_TIMESTAMP'
          },
          locations: [
            {
              column: 10,
              line: 1
            }
          ],
          message: 'timestamp must be in the past',
          path: ['blocks']
        }
      ]);
    },
    15e3
  );
});
