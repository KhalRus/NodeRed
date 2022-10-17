let st = env.get('NA');
context.set('tag', st.slice(0, st.length - 1));
context.set('tagLength', st.length - 1);
context.set('freq', 2);  // по умолчанию, практически не двигается
context.set('Alert', false);
context.set('Error', false);
context.set('Dist', false);
context.set('pumpOn', false);