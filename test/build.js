import test from 'tape';
import proc from 'child_process';
import fs from 'fs';

import _forEach from 'lodash/fp/forEach';
import _uniq from 'lodash/fp/uniq';
import _difference from 'lodash/fp/difference';
import _concat from 'lodash/fp/concat';
import _filter from 'lodash/fp/filter';
import _split from 'lodash/fp/split';
import _map from 'lodash/fp/map';
import _trim from 'lodash/fp/trim';
import _startsWith from 'lodash/fp/startsWith';

const _ = {
  map: _map,
  trim: _trim,
  startsWith: _startsWith,
  filter: _filter,
  uniq: _uniq,
  difference: _difference,
  concat: _concat,
  forEach: _forEach,
  split: _split,
};

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
