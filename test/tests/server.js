'use strict';

require('./helper/unique_flow_id');

const assert = require('assert');
const http = require('http');
const Flow = require('../../lib/flow');

it( 'Request handler', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	let responseID = 0;

	const server = http.createServer( ( req, res ) =>
	{
		verifyFlowID();

		const flowValue = Math.random();

		Flow.start( () =>
	 	{
			verifyFlowID();

			assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside flow callback');

			setTimeout( () =>
			{
				verifyFlowID();

				assert.strictEqual( flowValue, Flow.get('flowValue'), 'Flow value mismatch inside timeout');

				res.end( JSON.stringify({ requestID: Flow.get('requestID'), responseID: Flow.get('responseID') }));
			},
			Math.ceil( Math.random() * 250 ) );
		},
		{
			flowValue,
			requestID: parseInt(req.url.substr(1)),
			responseID: ++responseID
		});
	})
	.listen(8080, () =>
	{
		verifyFlowID();

		let requestsCnt = 100, responseIDs = new Set();

		function request()
		{
			let requestID = Math.ceil( Math.random() * Number.MAX_SAFE_INTEGER );

			http.get('http://localhost:8080/' + requestID, ( res ) =>
			{
				verifyFlowID();

				let data = '';

				res.on( 'data', chunk => data += chunk );
  				res.on( 'end', () =>
				{
					verifyFlowID();

					data = JSON.parse( data );

					assert.strictEqual( requestID, data.requestID, 'Client requestID mismatch');
					assert.ok( !responseIDs.has( data.responseID ), 'Client responseID duplicate');

					responseIDs.add( data.responseID );

					if( responseIDs.size === requestsCnt )
					{
						server.close( () => { next.ready = true; } );
					}
				});
			});
		}

		for( let i = 0; i < requestsCnt; ++i )
		{
			request();
		}
	});
});
