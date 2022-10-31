context.set('errorsCount', 0);
context.set('modbus', {});
context.set('objRead', {});
context.set('linkOn', 1);  // для первого опроса, дальше значение будет true/false

// ================================================== filter_Device function ==================================================

context.set('devLength', env.get('dev_name').length + 2);  // -- on Start --

// фильтруем сообщения для данного устройства (от модбас read, write)
if (msg.topic.startsWith(env.get('dev_name'))) {
  msg.topic = msg.topic.slice(context.get('devLength'));
  return msg;
}

// ================================================== filter_Device function (PCHv) ==================================================

if ( msg.topic.startsWith(env.get('dev_name')) ) {
  msg.topic = msg.topic.slice(context.get('devLength'));
  return [msg, null];
} else if ( msg.topic.startsWith('toCalc$$') ) {
  msg.topic = msg.topic.slice(8);
  return [null, msg];
}