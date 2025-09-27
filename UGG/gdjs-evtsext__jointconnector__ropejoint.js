
gdjs.evtsExt__JointConnector__RopeJoint = gdjs.evtsExt__JointConnector__RopeJoint || {};

/**
 * Behavior generated from Rope joint connector
 */
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint = class RopeJoint extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.MaxDistance = Number("") || 0;
    this._behaviorData.Frequency = behaviorData.Frequency !== undefined ? behaviorData.Frequency : Number("20") || 0;
    this._behaviorData.DampingRatio = behaviorData.DampingRatio !== undefined ? behaviorData.DampingRatio : Number("1") || 0;
    this._behaviorData.BreakingForce = behaviorData.BreakingForce !== undefined ? behaviorData.BreakingForce : Number("0") || 0;
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.MaxDistance !== newBehaviorData.MaxDistance)
      this._behaviorData.MaxDistance = newBehaviorData.MaxDistance;
    if (oldBehaviorData.Frequency !== newBehaviorData.Frequency)
      this._behaviorData.Frequency = newBehaviorData.Frequency;
    if (oldBehaviorData.DampingRatio !== newBehaviorData.DampingRatio)
      this._behaviorData.DampingRatio = newBehaviorData.DampingRatio;
    if (oldBehaviorData.BreakingForce !== newBehaviorData.BreakingForce)
      this._behaviorData.BreakingForce = newBehaviorData.BreakingForce;

    return true;
  }

  // Network sync:
  getNetworkSyncData() {
    return {
      ...super.getNetworkSyncData(),
      props: {
        
    MaxDistance: this._behaviorData.MaxDistance,
    Frequency: this._behaviorData.Frequency,
    DampingRatio: this._behaviorData.DampingRatio,
    BreakingForce: this._behaviorData.BreakingForce,
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData) {
    super.updateFromNetworkSyncData(networkSyncData);
    
    if (networkSyncData.props.MaxDistance !== undefined)
      this._behaviorData.MaxDistance = networkSyncData.props.MaxDistance;
    if (networkSyncData.props.Frequency !== undefined)
      this._behaviorData.Frequency = networkSyncData.props.Frequency;
    if (networkSyncData.props.DampingRatio !== undefined)
      this._behaviorData.DampingRatio = networkSyncData.props.DampingRatio;
    if (networkSyncData.props.BreakingForce !== undefined)
      this._behaviorData.BreakingForce = networkSyncData.props.BreakingForce;
  }

  // Properties:
  
  _getMaxDistance() {
    return this._behaviorData.MaxDistance !== undefined ? this._behaviorData.MaxDistance : Number("") || 0;
  }
  _setMaxDistance(newValue) {
    this._behaviorData.MaxDistance = newValue;
  }
  _getFrequency() {
    return this._behaviorData.Frequency !== undefined ? this._behaviorData.Frequency : Number("20") || 0;
  }
  _setFrequency(newValue) {
    this._behaviorData.Frequency = newValue;
  }
  _getDampingRatio() {
    return this._behaviorData.DampingRatio !== undefined ? this._behaviorData.DampingRatio : Number("1") || 0;
  }
  _setDampingRatio(newValue) {
    this._behaviorData.DampingRatio = newValue;
  }
  _getBreakingForce() {
    return this._behaviorData.BreakingForce !== undefined ? this._behaviorData.BreakingForce : Number("0") || 0;
  }
  _setBreakingForce(newValue) {
    this._behaviorData.BreakingForce = newValue;
  }
}

/**
 * Shared data generated from Rope joint connector
 */
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.SharedData = class RopeJointSharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._JointConnector_RopeJointSharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._JointConnector_RopeJointSharedData = new gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.SharedData(
      initialData
    );
  }
  return instanceContainer._JointConnector_RopeJointSharedData;
}

// Methods:
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.mapOfGDgdjs_9546evtsExt_9595_9595JointConnector_9595_9595RopeJoint_9546RopeJoint_9546prototype_9546BreakJointIfNeededContext_9546GDObjectWithJointObjects1Objects = Hashtable.newFrom({"ObjectWithJoint": gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1});
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

/* Reuse gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1 */
/* Reuse gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1 */

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("PhysicsBehavior")).getJointReactionForce((gdjs.RuntimeObject.getVariableNumber(((gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getVariables()).get("JointID")))) >= (( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBreakingForce()) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[k] = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1 */
/* Reuse gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1 */
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("PhysicsBehavior")).removeJoint((gdjs.RuntimeObject.getVariableNumber(((gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getVariables()).get("JointID"))));
}
}
}

}


};gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("ObjectWithJoint"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.linkedObjects.pickObjectsLinkedTo(runtimeScene, gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.mapOfGDgdjs_9546evtsExt_9595_9595JointConnector_9595_9595RopeJoint_9546RopeJoint_9546prototype_9546BreakJointIfNeededContext_9546GDObjectWithJointObjects1Objects, (gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length !== 0 ? gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0] : null), eventsFunctionContext);
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.eventsList0(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeeded = function(ObjectWithJoint, PhysicsBehavior, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "ObjectWithJoint": ObjectWithJoint
},
  _objectArraysMap: {
"Object": thisObjectList
, "ObjectWithJoint": gdjs.objectsListsToArray(ObjectWithJoint)
},
  _behaviorNamesMap: {
"Behavior": Behavior
, "PhysicsBehavior": PhysicsBehavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.eventsList1(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1);
{eventsFunctionContext.returnValue = (( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFrequency());}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.Frequency = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.FrequencyContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setFrequency((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequency = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetFrequencyContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1);
{eventsFunctionContext.returnValue = (( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getDampingRatio());}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatio = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.DampingRatioContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setDampingRatio((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatio = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetDampingRatioContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1);
{eventsFunctionContext.returnValue = (( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBreakingForce());}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForce = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.BreakingForceContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setBreakingForce((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForce = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetBreakingForceContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1);
{eventsFunctionContext.returnValue = (( gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getMaxDistance());}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistance = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.MaxDistanceContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext = {};
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMaxDistance((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistance = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("JointConnector"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("JointConnector"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.SetMaxDistanceContext.GDObjectObjects2.length = 0;


return;
}

gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerBehavior("JointConnector::RopeJoint", gdjs.evtsExt__JointConnector__RopeJoint.RopeJoint);
