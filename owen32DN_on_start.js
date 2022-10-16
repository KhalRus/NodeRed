let signalsRead1 = ['ch_0', 'ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8', 'ch_9', 'ch_10', 'ch_11', 'ch_12', 'ch_13', 'ch_14', 'ch_15'].map(st => env.get(st));
let signalsRead2 = ['ch_16', 'ch_17', 'ch_18', 'ch_19', 'ch_20', 'ch_21', 'ch_22', 'ch_23', 'ch_24', 'ch_25', 'ch_26', 'ch_27', 'ch_28', 'ch_29', 'ch_30', 'ch_31'].map(st => env.get(st));
context.set('signalsRead', [].concat(signalsRead1, signalsRead2));

let mess = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: [{
    reg: 99,
    count: 1,
    id: 'bitMask_1',
    type: 'bitArrWide',
    signalsArr: signalsRead1,
  }, {
    reg: 100,
    count: 1,
    id: 'bitMask_2',
    type: 'bitArrWide',
    signalsArr: signalsRead2,
  }],
};

node.send([mess, null]);