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

async function blah() {
    await sendRequest();
    await sendRequest();
}

it('works when the function has sequential requests', async () => {
    nock('http://localhost:6767')
        .get('/whatever')
        .times(2)
        .reply(200, 'ok');

    jest.useFakeTimers('legacy');

    const promise = blah();
    jest.runAllTicks();
    await promise;
    expect(nock.isDone()).toBe(true);
});
