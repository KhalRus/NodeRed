const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, null, null]; // выходы функции, 0 - ТУ в модбас, 1 - сообщение в журнал, 2 - сообщение Mqtt (не журнал, статус связи)
const MS_TU = 0;
const MS_LOG = 1;
const MS_MQTT = 2;

const topic = msg.topic;
const val = msg.payload;
const state = context.get('state');

if (topic == 'okWrite') {
  mess[MS_LOG] = {
    payload: {
      str: `Команда записана успешно: ${val}`,
      type: INFO,
    },
  };

} else if (topic == 'errorWrite') {
  node.status({ fill: 'yellow', shape: 'ring', text: `err - ${val}` });
  mess[MS_LOG] = {
    payload: {
      str: `Ошибка записи команды: ${val}`,
      type: ERROR,
    },
  };

} else if (topic == 'linkOn') {
  mess[MS_MQTT] = {
    payload: val,
    topic: `${context.get('tag')}linkOn`,
    retain: true,
  };

  mess[MS_LOG] = {
    payload: {
      str: val ? 'Модуль на связи!' : 'Связь с модулем потеряна!',
      type: val ? INFO : ERROR,
    },
  };
  val ? node.status({ fill: 'green', shape: 'dot', text: state }) : node.status({ fill: 'red', shape: 'dot', text: state });

} else if (topic == 'linkError') {
  mess[MS_LOG] = {
    payload: {
      str: `Количество ошибок связи с модулем: ${val}`,
      type: (val > 0) ? ALERT : INFO,
    },
  };
  (val > 0) ? node.status({ fill: 'yellow', shape: 'ring', text: `err: ${val}` }) : node.status({ fill: 'green', shape: 'dot', text: state });

} else if (topic == 'errorUnknown') {
  mess[MS_LOG] = {
    payload: {
      str: `error unknown: ${val}`,
      type: ERROR,
    },
  };

} else if (topic == 'state') {  // обновился статус выходов
  let arr = val.reverse();
  let stateNew = `${arr.slice(0, 4).join('')} ${arr.slice(4, 8).join('')} ${arr.slice(8, 12).join('')} ${arr.slice(12, 16).join('')}`;
  node.status({ fill: 'green', shape: 'dot', text: stateNew });
  context.set('state', stateNew);

} else {                                                      // остальные сигналы это команды ТУ
  let ind = context.get('signals').indexOf(topic);           // индекс в массиве соответствует регистру COIL

  if (ind != -1) {
    mess[MS_TU] = {
      payload: [(val === true) || (val == 'true')],
      topic: 'writeVar',
      reg: ind,
      signal: topic,
    };

    mess[MS_LOG] = {
      payload: {
        str: `Подана команда ТУ: ${topic} - ${val}`,
        type: INFO,
      },
    };

  } else {  // команда в массиве команд не найдена
    mess[MS_LOG] = {
      payload: {
        str: `Неправильная команда ТУ: ${topic} - ${val}`,
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