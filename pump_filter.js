//  -------------------------------------------- выполняется при запуске --------------------------------------------
context.set('tagLength', env.get('NA').length - 1);

//  -------------------------------------------- основная функция --------------------------------------------
const topic = msg.topic.slice(context.get('tagLength'));  // удаляем путь из топика, от последней /

if ((topic == 'pin1') ||    // пропускаем только нужные теги из MQTT
  (topic == 'pin2') ||
  (topic == 'pout1') ||
  (topic == 'pout2') ||
  (topic == 'tuStart') ||
  (topic == 'tuStop') ||
  (topic == 'changeFreq') ||
  (topic == 'setFreq') ||
  (topic == 'temp')) {
  msg.topic = topic;
  return msg;
}