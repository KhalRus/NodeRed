let mess = [null, null]; // выходы функции, null - ничего не отправляется на выход

switch (msg.topic) {
  case 'freq':
    mess[1] = {
      payload: Math.round(msg.payload / 327),  // преобразование (значение от 0 до 16384 - от 0 до 50 герц)
      topic: 'freq',
    };
  break;

  case 'status':  // раскладка статуса и передача сообщений выше
    let arr = msg.payload;
    mess[1] = [{
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
      topic: 'Alert',
    }, {
      payload: arr.join(''),  // Статус, для вывода состояния в статусе ноды
      topic: 'status',
    }];
  break;

  case 'setFreq':  // пишем новую частоту в ПЧ
    mess[0] = {
      payload: msg.payload * 327,
      topic: 'writeVar',
      reg: 50009,
      signal: msg.topic,
    };
  break;

  case 'tuStart':  // команда на пуск в ПЧ
    mess[0] = {
      payload: 1148,
      topic: 'writeVar',
      reg: 49999,
      signal: msg.topic,
    };
  break;

  case 'tuStop':  // команда на стоп в ПЧ
    mess[0] = {
      payload: 1080,
      topic: 'writeVar',
      reg: 49999,
      signal: msg.topic,
    };
  break;

  default: // передаем остальные сообщения выше, для обработки (errorWrite, error, okWrite, linkOn и неизвестные)
    mess[1] = {
      payload: msg.payload,
      topic: msg.topic,
    };
}

return mess;