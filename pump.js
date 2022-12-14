const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;
const TU_Prefix = 'toCalc$$';    // для фильтрации сообщений в ПЧ на Modbus и на Calc_function

let mess = [null, []];  // 0 - команды управления на ПЧ, 1 - сообщения в лог (журнал)
const MS_TU = 0;
const MS_LOG = 1;

let tag = context.get('tag');
let topic = msg.topic;
let val = msg.payload;

switch (topic) {
  case 'freq':     // частота с ПЧ
    mess[MS_LOG].push({
      payload: val,
      topic: `${tag}freq`,
    });
    break;

  case 'pin1':  // обработка давления на входе
  case 'pin2':
    context.set(topic, +val);
    if ( (val <= env.get('min_P_in')) && context.get('pumpOn') ) {  // мин. давление на входе, останавливаем насос
      mess[MS_TU] = {
        topic: `${TU_Prefix}tuStop`,
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по минимальному давлению на входе! P = ${val}`,
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
        topic: `${TU_Prefix}tuStop`,
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по максимальному давлению на выходе! P = ${val}`,
          type: ERROR,
        }
      });
    }
    break;

  case 'temp':  // обработка температуры насоса
    context.set(topic, +val);
    if ((val >= env.get('max_Temp')) && context.get('pumpOn')) {  // макс. температура, останавливаем насос
      mess[MS_TU] = {
        topic: `${TU_Prefix}tuStop`,
        payload: true,
      };

      mess[MS_LOG].push({
        payload: {
          str: `Защита! Стоп по аварийной температуре! t = ${val}`,
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

    if (!context.get('pumpOn') && context.get('linkOn') && (context.get('pin1') > env.get('min_P_in')) && (context.get('pin2') > env.get('min_P_in')) &&
      context.get('Dist') && !context.get('errorNA') && (context.get('temp') < env.get('max_Temp'))) {  // условия пуска насоса //
      mess[MS_TU] = {
        topic: `${TU_Prefix}tuStart`,
        payload: true,
      };

    } else {
      mess[MS_LOG].push({
        payload: {
          str: `Условия для пуска насоса не соблюдены!`,
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

    if (context.get('pumpOn') && context.get('linkOn') && context.get('Dist')) {
      mess[MS_TU] = {
        topic: `${TU_Prefix}tuStop`,
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
    context.set('linkOn', val);
    mess[MS_LOG].push({
      payload: {
        str: val ? `Связь с насосом (ПЧ) установлена` : `Связь с насосом (ПЧ) отсутствует`,
        type: val ? INFO : ERROR,
      },
    }, {

      payload: val,
      retain: true,
      topic: `${tag}linkOn`,
    });

    node.status({ fill: val ? 'green' : 'red', shape: 'dot', text: context.get('status') });
    break;

  case 'changeFreq':
    context.set('freq', +val);  // при изменении ползунка не пишем сразу в ПЧ
  break;

  case 'status':
    context.set('status', val);
    node.status({ fill: 'green', shape: 'dot', text: val });  // вывод слова состояния ПЧ в статусе ноды
  break;

  case 'setFreq':
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда на изменение частоты насоса - ${context.get('freq')}Hz`,
        type: INFO,
      }
    });

    mess[MS_TU] = {
      topic: `${TU_Prefix}setFreq`,
      payload: context.get('freq'),
    };
    break;

  case 'On':
    if (context.get('pumpOn') != val) {  // значение изменилось
      context.set('pumpOn', val);
      mess[MS_LOG].push({
        payload: val,
        topic: `${tag}on`,
      });

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
      mess[MS_LOG].push({
        payload: val,
        topic: `${tag}dist`,
      });

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
      mess[MS_LOG].push({
        payload: val,
        topic: `${tag}error`,
      });

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

  case 'PchAlert':
    if (context.get('AlertNA') != val) {
      context.set('AlertNA', val);
      mess[MS_LOG].push({
        payload: val,
        topic: `${tag}alert`,
      });

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
    mess[MS_LOG].push({
      payload: {
        str: `Количество ошибок связи с ПЧ: ${val}`,
        type: (val > 0) ? ALERT : INFO,
      },
    });
    (val > 0) ? node.status({ fill: 'yellow', shape: 'ring', text: `err: ${val}` }) : node.status({ fill: 'green', shape: 'dot', text: context.get('status') });
    break;

  case 'okWrite':
    mess[MS_LOG].push({
      payload: {
        str: `Команда ПЧ записана успешно: ${val}`,
        type: INFO,
      }
    });
    break;

  case 'errorWrite':
    mess[MS_LOG].push({
      payload: {
        str: `Ошибка записи команды насоса (ПЧ) - ${val}`,
        type: ALERT,
      }
    });
    break;

  default:
    mess[MS_LOG].push({
      payload: {
        str: `Необработанный топик: ${topic} - ${val}`,
        type: ALERT,
      }
    });
}

if (mess[MS_LOG].length == 0) { // нет сообщений MQTT для передачи
  mess[MS_LOG] = null;

} else { // добавляем в сообщения MQTT метку времени и топик (одно и тоже для всех сообщений, добавляем здесь, чтобы не дублировать это везде)
  mess[MS_LOG].forEach(el => {
    if (typeof(el.payload) == 'object') {    // у сообщений в лог, payload - объект
      el.payload.time = Date.now();
      el.topic = `${tag}log`;
    }
  });
}

return mess;