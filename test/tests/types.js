'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Types + scope', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let scope = { foo: 'bar', int: 10, obj: { foo: 'bar' }, arr: [ 'foo', 'bar' ] };

	Flow.start( () =>
	{
		verifyFlowID();

		assert.strictEqual( scope.foo, Flow.get('foo'), 'Flow string value mismatch');
		assert.strictEqual( scope.int, Flow.get('int'), 'Flow int value mismatch');
		assert.deepStrictEqual( scope.obj, Flow.get('obj'), 'Flow object value mismatch');
		assert.deepStrictEqual( scope.arr, Flow.get('arr'), 'Flow array value mismatch');

		assert.deepStrictEqual( scope.obj, Flow.getPath('obj'), 'Flow object getPath value mismatch');
		assert.strictEqual( scope.obj.foo, Flow.getPath('obj.foo'), 'Flow object getPath value mismatch');
		assert.strictEqual( scope.obj.foo, Flow.getPath('obj|foo', null, '|'), 'Flow object getPath value mismatch');
		assert.strictEqual( scope.obj.foo, Flow.getPath(['obj','foo']), 'Flow object getPath value mismatch');
		assert.strictEqual( 'missing', Flow.getPath('obj.foo.bar', 'missing'), 'Flow object getPath value mismatch');
		assert.strictEqual( 'missing', Flow.getPath('test.foo.bar', 'missing'), 'Flow object getPath value mismatch');

		setTimeout( () =>
		{
			verifyFlowID();

			assert.strictEqual( scope.foo, Flow.get('foo'), 'Flow string value mismatch inside timeout');
			assert.strictEqual( scope.int, Flow.get('int'), 'Flow int value mismatch inside timeout');
			assert.deepStrictEqual( scope.obj, Flow.get('obj'), 'Flow object value mismatch inside timeout');
			assert.deepStrictEqual( scope.arr, Flow.get('arr'), 'Flow array value mismatch inside timeout');

			let flow_scope = Flow.scope();

			assert.deepStrictEqual( Object.keys( scope ), Object.keys( flow_scope ), 'Not identical scope');

			assert.strictEqual( scope.foo, flow_scope.foo.value, 'Flow scope string value mismatch');
			assert.ok( flow_scope.foo.frozen === true, 'Flow scope string value not frozen');

			assert.strictEqual( scope.int, flow_scope.int.value, 'Flow scope int value mismatch');
			assert.ok( flow_scope.int.frozen === true, 'Flow scope int value not frozen');

			assert.strictEqual( scope.obj, flow_scope.obj.value, 'Flow scope object value mismatch');
			assert.ok( flow_scope.obj.frozen === true && Object.isFrozen( flow_scope.obj.value ), 'Flow scope object value not frozen');

			assert.strictEqual( scope.arr, flow_scope.arr.value, 'Flow scope array value mismatch');
			assert.ok( flow_scope.arr.frozen === true && Object.isFrozen( flow_scope.arr.value ), 'Flow scope array value not frozen');

			next.ready = true;
		},
		10 );
	},
	scope );
});
