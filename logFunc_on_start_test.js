//  -------------------------------------------- выполняется при запуске --------------------------------------------
const N = 200;   // количество сообщений хранимых в журнале, сообщения в журнал записываются по кругу, затирая самые старые
context.set('arrLog', Array(N));    // массив сообщений
context.set('currLog', -1);         // индекс последнего записанного сообщения
context.set('maxLog', N);

// --------------------------------------------------- test ---------------------------------------------------
const INFO = 0;  // типы сообщений в логе
const ALERT = 1;
const ERROR = 2;

let k = context.get('k') ?? 0;

let mess = [{
  topic: 'Nasosn2/Zdv_1/log',
  payload: {
    str: `Задвижка сошла с концевика Закрытия ${k++}`,
    time: Date.now(),
    type: INFO,

}}, {
  topic: 'Nasosn1/Zdv_2/log',
  payload: {
    str: `Задвижка сошла с концевика Открытия ${k++}`,
    time: Date.now(),
    type: ALERT,

}}, {
  topic: 'Nasosn1/Na_1/log',
  payload: {
    str: `Насос остановлен ${k++}`,
    time: Date.now(),
    type: INFO,

}}, {
  topic: 'Nasosn2/Na_2/log',
  payload: {
    str: `Насос Авария ${k++}`,
    time: Date.now(),
    type: ERROR,
}}];

context.set('k', k);

return [mess];