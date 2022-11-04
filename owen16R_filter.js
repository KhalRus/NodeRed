//  -------------------------------------------- выполняется при запуске --------------------------------------------
let signals = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8',
  'ch_9', 'ch_10', 'ch_11', 'ch_12', 'ch_13', 'ch_14', 'ch_15', 'ch_16',].map(st => `${env.get('place')}/${env.get(st)}`);

context.set('signals', signals);
context.set('placeLength', env.get('place').length + 1);

//  -------------------------------------------- основная функция --------------------------------------------
if (context.get('signals').includes(msg.topic)) {
  msg.topic = msg.topic.slice(context.get('placeLength'));  // убираем площадку из тега
  if (msg.topic != 'null') {
    return msg;
  }
}