let st = env.get('NA');
context.set('tag', st.slice(0, st.length - 1));
context.set('tagLength', st.length - 1);