const places = {      // перечень площадок название в программе -> строка в журнале событий
  Nasosn1: 'Насосная 1',
  Nasosn2: 'Насосная 2',
};

const objects = context.get('objects');      // перечень объектов название в программе -> строка в журнале событий

function dateToString(mTime) {
  let currTime = new Date(+mTime);
  let year = currTime.getFullYear();
  let month = currTime.getMonth() + 1;

  let tm = currTime.getDate();
  let day = tm > 9 ? tm : `0${tm}`;

  tm = currTime.getHours();
  let hour = tm > 9 ? tm : `0${tm}`;

  tm = currTime.getMinutes();
  let min = tm > 9 ? tm : `0${tm}`;

  tm = currTime.getSeconds();
  let sek = tm > 9 ? tm : `0${tm}`;

  return `${year}-${month}-${day} ${hour}:${min}:${sek}`;
}

function makeTableStr(ms) {       // функция делает объект сообщения для журнала из входящего сообщения
  const INFO = 0;  // типы сообщений в логе
  const ALERT = 1;
  const ERROR = 2;

  let arr = ms.topic.split('/');
  let typeStr;      // строка для журнала с HTML форматированием
  let typeStrLog;   // строка для лога без форматирования

  switch (ms.payload.type) {
    case INFO:
      typeStr = 'Информация';
      typeStrLog = 'Информация';
      break;

    case ALERT:
      typeStr = '<font color="orange"><b>Предупреждение</b></font>';
      typeStrLog = 'Предупреждение';
      break;

    case ERROR:
      typeStr = '<font color="red"><b>Авария</b></font>';
      typeStrLog = 'Авария';
      break;

    default:
      typeStr = `<font color="red"><b>Неизвестное-${ms.type}</b></font>`;
      typeStrLog = `Неизвестное-${ms.payload.type}`;
  }

  return {
    'date': dateToString(ms.payload.time),
    'type': typeStr,
    'place': places[arr[0]] ?? arr[0],
    'object': objects[arr[1]] ?? arr[1],
    'message': ms.payload.str,
    'logStr': typeStrLog,
  };
}

if (msg.payload == 'change') {  // произошла смена вкладки
  if (msg.name == 'Сообщения') {  // произошло переключение на вкладку с журналом  ------- имя вкладки должно быть актуальным
    let currLog = context.get('currLog');

    if (currLog > -1) {  // если уже было добавление сообщений в журнал, инициализация прошла
      let arrLog = context.get('arrLog');   // массив сообщений
      let arrToTable;                       // массив объектов для вывода в журнал

      if (arrLog[currLog + 1] === undefined) {  // массив сообщений еще полностью не записан, либо это последний элемент, алгоритм будет такой же
        arrToTable = Array(currLog + 1);
        for (let i = 0; i <= currLog; i++) {
          arrToTable[i] = makeTableStr(arrLog[i]);
        }
      } else {                                  // старые сообщения начинаются после последнего записанного (запись по кругу)
        let maxLog = context.get('maxLog');
        arrToTable = Array(maxLog);
        let j = 0;

        for (let i = currLog + 1; i < maxLog; i++) {
          arrToTable[j++] = makeTableStr(arrLog[i]);
        }

        for (let i = 0; i <= currLog; i++) {
          arrToTable[j++] = makeTableStr(arrLog[i]);
        }
      }
      return [{ payload: arrToTable }, null];  // запись всей таблицы, в файл ничего
    }
  }

} else if (msg.payload.str == 'logName') {  // при запуске все модули передают свои наименования для лога
  objects[msg.payload.id] = msg.payload.logName;
  context.set('objects', objects);

} else if (msg.payload.str == 'clearTable') {  // очистка журнала
  context.set('currLog', -1);
  return [{ payload: [] }, null];

} else {        // пришло сообщение в журнал
  let reload = false;
  let n = context.get('currLog') + 1;
  if (n >= context.get('maxLog')) {
    n = 0;
    reload = true;  // массив полностью переписан, для очистки таблицы перезагружаем ее, чтобы не было переполнения памяти
  }

  delete msg._msgid;  // удаляем ненужные для сохранения в массиве свойства входящего сообщения
  delete msg.qos;
  delete msg.retain;
  delete msg._topic;

  context.get('arrLog')[n] = msg;
  context.set('currLog', n);
  let mess = makeTableStr(msg);
  let strLog = `${mess.date};${mess.logStr};${mess.place};${mess.object};${mess.message}`;

  return [{
    payload: {
      command: 'addRow',
      arguments: [mess],
    }
  }, {
    payload: strLog,
  }];
}