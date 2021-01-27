export const noop = () => {};
export const plain = {};

export const omit = (obj, ...fields) => {
  const newObj = { ...obj };
  newObj.__proto__ = obj.__proto__;

  fields.forEach(k => delete newObj[k]);

  return newObj;
};

export const pick = (obj, ...fields) => {
  const newObj = {};
  newObj.__proto__ = obj.__proto__;

  fields.forEach(k => newObj[k] = obj[k]);

  return newObj;
};

export const get = (obj, path) => {
  return path.split('.').reduce((value, key) => {
    return value && value[key];
  }, obj);
};

export const set = (obj, path, newValue) => {
  return path.split('.').reduce((value, key, i, keys) => {
    if (i == keys.length - 1) {
      return value && (value[key] = newValue);
    }

    return value && value[key];
  }, obj);
};

export const mod = (target, operand) => {
  return ((target % operand) + operand) % operand;
};

export const uniqid = (prefix = 'ID') => {
  const timestamp = uniqid.timestamp = Math.max(uniqid.timestamp + 1, Date.now());

  return `${prefix}-${timestamp}`;
};
uniqid.timestamp = Date.now();

export const throttle = (fn, ms = 0) => {
  let timeout = 0;
  let nextCallMs = 0;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      nextCallMs = Date.now() + ms;
      fn(...args);
    }, nextCallMs - Date.now());

    return () => {
      clearTimeout(timeout);
    };
  };
};

export const memo = ((map) => (fn, key, ms) => {
  let throttledFn = map.get(key);

  if (throttledFn) {
    clearTimeout(throttledFn.timeout);

    throttledFn.timeout = setTimeout(() => {
      map.delete(key);
    }, ms);

    return throttledFn();
  }

  throttledFn = throttle(fn, ms);
  map.set(key, throttledFn);
  clearTimeout(throttledFn.timeout);

  throttledFn.timeout = setTimeout(() => {
    map.delete(key);
  }, ms);

  return throttledFn();
})(new Map());

// Will use the shortest indention as an axis
export const freeText = (text) => {
  // This will allow inline text generation with external functions, same as ctrl+shift+c
  // As long as we surround the inline text with ==>text<==
  text = text.replace(
    /( *)==>((?:.|\n)*?)<==/g,
    (match, baseIndent, content) => {
      return freeText(content)
        .split('\n')
        .map(line => `${baseIndent}${line}`)
        .join('\n');
    });

  const lines = text.split('\n');

  const minIndent = lines.filter(line => line.trim()).reduce((soFar, line) => {
    const currIndent = line.match(/^ */)[0].length;

    return currIndent < soFar ? currIndent : soFar;
  }, Infinity);

  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim()
    .replace(/\n +\n/g, '\n\n');
};

export const txt = (parts, ...values) => {
  return freeText(parts.reduce((text, part, index) => {
    const value = values[index - 1];

    return `${text}==>${value}<==${part}`;
  }));
};

// foo_barBaz -> ['foo', 'bar', 'Baz']
export const splitWords = (str) => {
  return str
    .replace(/[A-Z]/g, ' $&')
    .split(/[^a-zA-Z0-9]+/)
    .filter(word => word.trim());
};

// upper -> Upper
export const upperFirst = (str) => {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
};

// camel_case -> camelCase
export const camelCase = (str) => {
  const words = splitWords(str);
  const first = words.shift().toLowerCase();
  const rest = words.map(upperFirst);

  return [first, ...rest].join('');
};

export const titleCase = (str) => {
  return splitWords(str).map(s => upperFirst(s)).join(' ');
};

export const fork = (obj, { recursive = false, context = null } = {}) => {
  if (!(obj instanceof Object)) {
    return obj;
  }

  const clone = {};
  const keys = [];
  keys.push(...Object.getOwnPropertyNames(obj));
  keys.push(...Object.getOwnPropertySymbols(obj));

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (context != null) {
      if (typeof descriptor.value == 'function') {
        descriptor.value = descriptor.value.bind(context);
      }

      if (typeof descriptor.get == 'function') {
        descriptor.get = descriptor.get.bind(context);
      }

      if (typeof descriptor.set == 'function') {
        descriptor.set = descriptor.set.bind(context);
      }
    }

    Object.defineProperty(clone, key, descriptor);
  }

  let proto = Object.getPrototypeOf(obj);

  if (proto) {
    proto = fork(proto, { recursive, context });
  }

  Object.setPrototypeOf(clone, proto);

  return clone;
};

export const compact = (obj, check = v => v != null) => {
  if (obj instanceof Array) {
    return obj.filter(check);
  }

  return Object.keys(obj).reduce((fixed, k) => {
    if (check(obj[k])) {
      fixed[k] = obj[k];
    }

    return fixed;
  }, {});
};

export const roundDecimal = (n, round = Math.round.bind(Math)) => {
  const d = 10 ** (n.toFixed(0).length - 1);

  return round(n / d) * d;
};
