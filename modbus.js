function word2ToFloat(w1, w0) {  // 2 word преобразование во float
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt16BE(w1);
  buf.writeUInt16BE(w0, 2);
  return buf.readFloatBE(0);
}

function decToBinArr(n, razr = 16) {  // преобразование регистра в массив, по умолчанию 16 бит
  let arr = Array(razr).fill(0, 0, razr);
  razr = 0;
  while (n > 0) {
    arr[razr++] = n % 2;
    n = Math.trunc(n / 2);
  }
  return arr;
}

const modbus = context.get('modbus');    // объект для хранения настроек modbus
const objRead = context.get('objRead');  // все переменные для чтения хранятся в объекте objRead, ключ - имя переменной

// 0 - на delay, 1 - modbus Read, 2 - modbus Write, 3 - выход значений в вышестоящий поток
let mess = [null, null, null, null]; // выходы функции, null - ничего не отправляется на выход

if ((msg.topic == 'initModbusRead') && (msg.payload.length > 0)) {    // инициализация опроса modbus (если есть сигналы для опроса)
  modbus.addres = msg.addres ?? 1;                            // Значение по умолчанию 1
  modbus.pollPeriod = msg.pollPeriod ?? 1000;                 // Значение по умолчанию 1000 милисекунд
  modbus.pollErrPeriod = msg.pollErrPeriod ?? 10000;          // Значение по умолчанию 10 000 милисекунд
  modbus.maxErrors = msg.maxErrors ?? 10;                     // Значение по умолчанию 10
  modbus.devname = msg.devname;                               // Значение должно быть обязательно

  let arr = msg.payload;
  for (let i = 0; i < arr.length; i++) {
    let readObj = {
      reg: arr[i].reg,               // регистр чтения
      count: arr[i].count ?? 1,      // кол-во регистров чтения (по умолчанию 1)
      id: arr[i].id,                 // имя переменной
      type: arr[i].type ?? 'word',   // тип переменной (word - обычный регистр (по умолчанию), float - 2 регистра составляющих одну float переменную, bitArr - регистр преобразуемый в массив из 16 битов)
      value: null,                   // значение переменной
    };

    if (i == 0) readObj.first = true;  // подсчет ошибок чтения ведем по первой переменной
    if (readObj.type == 'float') readObj.value = [null, null];  // float 2 регистра
    if (readObj.type == 'bitArrWide') readObj.signalsArr = arr[i].signalsArr;  // если расширенная битовая маска (с названиями), то записываем массив названий сигналов

    objRead[readObj.id] = readObj;  // все переменные для чтения хранятся в объекте objRead, ключ - имя переменной
  }

  // запуск первого опроса
  mess[0] = {
    payload: 0,
    topic: 'updateAllVars',  // запуск опроса
    delay: msg.startDelay,   // пауза перед первым опросом
  };

} else if (msg.topic == 'initModbusWrite') {          // инициализация записи modbus
  modbus.addres = msg.addres ?? 1;                            // Значение по умолчанию 1
  modbus.devname = msg.devname;                               // Значение должно быть обязательно
  modbus.command = msg.command;
  modbus.type = msg.type;

  if (msg.type == 'bitArr'){
    modbus.reg = msg.reg;
    modbus.signals = msg.payload;
    modbus.bitMask = 0;
  }

} else if (msg.topic == 'updateAllVars') {    // циклический опрос modbus
  let outArr = [];
  for (let key in objRead) {
    let obj = objRead[key];
    outArr.push({
      payload: {
        value: 1,
        'fc': 3,
        'unitid': modbus.addres,
        'address': obj.reg,
        'quantity': obj.count,
      },
      topic: obj.id,
      dev: modbus.devname,
    });
  }
  mess[1] = outArr;

  mess[0] = {
    payload: 0,
    topic: 'updateAllVars',  // запуск следующего опроса
    delay: (context.get('linkOn')) ? modbus.pollPeriod : modbus.pollErrPeriod,  // если есть связь задержка опроса короткая, иначе длинная
  };

} else if (msg.topic == 'writeVar') {  // запись переменной modbus
  if (modbus.type == 'bitArr') {  // если пишем в битовую маску
    let ind = modbus.signals.indexOf(msg.signal);  // индекс в массиве сигналов соответсвует разряду в 2ном представлении

    if ((ind == -1) || (msg.signal == 'null')) {  // индекс сигнала не найден или был null
      node.warn(`${modbus.devname} Неправильная команда ТУ: ${msg.signal}`);
      mess[3] = {
        topic: 'errorWrite',
        payload: msg.signal,
      };
    }

    let curBitMask = modbus.bitMask;

    let arr = decToBinArr(modbus.bitMask);
    if ((msg.payload) && (arr[ind] == 0)) {  // записываем 1 если в регистре 0 и команда 1
      modbus.bitMask += 2 ** ind;
    } else if (!msg.payload && (arr[ind] == 1)) {
      modbus.bitMask -= 2 ** ind;
    }

    if (curBitMask != modbus.bitMask) {  // если битовая маска поменялась
      mess[2] = {
        payload: {
          value: modbus.bitMask,
          'fc': modbus.command,
          'unitid': modbus.addres,
          'address': modbus.reg,
          'quantity': 1,
        },
        topic: 'varWrited',
        dev: modbus.devname,
        signal: msg.signal,
      }
      node.warn(`${modbus.devname} Подана команда ТУ: ${msg.signal}`);
    } else {
      node.warn(`${modbus.devname} Данный сигнал уже был подан: ${msg.signal}`);
    }

  } else if (modbus.type == 'word') {
    mess[2] = {
      payload: {
        value: msg.payload,
        'fc': modbus.command,
        'unitid': modbus.addres,
        'address': msg.reg,
        'quantity': 1,
      },
      topic: 'varWrited',
      dev: modbus.devname,
      signal: msg.signal,
    }
  }

} else if (msg.topic == 'varWrited') {  // ответ модбас после записи переменной modbus
  if (msg.error === undefined) {
    node.warn(`${modbus.devname} Команда ТУ доставлена: ${msg}`);
    mess[3] = {
      topic: 'okWrite',
      payload: msg.signal,
    };
  } else {
    node.warn(`${modbus.devname} Ошибка записи команды: ${msg}`);
    mess[3] = {
      topic: 'errorWrite',
      payload: msg.signal,
    };
  }
} else {  // остальные топики обрабатываем здесь (прочитанные значения и тд.)
  let obj = objRead[msg.topic];

  if (obj) {  // переменная есть
    let outVar = {
      topic: msg.topic,
      payload: null,
    };

    if (msg.error === undefined) {  // нет ошибок чтения модбас
      switch (obj.type) {  // проверяем, что значение изменилось, запоминаем его и пишем на выход
        case 'word':
          if (obj.value != msg.payload[0]) {
            obj.value = msg.payload[0];
            outVar.payload = msg.payload[0];
          }
        break;

        case 'bitArr':
          if (obj.value != msg.payload[0]) {
            obj.value = msg.payload[0];
            outVar.payload = decToBinArr(msg.payload[0]);
          }
        break;

        case 'bitArrWide':
          if (obj.value != msg.payload[0]) {
            mess[3] = [];  // пишем в выход сразу
            let oldVar = decToBinArr(obj.value);
            let newVar = decToBinArr(msg.payload[0]);

            for (let i = 0; i < 16; i++) {
              if (oldVar[i] != newVar[i]) {
                mess[3].push({
                  topic: obj.signalsArr[i],
                  payload: newVar[i] == 1,
                });
              }
            }

            obj.value = msg.payload[0];
          }
          break;

        case 'float':
          if ( (obj.value[0] != msg.payload[0]) || (obj.value[1] != msg.payload[1]) ){
            obj.value[0] = msg.payload[0];
            obj.value[1] = msg.payload[1];
            outVar.payload = word2ToFloat(msg.payload[1], msg.payload[0]);
          }
        break;

        default:
          node.warn(`${modbus.devname} Ошибка в типе переменной: ${obj.type}`)
        break;
      }

      if (outVar.payload !== null) {
        mess[3] = [outVar];
      }

      if (obj.first) {                                       // первая переменная, для учета ошибок чтения
        if (context.get('linkOn') === true) {                // связь была и есть (лимит ошибок не превышен, linkOn == true)
          if (context.get('errorsCount') > 0) {              // но несколько раз (или 1) прошли ошибки связи
            context.set('errorsCount', 0);                   // обнуляем ошибки чтения
            if (mess[3] === null) mess[3] = [];              // если пусто, то делаем массив, для универсальности
            mess[3].push({                                   // сообщение, что кол-во ошибок 0 - для обновления статуса ноды
              topic: 'error',
              payload: 0,
            });
          }

        } else {                                            // если связь восстановилась, то отправляем сообщение
          if (mess[3] === null) mess[3] = [];               // если пусто, то делаем массив, для универсальности
          mess[3].push({
            topic: 'linkOn',
            payload: true,
          });-
          context.set('errorsCount', 0);  // обнуляем ошибки чтения
          context.set('linkOn', true);
        }
      }

    } else if ( context.get('linkOn') && (obj.first) ) {  // ошибки чтения modbus учитываем для первой переменной и если связь была (лимит ошибок не превышен, linkOn == true)
      let numErr = context.get('errorsCount') + 1;
      if (numErr < modbus.maxErrors) {
        mess[3] = {
          topic: 'error',
          payload: numErr,
        };
        context.set('errorsCount', numErr);
      } else {
        mess[3] = {
          topic: 'linkOn',
          payload: false,
        };
      }
    }

  } else {
    node.warn(`${modbus.devname} Необработанный топик: ${msg.topic}`);
  }
}

return mess;