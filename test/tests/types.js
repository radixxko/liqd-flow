'use strict';

require('./helper/unique_flow_id');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Types + scope', ( done ) =>
{
	setImmediate( () =>
	{
		verifyFlowID();

		let scope = { foo: 'bar', int: 10, obj: { foo: 'bar' }, arr: [ 'foo', 'bar' ] };

		Flow.start( () =>
		{
			verifyFlowID();

			assert.strictEqual( scope.foo, Flow.get('foo'), 'Flow string value mismatch');
			assert.strictEqual( scope.int, Flow.get('int'), 'Flow int value mismatch');
			assert.strictEqual( scope.obj, Flow.get('obj'), 'Flow object value mismatch');
			assert.strictEqual( scope.arr, Flow.get('arr'), 'Flow array value mismatch');

			setTimeout( () =>
			{
				verifyFlowID();

				assert.strictEqual( scope.foo, Flow.get('foo'), 'Flow string value mismatch inside timeout');
				assert.strictEqual( scope.int, Flow.get('int'), 'Flow int value mismatch inside timeout');
				assert.strictEqual( scope.obj, Flow.get('obj'), 'Flow object value mismatch inside timeout');
				assert.strictEqual( scope.arr, Flow.get('arr'), 'Flow array value mismatch inside timeout');

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

				done();
			},
			10 );
		},
		scope );
	});
});