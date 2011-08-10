// ==========================================================================
// Project:   Foilsim - mainPage
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Foilsim */

// This page describes the main user interface for your application.  
Foilsim.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'viewer'.w(),
    
    viewer: Foilsim.Viewer.design({
      layout: { left: 30, top: 30, width: 350, height: 220 },
      contentBinding: 'Foilsim.solverController*content'
    })
  })

});
