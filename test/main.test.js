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

const transform = (code, options = {}, withEnv = false) => babel.transform(code, {
  presets: withEnv ? [
    ['@babel/preset-env', {
      targets: { node: true },
    }],
  ] : [],
  plugins: [
    [Plugin, options],
  ],
});

// Babel 7 newlines are a bit messed up
const replaceNewlines = _.replace(/\n+/gm, ' ');

test('Should apply magic transformation', (t) => {
  t.plan(2);

  const testTable = fp => ([
    `import x from "lodash${fp ? '/fp' : ''}"; const _ = {}, a = {}; _.get("some"); _.keys(["re", "x"], {}); _.map(_.identity);`,
    _.join(' ')([
      `import _get from "lodash${fp ? '/fp' : ''}/get";`,
      `import _keys from "lodash${fp ? '/fp' : ''}/keys";`,
      `import _map from "lodash${fp ? '/fp' : ''}/map";`,
      `import _identity from "lodash${fp ? '/fp' : ''}/identity";`,
      'const a = {}; _get("some"); _keys(["re", "x"], {});',
      '_map(_identity);',
    ]),
  ]);

  let [input, output] = testTable(true);
  t.equal(replaceNewlines(transform(input).code), output);

  [input, output] = testTable();
  t.equal(replaceNewlines(transform(input).code), output);
});

test('Should apply magic cached transformation', (t) => {
  t.plan(2);

  const testTable = fp => ([
    `import x from "lodash${fp ? '/fp' : ''}"; const _ = {}, a = {}; _.get("some"); _.map([]);`,
    _.join(' ')([
      `const _ = require("lodash-magic-cache").${fp ? 'lodashFP' : 'lodash'}(["get", "map"]);`,
      'const a = {}; _.get("some"); _.map([]);',
    ]),
  ]);

  let [input, output] = testTable(true);
  t.equal(replaceNewlines(transform(input, { cache: true }).code), output);

  [input, output] = testTable();
  t.equal(replaceNewlines(transform(input, { cache: true }).code), output);
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

test('Should not break env', (t) => {
  const source = 'import x from "lodash/fp"; _.get("some"); _.map(_.identity);';
  t.plan(1);

  const result = transform(source, { cache: false }, true).code;
  t.ok(result.match(/_interopRequireDefault/));
});
