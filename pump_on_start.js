const st = env.get('NA');
const tag = st.slice(0, -1);

context.set('tag', tag);
context.set('freq', 2);  // по умолчанию, практически не двигается
context.set('temp', 2);  // начальное значение температуры
context.set('AlertNA', false);
context.set('ErrorNA', false);
context.set('Dist', false);
context.set('pumpOn', false);
context.set('linkOn', false);

let mess = [{    // отправляем имя насоса в логе и значения false индикаторов, чтобы расцветить Dashboard
  payload: false,
  topic: `${tag}on`,
  }, {
  payload: false,
  topic: `${tag}dist`,
  }, {
  payload: false,
  topic: `${tag}error`,
  }, {
  payload: false,
  topic: `${tag}alert`,
  }, {
  payload: {
    str: 'logName',
    id: st.split('/')[1],  // получаем тег Объекта - NA_X
    logName: env.get('log_name'),
  },
  retain: true,
  topic: `${tag}log`,
}];

node.send([null, mess]);