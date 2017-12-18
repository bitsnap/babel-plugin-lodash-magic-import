import * as babel from 'babel-core';
import test from 'tape';
import {
  replace,
  trim,
  map,
  forEach,
  pipe,
  concat,
  join,
} from 'lodash/fp';

const _ = {
  pipe,
  replace,
  trim,
  map,
  forEach,
  concat,
  join,
};

function transform(code, options = {}) {
  return babel.transform(code, {
    presets: ['es2015'],
    plugins: [
      ['./index', options],
    ],
  }).code;
}

const strict = '"use strict";';
const normalize = _.pipe(
  _.replace(/\s+/g, ''),
  _.trim,
);

const testData = [
  [
    'const _ = { at, flatMap, forEach, keys, identity, sortBy, concat, uniq };',
    `var _fp = require("lodash/fp");
     var _ = {
       at: _fp.at,
       flatMap: _fp.flatMap,
       forEach: _fp.forEach,
       keys: _fp.keys,
       identity: _fp.identity,
       sortBy: _fp.sortBy,
       concat: _fp.concat,
       uniq: _fp.uniq
     };`,
  ],
];

const transformTestTable = _.map(([input, output]) => [input, _.pipe(_.concat(strict), normalize, _.join(''))(output)])(testData);
console.log(transformTestTable);
//
test('Test', (t) => {
  t.plan(transformTestTable.length);
  const transformOptions = {
    libIdentifier: '_',
    importPath: 'lodash/fp',
  };

  _.forEach(([input, output]) => {
    t.equal(normalize(transform(input, transformOptions)), output, 'transform performed correctly');
  })(transformTestTable);
});
