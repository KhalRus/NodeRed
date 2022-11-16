const tag = env.get('Zdv').slice(0, -1);      // Nasosn2/Zdv_/
context.set('tag', tag);
context.set('tagLength', tag.length);

context.set('state', 5);  // MIDDLE
context.set('linkOn', false);  // связь вначале есть по модулям, общая false, чтобы вначале прошло сообщение linkOn
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
  retain: true,
  topic: `${tag}log`,
};

node.send([logName, null, null]);