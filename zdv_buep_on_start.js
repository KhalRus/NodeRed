const tag = env.get('Zdv').slice(0, -1);      // Nasosn2/Zdv_/
context.set('tag', tag);
context.set('tagLength', tag.length);

context.set('state', 5);  // MIDDLE
context.set('linkOn', true);  // связь вначале есть и общая и по модулям
context.set('linkTu', true);
context.set('linkState', true);
context.set('knOpen', false);         // концевик открытия
context.set('knClose', false);        // концевик закрытия

let logName = {    // Имя устройства в журнале (объект)
  payload: {
    str: 'logName',
    id: env.get('dev_name'),
    logName: env.get('log_name'),
  },
  topic: `${tag}log`,
  retain: true,
};

let dist = {                      // сообщение MQTT, задвижка всегда в дистанции
  payload: true,
  topic: `${tag}dist`,
  retain: true,
};

node.send([[logName, dist], null, null]);