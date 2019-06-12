'use strict';

const FlowTreeNodes = new Map();

// TODO pridat ze zacal scope naj sa values setuju do parent scope

class FlowTreeNode
{
    constructor( id, parent )
    {
        //console.log( 'Created ' + id );

        FlowTreeNodes.set( id, this );

        this.id = id;
        this.parent = parent;
        this.children = new Set();
        this.scope = undefined;
        this.alive = true;

        parent && parent.children.add( this );
    }

    destroy()
    {
        this.alive = false;

        if( !this.scope || !this.children || this.children.size === 0 )
        {
            FlowTreeNodes.delete( this.id );

            //if( this.children )
            {
                for( let child of this.children )
                {
                    child.parent = this.parent;
                    this.parent && this.parent.children.add( this );
                }

                //this.children = this.scope = undefined; TODO zmazat aj scope pre rychlejsie uvolnenie pamate

                this.children.clear();
            }

            if( this.parent && this.parent.children )
            {
                this.parent.children.delete( this );

                if( this.parent.children.size === 0 && !this.parent.alive )
                {
                    this.parent.destroy();
                }
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

        return path;
    }

    fullScope()
    {
        let scope = {};

        if( this.parent ){ Object.assign( scope, this.parent.fullScope()); }
        if( this.scope ){ Object.assign( scope, this.scope ); }

        return scope;
    }

    frozen( key )
    {
        return ( this.scope && this.scope[key]) ? this.scope[key].frozen : this.parent ? this.parent.frozen( key ) : false;
    }

    set( key, value, frozen )
    {
        if( !this.frozen( key ))
        {
            if( !this.scope ){ this.scope = {}}

            if( value && typeof value === 'object' && frozen && !Object.isFrozen( value ))
    		{
    			Object.freeze( value );
    		}

            this.scope[key] = { value, frozen: Boolean( frozen )};

            return true;
        }

        return false;
    }

    get( key )
    {
        return ( this.scope && this.scope[key]) ? this.scope[key].value : this.parent ? this.parent.get( key ) : undefined;
    }
}

module.exports = class FlowTree
{
    static has( id )
    {
        return FlowTreeNodes.has( id );
    }

    static add( id, parent )
    {
        if( !FlowTreeNodes.has( id ))
        {
            new FlowTreeNode( id, FlowTreeNodes.get( parent ));
        }
    }

    static delete( id )
    {
        let node = FlowTreeNodes.get( id );

        return node && node.destroy();
    }

    static set( id, key, value, frozen )
    {
        let node = FlowTreeNodes.get( id );

        return node ? node.set( key, value, frozen ) : false;
    }

    static get( id, key )
    {
        let node = FlowTreeNodes.get( id );

        return node ? node.get( key ) : undefined;
    }

    static scope( id )
    {
        let node = FlowTreeNodes.get( id );

        return node ? node.fullScope() : undefined;
    }

    static path( id )
    {
        let node = FlowTreeNodes.get( id );

        return node ? node.path() : [];
    }

    static size()
    {
        return FlowTreeNodes.size;
    }
}
