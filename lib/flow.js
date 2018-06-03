const fs = require('fs');
const async_hooks = require('async_hooks');

function LOG( str )
{
	fs.writeSync(1, str + '\n');
}

const flows = new Map();
//const paths = new Map();

async_hooks.createHook(
{
	init( asyncId, type, triggerAsyncId )
	{
		let flow = flows.get( triggerAsyncId );

		if( flow )
		{
			flows.set( asyncId, flow );
		}

		/*let flowID = ( flows.has( triggerAsyncId ) && triggerAsyncId ) || paths.get( triggerAsyncId );

		if( flowID )
		{
			//LOG(`INIT  ${asyncId}, ${type}, ${triggerAsyncId}`);

			paths.set( asyncId, flowID );
		}*/
		//LOG(`INIT  ${asyncId}, ${type}, ${triggerAsyncId}`);
	},

	/*before( asyncId )
	{
		//LOG(`BEFORE  ${asyncId}`);
	},

	promiseResolve( asyncId )
	{
		//LOG(`promiseResolve  ${asyncId}`);
	},*/

	destroy( asyncId )
	{
		if( flows.has( asyncId ) )
		{
			//LOG(`destroy flow ${asyncId}`);

			flows.delete( asyncId );
		}
		/*else if( paths.has( asyncId ) )
		{
			LOG(`destroy path ${asyncId}`);

			paths.delete( asyncId );
		}*/
	}
})
.enable();




module.exports = class Flow
{
	static start( callback, scope = {} )
	{
		setImmediate( () =>
		{
			//LOG(`FLOW eid ${async_hooks.executionAsyncId()} tid ${async_hooks.triggerAsyncId()}`);

			flows.set( async_hooks.executionAsyncId(), scope );

			callback();
		})
	}

	static get( path )
	{
		//LOG(`FLOW GET ${path} eid ${async_hooks.executionAsyncId()} tid ${async_hooks.triggerAsyncId()}`);

		let executionAsyncId = async_hooks.executionAsyncId();
		let flowID = ( flows.has( executionAsyncId ) && executionAsyncId );// || paths.get( executionAsyncId );

		//console.log( flowID, flows );

		if( flowID )
		{
			return flows.get( flowID )[path];
		}
	}
}

setInterval( () =>
{
	console.log( Array.from(flows.keys()).length );
},
1000);
