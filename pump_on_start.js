let st = env.get('NA');
context.set('tag', st.slice(0, -1));
context.set('tagLength', st.length - 1);
context.set('freq', 2);  // по умолчанию, практически не двигается
context.set('AlertNA', false);
context.set('ErrorNA', false);
context.set('Dist', false);
context.set('pumpOn', false);

node.send([null, {
  payload: {
    str: 'logName',
    id: st.split('/')[1],
    logName: env.get('log_name'),
  },
  topic: `${context.get('tag')}log`,
  retain: true,
}]);