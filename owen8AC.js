const dev_name = env.get('dev_name');
const place = env.get('place');

let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход

if (msg.topic == 'linkOn') {
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

} else if (context.get('signals').includes(msg.topic)) {  // название сигнала содержится в массиве сигналов
  mess[1] = {
    payload: msg.payload / +env.get('koef_ch'),  // входное значение датчиков модуля 8АС умножено на коэффициент для преобразования к целому, результат надо разделить на этот коэф.
    topic: msg.topic,
  };
} else {  // не должно быть необработанных сигналов
  node.warn(`${dev_name} Необработанный топик: ${msg}`);
}

return mess;