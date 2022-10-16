let signalsRead = ['ch_in_1', 'ch_in_2', 'ch_in_3', 'ch_in_4', 'ch_in_5', 'ch_in_6', 'ch_in_7', 'ch_in_8'].map(st => env.get(st));
context.set('signalsRead', signalsRead);

let mess1 = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 51,
    count: 1,
    id: 'bitMask_1',
    type: 'bitArrWide',
    signalsArr: signalsRead,
  }],
};

let signalsWrite = ['ch_out_1', 'ch_out_2', 'ch_out_3', 'ch_out_4'].map(st => env.get(st));
context.set('signalLength', env.get('TU').length - 1);  // длина пути в названии топика

let mess2 = {
  topic: 'initModbusWrite',
  addres: env.get('modbus_addr'),
  devname: env.get('dev_name'),
  reg: 50,
  type: 'bitArr',
  payload: signalsWrite,
  command: 16,
};


node.send([[mess1, mess2], null]);