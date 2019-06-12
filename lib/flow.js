'use strict';

const AsyncHooks = require('async_hooks');
const FlowTree = require('./flow_tree.js');
const FlowHandles = new Map();

// TODO children set if !alive & no scope destroy and connect children

function LOG( str ){ require('fs').writeSync(1, str + '\n'); }

AsyncHooks.createHook(
{
	init( asyncID, type, triggerAsyncID )
	{
		FlowTree.has( triggerAsyncID ) && FlowTree.add( asyncID, triggerAsyncID );
	},
	destroy( asyncID )
	{
		FlowTree.delete( asyncID );
	}
})
.enable();

class FlowHandle
{
	constructor(){}

	restore( callback )
	{
		return Flow.restore( this, callback );
	}
}

const Flow = global.LIQD_FLOW = module.exports = class Flow
{
	// TODO: add option for freeze to be Array with not frozen scope keys
	static start( callback, scope = {}, freeze = true )
	{
		setImmediate(() =>
		{
			let asyncID = AsyncHooks.executionAsyncId();

			FlowTree.add( asyncID, AsyncHooks.triggerAsyncId());

			for( let key in scope )
			{
				FlowTree.set( asyncID, key, scope[key], freeze );
			}

			callback();
		});
	}

	static get started()
	{
		return Boolean( FlowTree.has( AsyncHooks.executionAsyncId() ));
	}

	static set( key, value, freeze = true )
	{
		return FlowTree.set( AsyncHooks.executionAsyncId(), key, value, freeze );
	}

	static get( key, default_value = undefined )
	{
		let value = FlowTree.get( AsyncHooks.executionAsyncId(), key );

		return value !== undefined ? value : default_value;
	}

	static getPath( path, default_value = undefined, path_delimiter = '.' )
	{
		let keys = ( typeof path === 'string' ? path.split( path_delimiter ) : path );
		let value = this.get( keys.shift() );

		while( value !== undefined && keys.length )
		{
			let key = keys.shift();

			if( value && typeof value === 'object' && value[key] !== undefined )
			{
				value = value[key];
			}
			else{ value = undefined; }
		}

		return ( value !== undefined ? value : default_value );
	}

	static save()
	{
		let flow_handle = new FlowHandle(), flow_scope = FlowTree.scope( AsyncHooks.executionAsyncId() );

		FlowHandles.set( flow_handle, flow_scope );

		return flow_handle;
	}

	static restore( flow_handle, callback )
	{
		if(  FlowHandles.has( flow_handle ))
		{
			let flow_scope = FlowHandles.get( flow_handle );

			FlowHandles.delete( flow_handle );

			setImmediate(() =>
			{
				let asyncID = AsyncHooks.executionAsyncId();

				FlowTree.add( asyncID, AsyncHooks.triggerAsyncId());

				if( flow_scope )
				{
					for( let key in flow_scope )
					{
						FlowTree.set( asyncID, key, flow_scope[key].value, flow_scope[key].frozen );
					}
				}

				callback();
			});
		}
		else{ throw new Error('Flow restore failed due to multiple restore() calls'); }
	}

	static bind( callback )
	{
		let flow_handle = Flow.save();

		return ( ...args ) =>
		{
			flow_handle.restore( () =>
			{
				callback( ...args );
			});
		};
	}

	static scope()
	{
		return FlowTree.scope( AsyncHooks.executionAsyncId() );
	}

	static path()
	{
		return FlowTree.path( AsyncHooks.executionAsyncId() );
	}

	static get flowsCount()
	{
		return FlowTree.size();
	}
}

/*setInterval(() =>
{
	LOG( 'Flows: ' + FlowTree.size() );

}, 1000 );*/
