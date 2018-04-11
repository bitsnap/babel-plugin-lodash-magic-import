# lodash-magic-import

[![npmjs](https://img.shields.io/npm/v/babel-plugin-lodash-magic-import.svg)](https://npmjs.org/package/babel-plugin-lodash-magic-import)
[![downloads](https://img.shields.io/npm/dw/babel-plugin-lodash-magic-import.svg)](https://npmjs.org/package/babel-plugin-lodash-magic-import)
[![CircleCI](https://img.shields.io/circleci/project/github/bitsnap/babel-plugin-lodash-magic-import.svg)](https://circleci.com/gh/bitsnap/babel-plugin-lodash-magic-import)
[![Coverage Status](https://coveralls.io/repos/github/bitsnap/babel-plugin-lodash-magic-import/badge.svg?branch=master)](https://coveralls.io/github/bitsnap/babel-plugin-lodash-magic-import?branch=master) 
[![dependencies](https://david-dm.org/bitsnap/babel-plugin-lodash-magic-import.svg)](https://david-dm.org/bitsnap/babel-plugin-lodash-magic-import)
[![devDependencies](https://david-dm.org/bitsnap/babel-plugin-lodash-magic-import/dev-status.svg)](https://david-dm.org/bitsnap/babel-plugin-lodash-magic-import#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/bitsnap/babel-plugin-lodash-magic-import/badge.svg)](https://snyk.io/test/github/bitsnap/babel-plugin-lodash-magic-import)

Magic import 🍒 picks lodash 📦 for you.

Transforms 
```
import _ from 'lodash';
_.forEach([], () => ({}));
```

into these

```
import _forEach from 'lodash/forEach';
_forEach([], () => ({}));
```

Removes every `_` assignment .

So

```
import _forEach from 'lodash/fp/forEach';

const _ = {
    forEach: _forEach
}
```

will be removed and replaced.

## How to use 

```
> npm i --save lodash
> npm i --save-dev babel-plugin-lodash-magic-import @babel/core @babel/preset-env
```

*.babelrc*
```
{
  "plugins": ["lodash-magic-import"],
  "presets": [["env", { "targets": { "node": true } }]],
}
```

if you want to use the [lodash-magic-cache](https://github.com/bitsnap/lodash-magic-cache) go for 

```
{
  "plugins": [["lodash-magic-import", { "cache": true }],
  "presets": [["env", { "targets": { "node": true } }]],
}
```

and make sure you've 

```
npm i --save lodash-magic-cache
```

### How it differs from [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) ?

It's much simpler.

We'll provide an eslint plugin in the nearest future.
Although [lodash-magic-cache](https://github.com/bitsnap/lodash-magic-cache) is ready.

`lodash-magic-import` is completely pointless with `lodash-es` and prohibits usage of Seq and `_.chain` methods, for the greater good 🎀.

### Q&A

Feel free to ask some questions [via Discord](http://discord.gg/P7W9v9B).

## License

Licensed under [MIT](LICENSE) license, of course.
