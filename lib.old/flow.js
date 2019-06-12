'use strict';

const AsyncHooks = require('async_hooks');
const Scopes = new Map();
const Flows = new Map();
const FlowHandles = new WeakMap();

// TODO children set if !alive & no scope destroy and connect children

function LOG( str ){ require('fs').writeSync(1, str + '\n'); }

function ref( asyncID )
{
	let flow = Flows.get( asyncID );

	flow && ++flow.references;
}

function unref( asyncID )
{
	let flow = Flows.get( asyncID );

	if( flow && --flow.references <= 0 && !flow.alive )
	{
		flow.scope = null; Flows.delete( asyncID ); unref( flow.parent );
	}
}

require('./emmiter')({ ref, unref });

AsyncHooks.createHook(
{
	init( asyncID, type, triggerAsyncID )
	{
		let flow = Flows.get( triggerAsyncID );

		if( flow )
		{
			Flows.set( asyncID, { scope: flow.scope, parent: triggerAsyncID, alive: true, references: 0 });
			++flow.references;
		}
	},

	destroy( asyncID )
	{
		let flow = Flows.get( asyncID );

		if( flow )
		{
			flow.alive = false;

			if( flow.references <= 0 )
			{
				flow.scope = null; Flows.delete( asyncID ); unref( flow.parent );
			}
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

	clone()
	{
		if( this._value && typeof this._value === 'object' && !Object.isFrozen( this._value ) )
		{
			return new FlowScopeValue( JSON.parse(JSON.stringify(this._value)), this._frozen );
		}
		else
		{
			return new FlowScopeValue( this._value, this._frozen );
		}
	}

	dump()
	{
		return { value: this._value, frozen: this._frozen };
	}
}

class FlowHandle
{
	constructor(){}

	restore( callback )
	{
		return Flow.restore( this, callback );
	}
}

function setFlow( scope )
{
	let flow = Flows.get( AsyncHooks.executionAsyncId() );

	if( flow )
	{
		// TODO reflect changes on parent_scope
		let inherited_scope = new Map();

		for( let [ key, value ] of flow.scope )
		{
			inherited_scope.set( key, value.clone() );
		}

		for( let key of Object.keys( scope ) )
		{
			if( inherited_scope.has( key ) )
			{
				inherited_scope.get( key ).update( scope[key].value, scope[key].frozen );
			}
			else
			{
				inherited_scope.set( key, new FlowScopeValue( scope[key].value, scope[key].frozen ));
			}
		}

		flow.scope = inherited_scope;
	}
	else
	{
		Flows.set( AsyncHooks.executionAsyncId(),
		{
			scope: new Map( Object.keys(scope).map( key => [key, new FlowScopeValue( scope[key].value, scope[key].frozen )])),
			parent: 0, alive: true, references: 0
		});
	}
}

function createScope( scope, freeze )
{
	let flow_scope = new Object();

	for( let key of Object.keys( scope ) )
	{
		flow_scope[key] = { value: scope[key], frozen: Boolean(freeze) };
	}

	return flow_scope;
}

const Flow = global.LIQD_FLOW = module.exports = class Flow
{
	// TODO: add option for freeze to be Array with not frozen scope keys
	static start( callback, scope = {}, freeze = true )
	{
		setImmediate( () =>
		{
			setFlow( createScope( scope, freeze ));

			callback();
		});
	}

	static get started()
	{
		return Boolean( Flows.get( AsyncHooks.executionAsyncId() ));
	}

	static set( key, value, freeze = true )
	{
		let flow = Flows.get( AsyncHooks.executionAsyncId() );

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

	static get( key, default_value = undefined )
	{
		let flow = Flows.get( AsyncHooks.executionAsyncId() );

		if( flow && flow.scope.has(key) )
		{
			return flow.scope.get(key).value;
		}

		return default_value;
	}

	static getPath( path, default_value = undefined, path_delimiter = '.' )
	{
		let keys = ( typeof path === 'string' ? path.split( path_delimiter ) : path );
		let value = this.get( keys.shift() );

		while( value !== undefined && keys.length )
		{
			let key = keys.shift();

			if( value && typeof value === 'object' && typeof value[key] !== 'undefined' )
			{
				value = value[key];
			}
			else{ value = undefined; }
		}

		return ( value !== undefined ? value : default_value );
	}

	static save()
	{
		let flow_handle = new FlowHandle(), asyncID = AsyncHooks.executionAsyncId(), flow = Flows.get( asyncID );

		if( flow )
		{
			FlowHandles.set( flow_handle, flow.scope );
		}

		return flow_handle;
	}

	static restore( flow_handle, callback )
	{
		let flow_scope = FlowHandles.get( flow_handle );

		if( flow_scope )
		{
			FlowHandles.delete( flow_handle );

			let scope = new Object();

			for( let [ key, value ] of flow_scope )
			{
				scope[key] = value.dump();
			}

			setImmediate( () =>
			{
				setFlow( scope );
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
		let flow = Flows.get( AsyncHooks.executionAsyncId() );

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

	static path()
	{
		let asyncID = AsyncHooks.executionAsyncId(), path = [ asyncID ], flow;

		while( flow = Flows.get( asyncID ))
		{
			path.unshift( asyncID = flow.parent );
		}

		return path;
	}
}

setInterval(() =>
{
	LOG( 'Flows: ' + Flows.size );

	let it = 0;

	for( let flow of Flows )
	{
		//console.log( flow );

		if( ++it > 10 ) break;
	}

}, 1000 );
