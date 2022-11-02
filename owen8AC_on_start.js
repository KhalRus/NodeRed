let signals = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8'].map(st => env.get(st));
let modbusSignals = [];
let tag = `${env.get('place')}/${env.get('dev_name')}/`;
let log = `${env.get('place')}/${env.get('dev_name')}/log`;
context.set('tag', tag);
context.set('log', log);

for (let i = 0; i < 8; i++) {
  if (signals[i] != 'null') {  // null пустые каналы, без сигналов, их не опрашиваем
    modbusSignals.push({
      reg: 256 + i,
      count: 1,
      id: signals[i],
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

context.set('signals', signals.filter(el => (el != 'null')));

let logName = {    // Имя устройства в журнале (объект)
  payload: {
    str: 'logName',
    id: env.get('dev_name'),
    logName: env.get('log_name'),
  },
  topic: `${log}`,
  retain: true,
}

node.send([mess, logName]);