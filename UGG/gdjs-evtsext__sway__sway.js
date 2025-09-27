
gdjs.evtsExt__Sway__Sway = gdjs.evtsExt__Sway__Sway || {};

/**
 * Behavior generated from Sway
 */
gdjs.evtsExt__Sway__Sway.Sway = class Sway extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__Sway__Sway.Sway.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.AngleLeft = behaviorData.AngleLeft !== undefined ? behaviorData.AngleLeft : Number("-5") || 0;
    this._behaviorData.AngleRight = behaviorData.AngleRight !== undefined ? behaviorData.AngleRight : Number("5") || 0;
    this._behaviorData.AngleTimeMin = behaviorData.AngleTimeMin !== undefined ? behaviorData.AngleTimeMin : Number("1") || 0;
    this._behaviorData.AngleTimeMax = behaviorData.AngleTimeMax !== undefined ? behaviorData.AngleTimeMax : Number("3") || 0;
    this._behaviorData.YScaleMin = behaviorData.YScaleMin !== undefined ? behaviorData.YScaleMin : Number("1") || 0;
    this._behaviorData.YScaleMax = behaviorData.YScaleMax !== undefined ? behaviorData.YScaleMax : Number("1.2") || 0;
    this._behaviorData.YScaleTimeMin = behaviorData.YScaleTimeMin !== undefined ? behaviorData.YScaleTimeMin : Number("1") || 0;
    this._behaviorData.YScaleTimeMax = behaviorData.YScaleTimeMax !== undefined ? behaviorData.YScaleTimeMax : Number("3") || 0;
    this._behaviorData.TweenBehavior = behaviorData.TweenBehavior !== undefined ? behaviorData.TweenBehavior : "";
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.AngleLeft !== newBehaviorData.AngleLeft)
      this._behaviorData.AngleLeft = newBehaviorData.AngleLeft;
    if (oldBehaviorData.AngleRight !== newBehaviorData.AngleRight)
      this._behaviorData.AngleRight = newBehaviorData.AngleRight;
    if (oldBehaviorData.AngleTimeMin !== newBehaviorData.AngleTimeMin)
      this._behaviorData.AngleTimeMin = newBehaviorData.AngleTimeMin;
    if (oldBehaviorData.AngleTimeMax !== newBehaviorData.AngleTimeMax)
      this._behaviorData.AngleTimeMax = newBehaviorData.AngleTimeMax;
    if (oldBehaviorData.YScaleMin !== newBehaviorData.YScaleMin)
      this._behaviorData.YScaleMin = newBehaviorData.YScaleMin;
    if (oldBehaviorData.YScaleMax !== newBehaviorData.YScaleMax)
      this._behaviorData.YScaleMax = newBehaviorData.YScaleMax;
    if (oldBehaviorData.YScaleTimeMin !== newBehaviorData.YScaleTimeMin)
      this._behaviorData.YScaleTimeMin = newBehaviorData.YScaleTimeMin;
    if (oldBehaviorData.YScaleTimeMax !== newBehaviorData.YScaleTimeMax)
      this._behaviorData.YScaleTimeMax = newBehaviorData.YScaleTimeMax;
    if (oldBehaviorData.TweenBehavior !== newBehaviorData.TweenBehavior)
      this._behaviorData.TweenBehavior = newBehaviorData.TweenBehavior;

    return true;
  }

  // Network sync:
  getNetworkSyncData() {
    return {
      ...super.getNetworkSyncData(),
      props: {
        
    AngleLeft: this._behaviorData.AngleLeft,
    AngleRight: this._behaviorData.AngleRight,
    AngleTimeMin: this._behaviorData.AngleTimeMin,
    AngleTimeMax: this._behaviorData.AngleTimeMax,
    YScaleMin: this._behaviorData.YScaleMin,
    YScaleMax: this._behaviorData.YScaleMax,
    YScaleTimeMin: this._behaviorData.YScaleTimeMin,
    YScaleTimeMax: this._behaviorData.YScaleTimeMax,
    TweenBehavior: this._behaviorData.TweenBehavior,
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData) {
    super.updateFromNetworkSyncData(networkSyncData);
    
    if (networkSyncData.props.AngleLeft !== undefined)
      this._behaviorData.AngleLeft = networkSyncData.props.AngleLeft;
    if (networkSyncData.props.AngleRight !== undefined)
      this._behaviorData.AngleRight = networkSyncData.props.AngleRight;
    if (networkSyncData.props.AngleTimeMin !== undefined)
      this._behaviorData.AngleTimeMin = networkSyncData.props.AngleTimeMin;
    if (networkSyncData.props.AngleTimeMax !== undefined)
      this._behaviorData.AngleTimeMax = networkSyncData.props.AngleTimeMax;
    if (networkSyncData.props.YScaleMin !== undefined)
      this._behaviorData.YScaleMin = networkSyncData.props.YScaleMin;
    if (networkSyncData.props.YScaleMax !== undefined)
      this._behaviorData.YScaleMax = networkSyncData.props.YScaleMax;
    if (networkSyncData.props.YScaleTimeMin !== undefined)
      this._behaviorData.YScaleTimeMin = networkSyncData.props.YScaleTimeMin;
    if (networkSyncData.props.YScaleTimeMax !== undefined)
      this._behaviorData.YScaleTimeMax = networkSyncData.props.YScaleTimeMax;
    if (networkSyncData.props.TweenBehavior !== undefined)
      this._behaviorData.TweenBehavior = networkSyncData.props.TweenBehavior;
  }

  // Properties:
  
  _getAngleLeft() {
    return this._behaviorData.AngleLeft !== undefined ? this._behaviorData.AngleLeft : Number("-5") || 0;
  }
  _setAngleLeft(newValue) {
    this._behaviorData.AngleLeft = newValue;
  }
  _getAngleRight() {
    return this._behaviorData.AngleRight !== undefined ? this._behaviorData.AngleRight : Number("5") || 0;
  }
  _setAngleRight(newValue) {
    this._behaviorData.AngleRight = newValue;
  }
  _getAngleTimeMin() {
    return this._behaviorData.AngleTimeMin !== undefined ? this._behaviorData.AngleTimeMin : Number("1") || 0;
  }
  _setAngleTimeMin(newValue) {
    this._behaviorData.AngleTimeMin = newValue;
  }
  _getAngleTimeMax() {
    return this._behaviorData.AngleTimeMax !== undefined ? this._behaviorData.AngleTimeMax : Number("3") || 0;
  }
  _setAngleTimeMax(newValue) {
    this._behaviorData.AngleTimeMax = newValue;
  }
  _getYScaleMin() {
    return this._behaviorData.YScaleMin !== undefined ? this._behaviorData.YScaleMin : Number("1") || 0;
  }
  _setYScaleMin(newValue) {
    this._behaviorData.YScaleMin = newValue;
  }
  _getYScaleMax() {
    return this._behaviorData.YScaleMax !== undefined ? this._behaviorData.YScaleMax : Number("1.2") || 0;
  }
  _setYScaleMax(newValue) {
    this._behaviorData.YScaleMax = newValue;
  }
  _getYScaleTimeMin() {
    return this._behaviorData.YScaleTimeMin !== undefined ? this._behaviorData.YScaleTimeMin : Number("1") || 0;
  }
  _setYScaleTimeMin(newValue) {
    this._behaviorData.YScaleTimeMin = newValue;
  }
  _getYScaleTimeMax() {
    return this._behaviorData.YScaleTimeMax !== undefined ? this._behaviorData.YScaleTimeMax : Number("3") || 0;
  }
  _setYScaleTimeMax(newValue) {
    this._behaviorData.YScaleTimeMax = newValue;
  }
  _getTweenBehavior() {
    return this._behaviorData.TweenBehavior !== undefined ? this._behaviorData.TweenBehavior : "";
  }
  _setTweenBehavior(newValue) {
    this._behaviorData.TweenBehavior = newValue;
  }
}

/**
 * Shared data generated from Sway
 */
gdjs.evtsExt__Sway__Sway.Sway.SharedData = class SwaySharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__Sway__Sway.Sway.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._Sway_SwaySharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._Sway_SwaySharedData = new gdjs.evtsExt__Sway__Sway.Sway.SharedData(
      initialData
    );
  }
  return instanceContainer._Sway_SwaySharedData;
}

