
if (typeof gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder !== "undefined") {
  gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder = {};
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1= [];
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2= [];
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3= [];
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects4= [];


gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.mapOfEmptyGDShapePainterObjects = Hashtable.newFrom({"ShapePainter": []});
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.mapOfGDgdjs_9546evtsExt_9595_9595EdgeScrollCamera_9595_9595DrawEdgeScrollingBorder_9546GDShapePainterObjects3Objects = Hashtable.newFrom({"ShapePainter": gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3});
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(eventsFunctionContext, gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.mapOfEmptyGDShapePainterObjects) < 1;
if (isConditionTrue_0) {
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length = 0;

{gdjs.evtTools.object.createObjectOnScene(eventsFunctionContext, gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.mapOfGDgdjs_9546evtsExt_9595_9595EdgeScrollCamera_9595_9595DrawEdgeScrollingBorder_9546GDShapePainterObjects3Objects, 0, 0, "" + eventsFunctionContext.getArgument("Layer"));
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("ShapePainter"), gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length;i<l;++i) {
    if ( gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i].getFillOpacity() != 0 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[k] = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i];
        ++k;
    }
}
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3 */
{for(var i = 0, len = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length ;i < len;++i) {
    gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i].setFillOpacity(0);
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("ShapePainter"), gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length;i<l;++i) {
    if ( gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i].areCoordinatesRelative() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[k] = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i];
        ++k;
    }
}
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3 */
{for(var i = 0, len = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length ;i < len;++i) {
    gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3[i].setCoordinatesRelative(false);
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("ShapePainter"), gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2.length;i<l;++i) {
    if ( !(gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2[i].isClearedBetweenFrames()) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2[k] = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2 */
{for(var i = 0, len = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2.length ;i < len;++i) {
    gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2[i].setClearBetweenFrames(true);
}
}
}

}


};gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = eventsFunctionContext.getOnceTriggers().triggerOnce(101465012);
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList0(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList2 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("ShapePainter"), gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1);
{for(var i = 0, len = gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1.length ;i < len;++i) {
    gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1[i].drawRectangle(gdjs.evtTools.camera.getCameraBorderLeft(runtimeScene, "" + eventsFunctionContext.getArgument("Layer"), (Number(eventsFunctionContext.getArgument("Camera")) || 0)) + gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin")), gdjs.evtTools.camera.getCameraBorderTop(runtimeScene, "" + eventsFunctionContext.getArgument("Layer"), (Number(eventsFunctionContext.getArgument("Camera")) || 0)) + gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin")), gdjs.evtTools.camera.getCameraBorderRight(runtimeScene, "" + eventsFunctionContext.getArgument("Layer"), (Number(eventsFunctionContext.getArgument("Camera")) || 0)) - gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin")), gdjs.evtTools.camera.getCameraBorderBottom(runtimeScene, "" + eventsFunctionContext.getArgument("Layer"), (Number(eventsFunctionContext.getArgument("Camera")) || 0)) - gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("ScreenMargin")));
}
}
}

}


};gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList3 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList1(runtimeScene, eventsFunctionContext);
}


{


gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList2(runtimeScene, eventsFunctionContext);
}


};gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList4 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableBoolean(runtimeScene.getScene().getVariables().get("__EdgeScrollCamera").getChild("Enabled"), true);
if (isConditionTrue_0) {

{ //Subevents
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList3(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList5 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList4(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.func = function(runtimeScene, ShapePainter, Layer, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
"ShapePainter": ShapePainter
},
  _objectArraysMap: {
"ShapePainter": gdjs.objectsListsToArray(ShapePainter)
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
if (argName === "Layer") return Layer;
    return "";
  },
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects4.length = 0;

gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.eventsList5(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects1.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects2.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects3.length = 0;
gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.GDShapePainterObjects4.length = 0;


return;
}

gdjs.evtsExt__EdgeScrollCamera__DrawEdgeScrollingBorder.registeredGdjsCallbacks = [];