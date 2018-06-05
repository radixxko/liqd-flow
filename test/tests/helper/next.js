'use strict';

let queue = [], emptied = (new Date()).getTime() + 10000;

function check()
{
	var ready_index = queue.findIndex( item => item.ready );

	if( ready_index !== -1 )
	{
		let callback = queue[ready_index].callback;

		queue.splice( ready_index, 1 );

		if( queue.length === 0 )
		{
			emptied = (new Date()).getTime();
		}

		callback();
	}

	if( (new Date()).getTime() - emptied < 5000 ){ setTimeout( check, 10 ); }
}

check();

global.Next = ( next ) =>
{
	queue.push( next );
}
