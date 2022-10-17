const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, []];  // 0 - PCh, 1 - MQTT
let tag = context.get('tag');
let topic = msg.topic.startsWith(tag) ? msg.topic.slice(context.get('tagLength')) : msg.topic;  // удаляем путь из топика, от последней /
let val = msg.payload;

switch (topic) {
  case 'pin1':  // обработка давления на входе
  case 'pin2':
    context.set(topic, +val);
    if ( (val <= env.get('min_P_in')) && context.get('pumpOn') ) {  // мин. давление на входе, останавливаем насос
      mess[0] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[1].push({
        type: ERROR,
        payload: `Защита! Стоп по минимальному давлению на входе!`,
      });
    }
  break;

  case 'pout1':   // обработка давления на выходе
  case 'pout2':
    context.set(topic, +val);
    if ((val >= env.get('max_P_out')) && context.get('pumpOn')) {  // макс. давление на выходе, останавливаем насос
      mess[0] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[1].push({
        type: ERROR,
        payload: `Защита! Стоп по максимальному давлению на выходе!`,
      });
    }
  break;

  case 'temp':  // обработка температуры насоса
    context.set(topic, +val);
    if ((val >= env.get('max_Temp')) && context.get('pumpOn')) {  // макс. температура, останавливаем насос
      mess[0] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[1].push({
        type: ERROR,
        payload: `Защита! Стоп по аварийной температуре!`,
      });
    }
  break;

  case 'tuStart':  // команда на включение насоса
    mess[1].push({
      type: INFO,
      payload: `Подана команда на включение насоса`,
    });

    if (!context.get('pumpOn') && context.get('linkOn') && (context.get('temp') < env.get('max_Temp')) && (context.get('pin1') > env.get('min_P_in')) &&
     (context.get('pin2') > env.get('min_P_in')) && !context.get('errorNA')) {  // условия пуска насоса
      mess[0] = {
        topic: 'tuStart',
        payload: true,
      };

    } else {
      mess[1].push({
        type: ALERT,
        payload: `Условия для пуска насоса не соблюдены`,
      });
    }
  break;

  case 'tuStop':  // команда на стоп насоса
    mess[1].push({
      type: INFO,
      payload: `Подана команда на стоп насоса`,
    });

    if (context.get('pumpOn') && context.get('linkOn')) {
      mess[0] = {
        topic: 'tuStop',
        payload: true,
      };

    } else {
      mess[1].push({
        type: ALERT,
        payload: `Условия для остановки насоса не соблюдены`,
      });
    }
  break;

  case 'linkOn':
    if (val) {
      mess[1].push({
        type: INFO,
        payload: `Связь с насосом (ПЧ) установлена`,
      });
      node.status({ fill: 'green', shape: 'dot', text: `status: ${context.get('status')}` });

    } else {
      mess[1].push({
        type: ERROR,
        payload: `Связь с насосом (ПЧ) отсутствует`,
      });
      node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
    }
  break;

  case 'changeFreq':
    context.set('freq', +val);  // при изменении ползунка не пишем сразу в ПЧ
  break;

  case 'status':
    context.set('status', val);
    node.status({ fill: 'green', shape: 'dot', text: `status: ${val}` });  // вывод слова состояния ПЧ в статусе ноды
  break;

  case 'setFreq':
    mess[1].push({
      type: INFO,
      payload: `Подана команда на изменение частоты насоса - ${context.get('freq')} Hz`,
    });

    mess[0] = {
      topic: 'setFreq',
      payload: context.get('freq'),
    };
  break;

  case 'On':
    if (context.get('pumpOn') != val) {  // значение изменилось
      context.set('pumpOn', val);
      if (val) {
        mess[1].push({
          type: INFO,
          payload: `Насос включен`,
        });

      } else {
        mess[1].push({
          type: INFO,
          payload: `Насос отключен`,
        });
      }
    }
  break;

  case 'Dist':
    if (context.get('Dist') != val) {
      context.set('Dist', val);
      if (val) {
        mess[1].push({
          type: INFO,
          payload: `Насос в дистанционном режиме`,
        });

      } else {
        mess[1].push({
          type: INFO,
          payload: `Насос в местном режиме`,
        });
      }
    }
  break;

  case 'PchError':
    if (context.get('errorNA') != val) {
      context.set('errorNA', val);
      if (val) {
        mess[1].push({
          type: ERROR,
          payload: `Авария насоса (ПЧ)!`,
        });

      } else {
        mess[1].push({
          type: INFO,
          payload: `Аварии насоса (ПЧ) отсутствуют`,
        });
      }
    }
  break;

  case 'Alert':
    if (context.get('Alert') != val) {
      context.set('Alert', val);
      if (val) {
        mess[1].push({
          type: ERROR,
          payload: `Сбой (предупреждение) в работе насоса (ПЧ)`,
        });

      } else {
        mess[1].push({
          type: INFO,
          payload: `Предупреждения по насосу (ПЧ) отсутствуют`,
        });
      }
    }
  break;

  case 'linkError':
    if (val == 0) {  // ошибок нет
      node.status({ fill: 'green', shape: 'dot', text: `status: ${context.get('status')}` });
    } else {
      mess[1].push({
        type: ALERT,
        payload: `Ошибка чтения данных насоса (ПЧ). Кол-во ошибок: ${val}`,
      });
      node.status({ fill: 'yellow', shape: 'ring', text: `err: ${val}` });
    }
    break;

  case 'errorWrite':
    mess[1].push({
      type: ALERT,
      payload: `Ошибка записи команды насоса (ПЧ) - ${val}`,
    });
    break;
}

if (mess[1].length == 0) { // нет сообщений MQTT для передачи
  mess[1] = null;

} else { // добавляем в сообщения MQTT метку времени и топик (одно и тоже для всех сообщений, добавляем здесь, чтобы не дублировать это везде)
  for (let i = 0; i < mess[1].length; i++) {
    mess[1][i].time = Date.now();
    mess[1][i].topic = `${tag}/log`;
  }
}

return mess;