
if (typeof gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects !== "undefined") {
  gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects = {};
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1= [];
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects2= [];
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1= [];
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects2= [];


gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Player"), gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Source"), gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1);
{gdjs.evtTools.sound.setSoundOnChannelVolume(runtimeScene, (Number(eventsFunctionContext.getArgument("Channel")) || 0), (gdjs.RuntimeObject.getVariableNumber(((gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[0].getVariables()).get("__SoundVolumeBasedOnDistance").getChild("Audio"))));
}
{for(var i = 0, len = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length ;i < len;++i) {
    gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].returnVariable(gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariables().get("__SoundVolumeBasedOnDistance").getChild("Audio")).setNumber((Number(eventsFunctionContext.getArgument("Full")) || 0) - gdjs.evtTools.common.distanceBetweenPositions((( gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1.length === 0 ) ? 0 :gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1[0].getAABBCenterX()), (( gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1.length === 0 ) ? 0 :gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1[0].getAABBCenterY()), (gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getAABBCenterX()), (gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getAABBCenterY())) / (Number(eventsFunctionContext.getArgument("Range")) || 0));
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Source"), gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariableNumber(gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariables().get("__SoundVolumeBasedOnDistance").getChild("Audio")) < 0 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[k] = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1 */
{for(var i = 0, len = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length ;i < len;++i) {
    gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].returnVariable(gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariables().get("__SoundVolumeBasedOnDistance").getChild("Audio")).setNumber(0);
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Source"), gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariableNumber(gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariables().get("__SoundVolumeBasedOnDistance").getChild("Audio")) > 100 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[k] = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1 */
{for(var i = 0, len = gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length ;i < len;++i) {
    gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].returnVariable(gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1[i].getVariables().get("__SoundVolumeBasedOnDistance").getChild("Audio")).setNumber(100);
}
}
}

}


};

gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.func = function(runtimeScene, Player, Source, Channel, Range, Full, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
"Player": Player
, "Source": Source
},
  _objectArraysMap: {
"Player": gdjs.objectsListsToArray(Player)
, "Source": gdjs.objectsListsToArray(Source)
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("SoundVolumeBasedOnDistance"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("SoundVolumeBasedOnDistance"),
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
if (argName === "Channel") return Channel;
if (argName === "Range") return Range;
if (argName === "Full") return Full;
    return "";
  },
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects2.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects2.length = 0;

gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects1.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDPlayerObjects2.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects1.length = 0;
gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.GDSourceObjects2.length = 0;


return;
}

gdjs.evtsExt__SoundVolumeBasedOnDistance__SoundObjects.registeredGdjsCallbacks = [];