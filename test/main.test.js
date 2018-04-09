import * as babel from '@babel/core';

import test from 'tape';

import _replace from 'lodash/fp/replace';
import _forEach from 'lodash/fp/forEach';
import _join from 'lodash/fp/join';

import Plugin from 'main';

const _ = {
  forEach: _forEach,
  join: _join,
  replace: _replace,
};

const transform = (code, options = {}) =>
  babel.transform(code, {
    presets: [
      ['@babel/preset-env', {
        targets: { node: true },
      }],
    ],
    plugins: [
      [Plugin, options],
    ],
  });

// Babel 7 newlines are a bit messed up
const replaceNewlines = _.replace(/\n+/gm, ' ');

test('Should apply magic transformation', (t) => {
  t.plan(1);

  const [input, output] = [
    'import x from \'lodash/fp\'; const _ = {}, a = {}; _.get("some"); _.keys(["re", "x"], {}); _.map(_.identity);',
    _.join(' ')([
      'import _identity from "lodash/fp/identity";',
      'import _map from "lodash/fp/map";',
      'import _keys from "lodash/fp/keys";',
      'import _get from "lodash/fp/get";',
      'const a = {}; _get("some"); _keys(["re", "x"], {});',
      '_map(_identity);',
    ]),
  ];

  t.equal(replaceNewlines(transform(input).code), output);
});

test('Should remove lodash variable declaration', (t) => {
  t.plan(1);

  const [input, output] = [
    'import __keys from "lodash/keys"; const _ = {}; _.keys(re);',
    'import _keys from "lodash/keys"; _keys(re);',
  ];

  t.equal(replaceNewlines(transform(input).code), output);
});

test('Should throw properly', (t) => {
  const testTable = [
    ['import _ from "lodash"; _();', /Using Seq/],
    ['import _ from "lodash"; _.chain();', /method is prohibited/],
    ['import _ from "lodash"; _.tap();', /method is prohibited/],
    ['import _ from "lodash"; _.thru();', /method is prohibited/],
    ['import _ from "lodash-es";', /useless/],
    ['import _ from "lodash"; import fp from "lodash/fp";', /Mixing/],
    ['import _ from "lodash"; _.blablablar', /Unknown/],
    ['import bla from "bla"; _.keys()', /Add a lodash/],
  ];

  t.plan(testTable.length);
  _.forEach(([input, throws]) => t.throws(() => transform(input), throws))(testTable);
});
