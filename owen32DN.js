const log = context.get('log');
const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, null]; // выходы функции, 0 - в модбас, 1 - сообщение в журнал
const MS_MQTT = 1;

if ( context.get('signals').includes(msg.topic) ) { // пришел сигнал DI, отправляем MQTT сообщение сигнала и в журнал
  mess[MS_MQTT] = [{
    payload: msg.payload,
    topic: `${env.get('place')}/${msg.topic}`,
  }, {
    payload: {
      str: `Изменился DI: ${msg.topic} - ${msg.payload}`,
      type: INFO,
      time: Date.now(),
    },
    topic: log,
  }];

} else if (msg.topic == 'linkOn') {
  mess[MS_MQTT] = [{
    payload: msg.payload,
    topic: `${context.get('tag')}linkOn`,
  }, {
    payload: {
      time: Date.now(),
    },
    topic: log,
  }];

  if (msg.payload) {
    node.status({ fill: 'green', shape: 'dot', text: 'connected' });
    mess[MS_MQTT][1].payload.str = 'Модуль на связи!';
    mess[MS_MQTT][1].payload.type = INFO;

  } else {
    node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
    mess[MS_MQTT][1].payload.str = 'Связь с модулем потеряна!';
    mess[MS_MQTT][1].payload.type = ERROR;
  }

} else if (msg.topic == 'linkError') {
  mess[MS_MQTT] = {
    payload: {
      str: `Количество ошибок связи с модулем: ${msg.payload}`,
      time: Date.now(),
    },
    topic: log,
  };

  if (msg.payload > 0) {   // кол-во ошибок больше 0
    mess[MS_MQTT].payload.type = ALERT;
    node.status({ fill: 'yellow', shape: 'ring', text: `err: ${msg.payload}` });

  } else if (msg.payload == 0) {
    mess[MS_MQTT].payload.type = INFO;
    node.status({ fill: 'green', shape: 'dot', text: `connected` });
  }

} else {  // не должно быть необработанных сигналов
  mess[MS_MQTT] = {
    payload: {
      str: `Необработанный топик: ${msg.topic} - ${msg.payload}`,
      time: Date.now(),
      type: ALERT,
    },
    topic: log,
  };
}

return mess;