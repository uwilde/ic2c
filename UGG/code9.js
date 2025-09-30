gdjs.BLACKCode = {};
gdjs.BLACKCode.localVariables = [];
gdjs.BLACKCode.GDNewTiledSpriteObjects1= [];
gdjs.BLACKCode.GDNewTiledSpriteObjects2= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects1= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects2= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects1= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects2= [];
gdjs.BLACKCode.GDPAUSE_95951Objects1= [];
gdjs.BLACKCode.GDPAUSE_95951Objects2= [];
gdjs.BLACKCode.GDPAUSE_95952Objects1= [];
gdjs.BLACKCode.GDPAUSE_95952Objects2= [];
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects1= [];
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects2= [];
gdjs.BLACKCode.GDMMENUObjects1= [];
gdjs.BLACKCode.GDMMENUObjects2= [];
gdjs.BLACKCode.GDQUITObjects1= [];
gdjs.BLACKCode.GDQUITObjects2= [];
gdjs.BLACKCode.GDSETTINGSObjects1= [];
gdjs.BLACKCode.GDSETTINGSObjects2= [];
gdjs.BLACKCode.GDPAUSE_95953Objects1= [];
gdjs.BLACKCode.GDPAUSE_95953Objects2= [];
gdjs.BLACKCode.GDPAUSE_95954Objects1= [];
gdjs.BLACKCode.GDPAUSE_95954Objects2= [];
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects1= [];
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects2= [];
gdjs.BLACKCode.GDYESObjects1= [];
gdjs.BLACKCode.GDYESObjects2= [];
gdjs.BLACKCode.GDNOObjects1= [];
gdjs.BLACKCode.GDNOObjects2= [];
gdjs.BLACKCode.GDSURE_9595Objects1= [];
gdjs.BLACKCode.GDSURE_9595Objects2= [];
gdjs.BLACKCode.GDBACKBTNObjects1= [];
gdjs.BLACKCode.GDBACKBTNObjects2= [];
gdjs.BLACKCode.GDHAMBURGERObjects1= [];
gdjs.BLACKCode.GDHAMBURGERObjects2= [];
gdjs.BLACKCode.GDMUSICSLIDERObjects1= [];
gdjs.BLACKCode.GDMUSICSLIDERObjects2= [];
gdjs.BLACKCode.GDSFXSLIDERObjects1= [];
gdjs.BLACKCode.GDSFXSLIDERObjects2= [];
gdjs.BLACKCode.GDPAUSBACKObjects1= [];
gdjs.BLACKCode.GDPAUSBACKObjects2= [];
gdjs.BLACKCode.GDPAUSBACK2Objects1= [];
gdjs.BLACKCode.GDPAUSBACK2Objects2= [];
gdjs.BLACKCode.GDVOLSLIDEObjects1= [];
gdjs.BLACKCode.GDVOLSLIDEObjects2= [];
gdjs.BLACKCode.GDVOLBUTTONObjects1= [];
gdjs.BLACKCode.GDVOLBUTTONObjects2= [];
gdjs.BLACKCode.GDVOLTEXTObjects1= [];
gdjs.BLACKCode.GDVOLTEXTObjects2= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects1= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects2= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects1= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects2= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects1= [];
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects2= [];
gdjs.BLACKCode.GDPHONEObjects1= [];
gdjs.BLACKCode.GDPHONEObjects2= [];
gdjs.BLACKCode.GDPAT_9595HEADObjects1= [];
gdjs.BLACKCode.GDPAT_9595HEADObjects2= [];
gdjs.BLACKCode.GDPAT_9595BGObjects1= [];
gdjs.BLACKCode.GDPAT_9595BGObjects2= [];
gdjs.BLACKCode.GDPATALKObjects1= [];
gdjs.BLACKCode.GDPATALKObjects2= [];
gdjs.BLACKCode.GDPATALK2Objects1= [];
gdjs.BLACKCode.GDPATALK2Objects2= [];


