const AsyncHooks = require('async_hooks');
const EventEmmiter = require('events');

let FlowHandler = null;

function bind( listener, emmiter, event )
{
	let event_binds, asyncID = AsyncHooks.executionAsyncId();

	if( !listener._flow_binds )
	{
		listener._flow_binds = new Map();
	}

	if( !( event_binds = listener._flow_binds.get( event )))
	{
		listener._flow_binds.set( event, event_binds = new WeakMap());
	}

    let oldAsyncID = event_binds.get( emmiter );

    event_binds.set( emmiter, asyncID );

	FlowHandler.ref( asyncID );
    if( oldAsyncID ){ FlowHandler.unref( asyncID )}
}

function unbind( listener, emmiter, event )
{
    let event_binds, asyncID;

	if( listener._flow_binds )
	{
        if( event_binds = listener._flow_binds.get( event ))
    	{
    		if( asyncID = event_binds.get( emmiter ))
            {
                event_binds.delete( emmiter );

                FlowHandler.unref( asyncID );
            }
    	}
	}
}

EventEmmiter.prototype._original_addListener = EventEmmiter.prototype.addListener;
EventEmmiter.prototype.addListener = function( event, listener )
{
    bind( listener, this, event );

    return this._original_addListener( event, listener );
}

EventEmmiter.prototype._original_off = EventEmmiter.prototype.off;
EventEmmiter.prototype.off = function( event, listener )
{
    unbind( listener, this, event );

    return this._original_off( event, listener );
}

EventEmmiter.prototype._original_on = EventEmmiter.prototype.on;
EventEmmiter.prototype.on = function( event, listener )
{
    bind( listener, this, event );

    return this._original_on( event, listener );
}

EventEmmiter.prototype._original_once = EventEmmiter.prototype.once;
EventEmmiter.prototype.once = function( event, listener )
{
    bind( listener, this, event ); // TODO odobrat ked sa emitne

    return this._original_once( event, listener );
}

EventEmmiter.prototype._original_prependListener = EventEmmiter.prototype.prependListener;
EventEmmiter.prototype.prependListener = function( event, listener )
{
    bind( listener, this, event );

    return this._original_prependListener( event, listener );
}

EventEmmiter.prototype._original_prependOnceListener = EventEmmiter.prototype.prependOnceListener;
EventEmmiter.prototype.prependOnceListener = function( event, listener )
{
    bind( listener, this, event ); // TODO odobrat ked sa emitne

    return this._original_prependOnceListener( event, listener );
}

EventEmmiter.prototype._original_removeAllListeners = EventEmmiter.prototype.removeAllListeners;
EventEmmiter.prototype.removeAllListeners = function( event )
{
    //LOG( 'removeAllListeners ' + event );

    return this._original_removeAllListeners( event );
}

EventEmmiter.prototype._original_removeListener = EventEmmiter.prototype.removeListener;
EventEmmiter.prototype.removeListener = function( event, listener )
{
    unbind( listener, this, event );

    return this._original_removeListener( event, listener );
}

module.exports = function( handler )
{
    FlowHandler = handler;
}
