
if (typeof gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents !== "undefined") {
  gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents = {};


gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.getCursorY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) <= gdjs.evtTools.camera.getCameraBorderTop(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) + gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin"));
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedY").setNumber(-(gdjs.evtsExt__EdgeScrollCamera__AbsoluteScrollSpeed.func(runtimeScene, gdjs.evtTools.camera.getCameraBorderTop(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.input.getCursorY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))), eventsFunctionContext)));
}
}

}


{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.getCursorY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) >= gdjs.evtTools.camera.getCameraBorderBottom(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin"));
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedY").setNumber(gdjs.evtsExt__EdgeScrollCamera__AbsoluteScrollSpeed.func(runtimeScene, gdjs.evtTools.camera.getCameraBorderBottom(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.input.getCursorY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))), eventsFunctionContext));
}
}

}


{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.getCursorX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) <= gdjs.evtTools.camera.getCameraBorderLeft(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) + gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin"));
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedX").setNumber(-(gdjs.evtsExt__EdgeScrollCamera__AbsoluteScrollSpeed.func(runtimeScene, gdjs.evtTools.camera.getCameraBorderLeft(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.input.getCursorX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))), eventsFunctionContext)));
}
}

}


{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.getCursorX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) >= gdjs.evtTools.camera.getCameraBorderRight(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin"));
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedX").setNumber(gdjs.evtsExt__EdgeScrollCamera__AbsoluteScrollSpeed.func(runtimeScene, gdjs.evtTools.camera.getCameraBorderRight(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) - gdjs.evtTools.input.getCursorX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))), eventsFunctionContext));
}
}

}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseInsideCanvas(runtimeScene);
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList0(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList2 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedX")) != 0;
if (isConditionTrue_0) {
{gdjs.evtTools.camera.setCameraX(runtimeScene, gdjs.evtTools.camera.getCameraX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) + (gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedX")) * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)), gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera")));
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedY")) != 0;
if (isConditionTrue_0) {
{gdjs.evtTools.camera.setCameraY(runtimeScene, gdjs.evtTools.camera.getCameraY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) + (gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedY")) * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)), gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera")));
}
}

}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList3 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList1(runtimeScene, eventsFunctionContext);
}


{


gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList2(runtimeScene, eventsFunctionContext);
}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList4 = function(runtimeScene, eventsFunctionContext) {

{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{let isConditionTrue_1 = false;
isConditionTrue_0 = false;
{
isConditionTrue_1 = gdjs.evtTools.input.getCursorX(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) != 0;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
}
}
{
isConditionTrue_1 = gdjs.evtTools.input.getCursorY(runtimeScene, gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer")), gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera"))) != 0;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
}
}
{
}
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = eventsFunctionContext.getOnceTriggers().triggerOnce(136946892);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.variable.setVariableBoolean(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CursorMoved"), true);
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableBoolean(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CursorMoved"), true);
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedX").setNumber(0);
}
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("CurrentScrollSpeedY").setNumber(0);
}

{ //Subevents
gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList3(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList5 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableBoolean(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Enabled"), true);
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList4(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList6 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList5(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.func = function(runtimeScene, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
},
  _objectArraysMap: {
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("EdgeScrollCamera"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("EdgeScrollCamera"),
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


gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.eventsList6(runtimeScene, eventsFunctionContext);


return;
}

gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.registeredGdjsCallbacks = [];
gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.registeredGdjsCallbacks.push((runtimeScene) => {
    gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.func(runtimeScene, runtimeScene);
})
gdjs.registerRuntimeScenePreEventsCallback(gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.registeredGdjsCallbacks[gdjs.evtsExt__EdgeScrollCamera__onScenePreEvents.registeredGdjsCallbacks.length - 1]);
