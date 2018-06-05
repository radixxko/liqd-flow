'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

let uniqueID = Math.ceil( Math.random() * Number.MAX_SAFE_INTEGER );

function key( key )
{
	return key + '_' + uniqueID;
}

function random( type )
{
	switch( type )
	{
		case 'string': return require('crypto').randomBytes(20).toString('hex');
		case 'int': return Math.ceil( Math.random() * Number.MAX_SAFE_INTEGER );
		case 'object': return { [random('string')]: random('string') };
		case 'array': return [ random('string'), random('string') ];
		default: return random('string');
	}
}

it( 'Frozen change (default freeze parameter)', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let scope = { [key('str')]: random('string'), [key('int')]: random('int'), [key('obj')]: random('object'), [key('arr')]: random('array') };

	Flow.start( () =>
	{
		verifyFlowID();

		setTimeout( () =>
		{
			verifyFlowID();

			assert.strictEqual( scope[key('str')], Flow.get(key('str')), 'Flow string value mismatch');
			assert.strictEqual( scope[key('int')], Flow.get(key('int')), 'Flow int value mismatch');
			assert.strictEqual( scope[key('obj')], Flow.get(key('obj')), 'Flow object value mismatch');
			assert.strictEqual( scope[key('arr')], Flow.get(key('arr')), 'Flow array value mismatch');

			assert.ok( Flow.set(key('str'), random('string')) === false, 'Flow set passed on frozen string value');
			assert.strictEqual( scope[key('str')], Flow.get(key('str')), 'Flow value mismatch after set on frozen string value');

			assert.ok( Flow.set(key('int'), 11) === false, 'Flow set passed on frozen int value');
			assert.strictEqual( scope[key('int')], Flow.get(key('int')), 'Flow value mismatch after set on frozen int value');

			assert.ok( Object.isFrozen( Flow.get(key('obj')) ) === true, 'Flow object value not frozen');
			assert.ok( Flow.set(key('obj'), random('object')) === false, 'Flow set passed on frozen object value');
			assert.deepStrictEqual( scope[key('obj')], Flow.get(key('obj')), 'Flow value mismatch after set on frozen object value');

			assert.ok( Object.isFrozen( Flow.get(key('arr')) ) === true, 'Flow array value not frozen');
			assert.ok( Flow.set(key('arr'), random('array')) === false, 'Flow set passed on frozen array value');
			assert.deepStrictEqual( scope[key('arr')], Flow.get(key('arr')), 'Flow value mismatch after set on frozen array value');

			next.ready = true;
		},
		Math.ceil( Math.random() * 30 ));
	},
	scope);
});

it( 'Frozen change (explicit freeze parameter)', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let scope = { [key('str')]: random('string'), [key('int')]: random('int'), [key('obj')]: random('object'), [key('arr')]: random('array') };

	Flow.start( () =>
	{
		verifyFlowID();

		setTimeout( () =>
		{
			verifyFlowID();

			assert.strictEqual( scope[key('str')], Flow.get(key('str')), 'Flow string value mismatch');
			assert.strictEqual( scope[key('int')], Flow.get(key('int')), 'Flow int value mismatch');
			assert.strictEqual( scope[key('obj')], Flow.get(key('obj')), 'Flow object value mismatch');
			assert.strictEqual( scope[key('arr')], Flow.get(key('arr')), 'Flow array value mismatch');

			assert.ok( Flow.set(key('str'), 'bar2') === false, 'Flow set passed on frozen string value');
			assert.strictEqual( scope[key('str')], Flow.get(key('str')), 'Flow value mismatch after set on frozen string value');

			assert.ok( Flow.set(key('int'), 11) === false, 'Flow set passed on frozen int value');
			assert.strictEqual( scope[key('int')], Flow.get(key('int')), 'Flow value mismatch after set on frozen int value');

			assert.ok( Object.isFrozen( Flow.get(key('obj')) ) === true, 'Flow object value not frozen');
			assert.ok( Flow.set(key('obj'), { foo: 'bar2' }) === false, 'Flow set passed on frozen object value');
			assert.deepStrictEqual( scope[key('obj')], Flow.get(key('obj')), 'Flow value mismatch after set on frozen object value');

			assert.ok( Object.isFrozen( Flow.get(key('arr')) ) === true, 'Flow array value not frozen');
			assert.ok( Flow.set(key('arr'), [ 'foo' ]) === false, 'Flow set passed on frozen array value');
			assert.deepStrictEqual( scope[key('arr')], Flow.get(key('arr')), 'Flow value mismatch after set on frozen array value');

			next.ready = true;
		},
		Math.ceil( Math.random() * 30 ));
	},
	scope, true);
});

