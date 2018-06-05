'use strict';
const fs = require('fs');

describe( 'Tests', ( done ) =>
{
	var files = fs.readdirSync( __dirname + '/tests' );

	for( let file of files )
	{
		if( !file.match(/\.js$/) ){ continue; }

		describe( file, () =>
		{
			require( __dirname + '/tests/' + file );
		});
	}
});
