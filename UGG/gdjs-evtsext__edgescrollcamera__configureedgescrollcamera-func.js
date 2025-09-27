
if (typeof gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera !== "undefined") {
  gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera = {};


gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = ("" + eventsFunctionContext.getArgument("ScrollStyle") == "Constant speed");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Style").setString("Constant speed");
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = ("" + eventsFunctionContext.getArgument("ScrollStyle") == "Progressive speed");
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Style").setString("Progressive speed");
}
}

}


{


let isConditionTrue_0 = false;
{
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Layer").setString("" + eventsFunctionContext.getArgument("Layer"));
}
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Camera").setNumber((Number(eventsFunctionContext.getArgument("Camera")) || 0));
}
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScrollSpeed").setNumber((Number(eventsFunctionContext.getArgument("ScrollSpeed")) || 0));
}
{runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin").setNumber(Math.max(1, (Number(eventsFunctionContext.getArgument("ScreenMargin")) || 0)));
}
}

}


};gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.eventsList0(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.func = function(runtimeScene, ScreenMargin, ScrollSpeed, Layer, Camera, ScrollStyle, parentEventsFunctionContext) {
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
if (argName === "ScreenMargin") return ScreenMargin;
if (argName === "ScrollSpeed") return ScrollSpeed;
if (argName === "Layer") return Layer;
if (argName === "Camera") return Camera;
if (argName === "ScrollStyle") return ScrollStyle;
    return "";
  },
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};


gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.eventsList1(runtimeScene, eventsFunctionContext);


return;
}

gdjs.evtsExt__EdgeScrollCamera__ConfigureEdgeScrollCamera.registeredGdjsCallbacks = [];