'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Promise-then', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let cnt = 100, resolved = 0;

	function createPromise()
	{
		const flowValue = Math.random();

		Flow.start( () =>
		{
			verifyFlowID();

			(new Promise( ( resolve, reject ) =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside promise executor');

				setTimeout( () =>
				{
					resolve( Flow.get('flowValue') );
				},
				Math.ceil( Math.random() * 750 ) );
			}))
			.then( v =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, v, 'Flow value resolve mismatch');
				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value then mismatch');

				if( ++resolved === cnt )
				{
					next.ready = true;
				}
			});
		},
		{
			flowValue
		});
	}

	for( let i = 0; i < cnt; ++i )
	{
		createPromise();
	}
});/*

it( 'Promise-catch', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let cnt = 100, resolved = 0;

	function createPromise()
	{
		const flowValue = Math.random();

		Flow.start( () =>
		{
			verifyFlowID();

			(new Promise( ( resolve, reject ) =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside promise executor');

				setTimeout( () =>
				{
					reject( Flow.get('flowValue') );
				},
				Math.ceil( Math.random() * 750 ) );
			}))
			.then( v => v )
			.catch( v =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, v, 'Flow value reject mismatch');
				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value catch mismatch');

				if( ++resolved === cnt )
				{
					next.ready = true;
				}
			});
		},
		{
			flowValue
		});
	}

	for( let i = 0; i < cnt; ++i )
	{
		createPromise();
	}
});

it( 'Promise-await', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let cnt = 100, resolved = 0;

	function createPromise()
	{
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
				Math.ceil( Math.random() * 750 ));
			});

			assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch before await');

			await promise;

			verifyFlowID();

			assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch after await');

			if( ++resolved === cnt )
			{
				next.ready = true;
			}
		},
		{
			flowValue
		});
	}

	for( let i = 0; i < cnt; ++i )
	{
		createPromise();
	}
});
*/
