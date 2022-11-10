const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

const OPEN = 0;  // константы состояния задвижки
const TO_OPEN = 1;
// const ERROR = 2;  - не дублируем
const CLOSE = 3;
const TO_CLOSE = 4;
const MIDDLE = 5;
const strState = ['Открыта', 'Открывается', 'Авария', 'Закрыта', 'Закрывается', 'Промежуток'];

const stateZdv1 = context.get('stateZdv1');
const stateZdv2 = context.get('stateZdv2');
const placeLength = context.get('placeLength');
const haveZdv2 = context.get('haveZdv2');

const log = context.get('log');
const logZdv1 = context.get('logZdv1');
const logZdv2 = context.get('logZdv2');

let mess = [null, []]; // выходы функции, 0 - в модбас, 1 - сообщение в журнал, MQTT
const MS_TU = 0;
const MS_LOG = 1;

let linkError;  // кол-во ошибок чтения данных модбас

switch (msg.topic) {
  case 'stateKuz':
    let arr = msg.payload;
    let newStateZdv1 = arr[0] + arr[1] * 2 + arr[2] * 4 + arr[3] * 8;
    if (arr[4] == 0) newStateZdv1 += 100;  // 0 означает местный режим, 1 - дистанция

    if (newStateZdv1 != context.get('stateKuzZdv1')) {
      let st = getStateZdv(newStateZdv1);
      context.set('stateKuzZdv1', newStateZdv1);
      context.set('stateZdv1', st);

      mess[MS_LOG].push({
        payload: {
          str: getStrZdv(newStateZdv1),
          type: (st == ERROR) ? ERROR : INFO,
        },
        topic: logZdv1,
      });
    }

    if (haveZdv2) {
      let newStateZdv2 = arr[8] + arr[9] * 2 + arr[10] * 4 + arr[11] * 8;
      if (arr[12] == 0) newStateZdv1 += 100;  // 0 означает местный режим, 1 - дистанция

      if (newStateZdv2 != context.get('stateKuzZdv2')) {
        let st = getStateZdv(newStateZdv2);
        context.set('stateKuzZdv2', newStateZdv2);
        context.set('stateZdv2', st);

        mess[MS_LOG].push({
          payload: {
            str: getStrZdv(newStateZdv2),
            type: (st == ERROR) ? ERROR : INFO,
          },
          topic: logZdv2,
        });
      }
    }
    break;

  case context.get('deblockZdv1'):                 // команда MQTT на деблокировку задвижки 1
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Сброса аварии`,
        type: INFO,
      },
      topic: logZdv1,
    });

    if (stateZdv1 != ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `По задвижке сейчас нет Аварии!`,
          type: INFO,
        },
        topic: logZdv1,
      });

    } else {
      if (!context.get('linkOn')) {
        mess[MS_LOG].push({
          payload: {
            str: `Отсутствует связь с задвижкой!`,
            type: ERROR,
          },
          topic: logZdv1,
        });

      } else if (context.get('stateKuzZdv1') >= 100) {
        mess[MS_LOG].push({
          payload: {
            str: `Задвижка в Местном управлении!`,
            type: ERROR,
          },
          topic: logZdv1,
        });

      } else {
        if (context.get('fixStateZdv1') === OPEN) {
          mess[MS_LOG].push({
            payload: {
              str: `Подана команда Открыть`,
              type: INFO,
            },
            topic: logZdv1,
          });

          mess[MS_TU] = {
            payload: 2,
            topic: 'writeVar',
            reg: 0,
            signal: msg.topic.slice(placeLength),
          };

        } else if (context.get('fixStateZdv1') === CLOSE) {
          mess[MS_LOG].push({
            payload: {
              str: `Подана команда Закрыть`,
              type: INFO,
            },
            topic: logZdv1,
          });

          mess[MS_TU] = {
            payload: 1,
            topic: 'writeVar',
            reg: 0,
            signal: msg.topic.slice(placeLength),
          };
        }
      }
    }
    break;

  case context.get('deblockZdv2'):                 // команда MQTT на деблокировку задвижки 2
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Сброса аварии`,
        type: INFO,
      },
      topic: logZdv2,
    });

    if (stateZdv2 != ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `По задвижке сейчас нет Аварии!`,
          type: INFO,
        },
        topic: logZdv2,
      });

    } else {
      if (!context.get('linkOn')) {
        mess[MS_LOG].push({
          payload: {
            str: `Отсутствует связь с задвижкой!`,
            type: ERROR,
          },
          topic: logZdv2,
        });

      } else if (context.get('stateKuzZdv2') >= 100) {
        mess[MS_LOG].push({
          payload: {
            str: `Задвижка в Местном управлении!`,
            type: ERROR,
          },
          topic: logZdv2,
        });

      } else {
        if (context.get('fixStateZdv2') === OPEN) {
          mess[MS_LOG].push({
            payload: {
              str: `Подана команда Открыть`,
              type: INFO,
            },
            topic: logZdv2,
          });

          mess[MS_TU] = {
            payload: 2,
            topic: 'writeVar',
            reg: 3,
            signal: msg.topic.slice(placeLength),
          };

        } else if (context.get('fixStateZdv2') === CLOSE) {
          mess[MS_LOG].push({
            payload: {
              str: `Подана команда Закрыть`,
              type: INFO,
            },
            topic: logZdv2,
          });

          mess[MS_TU] = {
            payload: 1,
            topic: 'writeVar',
            reg: 3,
            signal: msg.topic.slice(placeLength),
          };
        }
      }
    }
    break;

  case context.get('openZdv1'):                 // команда MQTT на открытие задвижки 1
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Открыть`,
        type: INFO,
      },
      topic: logZdv1,
    });
    context.set('fixStateZdv1', OPEN);  // требуемое состояние задвижки

    if ((stateZdv1 == OPEN) || (stateZdv1 == TO_OPEN)) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка уже открыта/открывается`,
          type: INFO,
        },
        topic: logZdv1,
      });

    } else if (stateZdv1 == ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка в Аварии не управляется. Необходимо устранить`,
          type: ALERT,
        },
        topic: logZdv1,
      });

    } else {
      mess[MS_TU] = {
        payload: 2,
        topic: 'writeVar',
        reg: 0,
        signal: msg.topic.slice(placeLength),
      };
    }
    break;

  case context.get('openZdv2'):                 // команда MQTT на открытие задвижки 2
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Открыть`,
        type: INFO,
      },
      topic: logZdv2,
    });
    context.set('fixStateZdv2', OPEN);  // требуемое состояние задвижки

    if ((stateZdv2 == OPEN) || (stateZdv2 == TO_OPEN)) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка уже открыта/открывается`,
          type: INFO,
        },
        topic: logZdv2,
      });

    } else if (stateZdv2 == ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка в Аварии не управляется. Необходимо устранить`,
          type: ALERT,
        },
        topic: logZdv2,
      });

    } else {
      mess[MS_TU] = {
        payload: 2,
        topic: 'writeVar',
        reg: 3,
        signal: msg.topic.slice(placeLength),
      };
    }
    break;

  case context.get('closeZdv1'):                 // команда MQTT на закрытие задвижки 1
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Закрыть`,
        type: INFO,
      },
      topic: logZdv1,
    });
    context.set('fixStateZdv1', CLOSE);  // требуемое состояние задвижки

    if ((stateZdv1 == CLOSE) || (stateZdv1 == TO_CLOSE)) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка уже закрыта/закрывается`,
          type: INFO,
        },
        topic: logZdv1,
      });

    } else if (stateZdv1 == ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка в Аварии не управляется. Необходимо устранить`,
          type: ALERT,
        },
        topic: logZdv1,
      });

    } else {
      mess[MS_TU] = {
        payload: 1,
        topic: 'writeVar',
        reg: 0,
        signal: msg.topic.slice(placeLength),
      };
    }
    break;

  case context.get('closeZdv2'):                 // команда MQTT на закрытие задвижки 2
    mess[MS_LOG].push({
      payload: {
        str: `Подана команда Закрыть`,
        type: INFO,
      },
      topic: logZdv2,
    });
    context.set('fixStateZdv2', CLOSE);  // требуемое состояние задвижки

    if ((stateZdv2 == CLOSE) || (stateZdv2 == TO_CLOSE)) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка уже закрыта/закрывается`,
          type: INFO,
        },
        topic: logZdv2,
      });

    } else if (stateZdv2 == ERROR) {
      mess[MS_LOG].push({
        payload: {
          str: `Задвижка в Аварии не управляется. Необходимо устранить`,
          type: ALERT,
        },
        topic: logZdv2,
      });

    } else {
      mess[MS_TU] = {
        payload: 1,
        topic: 'writeVar',
        reg: 3,
        signal: msg.topic.slice(placeLength),
      };
    }
    break;

  case 'okWrite':
    mess[MS_LOG].push({
      payload: {
        str: `Команда записана успешно: ${msg.payload}`,
        type: INFO,
      },
      topic: log,
    });
    break;

  case 'errorWrite':
    mess[MS_LOG].push({
      payload: {
        str: `Ошибка записи команды: ${msg.payload}`,
        type: ERROR,
      },
      topic: log,
    });

    let strZ = msg.payload.split('/')[0];  // по какой здв пришла авария (dev_name), по ней выставляем статус аварии
    (strZ == env.get('Zdv_1_dev_name')) ? context.set('stateZdv1', ERROR) : context.set('stateZdv2', ERROR);
    break;

  case 'linkOn':
    mess[MS_LOG].push({
      payload: msg.payload,
      topic: context.get('tagLink'),
    });

    mess[MS_LOG].push({
      payload: {
        str: msg.payload ? `Связь с задвижкой восстановлена!` : `Связь с задвижкой потеряна. Авария!`,
        type: msg.payload ? INFO : ERROR,
      },
      topic: logZdv1,
    });

    if (haveZdv2) {
      mess[MS_LOG].push({
        payload: {
          str: msg.payload ? `Связь с задвижкой восстановлена!` : `Связь с задвижкой потеряна. Авария!`,
          type: msg.payload ? INFO : ERROR,
        },
        topic: logZdv2,
      });
    }

    if (msg.payload) {                                // связь восстановилась, убираем аварию, пересчитываем статус
      context.set('linkOn', true);

      if (stateZdv1 == ERROR) {
        let st = getStateZdv(context.get('stateKuzZdv1'));
        context.set('stateZdv1', st);

        mess[MS_LOG].push({
          payload: {
            str: `Задвижка ${strState[st]}!`,
            type: (st == ERROR) ? ERROR : INFO,
          },
          topic: logZdv1,
        });
      }

      if (haveZdv2 && (stateZdv2 == ERROR)) {
        let st = getStateZdv(context.get('stateKuzZdv2'));
        context.set('stateZdv2', st);

        mess[MS_LOG].push({
          payload: {
            str: `Задвижка ${strState[st]}!`,
            type: (st == ERROR) ? ERROR : INFO,
          },
          topic: logZdv2,
        });
      }

    } else {
      context.set('linkOn', false);
      context.set('stateZdv1', ERROR);
      if (haveZdv2) context.set('stateZdv2', ERROR);
    }
    break;

  case 'linkError':
    mess[MS_LOG].push({
      payload: {
        str: `Количество ошибок связи с КУЗ: ${msg.payload}`,
        type: (msg.payload > 0) ? ALERT : INFO,
      },
      topic: log,
    });
    linkError = msg.payload;
    break;

  case 'errorUnknown':
    mess[MS_LOG].push({
      payload: {
        str: `error unknown: ${msg.payload}`,
        type: ERROR,
      },
      topic: log,
    });
    break;
}

