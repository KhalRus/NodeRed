const log = context.get('log');
const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, null]; // выходы функции, 0 - в модбас, 1 - сообщение в журнал
const val = msg.payload;
const topic = msg.topic;
const MS_MQTT = 1;

if ( context.get('signals').includes(topic) ) { // пришел сигнал DI, отправляем MQTT сообщение сигнала и в журнал
  mess[MS_MQTT] = [{
    payload: val,
    topic: `${env.get('place')}/${topic}`,
  }, {
    payload: {
      str: `Изменился DI: ${topic} - ${val}`,
      type: INFO,
      time: Date.now(),
    },
    topic: log,
  }];

} else if (topic == 'linkOn') {
  mess[MS_MQTT] = [{
    payload: val,
    topic: `${context.get('tag')}linkOn`,
    retain: true,
  }, {

    payload: {
      str: val ? 'Модуль на связи!' : 'Связь с модулем потеряна!',
      time: Date.now(),
      type: val ? INFO : ERROR,
    },
    topic: log,
  }];

  node.status({ fill: val ? 'green' : 'red', shape: 'dot', text: val ? 'connected' : 'disconnected' });

} else if (topic == 'linkError') {
  mess[MS_MQTT] = {
    payload: {
      str: `Количество ошибок связи с модулем: ${val}`,
      time: Date.now(),
      type: (val > 0) ? ALERT : INFO,
    },
    topic: log,
  };

  node.status({
    fill: (val > 0) ? 'yellow' : 'green',
    shape: (val > 0) ? 'ring' : 'dot',
    text: (val > 0) ? `err: ${val}` : 'connected',
  });

} else {  // не должно быть необработанных сигналов
  mess[MS_MQTT] = {
    payload: {
      str: `Необработанный топик: ${topic} - ${val}`,
      time: Date.now(),
      type: ALERT,
    },
    topic: log,
  };
}

return mess;