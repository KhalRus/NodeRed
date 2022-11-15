const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

const log = context.get('log');
const koef = +env.get('koef_ch');

const topic = msg.topic;
const val = msg.payload;

let mess = [null, null]; // выходы функции, 0 - в модбас, 1 - сообщение в журнал
const MS_MQTT = 1;

if ( context.get('signals').includes(topic) ) { // пришел сигнал AI, отправляем MQTT
  let k = +val;
  if (k > 65000) {  // отрицательные вызывают переполнение
    k -= 65536;
  }
  mess[MS_MQTT] = [{
    payload: k / koef,
    topic: `${env.get('place')}/${topic}`,
  }];

} else if (topic == 'linkOn') {
  mess[MS_MQTT] = [{
    payload: val,
    topic: `${context.get('tag')}linkOn`,
    retain: true,
  }, {

    payload: {
      str: val ? 'Модуль на связи!' : 'Связь с модулем потеряна!',
      type: val ? INFO : ERROR,
      time: Date.now(),
    },
    topic: log,
  }];

  node.status({ fill: val ? 'green' : 'red', shape: 'dot', text: val ? 'connected' : 'disconnected' });

} else if (topic == 'linkError') {
  mess[MS_MQTT] = {
    payload: {
      str: `Количество ошибок связи с модулем: ${val}`,
      type: (val > 0) ? ALERT : INFO,
      time: Date.now(),
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