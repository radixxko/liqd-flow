'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Flow path without scope', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	assert.ok( Flow.path().length === 0, 'Flow path is not empty');

	Flow.start( () =>
	{
		verifyFlowID();

		assert.ok( Flow.path().length === 1, 'Flow path is not 1');

		setTimeout( () =>
		{
			verifyFlowID();

			assert.ok( Flow.path().length === 1, 'Flow path is not 1');

			Flow.start( () =>
			{
				verifyFlowID();

				assert.ok( Flow.path().length === 1, 'Flow path is not 1');

				next.ready = true;
			});
		},
		10 );
	});
});

it( 'Flow path with scope', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	assert.ok( Flow.path().length === 0, 'Flow path is not empty');

	Flow.start( () =>
	{
		verifyFlowID();

		assert.ok( Flow.flowsCount > 0, 'Flows count is 0' );
		assert.ok( Flow.path().length === 1, 'Flow path is not 1');

		setTimeout( () =>
		{
			verifyFlowID();

			assert.ok( Flow.path().length === 2, 'Flow path is not 2');

			Flow.start( () =>
			{
				verifyFlowID();

				assert.ok( Flow.path().length === 2, 'Flow path is not 2');

				next.ready = true;
			},
			{ b: 2 });
		},
		10 );
	},
	{ a: 1 });
});
