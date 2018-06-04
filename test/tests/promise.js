'use strict';

require('./helper/unique_flow_id');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Promise-then', ( done ) =>
{
	setImmediate( () =>
	{
		verifyFlowID();

		const flowValue = Math.random();

		Flow.start( () =>
		{
			verifyFlowID();

			(new Promise( ( resolve, reject ) =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside promise executor');

				resolve( Flow.get('flowValue') );
			}))
			.then( v =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, v, 'Flow value resolve mismatch');
				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value then mismatch');

				done();
			});
		},
		{
			flowValue
		});
	});
});

it( 'Promise-catch', ( done ) =>
{
	setImmediate( () =>
	{
		verifyFlowID();

		const flowValue = Math.random();

		Flow.start( () =>
		{
			verifyFlowID();

			(new Promise( ( resolve, reject ) =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside promise executor');

				reject( Flow.get('flowValue') );
			}))
			.then( v => v )
			.catch( v =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, v, 'Flow value reject mismatch');
				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value catch mismatch');

				done();
			});
		},
		{
			flowValue
		});
	});
});

it( 'Promise-await', ( done ) =>
{
	setImmediate( () =>
	{
		verifyFlowID();

		const flowValue = Math.random();

		Flow.start( async() =>
		{
			verifyFlowID();

			let promise = new Promise( ( resolve, reject ) =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside promise executor');

				setTimeout( () =>
				{
					verifyFlowID();

					assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside timeout');

					resolve();
				},
				10);
			});

			assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch before await');

			await promise;

			verifyFlowID();

			assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch after await');

			done();
		},
		{
			flowValue
		});
	});
});
