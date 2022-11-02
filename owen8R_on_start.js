let signals = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8'].map(st => env.get(st));

let log = `${env.get('place')}/${env.get('dev_name')}/log`;
context.set('log', log);
context.set('signals', signals);

let mess = {
  topic: 'initModbusWrite',
  addres: env.get('modbus_addr'),
  devname: env.get('dev_name'),
  type: 'word',
  payload: 0,
  command: 15,
};

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