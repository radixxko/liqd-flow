'use strict';

require('./helper/unique_flow_id');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Sub Flow - frozen', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let parent_scope = { parent: { value: Math.random() } };

	assert.ok( Flow.started === false, 'Flow scope should not be started' );

	Flow.start( () =>
	{
		verifyFlowID();

		assert.ok( Flow.started === true, 'Flow scope should be started' );

		assert.deepStrictEqual( parent_scope.parent, Flow.get('parent'), 'Parent Flow value mismatch');
		assert.ok( Object.isFrozen( Flow.get('parent') ) === true, 'Flow scope int value not frozen');

		let child_scope = { parent: { value: Math.random() }, child: { value: Math.random() } };

		Flow.start( () =>
		{
			verifyFlowID();

			assert.deepStrictEqual( parent_scope.parent, Flow.get('parent'), 'Child Flow value mismatch');
			assert.ok( Object.isFrozen( Flow.get('parent') ) === true, 'Flow scope int value not frozen');

			assert.deepStrictEqual( child_scope.child, Flow.get('child'), 'Child Flow value mismatch');
			assert.ok( Object.isFrozen( Flow.get('child') ) === true, 'Flow scope int value not frozen');

			next.ready = true;
		},
		child_scope );
	},
	parent_scope );
});

it( 'Sub Flow - not frozen', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let parent_scope = { parent: { value: Math.random() } };

	Flow.start( () =>
	{
		verifyFlowID();

		assert.deepStrictEqual( parent_scope.parent, Flow.get('parent'), 'Parent Flow value mismatch');
		assert.ok( Object.isFrozen( Flow.get('parent') ) === false, 'Flow scope int value not frozen');

		let child_scope = { parent: { value: Math.random() }, child: { value: Math.random() } };

		Flow.start( () =>
		{
			verifyFlowID();

			assert.deepStrictEqual( child_scope.parent, Flow.get('parent'), 'Child Flow value mismatch');
			assert.ok( Object.isFrozen( Flow.get('parent') ) === true, 'Flow scope int value not frozen');

			assert.deepStrictEqual( child_scope.child, Flow.get('child'), 'Child Flow value mismatch');
			assert.ok( Object.isFrozen( Flow.get('child') ) === true, 'Flow scope int value not frozen');

			let child_child_scope = { parent: { value: Math.random() }, child: { value: Math.random() } };

			Flow.start( () =>
			{
				verifyFlowID();

				assert.deepStrictEqual( child_scope.parent, Flow.get('parent'), 'Child Flow value mismatch');
				assert.ok( Object.isFrozen( Flow.get('parent') ) === true, 'Flow scope int value not frozen');

				assert.deepStrictEqual( child_scope.child, Flow.get('child'), 'Child Flow value mismatch');
				assert.ok( Object.isFrozen( Flow.get('child') ) === true, 'Flow scope int value not frozen');

				next.ready = true;
			},
			child_child_scope );
		},
		child_scope );
	},
	parent_scope, false );
});
