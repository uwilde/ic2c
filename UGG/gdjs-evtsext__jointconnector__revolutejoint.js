
gdjs.evtsExt__JointConnector__RevoluteJoint = gdjs.evtsExt__JointConnector__RevoluteJoint || {};

/**
 * Behavior generated from Revolute joint connector
 */
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint = class RevoluteJoint extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.JointID = Number("") || 0;
    this._behaviorData.MotorEnabled = behaviorData.MotorEnabled !== undefined ? behaviorData.MotorEnabled : false;
    this._behaviorData.MotorTorque = behaviorData.MotorTorque !== undefined ? behaviorData.MotorTorque : Number("0") || 0;
    this._behaviorData.MotorSpeed = behaviorData.MotorSpeed !== undefined ? behaviorData.MotorSpeed : Number("0") || 0;
    this._behaviorData.AngleLimitsEnabled = behaviorData.AngleLimitsEnabled !== undefined ? behaviorData.AngleLimitsEnabled : false;
    this._behaviorData.ClockwiseAngleLimit = behaviorData.ClockwiseAngleLimit !== undefined ? behaviorData.ClockwiseAngleLimit : Number("0") || 0;
    this._behaviorData.CounterClockwiseAngleLimit = behaviorData.CounterClockwiseAngleLimit !== undefined ? behaviorData.CounterClockwiseAngleLimit : Number("0") || 0;
    this._behaviorData.BreakingForce = behaviorData.BreakingForce !== undefined ? behaviorData.BreakingForce : Number("0") || 0;
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.JointID !== newBehaviorData.JointID)
      this._behaviorData.JointID = newBehaviorData.JointID;
    if (oldBehaviorData.MotorEnabled !== newBehaviorData.MotorEnabled)
      this._behaviorData.MotorEnabled = newBehaviorData.MotorEnabled;
    if (oldBehaviorData.MotorTorque !== newBehaviorData.MotorTorque)
      this._behaviorData.MotorTorque = newBehaviorData.MotorTorque;
    if (oldBehaviorData.MotorSpeed !== newBehaviorData.MotorSpeed)
      this._behaviorData.MotorSpeed = newBehaviorData.MotorSpeed;
    if (oldBehaviorData.AngleLimitsEnabled !== newBehaviorData.AngleLimitsEnabled)
      this._behaviorData.AngleLimitsEnabled = newBehaviorData.AngleLimitsEnabled;
    if (oldBehaviorData.ClockwiseAngleLimit !== newBehaviorData.ClockwiseAngleLimit)
      this._behaviorData.ClockwiseAngleLimit = newBehaviorData.ClockwiseAngleLimit;
    if (oldBehaviorData.CounterClockwiseAngleLimit !== newBehaviorData.CounterClockwiseAngleLimit)
      this._behaviorData.CounterClockwiseAngleLimit = newBehaviorData.CounterClockwiseAngleLimit;
    if (oldBehaviorData.BreakingForce !== newBehaviorData.BreakingForce)
      this._behaviorData.BreakingForce = newBehaviorData.BreakingForce;

    return true;
  }

  // Network sync:
  getNetworkSyncData() {
    return {
      ...super.getNetworkSyncData(),
      props: {
        
    JointID: this._behaviorData.JointID,
    MotorEnabled: this._behaviorData.MotorEnabled,
    MotorTorque: this._behaviorData.MotorTorque,
    MotorSpeed: this._behaviorData.MotorSpeed,
    AngleLimitsEnabled: this._behaviorData.AngleLimitsEnabled,
    ClockwiseAngleLimit: this._behaviorData.ClockwiseAngleLimit,
    CounterClockwiseAngleLimit: this._behaviorData.CounterClockwiseAngleLimit,
    BreakingForce: this._behaviorData.BreakingForce,
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData) {
    super.updateFromNetworkSyncData(networkSyncData);
    
    if (networkSyncData.props.JointID !== undefined)
      this._behaviorData.JointID = networkSyncData.props.JointID;
    if (networkSyncData.props.MotorEnabled !== undefined)
      this._behaviorData.MotorEnabled = networkSyncData.props.MotorEnabled;
    if (networkSyncData.props.MotorTorque !== undefined)
      this._behaviorData.MotorTorque = networkSyncData.props.MotorTorque;
    if (networkSyncData.props.MotorSpeed !== undefined)
      this._behaviorData.MotorSpeed = networkSyncData.props.MotorSpeed;
    if (networkSyncData.props.AngleLimitsEnabled !== undefined)
      this._behaviorData.AngleLimitsEnabled = networkSyncData.props.AngleLimitsEnabled;
    if (networkSyncData.props.ClockwiseAngleLimit !== undefined)
      this._behaviorData.ClockwiseAngleLimit = networkSyncData.props.ClockwiseAngleLimit;
    if (networkSyncData.props.CounterClockwiseAngleLimit !== undefined)
      this._behaviorData.CounterClockwiseAngleLimit = networkSyncData.props.CounterClockwiseAngleLimit;
    if (networkSyncData.props.BreakingForce !== undefined)
      this._behaviorData.BreakingForce = networkSyncData.props.BreakingForce;
  }

  // Properties:
  
  _getJointID() {
    return this._behaviorData.JointID !== undefined ? this._behaviorData.JointID : Number("") || 0;
  }
  _setJointID(newValue) {
    this._behaviorData.JointID = newValue;
  }
  _getMotorEnabled() {
    return this._behaviorData.MotorEnabled !== undefined ? this._behaviorData.MotorEnabled : false;
  }
  _setMotorEnabled(newValue) {
    this._behaviorData.MotorEnabled = newValue;
  }
  _toggleMotorEnabled() {
    this._setMotorEnabled(!this._getMotorEnabled());
  }
  _getMotorTorque() {
    return this._behaviorData.MotorTorque !== undefined ? this._behaviorData.MotorTorque : Number("0") || 0;
  }
  _setMotorTorque(newValue) {
    this._behaviorData.MotorTorque = newValue;
  }
  _getMotorSpeed() {
    return this._behaviorData.MotorSpeed !== undefined ? this._behaviorData.MotorSpeed : Number("0") || 0;
  }
  _setMotorSpeed(newValue) {
    this._behaviorData.MotorSpeed = newValue;
  }
  _getAngleLimitsEnabled() {
    return this._behaviorData.AngleLimitsEnabled !== undefined ? this._behaviorData.AngleLimitsEnabled : false;
  }
  _setAngleLimitsEnabled(newValue) {
    this._behaviorData.AngleLimitsEnabled = newValue;
  }
  _toggleAngleLimitsEnabled() {
    this._setAngleLimitsEnabled(!this._getAngleLimitsEnabled());
  }
  _getClockwiseAngleLimit() {
    return this._behaviorData.ClockwiseAngleLimit !== undefined ? this._behaviorData.ClockwiseAngleLimit : Number("0") || 0;
  }
  _setClockwiseAngleLimit(newValue) {
    this._behaviorData.ClockwiseAngleLimit = newValue;
  }
  _getCounterClockwiseAngleLimit() {
    return this._behaviorData.CounterClockwiseAngleLimit !== undefined ? this._behaviorData.CounterClockwiseAngleLimit : Number("0") || 0;
  }
  _setCounterClockwiseAngleLimit(newValue) {
    this._behaviorData.CounterClockwiseAngleLimit = newValue;
  }
  _getBreakingForce() {
    return this._behaviorData.BreakingForce !== undefined ? this._behaviorData.BreakingForce : Number("0") || 0;
  }
  _setBreakingForce(newValue) {
    this._behaviorData.BreakingForce = newValue;
  }
}

/**
 * Shared data generated from Revolute joint connector
 */
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.SharedData = class RevoluteJointSharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._JointConnector_RevoluteJointSharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._JointConnector_RevoluteJointSharedData = new gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.SharedData(
      initialData
    );
  }
  return instanceContainer._JointConnector_RevoluteJointSharedData;
}

