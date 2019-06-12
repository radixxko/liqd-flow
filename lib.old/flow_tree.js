'use strict';

const FlowTreeNodes = new Map();

class FlowTreeNode
{
    constructor( id, parent, scope )
    {
        FlowTreeNodes.set( id, this );

        this.id = id;
        this.parent = parent;
        this.children = new Set();
        this.scope = scope;
        this.alive = true;

        parent && parent.children.add( this );
    }

    destroy()
    {
        this.alive = false;

        FlowTreeNodes.detete( this.id );

        if( this.children )
        {
            for( let child of this.children )
            {
                child.parent = this.parent;
                this.parent && this.parent.children.add( this );
            }

            this.children = this.scope = undefined;
        }

        if( this.parent )
        {
            this.parent.children.delete( this );

            if( this.parent.children.size === 0 )
            {
                this.parent.destroy();
            }
        }
    }

    path()
    {
        let node = this, path = [ node.id ];

        while( node = node.parent )
        {
            path.unshift( node.id );
        }

        return path.join(' > ');
    }

    clone()
    {

    }
}

module.exports = class FlowTree
{
    static add( id, parent )
    {
        new FlowTreeNode( this.nodes, id, parent );
    }

    static delete( id )
    {
        let node = FlowTreeNodes.get( id );

        if( node )
        {
            node.destroy();
        }
    }
}
