const nock = require('nock');
const http = require('http');

async function sendRequest() {
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

async function sendTwoSequentialRequests() {
    await sendRequest();
    await sendRequest();
}

it('works when the function has sequential requests', async () => {
    nock('http://localhost:6767')
        .get('/whatever')
        .times(2)
        .reply(200, 'ok');

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
    jest.runAllTicks();
    await promise;
    expect(nock.isDone()).toBe(true);
});