// Methods:
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setBreakingForce((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForce = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetBreakingForceContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.mapOfGDgdjs_9546evtsExt_9595_9595JointConnector_9595_9595RevoluteJoint_9546RevoluteJoint_9546prototype_9546BreakJointIfNeededContext_9546GDObjectWithJointObjects1Objects = Hashtable.newFrom({"ObjectWithJoint": gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1});
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

/* Reuse gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1 */
/* Reuse gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1 */

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("PhysicsBehavior")).getJointReactionForce((gdjs.RuntimeObject.getVariableNumber(((gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getVariables()).get("JointID")))) >= (( gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBreakingForce()) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[k] = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1 */
/* Reuse gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1 */
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("PhysicsBehavior")).removeJoint((gdjs.RuntimeObject.getVariableNumber(((gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0].getVariables()).get("JointID"))));
}
}
}

}


};gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("ObjectWithJoint"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.linkedObjects.pickObjectsLinkedTo(runtimeScene, gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.mapOfGDgdjs_9546evtsExt_9595_9595JointConnector_9595_9595RevoluteJoint_9546RevoluteJoint_9546prototype_9546BreakJointIfNeededContext_9546GDObjectWithJointObjects1Objects, (gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length !== 0 ? gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1[0] : null), eventsFunctionContext);
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.eventsList0(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeeded = function(ObjectWithJoint, PhysicsBehavior, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.eventsList1(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.BreakJointIfNeededContext.GDObjectWithJointObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorEnabled(false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !!eventsFunctionContext.getArgument("Value");
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorEnabled(true);
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotor = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableMotorContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorTorque((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrength = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorStrengthContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorSpeed((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeed = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorSpeedContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleLimitsEnabled(false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !!eventsFunctionContext.getArgument("Value");
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleLimitsEnabled(true);
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimits = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetEnableAngleLimitsContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setClockwiseAngleLimit((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimit = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetClockwiseAngleLimitContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCounterClockwiseAngleLimit((Number(eventsFunctionContext.getArgument("Value")) || 0));
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimit = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetCounterClockwiseAngleLimitContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getMotorEnabled() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1[k] = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
{eventsFunctionContext.returnValue = true;}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabled = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.MotorEnabledContext.GDObjectObjects2.length = 0;


return !!eventsFunctionContext.returnValue;
}
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext = {};
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects2= [];


gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !eventsFunctionContext.getArgument("Value");
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorEnabled(false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !!eventsFunctionContext.getArgument("Value");
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setMotorEnabled(true);
}
}
}

}


};

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabled = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.SetMotorEnabledContext.GDObjectObjects2.length = 0;


return;
}

gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerBehavior("JointConnector::RevoluteJoint", gdjs.evtsExt__JointConnector__RevoluteJoint.RevoluteJoint);
