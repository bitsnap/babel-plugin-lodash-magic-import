import * as babel from '@babel/core';

import test from 'tape';
import proc from 'child_process';
import fs from 'fs';

import _map from 'lodash/fp/map';
import _trim from 'lodash/fp/trim';
import _startsWith from 'lodash/fp/startsWith';
import _filter from 'lodash/fp/filter';
import _uniq from 'lodash/fp/uniq';
import _isEqual from 'lodash/fp/isEqual';
import _difference from 'lodash/fp/difference';
import _concat from 'lodash/fp/concat';
import _forEach from 'lodash/fp/forEach';
import _join from 'lodash/fp/join';
import _replace from 'lodash/fp/replace';
import _split from 'lodash/fp/split';

import Plugin from 'main';

const _ = {
  map: _map,
  trim: _trim,
  startsWith: _startsWith,
  filter: _filter,
  uniq: _uniq,
  isEqual: _isEqual,
  difference: _difference,
  concat: _concat,
  forEach: _forEach,
  join: _join,
  replace: _replace,
  split: _split,
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
    ['import _ from "lodash-es";', /useless/],
    ['import _ from "lodash"; import fp from "lodash/fp";', /Mixing/],
    ['import _ from "lodash"; _.blablablar', /Unknown/],
    ['import bla from "bla"; _.keys()', /Add a lodash/],
  ];

  t.plan(testTable.length);
  _.forEach(([input, throws]) => t.throws(() => transform(input), throws))(testTable);
});

const writeTestBabelConfig = () => {
  const babelRC = JSON.parse(fs.readFileSync(`${__dirname}/../.babelrc`, { encoding: 'utf8' }).toString());
  babelRC.plugins = _.concat(['./dist/lodash-magic-import.min.js'])(babelRC.plugins);
  fs.writeFileSync(`${__dirname}/../.babelrc-test`, JSON.stringify(babelRC, null, 2));
};

const removeTestBabelConfig = () => {
  try {
    fs.unlinkSync(`${__dirname}/../.babelrc-test`);
  } catch (e) { /**/ }
};

test('Should be buildable', (t) => {
  t.plan(1);
  const result = proc.spawnSync('npm', ['run', 'build']);
  t.equal(result.status, 0);
});

test('Should be self-testable', (t) => {
  t.plan(1);
  writeTestBabelConfig();
  const result = proc.spawnSync('./node_modules/.bin/babel', ['src', 'test', '--out-dir', 'here', '--config-file', './.babelrc-test']);
  t.equal(result.status, 0);
  removeTestBabelConfig();
});

test('Should not contain duplicate imports', (t) => {
  const dir = `${__dirname}/../here`;
  const contents = _.map(filename =>
    _.split('\n')(fs.readFileSync(`${dir}/${filename}`, { encoding: 'utf8' }).toString()))(fs.readdirSync(dir));

  const filterImports = _.filter(s => _.startsWith('import')(_.trim(s)));

  const importStatements = _.map(filterImports)(contents);

  t.plan(importStatements.length);

  _.forEach((imports) => {
    t.deepEqual(_.difference(imports)(_.uniq(imports)), []);
  })(importStatements);
  proc.spawnSync('rm', ['-r', dir]);
});
