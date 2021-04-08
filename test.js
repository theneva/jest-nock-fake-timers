// const nock = require('nock');
const http = require('http');
const {promisify} = require('util');

const port = 6767;

let server;

beforeAll(done => {
    server = http.createServer((req, res) => {
        res.write('hello world');
        res.end();
    });
    server.listen(port, done);
});

afterAll(done => {
    server.close(done);
});

async function request() {
    return new Promise((resolve, reject) => {
        const req = http.request('http://localhost:6767', {}, res => {
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

it('works', async () => {
    jest.useFakeTimers();
    const res = await request();
    const res2 = await request();
    expect(res).toBe('hello world');
});
