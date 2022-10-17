const dev_name = env.get('dev_name');
const place = env.get('place');
let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход

switch (msg.topic) {
  case 'level':
    mess[1] = {
      payload: `${msg.payload.toFixed(3)} м.`,
      topic: `${place}/${dev_name}/level`,
    };
  break;

  case 'temperature':
    mess[1] = {
      payload: `${msg.payload.toFixed(1)} °C`,
      topic: `${place}/${dev_name}/temper`,
    };
  break;

  case 'linkOn':
    mess[1] = {
      payload: msg.payload,
      topic: `${place}/${dev_name}/linkOn`,
    };
    if (msg.payload) {
      node.status({ fill: 'green', shape: 'dot', text: `connected` });
    } else {
      node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
    }
  break

  case 'linkError':
    if (msg.payload > 0) {   // кол-во ошибок больше 0
      node.warn(`${dev_name}. Errors count: ${msg.payload}`);
      node.status({ fill: 'yellow', shape: 'ring', text: `err: ${msg.payload}` });

    } else if (msg.payload == 0) {
      node.status({ fill: 'green', shape: 'dot', text: `connected` });
    }
  break;
};
return mess;