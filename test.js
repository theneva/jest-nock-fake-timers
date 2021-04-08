const http = require('http');

const server = http.createServer((req, res) => {
    console.log('received request');
    res.write('hello');
    res.end();
});

beforeAll(done => {
    server.on('error', err => {
        throw err;
    })
    server.listen(6767, () => {
        done();
    });
});

afterAll(done => {
    server.close(err => {
        if (err) {
            throw err;
        }

        done();
    });
});

async function sendRequest() {
    return new Promise((resolve, reject) => {
        const req = http.request('http://localhost:6767/whatever', {}, res => {
            const responseChunks = [];

            res.on('data', chunk => {
                responseChunks.push(chunk)
            });

            res.on('error', err => {
                console.log(err);
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

async function sendTwoSequentialRequests() {
    return [
        await sendRequest(),
        await sendRequest(),
    ];
}

it('works when the function has sequential requests', async () => {
    // Works with legacy timers, but I can't seem to find a workaround
    // with modern ones without starting both requests before returning
    // from `sendTwoSequentialRequests()`.
    jest.useFakeTimers('legacy');
    // jest.useFakeTimers('modern');

    // Calling `runAllTicks()` once the function hits the first `await`
    // makes a single request work with modern timers
    // (see also https://github.com/facebook/jest/issues/10221),
    // but I don't think it's possible to have the test code
    // run all ticks again between landing the first request
    // and setting off the second.
    const promise = sendTwoSequentialRequests();
    // jest.runAllTicks();
    const results = await promise;
    expect(results).toStrictEqual(['hello', 'hello'])
}, 5000);
