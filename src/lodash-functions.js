import _flatMap from 'lodash/fp/flatMap';
import _identity from 'lodash/fp/identity';

// Lodash 4.17.5 functions list

import arrayFunctions from 'functions/array';
import collectionFunctions from 'functions/collection';
import fpFunctions from 'functions/fp';
import languageFunctions from 'functions/language';
import mathFunctions from 'functions/math';
import numberFunctions from 'functions/number';
import objectFunctions from 'functions/object';
import seqFunctions from 'functions/seq';
import shortHands from 'functions/shorthands';
import stringFunctions from 'functions/string';
import utilFunctions from 'functions/util';
import propertiesFunctions from 'functions/properties';

const dateFunctions = ['now'];

const _ = {
  flatMap: _flatMap,
  identity: _identity,
};

const functions = _.flatMap(_.identity)([
  arrayFunctions,
  collectionFunctions,
  dateFunctions,
  fpFunctions,
  languageFunctions,
  mathFunctions,
  numberFunctions,
  objectFunctions,
  seqFunctions,
  stringFunctions,
  utilFunctions,
  propertiesFunctions,
  shortHands,
]);

export default functions;
