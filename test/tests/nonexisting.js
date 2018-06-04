'use strict';

require('./helper/unique_flow_id');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'NonExisting Flow', ( done ) =>
{
	setImmediate( () =>
	{
		verifyFlowID();

		assert.strictEqual( undefined, Flow.get('foo'), 'Getting flow value outside flow passed');
		assert.strictEqual( false, Flow.set('foo'), 'Setting flow value outside flow passed');
		assert.strictEqual( undefined, Flow.scope(), 'Getting flow scope outside flow passed');

		done();
	});
});
