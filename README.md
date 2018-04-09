# lodash-magic-import

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

You know the drill already...

### How it differs from [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) ?

It's much simpler.

We'll provide a eslint plugin and a module caching support for node's dynamic require in the nearest future.

`lodash-magic-import` is completely pointless with `lodash-es` and prohibits usage of Seq and _.chain methods, for the greater good 🎀.

## License

Licensed under [MIT](LICENSE) license, of course.