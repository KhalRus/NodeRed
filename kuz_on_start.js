let log = `${env.get('place')}/${env.get('dev_name')}/log`;
context.set('placeLength', env.get('place').length + 1);  // для вырезания площадки из тега

context.set('tagLink', `${env.get('place')}/${env.get('dev_name')}/linkOn`);
context.set('linkOn', true);

const tagZdv1 = env.get('Zdv_1_topic').slice(0, -1);      // Nasosn2/Zdv_X/ убираем + в конце
context.set('logZdv1', `${tagZdv1}log`);
context.set('openZdv1', `${tagZdv1}toOpen`);
context.set('closeZdv1', `${tagZdv1}toClose`);
context.set('deblockZdv1', `${tagZdv1}deblock`);
context.set('stateZdv1MQTT', `${tagZdv1}state`);
context.set('stateZdv1', 5);    // MIDDLE

let logNames = [{    // Имя устройства в журнале (объект)
  payload: {
    str: 'logName',
    id: env.get('dev_name'),
    logName: env.get('log_name'),
  },
  topic: log,
  retain: true,

}, {
  payload: {
    str: 'logName',
    id: env.get('Zdv_1_dev_name'),
    logName: env.get('Zdv_1_log_name'),
  },
  topic: log,
  retain: true,
}];


if (env.get('Zdv_2_dev_name') != 'null') {    // есть задвижка 2
  context.set('haveZdv2', true);
  const tagZdv2 = env.get('Zdv_2_topic').slice(0, -1);

  context.set('logZdv2', `${tagZdv2}log`);
  context.set('openZdv2', `${tagZdv2}toOpen`);
  context.set('closeZdv2', `${tagZdv2}toClose`);
  context.set('deblockZdv2', `${tagZdv2}deblock`);
  context.set('stateZdv2MQTT', `${tagZdv2}state`);
  context.set('stateZdv2', 5);    // MIDDLE

  logNames.push({
    payload: {
      str: 'logName',
      id: env.get('Zdv_2_dev_name'),
      logName: env.get('Zdv_2_log_name'),
    },
    topic: log,
    retain: true,
  });
}

let mess1 = {
  topic: 'initModbusWrite',
  addres: env.get('modbus_addr'),
  devname: env.get('dev_name'),
  type: 'word',
  payload: 0,
  command: 6,
};

let mess2 = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 1,
    count: 1,
    id: 'stateKuz',
    type: 'bitArr',
  }],
};

node.send([[mess1, mess2], logNames]);