'use strict';

const async_hooks = require('async_hooks');

let FlowIDs = new Set();

global.verifyFlowID = () =>
{
	let flowID = async_hooks.executionAsyncId();

	if( FlowIDs.has( flowID ) )
	{
		require('assert')('Identical FlowID detected');
	}

	FlowIDs.add( flowID );
}
