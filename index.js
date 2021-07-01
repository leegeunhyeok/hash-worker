const isWorkerSupport = !!window.Worker;

databaseInitialize();
self.name = 'window';

$(function () {
  let workerCount = 0;
  let spawnedWorker = null;

  if (!isWorkerSupport) {
    alert('!! Your browser not support Web Worker !!');
    return;
  }

  const spawnWorker = () => {
    const worker = new Worker('/worker.js', { name: 'worker-' + ++workerCount });
    worker.addEventListener('message', (event) => {
      console.log('Window :: From worker -', event.data);
      if (event.data === 'UPDATE') renderRecentHistory();
    });
    return worker;
  };

  const kill = () => {
    spawnedWorker && spawnedWorker.terminate();
    spawnedWorker = null;
  };

  renderRecentHistory = () => {
    if (!db.ready) alert('Database not ready');

    CompletedHash.count().then((total) => $('#total').text(total));
    CompletedHash.find()
      .get(BoxDB.Order.DESC, 100)
      .then((recentHistory) => {
        const content = $('<tbody></tbody>');
        recentHistory.forEach((data, index) => {
          content.append(
            $(
              '<tr><td>' +
                (index + 1) +
                '</td><td style="color:dodgerblue">' +
                data.hash +
                '</td><td style="color:tomato">' +
                data.nonce +
                '</td><td style="color:gold">' +
                data.target +
                '</td></tr>',
            ),
          );
        });
        $('tbody').replaceWith(content);
      })
      .catch((error) => {
        console.error('Window :: renderRecentHistory', error);
      });
  };

  $('#start').click(() => {
    console.log('Window :: Button start');
    kill();
    spawnedWorker = spawnWorker();
    spawnedWorker.postMessage({ action: 'INIT', data: $('#hash_starts_with').val() || '0000' });
    spawnedWorker.postMessage({ action: 'RUN' });
    $('#running').show();
  });

  $('#stop').click(() => {
    console.log('Window :: Button stop');
    kill();
    $('#running').hide();
  });

  $('#clear').click(() => {
    console.log('Window :: Button clear');
    CompletedHash.clear()
      .then(renderRecentHistory)
      .catch((e) => console.error(e));
  });

  var loop = setInterval(() => {
    if (!db.ready) return;
    clearInterval(loop);
    renderRecentHistory();
    $('#loading').hide();
  }, 100);
});