const stz1 = context.get('stateZdv1');
const stz2 = context.get('stateZdv2');

if (stateZdv1 != stz1) {            // отправляем измененный статус задвижки
  mess[MS_LOG].push({
    payload: stz1,
    topic: context.get('stateZdv1MQTT'),
    retain: true,
  });
}

if (stateZdv2 != stz2) {
  mess[MS_LOG].push({
    payload: stz2,
    topic: context.get('stateZdv2MQTT'),
    retain: true,
  });
}

if ((stateZdv1 != stz1) || (stateZdv2 != stz2) || (linkError !== undefined)) {  // если статус задвижек поменялся или кол-во ошибок связи, меняем статус Ноды
  let st;
  if (haveZdv2) {
    st = `${strState[stz1]} ${strState[stz2]}`;
  } else {
    st = `${strState[stz1]}`;
  }

  let color = 'green';
  if (!context.get('linkOn')) {                                // нет связи - цвет индикатора красный
    color = 'red';

  } else if ((stz1 == ERROR) || (stz2 == ERROR) || (linkError > 0)) {   // авария задвижки или обрывы связи, но linkOn = true - цвет индикатора желтый
    color = 'yellow';
  }

  node.status({
    fill: color,
    shape: (linkError > 0) ? 'ring' : 'dot',
    text: (linkError > 0) ? `err: ${linkError}` : st,
  });
}

