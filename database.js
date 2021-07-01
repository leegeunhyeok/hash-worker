const db = new BoxDB('hash-worker', 1);
const CompletedHash = db.box(
  'completed_hash',
  {
    hash: BoxDB.Types.STRING,
    nonce: BoxDB.Types.NUMBER,
    target: BoxDB.Types.STRING,
    startedAt: BoxDB.Types.STRING,
    endedAt: {
      type: BoxDB.Types.STRING,
      index: true,
    },
  },
  { autoIncrement: true },
);

const databaseInitialize = () => {
  return db
    .open()
    .then(() => {
      console.log(`${self.name} :: BoxDB ready`);
    })
    .catch((e) => {
      console.error(`${self.name} :: BoxDB error - ${e}`);
    });
};
