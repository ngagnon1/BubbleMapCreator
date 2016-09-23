var nodeCount = 0;

var AddButton = React.createClass({

  render: function() {
    return (
      <button type="button" value="Add" onClick={this.props.onUserInput} >Add Child</button>
    );
  }
});

var RemoveButton = React.createClass({

  render: function() {
    return (
      <button type="button" value="Remove" onClick={this.props.onUserInput} >Remove Node</button>
    );
  }
});

var Node = React.createClass({

  handleAddPress: function(addButton) {
    var newChildren = this.state.children;
    newChildren.unshift( {} ); 
    this.setState( { children: newChildren }, function(){
      this.props.parentHandleUpdate(this);
    } );
  },

  handlePopupPress: function(editButton){
    this.props.popupHandlePress(this);
  },

  handleDescriptionChange: function(textarea){
    var str = CKEDITOR.instances['popupEditor'].getData();
    this.setState( {description:str}, function(){
      this.props.parentHandleUpdate(this);
    } );
  },

  handleRemovePress: function(removeButton) {
    this.props.parentHandleRemove(this);
  },

  handleChildRemovePress: function(removeChild){
    var newChildren = [];
    this.state.children.forEach( function(child){
      if(child.nodeId != removeChild.props.nodeId ){
        newChildren.push( child );
      }
    } );
    this.setState( {children: newChildren}, function(){
      this.props.parentHandleUpdate(this);
    }
    );
    
  },

  handleChildUpdate: function(updateChild){
    var newChildren = [];
    this.state.children.forEach( function(child){
      if(child.nodeId == updateChild.props.nodeId ){
        child.children = updateChild.state.children;
        child.name = updateChild.state.name;
        child.size = updateChild.state.size;
        child.description = updateChild.state.description;
        newChildren.push( {
          name: updateChild.state.name,
          size: updateChild.state.size,
          description: updateChild.state.description,
          children: updateChild.state.children,
          nodeId: updateChild.props.nodeId
        } );
      }
      else{
        newChildren.push( child );
      }
    } );
    this.setState( {children: newChildren}, function(){
      this.props.parentHandleUpdate(this);
    } );
  },

  handleNameChange: function(e){
    this.setState( {name:e.target.value}, function(){ this.props.parentHandleUpdate(this); } );
  },

  handleSizeChange: function(e){
    this.setState( {size:e.target.value}, function(){ this.props.parentHandleUpdate(this); } );
  },

  getInitialState: function() {

    var children = typeof(this.props.children) != "undefined" ? this.props.children: [];
    var name = typeof(this.props.name) != "undefined"? this.props.name: "";
    var size = typeof(this.props.size) != "undefined"? this.props.size: "";
    var description = typeof(this.props.description) != "undefined"? this.props.description: "";

    return {
      children: children,
      name: name,
      size: size,
      description: description
    };
  },

  render: function() {
    var children = [];
    nodeCount++;
    var myRemoveHandler = this.handleChildRemovePress;
    var myUpdateHandler = this.handleChildUpdate;
    var myId = this.props.nodeId;
    var myPopupHandler = this.props.popupHandlePress;
    this.state.children.forEach( function(child){
      if(typeof(child.nodeId) == "undefined" ){
        child.nodeId = "nodeNum"+nodeCount;
        nodeCount++;
      }
      children.push( 
          <li key={child.nodeId}>
            <Node 
              children={child.children} 
              parentHandleRemove={myRemoveHandler}
              parentHandleUpdate={myUpdateHandler}
              nodeId={child.nodeId}
              parentNodeId={myId}
              name={child.name}
              size={child.size}
              description={child.description}
              parentNodeId={myId}
              popupHandlePress={myPopupHandler}
            /> 
          </li>
        );
    } );
    var sizeType = "text";
    if( this.state.children.length ){
      sizeType = "hidden";
    }
    var remove = <RemoveButton onUserInput={this.handleRemovePress} />;
    if( typeof(this.props.isRoot) != "undefined" && this.props.isRoot ){
      remove = null;
    }
    return (
      <div>
        <div>
          <input type="text" value={this.state.name} placeholder="Name" onChange={this.handleNameChange} />
          <input type={sizeType} value={this.state.size} placeholder="Size" size="4" onChange={this.handleSizeChange} />
          <AddButton onUserInput={this.handleAddPress} />
          {remove}
          <button type="button" data-toggle="modal" data-target="#myModal" onClick={this.handlePopupPress} >Edit</button>
          <input type="hidden" value={this.props.parentNodeId}  />
        </div>
        <ul>
          {children}
        </ul>
      </div>
    );
  }
});

var StringifiedTextbox = React.createClass({

  prepareOutput: function(node){
    var ret = {};
    if( typeof(node.name) != "undefined" ){
      ret.name = node.name;
    }
    if( typeof(node.children) != "undefined" ){
      if( node.children.length ){
        ret.children = [];
        var myFunc = this.prepareOutput;
        node.children.forEach( function(child){
          ret.children.push( myFunc(child) );
        } );
      }
    }
    if( typeof(ret.children) == "undefined" && typeof(node.size) != "undefined" ){
      ret.size = node.size;
    }

    ret.description = node.description;

    return ret;
  },

  render: function() {
    var jsonVal = JSON.stringify(this.prepareOutput(this.props.rootNode), null, 2);
    return (
      <div>
        <pre>{jsonVal}</pre>
        <input type="hidden" name="saveVal" value={jsonVal} />
      </div>
    );
  }
});

