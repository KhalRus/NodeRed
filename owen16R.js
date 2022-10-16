const dev_name = env.get('dev_name');
let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход

if (msg.topic == 'okWrite') {
  node.status({ fill: 'green', shape: 'dot', text: `ok - ${msg.payload}` });

} else if (msg.topic == 'errorWrite') {
  node.status({ fill: 'yellow', shape: 'ring', text: `err - ${msg.payload}` });
  // вывод ошибки в журнал потом добавить

} else {
  let signal = msg.topic.slice(context.get('signalLength'));  // только название сигнала без пути

  mess[0] = {
    payload: msg.payload == 'true',
    topic: 'writeVar',
    signal: signal,
  };
}
return mess;