if (mess[MS_LOG].length == 0) { // нет сообщений MQTT для передачи в журнал
  mess[MS_LOG] = null;

} else {                        // добавляем в сообщения лога метку времени
  mess[MS_LOG].forEach(el => {
    if (typeof(el.payload) == 'object') {    // у сообщений в лог, payload - объект
      el.payload.time = Date.now();
    }
  });
}

return mess;

function getStateZdv(n) {       // выдает статус задвижки, по коду из КУЗ
  if (n >= 100) return ERROR;

  let state;
  switch (n) {
    case 0:
    case 1:
      state = ERROR;
      break;

    case 3:
      state = MIDDLE;
      break;

    case 4:
      state = CLOSE;
      break;

    case 5:
      state = OPEN;
      break;

    case 6:
    case 8:
      state = TO_CLOSE;
      break;

    case 7:
    case 9:
      state = TO_OPEN;
      break;
  }

  return state;
}

function getStrZdv(n) {         // выдает Строку статуса задвижки, по коду из КУЗ
  let strDist = '';
  let str;

  if (n >= 100) {
    strDist = ' В МЕСТНОМ УПРАВЛЕНИИ!';
    n -= 100;
  }

  switch (n) {
    case 0:
      str = 'Авария при закрытии!';
      break;

    case 1:
      str = 'Авария при открытии!';
      break;

    case 3:
      str = 'В промежуточном положении!';
      break;

    case 4:
      str = 'Задвижка Закрыта!';
      break;

    case 5:
      str = 'Задвижка Открыта!';
      break;

    case 6:
      str = 'Прошла команда на закрытие!';
      break;

    case 7:
      str = 'Прошла команда на открытие!';
      break;

    case 8:
      str = 'Задвижка Закрывается! Сошла с концевика открытия.';
      break;

    case 9:
      str = 'Задвижка Открывается! Сошла с концевика закрытия.';
      break;

    default:
      str = 'Ошибка состояния из КУЗ!!';
  }

  return `${str}${strDist}`;
}