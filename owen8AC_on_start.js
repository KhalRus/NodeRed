let signalsAll = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8'].map(st => env.get(st));
let modbusSignals = [];

for (let i = 0; i < 8; i++) {
  if (signalsAll[i] != 'null') {  // null пустые каналы, без сигналов, их не опрашиваем
    modbusSignals.push({
      reg: 256 + i,
      count: 1,
      id: signalsAll[i],
      type: 'word',
    });
  }
}
let mess = {
  topic: 'initModbusRead',
  addres: env.get('modbus_addr'),
  pollPeriod: env.get('poll_period(ms)'),
  pollErrPeriod: env.get('poll_err_perd(ms)'),
  maxErrors: env.get('maxErr'),
  devname: env.get('dev_name'),
  startDelay: env.get('start_delay(ms)'),
  payload: modbusSignals,
};

context.set('signals', signalsAll.filter(el => (el != 'null')));
node.send([mess, null]);