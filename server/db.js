const Datastore = require('@seald-io/nedb');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

const db = {
  users: new Datastore({ filename: path.join(DATA_DIR, 'users.db'), autoload: true }),
  plans: new Datastore({ filename: path.join(DATA_DIR, 'plans.db'), autoload: true }),
  movements: new Datastore({ filename: path.join(DATA_DIR, 'movements.db'), autoload: true }),
  dailyMovements: new Datastore({ filename: path.join(DATA_DIR, 'daily_movements.db'), autoload: true }),
};

// Indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.movements.ensureIndex({ fieldName: 'planId' });
db.plans.ensureIndex({ fieldName: 'userId' });
db.dailyMovements.ensureIndex({ fieldName: 'planId' });

module.exports = db;
