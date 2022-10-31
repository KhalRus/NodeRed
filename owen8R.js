const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, null]; // выходы функции, 0 - ТУ в модбас, 1 - сообщение в журнал
const MS_TU = 0;
const MS_LOG = 1;

let topic = msg.topic;
if (topic.startsWith(context.get('tag'))) {
  topic = msg.topic.slice(context.get('signalLength'));   // только название сигнала без пути
}

if (topic == 'okWrite') {
  node.status({ fill: 'green', shape: 'dot', text: `ok - ${msg.payload}` });
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

} else if (topic == 'errorUnknown') {
  mess[MS_LOG] = {
    payload: {
      str: msg.payload,
      type: ERROR,
    },
  };

} else if (topic == 'log') {  // пришло сообщение в журнал, здесь его не обрабатываем

} else {                                                      // остальные сигналы это команды ТУ
  let ind = context.get('signals').indexOf(topic);           // индекс в массиве соответствует регистру COIL

  if ((ind != -1) && (topic != 'null')) {
    mess[MS_TU] = {
      payload: [(msg.payload === true) || (msg.payload == 'true') || (msg.payload == 1) || (msg.payload == '1')],
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
  mess[MS_LOG].topic = `${context.get('tag')}log`;
  mess[MS_LOG].payload.time = Date.now();
}

return mess;