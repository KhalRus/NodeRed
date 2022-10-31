let tag = `${env.get('place')}/${env.get('dev_name')}/`;
context.set('tag', tag);
context.set('level', 0);

let mess = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 2,
    count: 2,
    id: 'level',
    type: 'float',
  }, {
    reg: 35,
    count: 2,
    id: 'temperature',
    type: 'float',
  }],
};

let logName = {    // Имя устройства в журнале (объект)
  payload: {
    str: 'logName',
    id: env.get('dev_name'),
    logName: env.get('log_name'),
  },
  topic: `${tag}log`,
  retain: true,
}

node.send([mess, logName]);