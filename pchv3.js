let mess = [null, null]; // выходы функции, 0 - ТУ в модбас, 1 - сообщение в поток выше (PUMP)
const MS_WRITE = 0;
const MS_FLOW = 1;

switch (msg.topic) {
  case 'freq':
    mess[MS_FLOW] = {
      payload: Math.round(msg.payload / 327),  // преобразование (значение от 0 до 16384 - от 0 до 50 герц)
      topic: 'freq',
    };
    break;

  case 'status':  // раскладка статуса и передача сообщений выше
    let arr = msg.payload;
    mess[MS_FLOW] = [{
      payload: arr[11] == 1,  // ПЧ включен
      topic: 'On',
    }, {
      payload: arr[9] == 1,  // ПЧ в автомате (в ДУ)
      topic: 'Dist',
    }, {
      payload: arr[3] == 1,  // ПЧ авария
      topic: 'PchError',
    }, {
      payload: arr[4] == 1,  // ПЧ предупреждение
      topic: 'PchAlert',
    }, {
      payload: arr.reverse().join(''),  // Статус, для вывода состояния в статусе ноды
      topic: 'status',
    }];
    break;

  case 'setFreq':  // пишем новую частоту в ПЧ
    mess[MS_WRITE] = {
      payload: msg.payload * 327,
      topic: 'writeVar',
      reg: 50009,
      signal: msg.topic,
    };
  break;

  case 'tuStart':  // команда на пуск в ПЧ
    mess[MS_WRITE] = {
      payload: 1148,
      topic: 'writeVar',
      reg: 49999,
      signal: msg.topic,
    };
  break;

  case 'tuStop':  // команда на стоп в ПЧ
    mess[MS_WRITE] = {
      payload: 1080,
      topic: 'writeVar',
      reg: 49999,
      signal: msg.topic,
    };
  break;

  default: // передаем остальные сообщения выше, для обработки (errorWrite, errorUnknown, okWrite, linkOn и неизвестные)
    mess[MS_FLOW] = msg;
}

return mess;