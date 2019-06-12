'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'NonExisting Flow', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	setImmediate( () =>
	{
		verifyFlowID();

		assert.strictEqual( undefined, Flow.get('foo'), 'Getting flow value outside flow passed');
		assert.strictEqual( 'default_bar', Flow.get('foo', 'default_bar'), 'Getting flow value outside flow default mismatch');
		assert.strictEqual( false, Flow.set('foo'), 'Setting flow value outside flow passed');
		assert.strictEqual( undefined, Flow.scope(), 'Getting flow scope outside flow passed');

		next.ready = true;
	});
});
