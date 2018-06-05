'use strict';

//function LOG( str ){ require('fs').writeSync(1, str + '\n'); }

const async_hooks = require('async_hooks');
const Flows = new Map();

async_hooks.createHook(
{
	init( asyncID, type, triggerAsyncID )
	{
		let flow = Flows.get( triggerAsyncID );

		if( flow )
		{
			Flows.set( asyncID, { scope: flow.scope, parent: triggerAsyncID });
		}
	},

	destroy( asyncID )
	{
		if( Flows.has( asyncID ) )
		{
			Flows.delete( asyncID );
		}
	}
})
.enable();

class FlowScopeValue
{
	constructor( value, freeze )
	{
		this._value = ( freeze ? this._freeze( value ) : value );
		this._frozen = Boolean(freeze);
	}

	_freeze( value )
	{
		if( value && typeof value === 'object' && !Object.isFrozen( value ) )
		{
			Object.freeze( value );
		}

		return value;
	}

	update( value, freeze )
	{
		if( !this._frozen )
		{
			this._value = ( freeze ? this._freeze( value ) : value );
			this._frozen = Boolean(freeze);

			return true;
		}

		return false;
	}

	get value()
	{
		return this._value;
	}

	dump()
	{
		return { value: this._value, frozen: this._frozen };
	}
}

global.LIQD_FLOW = module.exports = class Flow
{
	static start( callback, scope = {}, freeze = true )
	{
		setImmediate( () =>
		{
			Flows.set( async_hooks.executionAsyncId(),
			{
				scope: new Map( Object.keys(scope).map( key => [key, new FlowScopeValue( scope[key], freeze )]))
			});

			callback();
		});
	}

	static set( key, value, freeze = true )
	{
		let flow = Flows.get( async_hooks.executionAsyncId() );

		if( flow )
		{
			if( !flow.scope.has(key) )
			{
				flow.scope.set( key, new FlowScopeValue( value, freeze ));

				return true;
			}
			else
			{
				return flow.scope.get(key).update( value, freeze );
			}
		}

		return false;
	}

	static get( key )
	{
		let flow = Flows.get( async_hooks.executionAsyncId() );

		if( flow && flow.scope.has(key) )
		{
			return flow.scope.get(key).value;
		}

		return undefined;
	}

	static scope()
	{
		let flow = Flows.get( async_hooks.executionAsyncId() );

		if( flow )
		{
			let scope = new Object();

			for( let [ key, value ] of flow.scope )
			{
				scope[key] = value.dump();
			}

			return scope;
		}

		return undefined;
	}
}
