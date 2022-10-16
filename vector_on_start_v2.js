let mess = {
  topic: 'initModbus',
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

node.send([mess, null]);