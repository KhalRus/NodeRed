const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let tag = context.get('tag');
let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход
const MS_MQTT = 1;

const val = msg.payload;
const topic = msg.topic;

switch (topic) {
  case 'curFlow':
    let fl = val.toFixed(2);

    mess[MS_MQTT] = {
      payload: fl,
      topic: `${tag}curFlow`,
    };

    context.set('curFlow', fl);
    node.status({ fill: 'green', shape: 'dot', text: `${fl} l/s`, });
    break;

  case 'sumFlow':
    mess[MS_MQTT] = {
      payload: val.toFixed(1),
      topic: `${tag}sumFlow`,
    };
    break;

  case 'linkOn':
    mess[MS_MQTT] = [{
      payload: val,
      retain: true,
      topic: `${tag}linkOn`,
    }, {

      payload: {
        str: val ? 'Расходомер на связи!' : 'Связь с Расходомером потеряна!',
        type: val ? INFO : ERROR,
        time: Date.now(),
      },
      topic: `${tag}log`,
    }];

    node.status({fill: val ? 'green' : 'red', shape: 'dot', text: `${context.get('curFlow')} l/s`});
    break;

  case 'linkError':
    mess[MS_MQTT] = {
      payload: {
        str: `Количество ошибок связи: ${val}`,
        type: (val > 0) ? ALERT : INFO,
        time: Date.now(),
      },
      topic: `${tag}log`,
    };

    node.status({
      fill: (val > 0) ? 'yellow' : 'green',
      shape: (val > 0) ? 'ring' : 'dot',
      text: (val > 0) ? `err: ${val}` : `${context.get('curFlow')} l/s`,
    });
    break;

  default:
    mess[MS_MQTT] = {
      payload: {
        str: `Необработанный топик: ${topic} - ${val}`,
        time: Date.now(),
        type: ALERT,
      },
      topic: `${tag}log`,
    };
};

return mess;