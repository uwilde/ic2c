
if (typeof gdjs.evtsExt__AnimationSystem__DoorIsOpen !== "undefined") {
  gdjs.evtsExt__AnimationSystem__DoorIsOpen.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__AnimationSystem__DoorIsOpen = {};
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1= [];
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects2= [];


gdjs.evtsExt__AnimationSystem__DoorIsOpen.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1[i].getVariableNumber(gdjs.VariablesContainer.badVariable) == 2 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1[k] = gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
{eventsFunctionContext.returnValue = true;}
}

}


};

gdjs.evtsExt__AnimationSystem__DoorIsOpen.func = function(runtimeScene, Object, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": gdjs.objectsListsToArray(Object)
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("AnimationSystem"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("AnimationSystem"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1.length = 0;
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects2.length = 0;

gdjs.evtsExt__AnimationSystem__DoorIsOpen.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects1.length = 0;
gdjs.evtsExt__AnimationSystem__DoorIsOpen.GDObjectObjects2.length = 0;


return !!eventsFunctionContext.returnValue;
}

gdjs.evtsExt__AnimationSystem__DoorIsOpen.registeredGdjsCallbacks = [];