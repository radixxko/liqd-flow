'use strict';
const fs = require('fs');

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

describe( 'Tests', ( done ) =>
{
	var files = fs.readdirSync( __dirname + '/tests' );

	for( let file of files )
	{
		if( !file.match(/\.js$/)/** / || ![ 'callbacks.js', 'freeze.js', 'nonexisting.js' ].includes( file )/**/ ){ continue; }
		//if( !file.match(/\.js$/)/**/ || ![ 'debug.js' ].includes( file )/**/ ){ continue; }

		describe( file, () =>
		{
			require( __dirname + '/tests/' + file );
		});
	}
});
