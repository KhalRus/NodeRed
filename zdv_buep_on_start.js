let st = env.get('Zdv');
context.set('tag', st.slice(0, st.length - 1));
context.set('tagLength', st.length - 1);

context.set('state', 5);  // MIDDLE
context.set('knOpen', false);         // концевик открытия
context.set('knClose', false);        // концевик закрытия
