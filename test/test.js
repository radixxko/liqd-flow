const Flow = require('../lib/flow');
const http = require('http');

function render()
{
	console.log( `render requestID is ${Flow.get('requestID')}` );

	return new Promise( resolve =>
	{
		setTimeout( () =>
		{
			resolve( `Hello ${Flow.get('requestID')}` );
		})
	});
}

async function dispatch( req, res )
{
	res.end( await render() );

	console.log( `dispatch requestID is ${Flow.get('requestID')}` );
}

function startServer()
{
	var requestID = 0;

	http.createServer( ( req, res ) =>
	{
		Flow.start( dispatch.bind(null, req, res), { requestID: ++requestID } );
	})
	.listen(8082);
}

startServer();
