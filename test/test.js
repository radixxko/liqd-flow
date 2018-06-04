'use strict';

const fs = require('fs');

describe( 'Tests', ( done ) =>
{
	var files = fs.readdirSync( __dirname + '/tests' );

	describe( 'nonexisting.js', () =>
	{
		require( __dirname + '/tests/nonexisting' );
	});

	for( let file of files )
	{
		if( file === 'nonexisting.js' || !file.match(/\.js$/) ){ continue; }

		describe( file, () =>
		{
			require( __dirname + '/tests/' + file );
		});
	}
});