gdjs.BLACKCode.asyncCallback99162732 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.BLACKCode.localVariables);
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "BOSS_1", false);
}
gdjs.BLACKCode.localVariables.length = 0;
}
gdjs.BLACKCode.eventsList0 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.BLACKCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.BLACKCode.asyncCallback99162732(runtimeScene, asyncObjectsList)));
}
}

}


};gdjs.BLACKCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewTiledSprite"), gdjs.BLACKCode.GDNewTiledSpriteObjects1);
{gdjs.evtTools.camera.setCameraX(runtimeScene, (( gdjs.BLACKCode.GDNewTiledSpriteObjects1.length === 0 ) ? 0 :gdjs.BLACKCode.GDNewTiledSpriteObjects1[0].getCenterXInScene()), "", 0);
}
{gdjs.evtTools.camera.setCameraY(runtimeScene, (( gdjs.BLACKCode.GDNewTiledSpriteObjects1.length === 0 ) ? 0 :gdjs.BLACKCode.GDNewTiledSpriteObjects1[0].getCenterYInScene()), "", 0);
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {

{ //Subevents
gdjs.BLACKCode.eventsList0(runtimeScene);} //End of subevents
}

}


};

gdjs.BLACKCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.BLACKCode.GDNewTiledSpriteObjects1.length = 0;
gdjs.BLACKCode.GDNewTiledSpriteObjects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95951Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95951Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95952Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95952Objects2.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects1.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects2.length = 0;
gdjs.BLACKCode.GDMMENUObjects1.length = 0;
gdjs.BLACKCode.GDMMENUObjects2.length = 0;
gdjs.BLACKCode.GDQUITObjects1.length = 0;
gdjs.BLACKCode.GDQUITObjects2.length = 0;
gdjs.BLACKCode.GDSETTINGSObjects1.length = 0;
gdjs.BLACKCode.GDSETTINGSObjects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95953Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95953Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95954Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95954Objects2.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects1.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects2.length = 0;
gdjs.BLACKCode.GDYESObjects1.length = 0;
gdjs.BLACKCode.GDYESObjects2.length = 0;
gdjs.BLACKCode.GDNOObjects1.length = 0;
gdjs.BLACKCode.GDNOObjects2.length = 0;
gdjs.BLACKCode.GDSURE_9595Objects1.length = 0;
gdjs.BLACKCode.GDSURE_9595Objects2.length = 0;
gdjs.BLACKCode.GDBACKBTNObjects1.length = 0;
gdjs.BLACKCode.GDBACKBTNObjects2.length = 0;
gdjs.BLACKCode.GDHAMBURGERObjects1.length = 0;
gdjs.BLACKCode.GDHAMBURGERObjects2.length = 0;
gdjs.BLACKCode.GDMUSICSLIDERObjects1.length = 0;
gdjs.BLACKCode.GDMUSICSLIDERObjects2.length = 0;
gdjs.BLACKCode.GDSFXSLIDERObjects1.length = 0;
gdjs.BLACKCode.GDSFXSLIDERObjects2.length = 0;
gdjs.BLACKCode.GDPAUSBACKObjects1.length = 0;
gdjs.BLACKCode.GDPAUSBACKObjects2.length = 0;
gdjs.BLACKCode.GDPAUSBACK2Objects1.length = 0;
gdjs.BLACKCode.GDPAUSBACK2Objects2.length = 0;
gdjs.BLACKCode.GDVOLSLIDEObjects1.length = 0;
gdjs.BLACKCode.GDVOLSLIDEObjects2.length = 0;
gdjs.BLACKCode.GDVOLBUTTONObjects1.length = 0;
gdjs.BLACKCode.GDVOLBUTTONObjects2.length = 0;
gdjs.BLACKCode.GDVOLTEXTObjects1.length = 0;
gdjs.BLACKCode.GDVOLTEXTObjects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects2.length = 0;
gdjs.BLACKCode.GDPHONEObjects1.length = 0;
gdjs.BLACKCode.GDPHONEObjects2.length = 0;
gdjs.BLACKCode.GDPAT_9595HEADObjects1.length = 0;
gdjs.BLACKCode.GDPAT_9595HEADObjects2.length = 0;
gdjs.BLACKCode.GDPAT_9595BGObjects1.length = 0;
gdjs.BLACKCode.GDPAT_9595BGObjects2.length = 0;
gdjs.BLACKCode.GDPATALKObjects1.length = 0;
gdjs.BLACKCode.GDPATALKObjects2.length = 0;
gdjs.BLACKCode.GDPATALK2Objects1.length = 0;
gdjs.BLACKCode.GDPATALK2Objects2.length = 0;

