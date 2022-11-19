let tag = `${env.get('place')}/${env.get('dev_name')}/`;
context.set('tag', tag);

let mess = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 173,
    count: 2,
    commRead: 4,
    id: 'curFlow',
    type: 'floatRev',
  }, {
    reg: 177,
    count: 2,
    commRead: 4,
    id: 'sumFlow',
    type: 'floatRev',
  }],
};

let logName = {    // Имя устройства в журнале (объект)
  payload: {
    str: 'logName',
    id: env.get('dev_name'),
    logName: env.get('log_name'),
  },
  retain: true,
  topic: `${tag}log`,
}

node.send([mess, logName]);