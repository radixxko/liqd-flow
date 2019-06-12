'use strict';

require('./helper/unique_flow_id');
require('./helper/next');

const assert = require('assert');
const Flow = require('../../lib/flow');

it( 'Callbacks', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	setImmediate( () =>
	{
		verifyFlowID();

		let callbacks = [];

		function dispatcher()
		{
			for( let i = 0; i < 20; ++i )
			{
				if( callbacks.length )
				{
					let callback = callbacks.splice( Math.floor( Math.random() * callbacks.length ), 1 )[0];

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch before callback' );

					callback();

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch after callback' );
				}
			}

			if( callbacks.length ){ setTimeout( dispatcher, 10 ); }
			else{ next.ready = true; }
		}

		function register()
		{
			let value = Math.random();

			Flow.start( () =>
			{
				verifyFlowID();

				let flow_handle = Flow.save();

				callbacks.push( () =>
				{
					assert.strictEqual( undefined, Flow.get('value'), 'Callback value mismatch before restore' );

					if( Math.random() < 0.5 )
					{
						Flow.restore( flow_handle, () =>
						{
							assert.strictEqual( value, Flow.get('value'), 'Callback value mismatch after restore' );
						});
					}
					else
					{
						flow_handle.restore( () =>
						{
							assert.strictEqual( value, Flow.get('value'), 'Callback value mismatch after restore' );
						});
					}

					if( Math.random() < 0.1 )
					{
						let err;

						try
						{
							flow_handle.restore( () => {} );
						}
						catch(e){ err = e.message; }

						assert.strictEqual( err, 'Flow restore failed due to multiple restore() calls', 'Multiple restores' );
					}
				});
			},
			{ value });
		}

		for( let i = 0; i < 500; ++i )
		{
			register();
		}

		setTimeout( dispatcher, 10 );
	});
});

it( 'Callbacks - bind', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	setImmediate( () =>
	{
		verifyFlowID();

		let callbacks = [];

		function dispatcher()
		{
			for( let i = 0; i < 20; ++i )
			{
				if( callbacks.length )
				{
					let callback = callbacks.splice( Math.floor( Math.random() * callbacks.length ), 1 )[0];

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch before callback' );

					callback();

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch after callback' );
				}
			}

			if( callbacks.length ){ setTimeout( dispatcher, 10 ); }
			else{ next.ready = true; }
		}

		function register()
		{
			let value = Math.random();

			Flow.start( () =>
			{
				verifyFlowID();

				let flow_handle = Flow.save();

				callbacks.push( Flow.bind( () =>
				{
					assert.strictEqual( value, Flow.get('value'), 'Callback value mismatch after restore' );
				}));
			},
			{ value });
		}

		for( let i = 0; i < 500; ++i )
		{
			register();
		}

		setTimeout( dispatcher, 10 );
	});
});

it( 'Promises', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	setImmediate( () =>
	{
		verifyFlowID();

		let callbacks = [];

		function dispatcher()
		{
			for( let i = 0; i < 20; ++i )
			{
				if( callbacks.length )
				{
					let callback = callbacks.splice( Math.floor( Math.random() * callbacks.length ), 1 )[0];

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch before callback' );

					callback();

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch after callback' );
				}
			}

			if( callbacks.length ){ setTimeout( dispatcher, 10 ); }
			else{ next.ready = true; }
		}

		function register()
		{
			let value = Math.random();

			Flow.start( async() =>
			{
				verifyFlowID();

				await new Promise( resolve =>
				{
					verifyFlowID();

					assert.strictEqual( value, Flow.get('value'), 'Promise value mismatch after restore' );

					callbacks.push( resolve );
				});

				verifyFlowID();

				assert.strictEqual( value, Flow.get('value'), 'Promise value mismatch after restore' );
			},
			{ value });
		}

		for( let i = 0; i < 500; ++i )
		{
			register();
		}

		setTimeout( dispatcher, 10 );
	});
});

it( 'Restore empty scope', ( done ) =>
{
	let next = { callback: done, ready: false }; Next( next );

	setImmediate( () =>
	{
		verifyFlowID();

		let callbacks = [];

		function dispatcher()
		{
			for( let i = 0; i < 20; ++i )
			{
				if( callbacks.length )
				{
					let callback = callbacks.splice( Math.floor( Math.random() * callbacks.length ), 1 )[0];

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch before callback' );

					callback();

					assert.strictEqual( undefined, Flow.get('value'), 'Dispatcher value mismatch after callback' );
				}
			}

			if( callbacks.length ){ setTimeout( dispatcher, 10 ); }
			else{ next.ready = true; }
		}

		function register()
		{
			let flow_handle = Flow.save();

			callbacks.push( () =>
			{
				assert.strictEqual( undefined, Flow.get('value'), 'Callback value mismatch before restore' );

				flow_handle.restore( () =>
				{
					assert.strictEqual( undefined, Flow.get('value'), 'Callback value mismatch after restore' );
				});
			});
		}

		for( let i = 0; i < 500; ++i )
		{
			register();
		}

		setTimeout( dispatcher, 10 );
	});
});
