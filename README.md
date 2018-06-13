# Flow: Track asynchronous application flow and access flow context variables

[![Version npm](https://img.shields.io/npm/v/liqd-flow.svg)](https://www.npmjs.com/package/liqd-flow)
[![Build Status](https://travis-ci.org/radixxko/liqd-flow.svg?branch=master)](https://travis-ci.org/radixxko/liqd-flow)
[![Coverage Status](https://coveralls.io/repos/github/radixxko/liqd-flow/badge.svg?branch=master)](https://coveralls.io/github/radixxko/liqd-flow?branch=master)

## Warning

Flow library does not work properly when using async/await on Promises with node v10.0 - v10.3 due to bug in V8 engine.

## Sneak Peek

This library allows you to create custom asynchronous flow contexts and access its variables in every step of the flow execution.

Let's illustrate Flow functionality on a simple http server:

```js
const Flow = require('liqd-flow'); // load Flow library

let requestID = 0;

const server = require('http').createServer( ( req, res ) =>
{
  // Start a new flow in request handler
  Flow.start( () =>
  {
    dispatch( req.url ).then( result => res.end( result ));
  },
  // and set its variables
  {
    start: process.hrtime(),
    requestID: ++requestID
  });
})
.listen(8080);

async function dispatch( url )
{
  Flow.set( 'url', url ); // Set a new variable in our Flow

  let data = await Model.getData( url );

  return
  {
    data,
    elapsed: process.hrtime( Flow.get( 'start' ) ), // get process.hrtime() from the current Flow (server request handler)
    requestID: Flow.get( 'requestID' )              // get requestID incremented in the current Flow (server request handler)
  };
}
```

## Table of Contents

* [Installing](#installing)
* [Class: Flow](#class-flow)

## Installing

```
npm install --save liqd-flow
```

## Class: Flow

### static start( callback[, scope = {}[, freeze = true]] )

Starts a new Flow and sets its scope object.

- `callback` {Function} Callback executed in a newly created Flow
- `scope` {Object} Scope assigned to the Flow
	- defaults to {Object} empty object `{}`
- `freeze` {Boolean} If set to true scope variables are frozen to prevent changes in the Flow
	- defaults to {Boolean} `true`

```js
Flow.start( () =>
{
	// Callback is executed inside Flow scope

	let foo = Flow.get('foo'); // returns 'bar';
},
{ foo: 'bar' }); // Sets the Flow scope
```

### static set( key, value[, freeze = true] )

Sets value for the key in the current Flow if key is not frozen.

- `key` {Any} Key
- `value` {Any} Value
- `freeze` {Boolean} If set to true value for key will be frozen to prevent changes in the Flow
	- defaults to {Boolean} `true`

Returns {Boolean}
- `true` value has been set for the key which was not frozen
- `false` key was frozen and variable have not been changed

```js
Flow.set('foo', 'bar', false); // Sets the value inside Flow, returns true
Flow.set('foo', 'boo', true); // Rewrites the value, returns true
Flow.set('foo', 'goo'); // Does not rewrite the value, returns false
```

### static get( key[, default_value = undefined] )

Returns value for the key in the current Flow, `default_value` if the key is not set.

- `key` {Any} Key
- `default_value` {Any} Value returned if the key is not set
	- defaults to `undefined`

Returns {Any}

```js
let foo = Flow.getPath('foo');
```

### static getPath( path[, default_value = undefined[, path_delimiter = '.']] )

Returns value for the path in the current Flow, `default_value` if the path is not set.

- `path` {Array of Strings | String} path
- `default_value` {Any} Value returned if the key is not set
	- defaults to `undefined`
- `path_delimiter` {String} Path delimiter if path is {String}
	- defaults to `'.'`

Returns {Any}

```js
let foo = Flow.getPath('obj.foo');
let bar = Flow.getPath('obj|bar', null, '|');
```

### static scope()

Returns the current scope of the Flow, object containing every key set in the Flow with its value and frozen state.

Returns {Object}

```js
let scope = Flow.scope();

/* scope =
{
  [key] : { value, frozen }
}
*/
```

### static save()

Returns the current Flow handle for later restoration.

Returns {FlowHandle}

```js
let flow_handle = Flow.save();
```

### static restore( FlowHandle, callback )

Restores the stored Flow and dispatches the callback. Flow can be restored by calling restore method on FlowHandle as well. Each FlowHandle can be restored only once - multiple restorations throws an Exception.

```js
Flow.restore( flow_handle, () =>
{
	// Flow is restored
});
```

```js
flow_handle.restore( () =>
{
	// Flow is restored
});
```
