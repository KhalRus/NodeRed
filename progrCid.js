const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

const OPEN = 0;  // константы состояния задвижки
const TO_OPEN = 1;
// const ERROR = 2;
const CLOSE = 3;
const TO_CLOSE = 4;
const MIDDLE = 5;
// const strState = ['Открыта', 'Открывается', 'Авария', 'Закрыта', 'Закрывается', 'Промежуток'];

const PR_WAIT = 8;           // ожидание запуска
const PR_ZDV_OPEN = 1;       // ожидание открытия задвижек
const PR_NA_START = 2;       // ожидание пуска насоса
const PR_WORK = 3;           // идет перекачка
const PR_ZDV_CLOSE = 4;      // остановлена, ожидание закрытия задвижек

let mess = [];
let messDelay = null;
const topic = msg.topic;
let val = msg.payload;

let state = context.get('status');

switch (topic) {
  case 'Nasosn2/ProgrCid/rez1':
    context.set('Rez', 1);

    mess.push({
      topic: 'Nasosn2/ProgrCid/bgRez1',
      payload: 'green',
    }, {

      topic: 'Nasosn2/ProgrCid/bgRez2',
      payload: 'blue',
    });
    break;

  case 'Nasosn2/ProgrCid/rez2':
    context.set('Rez', 2);

    mess.push({
      topic: 'Nasosn2/ProgrCid/bgRez1',
      payload: 'blue',
    }, {

      topic: 'Nasosn2/ProgrCid/bgRez2',
      payload: 'green',
    });
    break;

  case 'Nasosn2/ProgrCid/na1':
    context.set('Na', 1);

    mess.push({
      topic: 'Nasosn2/ProgrCid/bgNa1',
      payload: 'green',
    }, {

      topic: 'Nasosn2/ProgrCid/bgNa2',
      payload: 'blue',
    });
    break;

  case 'Nasosn2/ProgrCid/na2':
    context.set('Na', 2);

    mess.push({
      topic: 'Nasosn2/ProgrCid/bgNa1',
      payload: 'blue',
    }, {

      topic: 'Nasosn2/ProgrCid/bgNa2',
      payload: 'green',
    });
    break;

  case 'Nasosn2/Zdv_4/state':
    val = +val;
    context.set('Zdv4', val);

    if ((state == PR_ZDV_OPEN) && (val == OPEN)) {  // если работает программа и задвижка открылась, отправляем сообщение
      mess.push({
        topic: 'Nasosn2/ProgrCid/zdvOpen',     // сообщение в функцию об открытых задвижках
        payload: true,
      });
    }
    break;

  case 'Nasosn2/Zdv_10/state':
    val = +val;
    context.set('Zdv10', val);

    if ((state == PR_ZDV_OPEN) && (val == OPEN)) {  // если работает программа и задвижка открылась, отправляем сообщение
      mess.push({
        topic: 'Nasosn2/ProgrCid/zdvOpen',     // сообщение в функцию об открытых задвижках
        payload: true,
      });
    }
    break;

  case 'Nasosn2/Zdv_15/state':
    val = +val;
    context.set('Zdv15', val);

    if ((state == PR_ZDV_OPEN) && (val == OPEN)) {  // если работает программа и задвижка открылась, отправляем сообщение
      mess.push({
        topic: 'Nasosn2/ProgrCid/zdvOpen',     // сообщение в функцию об открытых задвижках
        payload: true,
      });
    }
    break;

  case 'Nasosn2/NA_1/error':
    context.set('Na1err', !!val);
    break;

  case 'Nasosn2/NA_2/error':
    context.set('Na2err', !!val);
    break;

  case 'Nasosn2/NA_1/dist':
    context.set('Na1dist', !!val);
    break;

  case 'Nasosn2/NA_2/dist':
    context.set('Na2dist', !!val);
    break;

  case 'Nasosn2/ProgrCid/start':
    if (state == PR_WAIT) {  // запуск только если статус ожидание
      let rez = context.get('Rez');
      let na = context.get('Na');
      let zdv4 = context.get('Zdv4');
      let zdv10 = context.get('Zdv10');
      let zdv15 = context.get('Zdv15');

      if (((na == 1) && context.get('Na1err')) || ((na == 2) && context.get('Na2err'))) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'Авария насоса',
        });
        break;
      }

      if ( ((na == 1) && (!context.get('Na1dist'))) || ((na == 2) && (!context.get('Na2dist'))) ) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'Авария насос мест.',
        });
        break;
      }

      if (zdv15 == ERROR) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'Авария Здв. 15',
        });
        break;
      }

      if (((rez == 1) && (zdv10 == ERROR)) || ((rez == 2) && (zdv4 == ERROR))) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'Авария Задв. РВС',
        });
        break;
      }

      mess.push({                           // аварий нет, запускаем программу
        topic: 'Nasosn2/ProgrCid/log',
        payload: {
          str: 'Запуск перекачки в ЦИД',
          type: INFO,
          time: Date.now(),
        }
      });


      if ((rez == 1) && (zdv10 != OPEN)) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'откр. задвижек',
        }, {
          topic: 'Nasosn2/Zdv_10/toOpen',
          payload: true,
        });
        state = PR_ZDV_OPEN;

      } else if ((rez == 2) && (zdv4 != OPEN)) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'откр. задвижек',
        }, {
          topic: 'Nasosn2/Zdv_4/toOpen',
          payload: true,
        });
        state = PR_ZDV_OPEN;
      }

      if (zdv15 != OPEN) {
        mess.push({
          topic: 'Nasosn2/ProgrCid/status',
          payload: 'откр. задвижек',
        }, {
          topic: 'Nasosn2/Zdv_15/toOpen',
          payload: true,
        });
        state = PR_ZDV_OPEN;
      }

      if (state == PR_WAIT) {  // задвижки уже были открыты, посылаем сообщение об открытых задвижках
        mess.push({
          topic: 'Nasosn2/ProgrCid/zdvOpen',     // сообщение в функцию об открытых задвижках
          payload: true,
        });

      } else {          // задвижки открываются, посылаем сообщение об аварии открытия задвижек, с задержкой, если не откроются все задвижки, будет авария
        messDelay = {
          topic: 'error',
          payload: true,
          state: PR_ZDV_OPEN,
          delay: 110000,  // задержка 110 секунд, все задвижки открываются за 90 секунд, выдержка еще 20 сек на прочее
        };
      }
      context.set('status', PR_ZDV_OPEN);
    }
    break;

  case 'Nasosn2/ProgrCid/zdvOpen':
    if (state == PR_ZDV_OPEN) {  // запуск только если статус открытия задвижек
      let rez = context.get('Rez');
      let na = context.get('Na');
      let zdv4 = context.get('Zdv4');
      let zdv10 = context.get('Zdv10');
      let zdv15 = context.get('Zdv15');
      let allOpen = false;

      if ( (rez == 1) && (zdv10 == OPEN) && (zdv15 == OPEN) ) {
        allOpen = true;
      } else if((rez == 2) && (zdv4 == OPEN) && (zdv15 == OPEN)) {
        allOpen = true;
      }

      if (allOpen) {  // задвижки открыты, запускаем насос
        mess.push({
          topic: 'Nasosn2/ATNK_4/tuOpen',     // открываем АТНК-4
          payload: true,
        }, {

          topic: 'Nasosn2/ProgrCid/status',
          payload: 'пуск насоса',
        });

        if (na == 1) {
          mess.push({
            topic: 'Nasosn2/NA_1/tuStart',
            payload: true,
          });

        } else if (na == 2) {
          mess.push({
            topic: 'Nasosn2/NA_2/tuStart',
            payload: true,
          });
        }
        context.set('status', PR_NA_START);

        messDelay = {     // выдержка времени на пуск насоса
          topic: 'error',
          payload: true,
          state: PR_NA_START,
          delay: 10000,  // задержка 10 секунд
        };
      }
    }
    break;

  case 'Nasosn2/NA_1/on':
    if ((state == PR_NA_START) && (!!val == true)) {
      context.set('status', PR_WORK);

      mess.push({
        topic: 'Nasosn2/ProgrCid/status',
        payload: 'идет перекачка',
      });
    }
    break;

  case 'Nasosn2/NA_2/on':
    if ((state == PR_NA_START) && (!!val == true)) {
      context.set('status', PR_WORK);

      mess.push({
        topic: 'Nasosn2/ProgrCid/status',
        payload: 'идет перекачка',
      });
    }
    break;

  case 'error':
    if (msg.state == state) {     // статус не изменился за выдержку времени
      let str;
      if (state == PR_NA_START) {
        str = 'Авария пуска насоса';
      } else if (state == PR_ZDV_OPEN) {
        str = 'Авария открытия задвижек';
      }

      mess.push({
        topic: 'Nasosn2/ProgrCid/status',
        payload: str,
      });

      context.set('status', PR_WAIT);
    }
    break;

  case 'Nasosn2/ProgrCid/stop':
    if (state != PR_WAIT) {
      let na = context.get('Na');

      mess.push({                           // останавливаем программу
        topic: 'Nasosn2/ProgrCid/log',
        payload: {
          str: 'Стоп программы перекачки в ЦИД',
          type: INFO,
          time: Date.now(),
        }
      });

      mess.push({
        topic: 'Nasosn2/ATNK_4/tuOpen',     // закрываем АТНК-4
        payload: false,
      }, {

        topic: 'Nasosn2/ProgrCid/status',
        payload: 'остановлена',
      });

      if (na == 1) {
        mess.push({
          topic: 'Nasosn2/NA_1/tuStop',
          payload: true,
        });

      } else if (na == 2) {
        mess.push({
          topic: 'Nasosn2/NA_2/tuStop',
          payload: true,
        });
      }
      context.set('status', PR_WAIT);
    }
    break;
}

if (mess.length == 0) mess == null;

return [mess, messDelay];