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
      retain: true,
    }, {

      payload: {
        str: msg.payload ? 'Модуль на связи!' : 'Связь с модулем потеряна!',
        type: msg.payload ? INFO : ERROR,
        time: Date.now(),
      },
      topic: `${tag}log`,
    }];

      node.status({
        fill: msg.payload ? 'green' : 'red',
        shape: 'dot',
        text: msg.payload ? `connected` : 'disconnected',
      });
    break;

  case 'linkError':
    mess[MS_MQTT] = {
      payload: {
        str: `Количество ошибок связи с модулем: ${msg.payload}`,
        type: (msg.payload > 0) ? ALERT : INFO,
        time: Date.now(),
      },
      topic: `${tag}log`,
    };

    node.status({
      fill: (msg.payload > 0) ? 'yellow' : 'green',
      shape: (msg.payload > 0) ? 'ring' : 'dot',
      text: (msg.payload > 0) ? `err: ${msg.payload}` : `connected`,
    });
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