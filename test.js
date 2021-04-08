const a = jest.fn(() => Promise.resolve());
const b = jest.fn(() => Promise.resolve());

async function subject() {
    await a();
    await b();
}

it('works', async () => {
   jest.useFakeTimers('modern');
   await subject();
   expect(a).toHaveBeenCalledTimes(1);
   expect(b).toHaveBeenCalledTimes(1);
});
