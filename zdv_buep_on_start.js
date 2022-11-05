let st = env.get('Zdv');                      // Nasosn2/Zdv_/+
context.set('tag', st.slice(0, -1));          // Nasosn2/Zdv_/
context.set('tagLength', st.length - 1);

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
  topic: `${context.get('tag')}log`,
  retain: true,
};

node.send([logName, null, null]);