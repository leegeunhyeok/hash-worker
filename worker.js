importScripts('https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js');
importScripts('https://cdn.jsdelivr.net/npm/bxd@latest/dist/bxd.min.js');
importScripts('/database.js');

let HASH_STARTS_WITH = null;

class HashTask {
  _running = null;

  _task = function* task() {
    while (true) {
      let nonce = 0;
      const startedAt = new Date();

      while (true) {
        const target = `${self.name}.${+startedAt}.${nonce}`;
        const hash = sha256(target);

        if (hash.startsWith(HASH_STARTS_WITH)) {
          const res = {
            hash,
            nonce,
            target,
            startedAt: startedAt.toString(),
            endedAt: new Date().toString(),
          };
          yield res;
          break;
        }

        ++nonce;
        yield;
      }
    }
  };

  async start() {
    let res;
    const currentTask = this._task();
    console.log(`${self.name} :: HashTask.start - Running..`);

    while (!(res = currentTask.next()).done) {
      if (res.value) {
        console.log('found');
        await CompletedHash.add(res.value).then(() => {
          console.log(`${self.name} :: Result stored!`, res.value);
          self.postMessage('UPDATE');
        });
      }
    }
  }
}

const task = new HashTask();

self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  console.log(`${self.name} :: From Window - ${action}`);

  switch (action) {
    case 'INIT':
      HASH_STARTS_WITH = data;
      return;

    case 'RUN':
      Promise.resolve(db.ready ? null : databaseInitialize()).then(() => task.start());
      return;
  }
});
