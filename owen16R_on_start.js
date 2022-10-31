let signals = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8',
  'ch_9', 'ch_10', 'ch_11', 'ch_12', 'ch_13', 'ch_14', 'ch_15', 'ch_16',].map(st => env.get(st));

let TU = env.get('TU');
context.set('signalLength', TU.length - 1);                        // длина пути в названии топика
context.set('tag', TU.slice(0, -1));    // путь без +   Nasosn2/Owen_16R_/
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
  topic: `${context.get('tag')}log`,
  retain: true,
}

node.send([mess, logName]);