gdjs.BLACKCode.eventsList1(runtimeScene);
gdjs.BLACKCode.GDNewTiledSpriteObjects1.length = 0;
gdjs.BLACKCode.GDNewTiledSpriteObjects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95951Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95952Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95951Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95951Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95952Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95952Objects2.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects1.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAYObjects2.length = 0;
gdjs.BLACKCode.GDMMENUObjects1.length = 0;
gdjs.BLACKCode.GDMMENUObjects2.length = 0;
gdjs.BLACKCode.GDQUITObjects1.length = 0;
gdjs.BLACKCode.GDQUITObjects2.length = 0;
gdjs.BLACKCode.GDSETTINGSObjects1.length = 0;
gdjs.BLACKCode.GDSETTINGSObjects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95953Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95953Objects2.length = 0;
gdjs.BLACKCode.GDPAUSE_95954Objects1.length = 0;
gdjs.BLACKCode.GDPAUSE_95954Objects2.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects1.length = 0;
gdjs.BLACKCode.GDBLACK_9595OVERLAY2Objects2.length = 0;
gdjs.BLACKCode.GDYESObjects1.length = 0;
gdjs.BLACKCode.GDYESObjects2.length = 0;
gdjs.BLACKCode.GDNOObjects1.length = 0;
gdjs.BLACKCode.GDNOObjects2.length = 0;
gdjs.BLACKCode.GDSURE_9595Objects1.length = 0;
gdjs.BLACKCode.GDSURE_9595Objects2.length = 0;
gdjs.BLACKCode.GDBACKBTNObjects1.length = 0;
gdjs.BLACKCode.GDBACKBTNObjects2.length = 0;
gdjs.BLACKCode.GDHAMBURGERObjects1.length = 0;
gdjs.BLACKCode.GDHAMBURGERObjects2.length = 0;
gdjs.BLACKCode.GDMUSICSLIDERObjects1.length = 0;
gdjs.BLACKCode.GDMUSICSLIDERObjects2.length = 0;
gdjs.BLACKCode.GDSFXSLIDERObjects1.length = 0;
gdjs.BLACKCode.GDSFXSLIDERObjects2.length = 0;
gdjs.BLACKCode.GDPAUSBACKObjects1.length = 0;
gdjs.BLACKCode.GDPAUSBACKObjects2.length = 0;
gdjs.BLACKCode.GDPAUSBACK2Objects1.length = 0;
gdjs.BLACKCode.GDPAUSBACK2Objects2.length = 0;
gdjs.BLACKCode.GDVOLSLIDEObjects1.length = 0;
gdjs.BLACKCode.GDVOLSLIDEObjects2.length = 0;
gdjs.BLACKCode.GDVOLBUTTONObjects1.length = 0;
gdjs.BLACKCode.GDVOLBUTTONObjects2.length = 0;
gdjs.BLACKCode.GDVOLTEXTObjects1.length = 0;
gdjs.BLACKCode.GDVOLTEXTObjects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95953Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95954Objects2.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects1.length = 0;
gdjs.BLACKCode.GDELEC_9595PORTAL_9595PART_95955Objects2.length = 0;
gdjs.BLACKCode.GDPHONEObjects1.length = 0;
gdjs.BLACKCode.GDPHONEObjects2.length = 0;
gdjs.BLACKCode.GDPAT_9595HEADObjects1.length = 0;
gdjs.BLACKCode.GDPAT_9595HEADObjects2.length = 0;
gdjs.BLACKCode.GDPAT_9595BGObjects1.length = 0;
gdjs.BLACKCode.GDPAT_9595BGObjects2.length = 0;
gdjs.BLACKCode.GDPATALKObjects1.length = 0;
gdjs.BLACKCode.GDPATALKObjects2.length = 0;
gdjs.BLACKCode.GDPATALK2Objects1.length = 0;
gdjs.BLACKCode.GDPATALK2Objects2.length = 0;


return;

}

gdjs['BLACKCode'] = gdjs.BLACKCode;
