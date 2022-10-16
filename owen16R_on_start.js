let signalsAll = ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5', 'ch_6', 'ch_7', 'ch_8',
  'ch_9', 'ch_10', 'ch_11', 'ch_12', 'ch_13', 'ch_14', 'ch_15', 'ch_16',].map(st => env.get(st));
context.set('signalLength', env.get('TU').length - 1);  // длина пути в названии топика

let mess = {
  topic: 'initModbusWrite',
  addres: env.get('modbus_addr'),
  devname: env.get('dev_name'),
  reg: 50,
  type: 'bitArr',
  payload: signalsAll,
  command: 16,
};

node.send([mess, null]);