it( 'Not Frozen change (explicit freeze parameter)', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let scope = { [key('str')]: random('string'), [key('int')]: random('int'), [key('obj')]: random('object'), [key('arr')]: random('array') };

	Flow.start( () =>
	{
		verifyFlowID();

		setTimeout( () =>
		{
			verifyFlowID();

			assert.strictEqual( scope[key('str')], Flow.get(key('str')), 'Flow string value mismatch');
			assert.strictEqual( scope[key('int')], Flow.get(key('int')), 'Flow int value mismatch');
			assert.strictEqual( scope[key('obj')], Flow.get(key('obj')), 'Flow object value mismatch');
			assert.strictEqual( scope[key('arr')], Flow.get(key('arr')), 'Flow array value mismatch');

			assert.ok( Flow.set(key('str'), 'bar2') === true, 'Flow set not passed on string value');
			assert.strictEqual( 'bar2', Flow.get(key('str')), 'Flow value mismatch after set on string value');

			assert.ok( Flow.set(key('int'), 11) === true, 'Flow set not passed on int value');
			assert.strictEqual( 11, Flow.get(key('int')), 'Flow value mismatch after set on int value');

			assert.ok( Object.isFrozen( Flow.get(key('obj')) ) === false, 'Flow object value frozen');
			assert.ok( Flow.set(key('obj'), { foo: 'bar2' }) === true, 'Flow set not passed on object value');
			assert.deepStrictEqual( { foo: 'bar2' }, Flow.get(key('obj')), 'Flow value mismatch after set on object value');

			assert.ok( Object.isFrozen( Flow.get(key('arr')) ) === false, 'Flow array value frozen');
			assert.ok( Flow.set(key('arr'), [ 'foo' ]) === true, 'Flow set not passed on array value');
			assert.deepStrictEqual( [ 'foo' ], Flow.get(key('arr')), 'Flow value mismatch after set on array value');

			next.ready = true;
		},
		Math.ceil( Math.random() * 30 ));
	},
	scope, false);
});

it( 'Setting values', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	Flow.start( () =>
	{
		verifyFlowID();
		
		setTimeout( () =>
		{
			verifyFlowID();

			assert.ok( Flow.set(key('str'), 'bar') === true, 'New string value not set');
			assert.strictEqual( 'bar', Flow.get(key('str')), 'Flow string value mismatch after set');
			assert.ok( Flow.set(key('str'), 'bar2') === false, 'New value set passed on frozen string value');
			assert.strictEqual( 'bar', Flow.get(key('str')), 'Flow string value changed');

			assert.ok( Flow.set(key('int'), 10, true) === true, 'New int value not set');
			assert.strictEqual( 10, Flow.get(key('int')), 'Flow int value mismatch after set');
			assert.ok( Flow.set(key('int'), 10) === false, 'New value set passed on frozen int value');
			assert.strictEqual( 10, Flow.get(key('int')), 'Flow int value changed');

			assert.ok( Flow.set(key('obj'), { foo: 'bar' }, false) === true, 'New object value not set');
			assert.deepStrictEqual( { foo: 'bar' }, Flow.get(key('obj')), 'Flow object value mismatch after set');
			assert.ok( Object.isFrozen( Flow.get(key('obj')) ) === false, 'Flow object value frozen');

			let obj = Flow.get(key('obj'));
			obj[key('str')] = 'bar2';

			assert.deepStrictEqual( obj, Flow.get(key('obj')), 'Flow object value mismatch after assign');
			assert.ok( Flow.set(key('obj'), { foo: 'bar3' }, false) === true, 'Updated object value not set');
			assert.ok( Flow.set(key('obj'), { foo: 'bar3' }, true) === true, 'Updated object value not set on not frozen');
			assert.deepStrictEqual( { foo: 'bar3' }, Flow.get(key('obj')), 'Flow object value mismatch after update');
			assert.ok( Object.isFrozen( Flow.get(key('obj')) ) === true, 'Flow object value not frozen after update');
			assert.ok( Flow.set(key('obj'), { foo: 'bar4' }) === false, 'Updated object frozen value set');
			assert.deepStrictEqual( { foo: 'bar3' }, Flow.get(key('obj')), 'Updated object frozen value mismatch');

			next.ready = true;
		},
		Math.ceil( Math.random() * 30 ));
	});
});
