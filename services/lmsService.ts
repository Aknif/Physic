
/**
 * LMS Service for SCORM 1.2 / 2004 Integration
 * Allows the app to report scores and completion back to Moodle, Canvas, etc.
 */

declare global {
  interface Window {
    API?: any;
    API_1484_11?: any;
  }
}

export const LMSService = {
  findAPI: (win: any): any => {
    let findAttempts = 0;
    while (win.API === null && win.API_1484_11 === null && win.parent !== null && win.parent !== win) {
      findAttempts++;
      if (findAttempts > 50) return null;
      win = win.parent;
    }
    return win.API_1484_11 || win.API;
  },

  initialize: () => {
    const api = LMSService.findAPI(window);
    if (api) {
      if (api.Initialize) api.Initialize("");
      else if (api.LMSInitialize) api.LMSInitialize("");
      console.log("LMS Connection established.");
      return true;
    }
    return false;
  },

  reportScore: (score: number, maxScore: number = 100) => {
    const api = LMSService.findAPI(window);
    if (!api) return false;

    if (api.SetValue) {
      // SCORM 2004
      api.SetValue("cmi.score.raw", score);
      api.SetValue("cmi.score.max", maxScore);
      api.SetValue("cmi.completion_status", "completed");
      api.Commit("");
    } else if (api.LMSSetValue) {
      // SCORM 1.2
      api.LMSSetValue("cmi.core.score.raw", score.toString());
      api.LMSSetValue("cmi.core.lesson_status", "completed");
      api.LMSCommit("");
    }
    return true;
  },

  generateManifest: (courseTitle: string) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="PhyEM_SCORM" version="1" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2 imsmd_rootv1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="PhyEM_ORG">
    <organization identifier="PhyEM_ORG">
      <title>${courseTitle}</title>
      <item identifier="ITEM_1" identifierref="RES_1">
        <title>Start PhyEM Mission</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>`;
  }
};
