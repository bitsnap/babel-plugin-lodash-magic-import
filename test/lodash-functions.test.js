import test from 'tape';

import functions from 'lodash-functions';

import _ from 'lodash/fp';

const lodashFunctions = _.keys(_);

test('Function names should be strings', (t) => {
  t.plan(functions.length + 1);
  t.deepEqual(_.difference(lodashFunctions)(functions), []);
  _.forEach(s => t.ok(_.isString(s)))(functions);
});