var EditPopup = React.createClass({

  render: function() {
    var jsonVal = JSON.stringify(this.prepareOutput(this.props.rootNode), null, 2);
    return (
      <div>
        <pre>{jsonVal}</pre>
        <input type="hidden" name="saveVal" value={jsonVal} />
      </div>
    );
  }
});

var NodeEditor = React.createClass({
  getInitialState: function() {
    return {
      rootNode: this.props.rootNode,
      name: this.props.name
    };
  },

  handleNewPress: function(addButton) {
    loadMap({});
  },

  handleLoadPress: function(addButton) {
    var nodeEditor = this;
    $.ajax({
      url: '/argmap/api/v1/TestBubbleMap',
      type: 'GET',
      success: function(data) { 

        data.TestBubbleMapSet.forEach(function(map){
          if( map.Name == nodeEditor.state.name ){
            console.log(map);
            $.ajax({
              url: '/argmap/api/v1/TestBubbleMap/'+map.TestBubbleMapId,
              type: 'GET',
              success: function(data) { 
                var newRoot = JSON.parse(data.TestBubbleMap.Content);
                loadMap(newRoot,data.TestBubbleMap.Name,data.TestBubbleMap.TestBubbleMapId);
                alert( "Map Loaded" );
              }
            });
          }
        });
      }
    });
  },

  handleRootUpdate: function(root){
    var newRoot = this.state.rootNode;
    newRoot.children = root.state.children;
    newRoot.name = root.state.name;
    newRoot.size = root.state.size;
    newRoot.description = root.state.description;
    this.setState( { rootNode: newRoot } );
  },

  handleSavePress: function(root){
    if( this.props.mapId > 0 ){
      $.ajax({
        url: '/argmap/api/v1/TestBubbleMap/1',
        type: 'PUT',
        data: {
          TestBubbleMap: {
            Name: this.state.name,
            Content: JSON.stringify(this.state.rootNode)
          }
        }, // or $('#myform').serializeArray()
        success: function(data) { 
          alert( "Map Saved" );
        }
      });
    }
    else{
      $.ajax({
        url: '/argmap/api/v1/TestBubbleMap',
        type: 'POST',
        data: {
          TestBubbleMap: {
            Name: this.state.name,
            Content: JSON.stringify(this.state.rootNode)
          }
        }, // or $('#myform').serializeArray()
        success: function(data) { 
          alert( "Map Created" );
        }
      });
    }
  },

  handleRootRemove: function(root){
  },

  handleNameChange: function(e){
    this.setState( {name:e.target.value} );
  },

  handlePopupPress: function(node){
    this.setState( {popupText:node.state.description, popupNode:node} );
    CKEDITOR.instances['popupEditor'].setData(node.state.description);
  },

  handleDescriptionChange: function(textarea){
    var str = CKEDITOR.instances['popupEditor'].getData();
    this.setState( {popupText:str} );
    this.state.popupNode.handleDescriptionChange(textarea);
  },

  render: function() {
    var nodeId = "nodeNum"+nodeCount++;
    ckCallbackFunc = this.handleDescriptionChange;
    return (
      <div>
        <div>
          <button type="button" id="newButton" onClick={this.handleNewPress} >New</button>
          <input type="text" placeholder="Map Name" id="mapName" value={this.state.name} onChange={this.handleNameChange} />
          <button type="button" id="loadButton" onClick={this.handleLoadPress} >Load</button>
          <button type="button" id="saveButton" onClick={this.handleSavePress} >Save</button>
        </div>
        <Node 
          parentHandleRemove={this.handleRootRemove} 
          parentHandleUpdate={this.handleRootUpdate} 
          size={this.state.rootNode.size}
          description={this.state.rootNode.description}
          name={this.state.rootNode.name}
          children={this.state.rootNode.children}
          nodeId={nodeId}
          parentNodeId={null}
          isRoot={true}
          popupHandlePress={this.handlePopupPress}
          />
        <StringifiedTextbox rootNode={this.state.rootNode} />

        <div id="myModal" className="modal fade" role="dialog">
          <div className="modal-dialog">

            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Modal Header</h4>
              </div>
              <div className="modal-body">
                <textarea  name="popupEditor" id="popupEditor" value={this.state.popupText} onChange={this.handleDescriptionChange}></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
});

var ckCallbackFunc = null;
function loadMap(def,pMapName,pMapId){
  var id = (new Date().getTime()).toString(16);
  var mapId = typeof(pMapId) != "undefined"? pMapId: -1;
  var mapName = typeof(pMapName) != "undefined"? pMapName: "";
  ReactDOM.render(
      <NodeEditor rootNode={def} key={id} mapId={mapId} name={mapName} />,
      document.getElementById('container')
    );
  CKEDITOR.replace( 'popupEditor' );
  CKEDITOR.instances['popupEditor'].on('change', function(myArg) { ckCallbackFunc(myArg); });
}

$.getJSON( DATA_URL, function(data){
  loadMap({});
} );

