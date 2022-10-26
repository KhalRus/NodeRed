const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let mess = [null, []];  // 0 - команды управления на ПЧ, 1 - сообщения в лог (журнал)
const MS_TU = 0;
const MS_LOG = 1;

let tag = context.get('tag');
let topic = msg.topic.startsWith(tag) ? msg.topic.slice(context.get('tagLength')) : msg.topic;  // удаляем путь из топика, от последней /
let val = msg.payload;

switch (topic) {
  case 'pin1':  // обработка давления на входе
  case 'pin2':
    context.set(topic, +val);
    if ( (val <= env.get('min_P_in')) && context.get('pumpOn') ) {  // мин. давление на входе, останавливаем насос
      mess[MS_TU] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по минимальному давлению на входе!`,
          type: ERROR,
        }
      });
    }
  break;

  case 'pout1':   // обработка давления на выходе
  case 'pout2':
    context.set(topic, +val);
    if ((val >= env.get('max_P_out')) && context.get('pumpOn')) {  // макс. давление на выходе, останавливаем насос
      mess[MS_TU] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по максимальному давлению на выходе!`,
          type: ERROR,
        }
      });
    }
  break;

  case 'temp':  // обработка температуры насоса
    context.set(topic, +val);
    if ((val >= env.get('max_Temp')) && context.get('pumpOn')) {  // макс. температура, останавливаем насос
      mess[MS_TU] = {
        topic: 'tuStop',
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по аварийной температуре!`,
          type: ERROR,
        }
      });
    }
  break;

  case 'tuStart':  // команда на включение насоса
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда на включение насоса`,
        type: INFO,
      }
    });

    if (!context.get('pumpOn') && context.get('linkOn') && (context.get('temp') < env.get('max_Temp')) && (context.get('pin1') > env.get('min_P_in')) &&
     (context.get('pin2') > env.get('min_P_in')) && !context.get('errorNA')) {  // условия пуска насоса
      mess[MS_TU] = {
        topic: 'tuStart',
        payload: true,
      };

    } else {
      mess[MS_LOG].push({
        payload: {
          str: `Условия для пуска насоса не соблюдены`,
          type: ALERT,
        }
      });
    }
  break;

  case 'tuStop':  // команда на стоп насоса
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда на стоп насоса`,
        type: INFO,
      }
    });

    if (context.get('pumpOn') && context.get('linkOn')) {
      mess[MS_TU] = {
        topic: 'tuStop',
        payload: true,
      };

    } else {
      mess[MS_LOG].push({
        payload: {
          str: `Условия для остановки насоса не соблюдены`,
          type: ALERT,
        }
      });
    }
  break;

  case 'linkOn':
    if (val) {
      mess[MS_LOG].push({
        payload: {
          str: `Связь с насосом (ПЧ) установлена`,
          type: INFO,
        }
      });
      node.status({ fill: 'green', shape: 'dot', text: `status: ${context.get('status')}` });

    } else {
      mess[MS_LOG].push({
        payload: {
          str: `Связь с насосом (ПЧ) отсутствует`,
          type: ERROR,
        }
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
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда на изменение частоты насоса - ${context.get('freq')} Hz`,
        type: INFO,
      }
    });

    mess[MS_TU] = {
      topic: 'setFreq',
      payload: context.get('freq'),
    };
  break;

  case 'On':
    if (context.get('pumpOn') != val) {  // значение изменилось
      context.set('pumpOn', val);
      if (val) {
        mess[MS_LOG].push({
          payload: {
            str: `Насос включен`,
            type: INFO,
          }
        });

      } else {
        mess[MS_LOG].push({
          payload: {
            str: `Насос отключен`,
            type: INFO,
          }
        });
      }
    }
  break;

  case 'Dist':
    if (context.get('Dist') != val) {
      context.set('Dist', val);
      if (val) {
        mess[MS_LOG].push({
          payload: {
            str: `Насос в дистанционном режиме`,
            type: INFO,
          }
        });

      } else {
        mess[MS_LOG].push({
          payload: {
            str: `Насос в местном режиме`,
            type: INFO,
          }
        });
      }
    }
  break;

  case 'PchError':
    if (context.get('errorNA') != val) {
      context.set('errorNA', val);
      if (val) {
        mess[MS_LOG].push({
          payload: {
            str: `Авария насоса (ПЧ)!`,
            type: ERROR,
          }
        });

      } else {
        mess[MS_LOG].push({
          payload: {
            str: `Аварии насоса (ПЧ) отсутствуют`,
            type: INFO,
          }
        });
      }
    }
  break;

  case 'Alert':
    if (context.get('Alert') != val) {
      context.set('Alert', val);
      if (val) {
        mess[MS_LOG].push({
          payload: {
            str: `Сбой (предупреждение) в работе насоса (ПЧ)`,
            type: ERROR,
          }
        });

      } else {
        mess[MS_LOG].push({
          payload: {
            str: `Предупреждения по насосу (ПЧ) отсутствуют`,
            type: INFO,
          }
        });
      }
    }
  break;

  case 'linkError':
    if (val == 0) {  // ошибок нет
      node.status({ fill: 'green', shape: 'dot', text: `status: ${context.get('status')}` });
    } else {
      mess[MS_LOG].push({
        payload: {
          str: `Ошибка чтения данных насоса (ПЧ). Кол-во ошибок: ${val}`,
          type: ALERT,
        }
      });
      node.status({ fill: 'yellow', shape: 'ring', text: `err: ${val}` });
    }
    break;

  case 'errorWrite':
    mess[MS_LOG].push({
      payload: {
        str: `Ошибка записи команды насоса (ПЧ) - ${val}`,
        type: ALERT,
      }
    });
    break;
}

if (mess[MS_LOG].length == 0) { // нет сообщений MQTT для передачи
  mess[MS_LOG] = null;

} else { // добавляем в сообщения MQTT метку времени и топик (одно и тоже для всех сообщений, добавляем здесь, чтобы не дублировать это везде)
  mess[MS_LOG].forEach(el => {
    el.topic = `${tag}/log`;
    el.payload.time = Date.now();
  });
}

return mess;