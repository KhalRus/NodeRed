const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, null, null]; // выходы функции, 0 - ТУ в модбас, 1 - сообщение в журнал, 2 - сообщение Mqtt (не журнал, статус связи)
const MS_TU = 0;
const MS_LOG = 1;
const MS_MQTT = 2;

const topic = msg.topic;
const state = context.get('state');

if (topic == 'okWrite') {
  mess[MS_LOG] = {
    payload: {
      str: `Команда записана успешно: ${msg.payload}`,
      type: INFO,
    },
  };

} else if (topic == 'errorWrite') {
  node.status({ fill: 'yellow', shape: 'ring', text: `err - ${msg.payload}` });
  mess[MS_LOG] = {
    payload: {
      str: `Ошибка записи команды: ${msg.payload}`,
      type: ERROR,
    },
  };

} else if (topic == 'linkOn') {
  mess[MS_MQTT] = {
    payload: msg.payload,
    topic: `${context.get('tag')}linkOn`,
  };

  mess[MS_LOG] = {
    payload: {
      str: msg.payload ? 'Модуль на связи!' : 'Связь с модулем потеряна!',
      type: msg.payload ? INFO : ERROR,
    },
  };
  msg.payload ? node.status({ fill: 'green', shape: 'dot', text: state }) : node.status({ fill: 'red', shape: 'dot', text: state });

} else if (topic == 'linkError') {
  mess[MS_LOG] = {
    payload: {
      str: `Количество ошибок связи с модулем: ${msg.payload}`,
      type: (msg.payload > 0) ? ALERT : INFO,
    },
  };
  (msg.payload > 0) ? node.status({ fill: 'yellow', shape: 'ring', text: `err: ${msg.payload}` }) : node.status({ fill: 'green', shape: 'dot', text: state });

} else if (topic == 'errorUnknown') {
  mess[MS_LOG] = {
    payload: {
      str: `error unknown: ${msg.payload}`,
      type: ERROR,
    },
  };

} else if (topic == 'state') {  // обновился статус выходов
  let arr = msg.payload.reverse();
  let stateNew = `${arr.slice(0, 4).join('')} ${arr.slice(4, 8).join('')} ${arr.slice(8, 12).join('')} ${arr.slice(12, 16).join('')}`;
  node.status({ fill: 'green', shape: 'dot', text: stateNew });
  context.set('state', stateNew);

} else {                                                      // остальные сигналы это команды ТУ
  let ind = context.get('signals').indexOf(topic);           // индекс в массиве соответствует регистру COIL

  if (ind != -1) {
    mess[MS_TU] = {
      payload: [(msg.payload === true) || (msg.payload == 'true')],
      topic: 'writeVar',
      reg: ind,
      signal: topic,
    };

    mess[MS_LOG] = {
      payload: {
        str: `Подана команда ТУ: ${topic} - ${msg.payload}`,
        type: INFO,
      },
    };

  } else {  // команда в массиве команд не найдена
    mess[MS_LOG] = {
      payload: {
        str: `Неправильная команда ТУ: ${topic} - ${msg.payload}`,
        type: ERROR,
      },
    };
  }
}

if (mess[MS_LOG] !== null) {  // добавляем в MQTT метку времени и топик (одно и тоже для всех сообщений, добавляем здесь, чтобы не дублировать это везде)
  mess[MS_LOG].topic = `${context.get('log')}`;
  mess[MS_LOG].payload.time = Date.now();
}

return mess;