
if (typeof gdjs.evtsExt__JointConnector__CreateRopeJoints !== "undefined") {
  gdjs.evtsExt__JointConnector__CreateRopeJoints.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__JointConnector__CreateRopeJoints = {};
gdjs.evtsExt__JointConnector__CreateRopeJoints.GDObjectObjects1= [];
gdjs.evtsExt__JointConnector__CreateRopeJoints.GDJointObjects1= [];


gdjs.evtsExt__JointConnector__CreateRopeJoints.userFunc0x19f6770 = function GDJSInlineCode(runtimeScene, objects, eventsFunctionContext) {
"use strict";
const behaviorName = eventsFunctionContext.getBehaviorName("Physics");
const jointObjects = eventsFunctionContext.getObjects("Joint");
const linkManager = gdjs.LinksManager.getManager(runtimeScene);

for (const jointObject of jointObjects) {
    // Save properties of each joint
    const jointBehavior = jointObject.getBehavior("RopeJoint");
    const maxlength = jointBehavior._getMaxDistance();
    const collideConnected = false;

    /** @type {gdjs.RuntimeObject} */
    let firstObject = null;
    for (const object of objects) {
        if (!firstObject) {
            var x1 = object.getAABBCenterX();
            var y1 = object.getAABBCenterY();
            if (jointObject.isCollidingWithPoint(x1, y1)) {
                firstObject = object;
                linkManager.linkObjects(object, jointObject);
            }
        }
        else {
            var x2 = object.getAABBCenterX();
            var y2 = object.getAABBCenterY();
            if (jointObject.isCollidingWithPoint(x2, y2)) {
                /** @type {gdjs.Physics2RuntimeBehavior} */
                const physicsBehavior = firstObject.getBehavior(behaviorName);
                physicsBehavior.addRopeJoint(
                    x1,
                    y1,
                    object,
                    x2,
                    y2,
                    maxlength,
                    collideConnected,
                    jointObject.getVariables().get('JointID'));
                linkManager.linkObjects(object, jointObject);
                break;
            }
        }
    }
}

};
gdjs.evtsExt__JointConnector__CreateRopeJoints.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__JointConnector__CreateRopeJoints.GDObjectObjects1);

const objects = gdjs.evtsExt__JointConnector__CreateRopeJoints.GDObjectObjects1;
gdjs.evtsExt__JointConnector__CreateRopeJoints.userFunc0x19f6770(runtimeScene, objects, eventsFunctionContext);

}


};

gdjs.evtsExt__JointConnector__CreateRopeJoints.func = function(runtimeScene, Object, Physics, Joint, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Joint": Joint
},
  _objectArraysMap: {
"Object": gdjs.objectsListsToArray(Object)
, "Joint": gdjs.objectsListsToArray(Joint)
},
  _behaviorNamesMap: {
"Physics": Physics
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__JointConnector__CreateRopeJoints.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__CreateRopeJoints.GDJointObjects1.length = 0;

gdjs.evtsExt__JointConnector__CreateRopeJoints.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__JointConnector__CreateRopeJoints.GDObjectObjects1.length = 0;
gdjs.evtsExt__JointConnector__CreateRopeJoints.GDJointObjects1.length = 0;


return;
}

gdjs.evtsExt__JointConnector__CreateRopeJoints.registeredGdjsCallbacks = [];