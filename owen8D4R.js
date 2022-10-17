const dev_name = env.get('dev_name');
const place = env.get('place');
let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход

if (msg.topic == 'okWrite') {
  node.status({ fill: 'green', shape: 'dot', text: `ok - ${msg.payload}` });

} else if (msg.topic == 'errorWrite') {
  node.status({ fill: 'yellow', shape: 'ring', text: `err - ${msg.payload}` });
  // вывод ошибки в журнал потом добавить

} else if ( context.get('signalsRead').includes(msg.topic) ) { // пришел сигнал DI, отправляем в MQTT
  mess[1] = {
    payload: msg.payload,
    topic: `${place}/${dev_name}/msg.topic`,
  };

} else if (msg.topic == 'linkOn') {
    mess[1] = {
      payload: msg.payload,
      topic: `${place}/${dev_name}/linkOn`,
    };
    if (msg.payload) {
      node.status({ fill: 'green', shape: 'dot', text: `connected` });
    } else {
      node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
    }

} else if (msg.topic == 'linkError') {
  if (msg.payload > 0) {   // кол-во ошибок больше 0
    node.warn(`${dev_name}. Errors count: ${msg.payload}`);
    node.status({ fill: 'yellow', shape: 'ring', text: `err: ${msg.payload}` });

  } else if (msg.payload == 0) {
    node.status({ fill: 'green', shape: 'dot', text: `connected` });
  }

} else {  // остальные сигналы должны быть командами ТУ
  let signal = msg.topic.slice(context.get('signalLength'));  // только название сигнала без пути

  mess[0] = {
    payload: msg.payload == 'true',
    topic: 'writeVar',
    signal: signal,
  };
}
return mess;