// Methods:
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{



}


{



}


{



}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectScaleYTween("YScaleMax", (gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleMax()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleTimeMax()) * 1000), false, false);
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectAngleTween("AngleRight", (gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleRight()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMax()) * 1000), false);
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreated = function(parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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

gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.onCreatedContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{



}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).hasFinished("AngleRight") ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).removeTween("AngleRight");
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectAngleTween("AngleLeft", (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleLeft()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMax()) * 1000), false);
}
}
}

}


{



}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).hasFinished("AngleLeft") ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).removeTween("AngleLeft");
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectAngleTween("AngleRight", (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleRight()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleTimeMax()) * 1000), false);
}
}
}

}


{



}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).hasFinished("YScaleMax") ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).removeTween("YScaleMax");
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectScaleYTween("YScaleMin", (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleMin()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleTimeMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleTimeMax()) * 1000), false, false);
}
}
}

}


{



}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).hasFinished("YScaleMin") ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).removeTween("YScaleMin");
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("TweenBehavior")).addObjectScaleYTween("YScaleMax", (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleMax()), "easeInOutSine", gdjs.randomInRange((gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleTimeMin()) * 1000, (gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getYScaleTimeMax()) * 1000), false, false);
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEvents = function(parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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

gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleLeft((Number(eventsFunctionContext.getArgument("AngleLeftChanged")) || 0));
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleRight((Number(eventsFunctionContext.getArgument("AngleRightChanged")) || 0));
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngle = function(AngleLeftChanged, AngleRightChanged, parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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
if (argName === "AngleLeftChanged") return AngleLeftChanged;
if (argName === "AngleRightChanged") return AngleRightChanged;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleTimeMin((Number(eventsFunctionContext.getArgument("AngleTimeMinChanged")) || 0));
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleTimeMax((Number(eventsFunctionContext.getArgument("AngleTimeMaxChanged")) || 0));
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTime = function(AngleTimeMinChanged, AngleTimeMaxChanged, parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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
if (argName === "AngleTimeMinChanged") return AngleTimeMinChanged;
if (argName === "AngleTimeMaxChanged") return AngleTimeMaxChanged;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayAngleTimeContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setYScaleMin((Number(eventsFunctionContext.getArgument("YScaleMinChanged")) || 0));
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setYScaleMax((Number(eventsFunctionContext.getArgument("YScaleMaxChanged")) || 0));
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScale = function(YScaleMinChanged, YScaleMaxChanged, parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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
if (argName === "YScaleMinChanged") return YScaleMinChanged;
if (argName === "YScaleMaxChanged") return YScaleMaxChanged;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext = {};
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1= [];
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects2= [];


gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setYScaleTimeMax((Number(eventsFunctionContext.getArgument("YScaleTimeMaxChanged")) || 0));
}
}
{for(var i = 0, len = gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setYScaleTimeMin((Number(eventsFunctionContext.getArgument("YScaleTimeMinChanged")) || 0));
}
}
}

}


};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTime = function(YScaleTimeMinChanged, YScaleTimeMaxChanged, parentEventsFunctionContext) {

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
, "TweenBehavior": this._getTweenBehavior()
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("Sway"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("Sway"),
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
if (argName === "YScaleTimeMinChanged") return YScaleTimeMinChanged;
if (argName === "YScaleTimeMaxChanged") return YScaleTimeMaxChanged;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__Sway__Sway.Sway.prototype.ChangeSwayYScaleTimeContext.GDObjectObjects2.length = 0;


return;
}

gdjs.evtsExt__Sway__Sway.Sway.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerBehavior("Sway::Sway", gdjs.evtsExt__Sway__Sway.Sway);
