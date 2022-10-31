const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let tag = context.get('tag');
let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход
const MS_MQTT = 1;

switch (msg.topic) {
  case 'level':
    mess[MS_MQTT] = [{
      payload: `${msg.payload.toFixed(3)} м.`,
      topic: `${tag}level`,
    }];

    let level = Math.round(msg.payload * 100);        // временно включаем лог по изменению уровня, для проверки помех
    if (level != context.get('level')) {
      context.set('level', level);
      mess[MS_MQTT].push({
        payload: {
          str: `Уровень ${msg.payload.toFixed(3)} м.`,
          type: INFO,
          time: Date.now(),
        },
        topic: `${tag}log`,
      });
    }
    //    -- удаляем лог до этой строки, когда будет не нужен --
    break;

  case 'temperature':
    mess[MS_MQTT] = {
      payload: `${msg.payload.toFixed(1)} °C`,
      topic: `${tag}temper`,
    };
    break;

  case 'linkOn':
    mess[MS_MQTT] = [{
      payload: msg.payload,
      topic: `${tag}linkOn`,
    }, {
      payload: {
        time: Date.now(),
      },
      topic: `${tag}log`,
    }];

    if (msg.payload) {
      node.status({ fill: 'green', shape: 'dot', text: `connected` });
      mess[MS_MQTT][1].payload.str = 'Модуль на связи!';
      mess[MS_MQTT][1].payload.type = INFO;

    } else {
      node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
      mess[MS_MQTT][1].payload.str = 'Связь с модулем потеряна!';
      mess[MS_MQTT][1].payload.type = ERROR;
    }
    break;

  case 'linkError':
    mess[MS_MQTT] = {
      payload: {
        str: `Количество ошибок связи с модулем: ${msg.payload}`,
        time: Date.now(),
      },
      topic: `${tag}log`,
    };
    if (msg.payload > 0) {   // кол-во ошибок больше 0
      mess[MS_MQTT].payload.type = ALERT;
      node.status({ fill: 'yellow', shape: 'ring', text: `err: ${msg.payload}` });

    } else if (msg.payload == 0) {
      mess[MS_MQTT].payload.type = INFO;
      node.status({ fill: 'green', shape: 'dot', text: `connected` });
    }
    break;

  default:
    mess[MS_MQTT] = {
      payload: {
        str: `Необработанный топик: ${msg.topic} - ${msg.payload}`,
        time: Date.now(),
        type: ALERT,
      },
      topic: `${tag}log`,
    };
};

return mess;