const nock = require('nock');
const http = require('http');

const port = 6767;

// let server;
//
// beforeAll(done => {
//     console.log('binding');
//     server = http.createServer((req, res) => {
//         res.write('hello world');
//         res.end();
//     });
//     server.listen(port, done);
// });
//
// afterAll(done => {
//     server.close(done);
// });

async function realRequest() {
    return new Promise((resolve, reject) => {
        const req = http.request('http://localhost:6767/whatever', {}, res => {
            const responseChunks = [];

            res.on('data', chunk => {
                responseChunks.push(chunk)
            });

            res.on('error', err => {
                reject(err);
            });

            res.on('end', () => {
                const response = Buffer.concat(responseChunks).toString();
                resolve(response);
            });
        });

        // send request
        req.end();
    });
}

// const request = jest.fn(realRequest);
//
// async function blah() {
//     await request();
//     await request();
// }

async function blah() {
    await realRequest();
    await realRequest();
}

it('works', async () => {
    nock('http://localhost:6767')
        .get('/whatever')
        .times(2)
        .reply(200, 'ok');
    await blah();
    expect(nock.isDone()).toBe(true);
});
