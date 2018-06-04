# Flow: Track asynchronous application flow and access flow context variables

[![Version npm](https://img.shields.io/npm/v/liqd-flow.svg)](https://www.npmjs.com/package/liqd-flow)
[![Build Status](https://travis-ci.org/radixxko/liqd-flow.svg?branch=master)](https://travis-ci.org/radixxko/liqd-flow)
[![Coverage Status](https://coveralls.io/repos/github/radixxko/liqd-flow/badge.svg?branch=master)](https://coveralls.io/github/radixxko/liqd-flow?branch=master)

## Sneak Peek

This library allows you to create custom asynchronous flow contexts and access its variables in every step of the flow execution.

Let's illustrate Flow functionality on a simple http server:

```js
const Flow = require('liqd-flow');	// load Flow library

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
.listen(8080)

async function dispatch( url )
{
	Flow.set( 'url', url ); // Set a new variable in our Flow

	let data = await Model.getData( url );

	return
	{
		data: data,
		elapsed: process.hrtime( Flow.get( 'start' ) ),	// get process.hrtime() from current Flow (server request handler)
		requestID: Flow.get( 'requestID' )				// get requestID incremented in  current Flow (server request handler)
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

- `callback` {Function} Callback executed in a newly created Flow
- `scope` {Object} Scope assigned to the Flow
	- defaults to {Object} empty object `{}`
- `freeze` {Boolean} If set to true scope variables are frozen to prevent changes in the Flow
	- defaults to {Boolean} `true`

Starts a new Flow and sets its scope object.

### static set( key, value[, freeze = true] )

- `key` {Any} Key
- `value` {Any} Value
- `freeze` {Boolean} If set to true value for key will be frozen to prevent changes in the Flow
	- defaults to {Boolean} `true`

Sets value for the key in the current Flow if key is not frozen.

Returns {Boolean}
	- `true` - value has been set for the key which was not frozen
	- `false` - key was frozen and variable have not been changed

### static get( key )

- `key` {Any} Key

Returns value for the key in the current Flow, `undefined` if the key is not set.

Returns {Any}

### static scope()

Returns the current scope of the Flow, object containing every key set in the Flow with its value and frozen state.

```js
{
	[key] : { value, frozen }
}
```

Returns {Object}
