context.set('freq', 400);

let mess1 = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 50209,
    count: 1,
    id: 'freq',
    type: 'word',
  }, {
    reg: 50199,
    count: 1,
    id: 'status',
    type: 'bitArr',
  }],
};

let mess2 = {
  topic: 'initModbusWrite',
  addres: env.get('modbus_addr'),
  devname: env.get('dev_name'),
  type: 'word',
  payload: 0,
  command: 6,
};

node.send([[mess1, mess2], null]);