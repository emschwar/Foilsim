// ==========================================================================
// Project:   Foilsim.Solver
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Foilsim */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Foilsim.Solver = SC.Record.extend(
/** @scope Foilsim.Solver.prototype */ {

  // TODO: Add your own code here.
    convdr: Math.PI/180.0,
    pid2: Math.PI/2.0,
    rval: null, ycval: null, xcval: null, gamval: null, alfval: null,
    thkval: null, camval: null, chrd: null, clift: null,
    dragCoeff: null, drag: null, liftOverDrag: null, reynolds: null, viscos: null,
    alfd: null, thkd: null, camd: null, dragco: null,
    thkinpt: null, caminpt: null,                 /* MODS 10 Sep 99 */
    leg: null, teg: null, lem: null, tem: null,
    usq: null, vsq: null, alt: null, altmax: null, area: null, armax: null, 
    armin: null,
    chord: null, span: null, aspr: null, arold: null, chrdold: null, spnold: null, /* Mod 13 Jan 00 */
    g0: null, q0: null, ps0: null, pt0: null, ts0: null, rho: null, rlhum: null, temf: null, presm: null,
    lyg: null, lrg: null, lthg: null, lxgt: null, lygt: null, lrgt: null, lthgt: null, /* MOD 20 Jul */
    lxm: null, lym: null, lxmt: null, lymt: null, vxdir: null, /* MOD 20 Jul */
    deltb: null, xflow: null,             /* MODS  20 Jul 99 */
    delx: null, delt: null, vfsd: null, spin: null, spindr: null, yoff: null, radius: null,
    vel: null, pres: null, lift: null, side: null, omega: null, radcrv: null, relsy: null, angr: null,

    rg:  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    thg: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    xg:  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    yg:  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    xm:  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    ym:  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    xpl: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    ypl: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    plp: [],
    plv: [],

    inptopt: null, outopt: null,
    nptc: null, npt2: null, nlnc: null, nln2: null, rdflag: null, browflag: null, probflag: null, anflag: null,
    foil: null, flflag: null, lunits: null, lftout: null, planet: null, dragOut: null,
    displ: null, viewflg: null, dispp: null, dout: null, doutb: null, sldloc: null, 
    calcrange: null, arcor: null, indrag: null, recor: null, bdragflag: null,
    /* units data */
    vmn: null, almn: null, angmn: null, vmx: null, almx: null, angmx: null,
    camn: null, thkmn: null, camx: null, thkmx: null,
    chrdmn: null, spanmn: null, armn: null, chrdmx: null, spanmx: null, armx: null,
    radmn: null, spinmn: null, radmx: null, spinmx: null,
    vconv: null, vmax: null,
    pconv: null, pmax: null, pmin: null, lconv: null, rconv: null, fconv: null, fmax: null, fmaxb: null,
    lflag: null, gflag: null, plscale: null, nond: null,
    /*  plot & probe data */
    fact: null, xpval: null, ypval: null, pbval: null, factp: null, 
    prg: null, pthg: null, pxg: null, pyg: null, pxm: null, pym: null, pxpl: null, pypl: null, 
    pboflag: null, xt: null, yt: null, ntikx: null, ntiky: null, npt: null, xtp: null, ytp: null, 
    xt1: null, yt1: null, xt2: null, yt2: null, spanfac: null, 
    lines: null, nord: null, nabs: null, ntr: null, 
    begx: null, endx: null, begy: null, endy: null, 
    labx: null, labxu: null, laby: null, labyu: null,
    pltx: [[], [], [], []],
    plty: [[], [], [], []],
    plthg: [],

  init: function() {
    sc_super();
    this.setDefaults();
    this.computeFlow();
  },

  computeFlow: function() {
    if (this.get('flflag') == 1) {
      this.getFreeStream() ;
      this.getCirc();                   /* get circulation */
      this.genFlow();
    }

    if (this.get('foil') <= 3) {
      this.set('reynolds', this.get('vfsd')/this.get('vconv') * this.get('chord')/this.get('lconv') * this.get('rho') / this.get('viscos')) ;
    } else {
      this.set('reynolds', this.get('vfsd')/this.get('vconv') * 2 * this.get('radius')/this.get('lconv') * this.get('rho') / this.get('viscos'));
    }

    this.getProbe();

    this.set('thkd', this.get('thkinpt')) ;
    this.set('camd', this.get('caminpt')) ;
    if (this.get('camd') < 0.0) { 
      this.set('alfd', - this.get('alfval')) ;
    } else {
      this.set('alfd', this.get('alfval')) ;
    }

    this.getDrag(this.get('clift')); 
    this.set('dragCoeff', this.get('dragco')) ;

    this.loadPlot();
  },

  getDrag: function(cldin) {    //Drag Interpolator
    var index,ifound ;  
    var dragCam0Thk5, dragCam5Thk5, dragCam10Thk5, dragCam15Thk5, dragCam20Thk5;
    var dragCam0Thk10, dragCam5Thk10, dragCam10Thk10, dragCam15Thk10, dragCam20Thk10;
    var dragCam0Thk15, dragCam5Thk15, dragCam10Thk15, dragCam15Thk15, dragCam20Thk15;
    var dragCam0Thk20, dragCam5Thk20, dragCam10Thk20, dragCam15Thk20, dragCam20Thk20;
    var dragThk5, dragThk10, dragThk15, dragThk20;
    var dragCam0, dragCam5, dragCam10, dragCam15, dragCam20;  //used for the flat plate drag values
    var recyl  = [0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0,
                    2.0, 4.0, 5.0, 6.0, 8.0, 10.0,
                    20.0, 40.0, 50.0, 60.0, 80.0, 100.0,
                    200.0, 400.0, 500.0, 600.0, 800.0, 1000,
                    2000, 4000, 5000, 6000, 8000, 10000,
                    100000,200000,400000,500000,600000,800000,1000000,
                    2000000,4000000,5000000,6000000,8000000,1000000000000 ] ; 
    var cdcyl  = [70, 35, 20, 17, 15, 13, 10,
                    7, 5.5, 5.0, 4.5, 4, 3.5,
                    3.0, 2.7, 2.5, 2.0, 2.0, 1.9,
                    1.6, 1.4, 1.2, 1.1, 1.1, 1.0, 
                    1.2, 1.4, 1.4, 1.5, 1.5, 1.6,
                    1.6, 1.4, 0.4, 0.28, 0.32, 0.4, 0.45,
                    0.6, 0.8, 0.8, 0.85, 0.9, 0.9 ] ; 
    var resps  = [0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0,
                    2.0, 4.0, 5.0, 6.0, 8.0, 10.0,
                    20, 40, 50, 60, 80.0, 100.0,
                    200, 400, 500, 600, 800.0, 1000,
                    2000, 4000, 5000, 6000, 8000, 10000,
                    20000, 40000, 50000, 60000, 80000, 100000,
                    200000, 400000, 500000, 600000, 800000, 1000000,
                    2000000, 4000000, 5000000, 6000000, 8000000, 1000000000000 ] ; 

    var cdsps  = [270, 110, 54, 51, 40, 35, 28,
                    15, 8.5, 7.5, 6.0, 5.4, 4.9,
                    3.1, 1.9, 1.8, 1.5, 1.3, 1.1,
                    0.81, 0.6, 0.58, 0.56, 0.5, 0.49, 
                    0.40, 0.41, 0.415, 0.42, 0.43, 0.44,
                    0.44, 0.45, 0.455, 0.46, 0.47, 0.48, 
                    0.47, 0.10, 0.098, 0.1, 0.15, 0.19, 
                    0.30, 0.35, 0.370, 0.4, 0.40, 0.42 ] ; 
    var cdspr  = [270, 110, 54, 51, 40, 35, 28,
                    15, 8.5, 7.5, 6.0, 5.4, 4.9,
                    3.1, 1.9, 1.8, 1.5, 1.3, 1.1,
                    0.81, 0.6, 0.58, 0.56, 0.5, 0.49, 
                    0.40, 0.41, 0.415, 0.42, 0.43, 0.44,
                    0.44, 0.45, 0.455, 0.46, 0.42, 0.15, 
                    0.27, 0.33, 0.35, 0.37, 0.38, 0.39, 
                    0.40, 0.41, 0.41, 0.42, 0.43, 0.44 ] ; 
    var cdspg  = [270, 110, 54, 51, 40, 35, 28,
                    15, 8.5, 7.5, 6.0, 5.4, 4.9,
                    3.1, 1.9, 1.8, 1.5, 1.3, 1.1,
                    0.81, 0.6, 0.58, 0.56, 0.5, 0.49, 
                    0.40, 0.41, 0.415, 0.42, 0.43, 0.44,
                    0.44, 0.28, 0.255, 0.24, 0.24, 0.25, 
                    0.26, 0.27, 0.290, 0.33, 0.37, 0.40, 
                    0.41, 0.42, 0.420, 0.43, 0.44, 0.45 ] ;
    var alfd = this.get('alfd'), camd = this.get('camd'), thkd = this.get('thkd'),
        reynolds = this.get('reynolds'), 
        bdragflag = this.get('bdragflag');

    if (this.get('anflag') === 0) {
      this.set('dragco', 0);
    } else if (this.get('anflag') === 1) {
      switch (this.get('foil'))
      {
      case 1:    //airfoil drag logic
        var dragCam0Thk5 = -9E-07*Math.pow(alfd,3) + 0.0007*Math.pow(alfd,2) + 0.0008*alfd + 0.015;
        var dragCam5Thk5 = 4E-08*Math.pow(alfd,5) - 7E-07*Math.pow(alfd,4) - 1E-05*Math.pow(alfd,3) + 0.0009*Math.pow(alfd,2) + 0.0033*alfd + 0.0301;
        var dragCam10Thk5 = -9E-09*Math.pow(alfd,6) - 6E-08*Math.pow(alfd,5) + 5E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) - 0.0001*Math.pow(alfd,2) - 0.0025*alfd + 0.0615;
        var dragCam15Thk5 = 8E-10*Math.pow(alfd,6) - 5E-08*Math.pow(alfd,5) - 1E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) + 0.0008*Math.pow(alfd,2) - 0.0027*alfd + 0.0612;
        var dragCam20Thk5 = 8E-9*Math.pow(alfd,6) + 1E-8*Math.pow(alfd,5) - 5E-6*Math.pow(alfd,4) + 6E-6*Math.pow(alfd,3) + 0.001*Math.pow(alfd,2) - 0.001*alfd + 0.1219;
        
        var dragCam0Thk10 = -1E-08*Math.pow(alfd,6) + 6E-08*Math.pow(alfd,5) + 6E-06*Math.pow(alfd,4) - 2E-05*Math.pow(alfd,3) - 0.0002*Math.pow(alfd,2) + 0.0017*alfd + 0.0196;
        var dragCam5Thk10 = 3E-09*Math.pow(alfd,6) + 6E-08*Math.pow(alfd,5) - 2E-06*Math.pow(alfd,4) - 3E-05*Math.pow(alfd,3) + 0.0008*Math.pow(alfd,2) + 0.0038*alfd + 0.0159;
        var dragCam10Thk10 = -5E-09*Math.pow(alfd,6) - 3E-08*Math.pow(alfd,5) + 2E-06*Math.pow(alfd,4) + 1E-05*Math.pow(alfd,3) + 0.0004*Math.pow(alfd,2) - 3E-05*alfd + 0.0624;
        var dragCam15Thk10 = -2E-09*Math.pow(alfd,6) - 2E-08*Math.pow(alfd,5) - 5E-07*Math.pow(alfd,4) + 8E-06*Math.pow(alfd,3) + 0.0009*Math.pow(alfd,2) + 0.0034*alfd + 0.0993;
        var dragCam20Thk10 = 2E-09*Math.pow(alfd,6) - 3E-08*Math.pow(alfd,5) - 2E-06*Math.pow(alfd,4) + 2E-05*Math.pow(alfd,3) + 0.0009*Math.pow(alfd,2) + 0.0023*alfd + 0.1581;

        var dragCam0Thk15 = -5E-09*Math.pow(alfd,6) + 7E-08*Math.pow(alfd,5) + 3E-06*Math.pow(alfd,4) - 3E-05*Math.pow(alfd,3) - 7E-05*Math.pow(alfd,2) + 0.0017*alfd + 0.0358;
        var dragCam5Thk15 = -4E-09*Math.pow(alfd,6) - 8E-09*Math.pow(alfd,5) + 2E-06*Math.pow(alfd,4) - 9E-07*Math.pow(alfd,3) + 0.0002*Math.pow(alfd,2) + 0.0031*alfd + 0.0351;
        var dragCam10Thk15 = 3E-09*Math.pow(alfd,6) + 3E-08*Math.pow(alfd,5) - 2E-06*Math.pow(alfd,4) - 1E-05*Math.pow(alfd,3) + 0.0009*Math.pow(alfd,2) + 0.004*alfd + 0.0543;
        var dragCam15Thk15 = 3E-09*Math.pow(alfd,6) + 5E-08*Math.pow(alfd,5) - 2E-06*Math.pow(alfd,4) - 3E-05*Math.pow(alfd,3) + 0.0008*Math.pow(alfd,2) + 0.0087*alfd + 0.1167;
        var dragCam20Thk15 = 3E-10*Math.pow(alfd,6) - 3E-08*Math.pow(alfd,5) - 6E-07*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) + 0.0006*Math.pow(alfd,2) + 0.0008*alfd + 0.1859;

        var dragCam0Thk20 = -3E-09*Math.pow(alfd,6) + 2E-08*Math.pow(alfd,5) + 2E-06*Math.pow(alfd,4) - 8E-06*Math.pow(alfd,3) - 4E-05*Math.pow(alfd,2) + 0.0003*alfd + 0.0416;
        var dragCam5Thk20 = -3E-09*Math.pow(alfd,6) - 7E-08*Math.pow(alfd,5) + 1E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) + 0.0004*Math.pow(alfd,2) + 5E-05*alfd + 0.0483;
        var dragCam10Thk20 = 1E-08*Math.pow(alfd,6) + 4E-08*Math.pow(alfd,5) - 6E-06*Math.pow(alfd,4) - 2E-05*Math.pow(alfd,3) + 0.0014*Math.pow(alfd,2) + 0.007*alfd + 0.0692;
        var dragCam15Thk20 = 3E-09*Math.pow(alfd,6) - 9E-08*Math.pow(alfd,5) - 3E-06*Math.pow(alfd,4) + 4E-05*Math.pow(alfd,3) + 0.001*Math.pow(alfd,2) + 0.0021*alfd + 0.139;
        var xdragCam20Thk20 = 3E-09*Math.pow(alfd,6) - 7E-08*Math.pow(alfd,5) - 3E-06*Math.pow(alfd,4) + 4E-05*Math.pow(alfd,3) + 0.0012*Math.pow(alfd,2) + 0.001*alfd + 0.1856;

        if (-20.0 <= camd && camd < -15.0)
        {
          dragThk5 = (camd/5 + 4)*(dragCam15Thk5 - dragCam20Thk5) + dragCam20Thk5;
          dragThk10 = (camd/5 + 4)*(dragCam15Thk10 - dragCam20Thk10) + dragCam20Thk10;
          dragThk15 = (camd/5 + 4)*(dragCam15Thk15 - dragCam20Thk15) + dragCam20Thk15;
          dragThk20 = (camd/5 + 4)*(dragCam15Thk20 - dragCam20Thk20) + dragCam20Thk20;
          
          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (-15.0 <= camd && camd < -10.0) {
          dragThk5 = (camd/5 + 3)*(dragCam10Thk5 - dragCam15Thk5) + dragCam15Thk5;
          dragThk10 = (camd/5 + 3)*(dragCam10Thk10 - dragCam15Thk10) + dragCam15Thk10;
          dragThk15 = (camd/5 + 3)*(dragCam10Thk15 - dragCam15Thk15) + dragCam15Thk15;
          dragThk20 = (camd/5 + 3)*(dragCam10Thk20 - dragCam15Thk20) + dragCam15Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (-10.0 <= camd && camd < -5.0) {
          dragThk5 = (camd/5 + 2)*(dragCam5Thk5 - dragCam10Thk5) + dragCam10Thk5;
          dragThk10 = (camd/5 + 2)*(dragCam5Thk10 - dragCam10Thk10) + dragCam10Thk10;
          dragThk15 = (camd/5 + 2)*(dragCam5Thk15 - dragCam10Thk15) + dragCam10Thk15;
          dragThk20 = (camd/5 + 2)*(dragCam5Thk20 - dragCam10Thk20) + dragCam10Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (-5.0 <= camd && camd < 0) {
          dragThk5 = (camd/5 + 1)*(dragCam0Thk5 - dragCam5Thk5) + dragCam5Thk5;
          dragThk10 = (camd/5 + 1)*(dragCam0Thk10 - dragCam5Thk10) + dragCam5Thk10;
          dragThk15 = (camd/5 + 1)*(dragCam0Thk15 - dragCam5Thk15) + dragCam5Thk15;
          dragThk20 = (camd/5 + 1)*(dragCam0Thk20 - dragCam5Thk20) + dragCam5Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (0 <= camd && camd < 5) {
          dragThk5 = (camd/5)*(dragCam5Thk5 - dragCam0Thk5) + dragCam0Thk5;
          dragThk10 = (camd/5)*(dragCam5Thk10 - dragCam0Thk10) + dragCam0Thk10;
          dragThk15 = (camd/5)*(dragCam5Thk15 - dragCam0Thk15) + dragCam0Thk15;
          dragThk20 = (camd/5)*(dragCam5Thk20 - dragCam0Thk20) + dragCam0Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (5 <= camd && camd < 10) {
          dragThk5 = (camd/5 - 1)*(dragCam10Thk5 - dragCam5Thk5) + dragCam5Thk5;
          dragThk10 = (camd/5 - 1)*(dragCam10Thk10 - dragCam5Thk10) + dragCam5Thk10;
          dragThk15 = (camd/5 - 1)*(dragCam10Thk15 - dragCam5Thk15) + dragCam5Thk15;
          dragThk20 = (camd/5 - 1)*(dragCam10Thk20 - dragCam5Thk20) + dragCam5Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (10 <= camd && camd < 15) {
          dragThk5 = (camd/5 - 2)*(dragCam15Thk5 - dragCam10Thk5) + dragCam10Thk5;
          dragThk10 = (camd/5 - 2)*(dragCam15Thk10 - dragCam10Thk10) + dragCam10Thk10;
          dragThk15 = (camd/5 - 2)*(dragCam15Thk15 - dragCam10Thk15) + dragCam10Thk15;
          dragThk20 = (camd/5 - 2)*(dragCam15Thk20 - dragCam10Thk20) + dragCam10Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        } else if (15 <= camd && camd <= 20) {
          dragThk5 = (camd/5 - 3)*(dragCam20Thk5 - dragCam15Thk5) + dragCam15Thk5;
          dragThk10 = (camd/5 - 3)*(dragCam20Thk10 - dragCam15Thk10) + dragCam15Thk10;
          dragThk15 = (camd/5 - 3)*(dragCam20Thk15 - dragCam15Thk15) + dragCam15Thk15;
          dragThk20 = (camd/5 - 3)*(dragCam20Thk20 - dragCam15Thk20) + dragCam15Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 15.0)
          {
            this.set('dragco', (thkd/5 - 2)*(dragThk15 - dragThk10) + dragThk10);
          }
          else if (15.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/5 - 3)*(dragThk20 - dragThk15) + dragThk15);
          }
        }

        break;
      case 2:   //elliptical drag logic
        dragCam0Thk5 = -6E-07*Math.pow(alfd,3) + 0.0007*Math.pow(alfd,2) + 0.0007*alfd + 0.0428;
        dragCam10Thk5 = 5E-09*Math.pow(alfd,6) - 7E-08*Math.pow(alfd,5) - 3E-06*Math.pow(alfd,4) + 5E-05*Math.pow(alfd,3) + 0.0009*Math.pow(alfd,2) - 0.0058*alfd + 0.0758;
        dragCam20Thk5 = 1E-08*Math.pow(alfd,6) - 2E-08*Math.pow(alfd,5) - 7E-06*Math.pow(alfd,4) + 1E-05*Math.pow(alfd,3) + 0.0015*Math.pow(alfd,2) + 0.0007*alfd + 0.1594;
        
        dragCam0Thk10 = 3E-09*Math.pow(alfd,6) + 4E-08*Math.pow(alfd,5) - 3E-06*Math.pow(alfd,4) - 9E-06*Math.pow(alfd,3) + 0.0013*Math.pow(alfd,2) + 0.0007*alfd + 0.0112;
        dragCam10Thk10 = -4E-09*Math.pow(alfd,6) - 9E-08*Math.pow(alfd,5) + 2E-06*Math.pow(alfd,4) + 7E-05*Math.pow(alfd,3) + 0.0008*Math.pow(alfd,2) - 0.0095*alfd + 0.0657;
        dragCam20Thk10 = -8E-09*Math.pow(alfd,6) - 9E-08*Math.pow(alfd,5) + 3E-06*Math.pow(alfd,4) + 6E-05*Math.pow(alfd,3) + 0.0005*Math.pow(alfd,2) - 0.0088*alfd + 0.2088;

        dragCam0Thk20 = -7E-09*Math.pow(alfd,6) - 1E-07*Math.pow(alfd,5) + 4E-06*Math.pow(alfd,4) + 6E-05*Math.pow(alfd,3) + 0.0001*Math.pow(alfd,2) - 0.0087*alfd + 0.0596;
        dragCam10Thk20 = -2E-09*Math.pow(alfd,6) + 2E-07*Math.pow(alfd,5) + 1E-06*Math.pow(alfd,4) - 6E-05*Math.pow(alfd,3) + 0.0004*Math.pow(alfd,2) - 7E-05*alfd + 0.1114;
        dragCam20Thk20 = 4E-09*Math.pow(alfd,6) - 7E-08*Math.pow(alfd,5) - 3E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) + 0.001*Math.pow(alfd,2) - 0.0018*alfd + 0.1925;

        if (-20.0 <= camd && camd < -10.0)
        {
          dragThk5 = (camd/10 + 2)*(dragCam10Thk5 - dragCam20Thk5) + dragCam20Thk5;
          dragThk10 = (camd/10 + 2)*(dragCam10Thk10 - dragCam20Thk10) + dragCam20Thk10;
          dragThk20 = (camd/10 + 2)*(dragCam10Thk20 - dragCam20Thk20) + dragCam20Thk20;
          
          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/10 - 1)*(dragThk20 - dragThk10) + dragThk10);
          }
        } else if (-10.0 <= camd && camd < 0) {
          dragThk5 = (camd/10 + 1)*(dragCam0Thk5 - dragCam10Thk5) + dragCam10Thk5;
          dragThk10 = (camd/10 + 1)*(dragCam0Thk10 - dragCam10Thk10) + dragCam10Thk10;
          dragThk20 = (camd/10 + 1)*(dragCam0Thk20 - dragCam10Thk20) + dragCam10Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/10 - 1)*(dragThk20 - dragThk10) + dragThk10);
          }
        } else if (0 <= camd && camd < 10) {
          dragThk5 = (camd/10)*(dragCam10Thk5 - dragCam0Thk5) + dragCam0Thk5;
          dragThk10 = (camd/10)*(dragCam10Thk10 - dragCam0Thk10) + dragCam0Thk10;
          dragThk20 = (camd/10)*(dragCam10Thk20 - dragCam0Thk20) + dragCam0Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/10 - 1)*(dragThk20 - dragThk10) + dragThk10);
          }
        } else if (10 <= camd && camd < 20) {
          dragThk5 = (camd/10 - 1)*(dragCam20Thk5 - dragCam10Thk5) + dragCam10Thk5;
          dragThk10 = (camd/10 - 1)*(dragCam20Thk10 - dragCam10Thk10) + dragCam10Thk10;
          dragThk20 = (camd/10 - 1)*(dragCam20Thk20 - dragCam10Thk20) + dragCam10Thk20;

          if (1.0 <= thkd && thkd <= 5.0)
          {
            this.set('dragco', dragThk5);
          }
          else if (5.0 < thkd && thkd <= 10.0)
          {
            this.set('dragco', (thkd/5 - 1)*(dragThk10 - dragThk5) + dragThk5);
          }
          else if (10.0 < thkd && thkd <= 20.0)
          {
            this.set('dragco', (thkd/10 - 1)*(dragThk20 - dragThk10) + dragThk10);
          }
        }

        break;
      case 3:    //flat plate drag logic
        dragCam0 = -9E-07*Math.pow(alfd,3) + 0.0007*Math.pow(alfd,2) + 0.0008*alfd + 0.015;
        dragCam5 = 1E-08*Math.pow(alfd,6) + 4E-08*Math.pow(alfd,5) - 9E-06*Math.pow(alfd,4) - 1E-05*Math.pow(alfd,3) + 0.0021*Math.pow(alfd,2) + 0.0033*alfd + 0.006;
        dragCam10 = -9E-09*Math.pow(alfd,6) - 6E-08*Math.pow(alfd,5) + 5E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) - 0.0001*Math.pow(alfd,2) - 0.0025*alfd + 0.0615;
        dragCam15 = 8E-10*Math.pow(alfd,6) - 5E-08*Math.pow(alfd,5) - 1E-06*Math.pow(alfd,4) + 3E-05*Math.pow(alfd,3) + 0.0008*Math.pow(alfd,2) - 0.0027*alfd + 0.0612;
        dragCam20 = 8E-9*Math.pow(alfd,6) + 1E-8*Math.pow(alfd,5) - 5E-6*Math.pow(alfd,4) + 6E-6*Math.pow(alfd,3) + 0.001*Math.pow(alfd,2) - 0.001*alfd + 0.1219;

        if (-20.0 <= camd && camd < -15.0)
        {
          this.set('dragco', (camd/5 + 4)*(dragCam15 - dragCam20) + dragCam20);
        } else if (-15.0 <= camd && camd < -10.0) {
          this.set('dragco', (camd/5 + 3)*(dragCam10 - dragCam15) + dragCam15);
        } else if (-10.0 <= camd && camd < -5.0) {
          this.set('dragco', (camd/5 + 2)*(dragCam5 - dragCam10) + dragCam10);
        } else if (-5.0 <= camd && camd < 0) {
          this.set('dragco', (camd/5 + 1)*(dragCam0 - dragCam5) + dragCam5);
        } else if (0 <= camd && camd < 5) {
          this.set('dragco', (camd/5)*(dragCam5 - dragCam0) + dragCam0);
        } else if (5 <= camd && camd < 10) {
          this.set('dragco', (camd/5 - 1)*(dragCam10 - dragCam5) + dragCam5);
        } else if (10 <= camd && camd < 15) {
          this.set('dragco', (camd/5 - 2)*(dragCam15 - dragCam10) + dragCam10);
        } else if (15 <= camd && camd <= 20) {
          this.set('dragco', (camd/5 - 3)*(dragCam20 - dragCam15) + dragCam15);
        }
        break;
      case 4:   //cylinder drag logic
        ifound = 0 ;
        for (index = 0; index <= 43 ; ++ index) {
          if(reynolds >= recyl[index] && reynolds < recyl[index+1]) { ifound = index; }
        }
        
        this.set('dragco', ((cdcyl[ifound+1]-cdcyl[ifound])/(recyl[ifound+1]-recyl[ifound]))*
                 (reynolds - recyl[ifound]) + cdcyl[ifound]);
        
        break;
      case 5:   //sphere drag logic
        ifound = 0;
        for (index = 0; index <= 48 ; ++ index) {
          if(reynolds >= resps[index] && reynolds < resps[index+1]) { ifound = index; }
        }
        
        if ( bdragflag == 1) {    // smooth ball
          this.set('dragco', ((cdsps[ifound+1]-cdsps[ifound])/(resps[ifound+1]-resps[ifound]))*
                   (reynolds - resps[ifound]) + cdsps[ifound]);
        }
        if ( bdragflag == 2) {    // rough ball
          this.set('dragco', ((cdspr[ifound+1]-cdspr[ifound])/(resps[ifound+1]-resps[ifound]))*
                   (reynolds - resps[ifound]) + cdspr[ifound]);
        }
        if ( bdragflag == 3) {    // golf ball
          this.set('dragco', ((cdspg[ifound+1]-cdspg[ifound])/(resps[ifound+1]-resps[ifound]))*
                   (reynolds - resps[ifound]) + cdspg[ifound]);
        }

        break;
      }

      if(this.get('recor') === 1) {    // reynolds correction
        if (this.get('foil') <= 3) {       // airfoil 
          this.set('dragco', this.get('dragco') * Math.pow((50000/reynolds),0.11));
        }
      }

      if (this.get('indrag') === 1) {    // induced drag coefficient  factor = .85 for rectangle
        this.set('dragco', this.get('dragco') + (cldin * cldin)/ (3.1415926 * this.get('aspr') * 0.85));
      }
    }
  },

  loadPressureSurfacePlot: function() {
    var index, npt = this.get('npt'), xpl = this.get('xpl'),
        pltx = this.get('pltx'), plty = this.get('plty'),
        npt2 = this.get('npt2'), ps0 = this.get('ps0'),
        pconv = this.get('pconv'), anflag = this.get('anflag'),
        plp = this.get('plp'), alfval = this.get('alfval');

    this.set('npt', npt = npt2);
    this.set('ntr', 3);
    this.set('nord', 1);
    this.set('nabs', 1);

    for (index = 1; index <= npt; ++ index) {
      if (this.get('foil') <= 3) {
        pltx[0][index] =100*(xpl[0][npt2-index + 1]/4.0 + 0.5) ;
        pltx[1][index] =100*(xpl[0][npt2+index - 1]/4.0 + 0.5) ;
        pltx[2][index] =100*(xpl[0][npt2+index - 1]/4.0 + 0.5) ;
      }
      if (this.get('foil') >= 4) {
        var radius = this.get('radius'), lconv = this.get('lconv');
        pltx[0][index]=100*(xpl[0][npt2-index+1]/(2.0*radius/lconv)+0.5);
        pltx[1][index]=100*(xpl[0][npt2+index-1]/(2.0*radius/lconv)+0.5);
        pltx[2][index]=100*(xpl[0][npt2+index-1]/(2.0*radius/lconv)+0.5);
      }
      plty[0][index] = plp[npt2-index + 1] ;
      plty[1][index] = plp[npt2+index - 1] ;
      plty[2][index] = ps0/2116 * pconv ;
      // **** Impose pstatic on surface plot for stalled foil
      if (anflag === 1 && index > 7) {
        if (alfval >  10.0) plty[0][index] = plty[2][index] ;
        if (alfval < -10.0) plty[1][index] = plty[2][index] ;
      }
      // *******
    }
    this.set('plty', plty);
    this.set('pltx', pltx);

    this.set('begx', 0);
    this.set('endx', 100);
    this.set('ntikx', 5);
    this.set('ntiky', 5);
    //       endy=1.02 * ps0/2116. * pconv ;
    //       begy=.95 * ps0/2116. * pconv ;
    this.set('laby', "Press");
    var lunits = this.get("lunits");
    if (lunits === 0) { this.set('labyu', "psi"); }
    if (lunits === 1) { this.set('labyu', "k-Pa"); }
    this.set('labx', " X ");
    var foil = this.get("foil");
    if (foil <= 3) { this.set('labxu', "% chord"); }
    if (foil >= 4) { this.set('labxu', "% diameter"); }
  },

  loadVelocitySurfacePlot: function() {
    var index, npt = this.get('npt'), xpl = this.get('xpl'),
        pltx = this.get('pltx'), plty = this.get('plty'),
        npt2 = this.get('npt2'), vfsd = this.get('vfsd'),
        anflag = this.get('anflag'), plv = this.get('plv'), 
        alfval = this.get('alfval');

    this.set('npt', npt2);
    this.set('ntr', 3);
    this.set('nord', 2);
    this.set('nabs', 1);
    for (index = 1; index <= npt; ++ index) {
      if (this.get('foil') <= 3) {
        pltx[0][index] = 100*(xpl[0][npt2-index+1]/4.0+0.5) ;
        pltx[1][index] = 100*(xpl[0][npt2+index-1]/4.0+0.5) ;
        pltx[2][index] = 100*(xpl[0][npt2-index+1]/4.0+0.5) ;
      }
      if (this.get('foil') >= 4) {
        var radius = this.get('radius'), lconv = this.get('lconv');
        pltx[0][index]=100*(xpl[0][npt2-index+1]/(2.0*radius/lconv)+0.5);
        pltx[1][index]=100*(xpl[0][npt2+index-1]/(2.0*radius/lconv)+0.5);
        pltx[2][index]=100*(xpl[0][npt2+index-1]/(2.0*radius/lconv)+0.5);
      }
      plty[0][index] = plv[npt2-index+1];
      plty[1][index] = plv[npt2+index-1] ;
      plty[2][index] = vfsd ;
      // **** Impose free stream vel on surface plot for stalled foil
      if (anflag === 1 && index > 7) {
        if (alfval >  10.0) { plty[0][index] = plty[2][index] ; }
        if (alfval < -10.0) { plty[1][index] = plty[2][index] ; }
      }
      // *******
    }
    this.set('pltx', pltx);
    this.set('plty', plty);

    this.set('begx', 0);
    this.set('endx', 100);
    this.set('ntikx', 5);
    this.set('ntiky', 6);
    //      begy = 0.0 ;
    //      endy = 500. ;
    this.set('laby', "Vel");
    if (lunits === 0) { this.set('labyu', "mph"); }
    if (lunits === 1) { this.set('labyu', "kmh"); }
    this.set('labx', " X ");
    if (foil <= 3) { this.set('labxu', "% chord"); }
    if (foil >= 4) { this.set('labxu', "% diameter"); }
  },

  loadLiftDragVsAltitude: function(lconv, planet) {
    var npt = this.set('npt', 20);
    var ntr = this.set('ntr', 1);
    var nabs = this.set('nabs', 6);  var nord = this.set('nord', 3);
    var begx = this.set('begx', 0.0), endx = this.set('endx', 50.0), ntikx = this.set('ntikx', 6);
    var pltx = this.get('pltx'), plty = this.get('plty');
    var lunits = this.get("lunits");
    if (lunits === 0) { this.set('endx', endx=50.0); }
    if (lunits === 1) { this.set('endx', endx=15.0); }
    this.set('labx', "Altitude");
    if (lunits === 0) { this.set('labxu', "k-ft"); }
    if (lunits === 1) { this.set('labxu', "km"); }
    var del = this.get('altmax') / npt ;
    var ic;
    for (ic=1; ic <=npt; ++ic) {
      hpl = (ic-1)*del ;
      pltx[0][ic] = lconv*hpl/1000 ;
      var tpl = 518.6 ;
      var ppl = 2116 ;
      if (planet === 0) {
        if (hpl < 36152)   {
          tpl = 518.6 - 3.56 * hpl /1000 ;
          ppl = 2116 * Math.pow(tpl/518.6, 5.256) ;
        }
        else {
          tpl = 389.98 ;
          ppl = 2116 * 0.236 * Math.exp((36000-hpl)/(53.35*tpl)) ;
        }
        if (doutb === 0) { plty[0][ic] = fconv*lftref * ppl/(tpl*53.3*32.17) / rho ; }
        if (doutb === 1) { plty[0][ic] = fconv*drgref * ppl/(tpl*53.3*32.17) / rho ; }
      }
      if (planet === 1) {
        if (hpl <= 22960) {
          tpl = 434.02 - 0.548 * hpl/1000 ;
          ppl = 14.62 * Math.pow(2.71828,-0.00003 * hpl) ;
        }
        if (hpl > 22960) {
          tpl = 449.36 - 1.217 * hpl/1000 ;
          ppl = 14.62 * Math.pow(2.71828,-0.00003 * hpl) ;
        }
        if (doutb === 0) { plty[0][ic] = fconv*lftref * ppl/(tpl*1149) / rho ; }
        if (doutb === 1) {plty[0][ic] = fconv*drgref * ppl/(tpl*1149) / rho ; }
      }
      if (planet === 2) {
        if (doutb === 0) { plty[0][ic] = fconv*lftref; }
        if (doutb === 1) { plty[0][ic] = fconv*drgref; }
      }
    }
    this.set('ntiky', 5);
    if (doutb === 0) { this.set('laby', "Lift"); }
    if (doutb === 1) { this.set('laby', "Drag"); }
    pltx[1][0] = alt/1000 ;
    if (doutb === 0) { plty[1][0] = lftref*fconv; }
    if (doutb === 1) { plty[1][0] = drgref*fconv; }
    if (lunits === 0) { this.set('labyu', "lbs"); }
    if (lunits === 1) { this.set('labyu', "N"); }
    this.set("pltx", pltx);
    this.set('plty', plty);
  },
  
  loadLiftDragVsAngle: function(clref, drgref, lftref, cdref) {
    var dout = this.get('dout'), pltx = this.get('pltx'), plty = this.get('plty'), 
        fconv = this.get('fconv'), camval = this.get('camval'), 
        caminpt = this.get('caminpt'), npt = 21;
    var ic, clpl, cdpl, del, angl;
    this.set('npt', npt);
    this.set('ntr', 1);
    this.set('nabs', 2); this.set('nord', 3);
    this.set('begx', -20.0); this.set('endx',20.0); this.set('ntikx', 5);
    this.set('labx', 'Angle');
    this.set('labxu', "degrees");
    del = 40.0 / (npt-1) ;
    for (ic=1; ic <=npt; ++ic) {
      angl = -20.0 + (ic-1)*del;
      clpl = this.getClplot(camval,this.get('thkval'),angl) ;
      this.set('alfd', angl);
      this.set('thkd', thkinpt);
      this.set('camd', caminpt);

      //   attempt to fix symmetry problem
      if (this.get('camd') < 0.0) { this.set('alfd', -angl); }
      //
      this.getDrag(clpl) ;
      cdpl = this.get('dragco') ;

      if ( dout <= 1) {
        pltx[0][ic] = angl ;
        if (dout === 0) { plty[0][ic] = fconv*lftref * clpl/clref ; }
        if (dout === 1) { plty[0][ic] = 100*clpl ; }
      }
      else {
        pltx[0][ic] = angl ;
        if (dout === 2) { plty[0][ic] = fconv*drgref * cdpl/cdref ; }
        if (dout === 3) { plty[0][ic] = 100*cdpl ; }
      }
    }
    this.set('ntiky', 5);
    pltx[1][0] = this.get('alfval') ;
    if (dout === 0) {
      this.set('laby', "Lift");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = lftref*fconv ;
    }
    if (dout === 1) {
      this.set('laby', "Cl");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('clift') ;
    }
    if (dout === 2) {
      this.set('laby', "Drag");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = drgref*fconv ;
    }
    if (dout === 3) {
      this.set('laby', "Cd");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('dragCoeff');
    }              
    this.set('pltx', pltx); this.set('plty', plty);
  },

  loadLiftDragVsThickness: function(clref, drgref, lftref, cdref) {
    var ic, clpl, cdpl, del, angl;
    var npt;
    var pltx = this.get('pltx'), plty = this.get('plty'), fconv = this.get('fconv'),
        alfval = this.get('alfval'), camval = this.get('camval'),
        caminpt = this.get('caminpt'), dout = this.get('dout');
    this.set('npt', npt = 20);
    this.set('ntr', 1);
    this.set('nabs', 3);  this.set('nord', 3);
    this.set('begx',0.0); this.set('endx',20.0); this.set('ntikx',5);
    this.set('labx', "Thickness ");
    this.set('labxu', "% chord");
    del = 1.0 / (npt) ;
    for (ic=1; ic <=npt; ++ic) {
      this.set('thkpl', 0.05 + (ic-1)*del);
      clpl = this.getClplot(camval,this.get('thkpl'),alfval) ;
      this.set('alfd', alfval);
      this.set('thkd', this.get('thkpl')*25.0);
      this.set('camd', caminpt);
      //   attempt to fix symmetry problem
      if (this.get('camd') < 0.0) { this.set('alfd', -alfval); }
      //
      this.getDrag(clpl) ;
      cdpl = this.get('dragco');

      if ( dout <= 1) {
        pltx[0][ic] = thkpl*25 ;
        if (dout === 0) { plty[0][ic] = fconv*lftref * clpl/clref ; }
        if (dout === 1) { plty[0][ic] = 100*clpl ; }
      }
      else {
        pltx[0][ic] = thkd ;
        if (dout === 2) { plty[0][ic] = fconv*drgref * cdpl/cdref ; }
        if (dout === 3) { plty[0][ic] = 100*cdpl ; }
      }
    }
    ntiky = 5 ;
    pltx[1][0] = thkinpt ;
    if (dout === 0) {
      this.set('laby', "Lift");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = lftref*fconv ;
    }
    if (dout === 1) {
      this.set('laby', "Cl");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('clift') ;
    }
    if (dout === 2) {
      this.set('laby', "Drag");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = drgref*fconv ;
      plty[0][npt]= plty[0][npt-1]= plty[0][npt-2]=plty[0][npt-3]=plty[0][npt-4] ;
    }
    if (dout === 3) {
      this.set('laby', "Cd");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('dragCoeff') ;
      plty[0][npt] = plty[0][npt-1] = plty[0][npt-2]=plty[0][npt-3]=plty[0][npt-4] ;
    }
    this.set('pltx', pltx); this.set('plty', plty);
  },

  loadLiftDragVsCamber: function() {
    var ic, clpl, cdpl, del, angl;
    var npt, campl;
    var pltx = this.get('pltx'), plty = this.get('plty'), fconv = this.get('fconv'),
        alfval = this.get('alfval'), camval = this.get('camval'),
        caminpt = this.get('caminpt'), dout = this.get('dout');

    this.set('npt', npt = 21 );
    this.set('ntr', 1 );
    this.set('nabs', 4);  this.set('nord', 3 );
    this.set('begx', -20); this.set('endx', 20); this.set('ntikx', 5);
    this.set('labx', "Camber ");
    this.set('labxu', "% chord");
    del = 2.0 / (npt-1) ;
    for (ic=1; ic <=npt; ++ic) {
      campl = -1.0 + (ic-1)*del ;
      clpl = this.getClplot(campl,this.get('thkval'),alfval) ;
      this.set('alfd', alfval);
      this.set('thkd', thkinpt);
      this.set('camd', campl * 25.0);
      //   attempt to fix symmetry problem
      if (camd < 0.0) { this.set('alfd', - alfval); }
      //
      this.getDrag(clpl) ;
      cdpl = this.get('dragco') ;

      if ( dout <= 1) {
        pltx[0][ic] = campl*25.0 ;
        if (dout === 0) { plty[0][ic] = fconv*lftref * clpl/clref ; } 
        if (dout === 1) { plty[0][ic] = 100*clpl ; }
      }
      else {
        pltx[0][ic] = this.get('camd') ;
        if (dout === 2) { plty[0][ic] = fconv*drgref * cdpl/cdref ; }
        if (dout === 3) { plty[0][ic] = 100*cdpl ; }
      }
    }
    this.set('ntiky', 5) ;
    pltx[1][0] = caminpt ;
    if (dout === 0) {
      this.set('laby', "Lift");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = lftref*fconv ;
    }
    if (dout === 1) {
      this.set('laby', "Cl");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('clift') ;
    }
    if (dout === 2) {
      this.set('laby', "Drag");
      if (lunits === 0) { this.set('labyu', "lbs"); }
      if (lunits === 1) { this.set('labyu', "N"); }
      plty[1][0] = drgref*fconv ;
      plty[0][1] = plty[0][2]= plty[0][3] ;
      plty[0][npt] = plty[0][npt -1] = plty[0][npt - 2] ;
    }
    if (dout === 3) {
      this.set('laby', "Cd");
      this.set('labyu', "x 100 ");
      plty[1][0] = 100*this.get('dragCoeff') ;
      plty[0][1] = plty[0][2]= plty[0][3] ;
      plty[0][npt] = plty[0][npt -1] = plty[0][npt-2] ;
    }
    this.set('pltx', pltx); this.set('plty', plty);
  },

  loadLiftDragVsSpeed: function(lftref, drgref) {
    var del, spd, npt;
    var fconv = this.get('fconv'), vfsd = this.get('vfsd'),
        pltx = this.get('pltx'), plty = this.get('plty');
    this.set('npt', npt = 20 );
    this.set('ntr', 1 );
    this.set('nabs', 5);  this.set('nord', 3 );
    this.set('begx', 0.0); this.set('endx', 300.0); this.set('ntikx', 7);
    this.set('labx', "Speed ");
    if (lunits === 0) { this.set('labxu', "mph"); }
    if (lunits === 1) { this.set('labxu', "kmh"); }
    del = this.get('vmax') / npt ;
    for (ic=1; ic <=npt; ++ic) {
      spd = (ic-1)*del ;
      pltx[0][ic] = spd ;
      if (doutb === 0) { plty[0][ic] = fconv*lftref * spd * spd / (vfsd * vfsd) ; }
      if (doutb === 1) { plty[0][ic] = fconv*drgref * spd * spd / (vfsd * vfsd) ; }
    }
    this.set('ntiky', 5 );
    if (doutb === 0) { this.set('laby', "Lift"); }
    if (doutb === 1) { this.set('laby', "Drag"); }
    pltx[1][0] = vfsd ;
    if (doutb === 0) { plty[1][0] = lftref*fconv ; }
    if (doutb === 1) { plty[1][0] = drgref*fconv ; }
    if (lunits === 0) { this.set('labyu', "lbs"); }
    if (lunits === 1) { this.set('labyu', "N"); }
    this.set('pltx', pltx); this.set('plty', plty);
  },

  loadPlot: function() {
    var rad,ang,xc,yc,lftref,clref,drgref,cdref ;
    var spd,awng,ppl,tpl,hpl,angl,thkpl,campl,clpl,cdpl ;
    var index,ic ;
    var q0 = this.get('q0'), area = this.get("area"), lconv = this.get("lconv"),
        alfval = this.get('alfval'), thkinpt = this.get('thkinpt'),
        caminpt = this.get('caminpt'), xpl = this.get('xpl'), ypl = this.get('ypl'),
        nlnc = this.get('nlnc'), nptc = this.get('nptc'), foil = this.get('foil'),
        dispp = this.get('dispp'), planet = this.get('planet');
    this.set('lines', 1);
    clref = this.getClplot(this.get('camval'),this.get('thkval'),this.get('alfval')) ;
    if (Math.abs(clref) <= 0.001) { 
      clref = 0.001 
    };    /* protection */
    lftref = clref * q0 * area/lconv/lconv ;
    this.set('alfd', alfval);
    this.set('thkd', thkinpt);
    this.set('camd', caminpt);
    //   attempt to fix symmetry problem
    if (this.get('camd') < 0.0) { this.set('alfd', -alfval); }
    //
    this.getDrag(clref) ;
    cdref = this.get('dragco');
    drgref = cdref * q0 * area/lconv/lconv ;

    var xm = this.get("xm"), ym = this.get("ym");
    // load up the view image
    for (ic = 0; ic <= nlnc; ++ ic) {
      for (index = 0; index <= nptc; ++ index) {
        if (foil <= 3) {
          xpl[ic][index] = xm[ic][index] ;
          ypl[ic][index] = ym[ic][index] ;
        }
        if (foil >= 4) {
          xpl[ic][index] = xg[ic][index] ;
          ypl[ic][index] = yg[ic][index] ;
        }
      }
    }
    // probe
    for (index = 0; index <= nptc; ++ index) {
      if (foil <= 3) {
        xpl[19][index] = xm[19][index] ;
        ypl[19][index] = ym[19][index] ;
        this.set('pxpl', this.get('pxm'));
        this.set('pypl', this.get('pym'));
      }
      if (foil >= 4) {
        xpl[19][index] = this.get('xg')[19][index] ;
        ypl[19][index] = this.get('yg')[19][index] ;
        this.set('pxpl', this.get('pxg'));
        this.set('pypl', this.get('pyg'));
      }
    }
    this.set('xpl', xpl);
    this.set('ypl', ypl);

    //  load up surface plots

    if (dispp === 0) {    // pressure variation
      this.loadPressureSurfacePlot();
    }
    if (dispp === 1) {    // velocity variation
      this.loadVelocitySurfacePlot();
    }

    //  load up performance plots

    if (dispp === 2) {    // lift or drag versus angle
      this.loadLiftDragVsAngle(clref, drgref, lftref, cdref);
    }

    if (dispp === 3) {    // lift or drag versus thickness
      this.loadLiftDragVsThickness(clref, drgref, lftref, cdref);
    }

    if (dispp === 4) {    // lift or drag versus camber
      this.loadLiftDragVsCamber(clref, drgref, lftref, cdref);
    }

    if (dispp === 5) {    // lift and drag versus speed
      this.loadLiftDragVsSpeed(lftref, drgref);
    }

    if (dispp === 6) {    // lift and drag versus altitude
      this.loadLiftDragVsAltitude(lconv, planet)
    }

    if (dispp === 7) {    // lift and drag versus area
      npt = 2 ;
      ntr = 1 ;
      nabs = 7;  nord = 3 ;
      begx=0.0; ntikx=6;
      labx = "Area ";
      if (lunits === 0) {
        labxu = "sq ft";
        endx = 2000.0 ;
        labyu = "lbs";
        pltx[0][1] = 0.0 ;
        plty[0][1] = 0.0 ;
        pltx[0][2] = 2000 ;
        if (doutb === 0) plty[0][2] = fconv*lftref * 2000 /area ;
        if (doutb === 1) plty[0][2] = fconv*drgref * 2000 /area ;
      }
      if (lunits === 1) {
        labxu = "sq m";
        endx = 200 ;
        labyu = "N";
        pltx[0][1] = 0.0 ;
        plty[0][1] = 0.0 ;
        pltx[0][2] = 200 ;
        if (doutb === 0) plty[0][2] = fconv*lftref * 200 /area ; 
        if (doutb === 1) plty[0][2] = fconv*drgref * 200 /area ; 
      }

      ntiky = 5 ;
      pltx[1][0] = area ;
      if (doutb === 0) {
        laby = "Lift";
        plty[1][0] = lftref*fconv ;
      }
      else {
        laby = "Drag";
        plty[1][0] = drgref*fconv ;
      }
    }

    if (dispp === 8) {    // lift and drag versus density
      npt = 2 ;
      ntr = 1 ;
      nabs = 7; nord = 3 ;
      begx=0.0; ntikx=6;
      labx = "Density ";
      if (planet === 0) {
        if (lunits === 0) {
          labxu = "x 10,000 slug/cu ft";
          endx = 25.0 ;
          pltx[0][1] = 0.0 ;
          plty[0][1] = 0.0 ;
          pltx[0][2] = 23.7 ;
          if (doutb === 0) plty[0][2] = fconv*lftref * 23.7 /(rho*10000);
          if (doutb === 1) plty[0][2] = fconv*drgref * 23.7 /(rho*10000);
          pltx[1][0] = rho*10000 ;
        }
        if (lunits === 1) {
          labxu = "g/cu m";
          endx = 1250 ;
          pltx[0][1] = 0.0 ;
          plty[0][1] = 0.0 ;
          pltx[0][2] = 1226 ;
          if (doutb === 0) plty[0][2] = fconv*lftref * 23.7 /(rho*10000);
          if (doutb === 1) plty[0][2] = fconv*drgref * 23.7 /(rho*10000);
          pltx[1][0] = rho*1000*515.4 ;
        }
      }

      if (planet === 1) {
        if (lunits === 0) {
          labxu = "x 100,000 slug/cu ft";
          endx = 5.0 ;
          pltx[0][1] = 0.0 ;
          plty[0][1] = 0.0 ;
          pltx[0][2] = 2.93 ;
          if (doutb === 0) plty[0][2] = fconv*lftref * 2.93 /(rho*100000);
          if (doutb === 1) plty[0][2] = fconv*drgref * 2.93 /(rho*100000);
          pltx[1][0] = rho*100000 ;
        }
        if (lunits === 1) {
          labxu = "g/cu m";
          endx = 15 ;
          pltx[0][1] = 0.0 ;
          plty[0][1] = 0.0 ;
          pltx[0][2] = 15.1 ;
          if (doutb === 0) plty[0][2] = fconv*lftref * 2.93 /(rho*100000);
          if (doutb === 1) plty[0][2] = fconv*drgref * 2.93 /(rho*100000);
          pltx[1][0] = rho*1000*515.4 ;
        }
      }
      ntiky = 5 ;
      if (doutb === 0) laby = "Lift";
      if (doutb === 1) laby = "Drag";
      if (doutb === 0) plty[1][0] = lftref*fconv ;
      if (doutb === 1) plty[1][0] = drgref*fconv ;
      if (lunits === 0) labyu = "lbs";
      if (lunits === 1) labyu = "N";
    }

    if (dispp === 9) {    // drag polar
      npt = 20 ;
      ntr = 1 ;
      nabs = 2;  nord = 3 ;
      ntikx=5;
      del = 40.0 / npt ;
      for (ic=1; ic <=npt; ++ic) {
        angl = -20.0 + (ic-1)*del ;
        clpl = this.getClplot(camval,thkval,angl) ;
        plty[0][ic] = 100 * clpl ;
        alfd = angl ;
        thkd = thkinpt ;
        camd = caminpt ;
        //   attempt to fix symmetry problem
        if (camd < 0.0) alfd = - angl ;
        //
        this.getDrag(clpl) ;
        cdpl = dragco ;
        pltx[0][ic] = 100*cdpl ;
      }
      ntiky = 5 ;
      pltx[1][0] = cdref * 100 ;    
      plty[1][0] = clref * 100 ;                        
      labx = "Cd";
      labxu = "x 100";
      laby = "Cl";
      labyu = "x 100 ";
    }              

    if (dispp >= 2 && dispp < 6) {  // determine y - range zero in middle
      if(dout <=1) {
        if (plty[0][npt] >= plty[0][1]) {
          begy=0.0 ;
          if (plty[0][1]   > endy) endy = plty[0][1]  ;
          if (plty[0][npt] > endy) endy = plty[0][npt]  ;
          if (endy <= 0.0) {
            begy = plty[0][1] ;
            endy = plty[0][npt] ;
          }
        }
        if (plty[0][npt] < plty[0][1]) {
          endy = 0.0 ;
          if (plty[0][1]   < begy) begy = plty[0][1]  ;
          if (plty[0][npt] < begy) begy = plty[0][npt]  ;
          if (begy <= 0.0) {
            begy = plty[0][npt] ;
            endy = plty[0][1] ;
          }
        }
      }
      else {
        begy = 0.0 ;
        endy = 0.0 ;
        for (index =1; index <= npt; ++ index) {
          if (plty[0][index] > endy) endy = plty[0][index] ;
        }
      }
    }

    if (dispp >= 6 && dispp <= 8) {    // determine y - range
      if (plty[0][npt] >= plty[0][1]) {
        begy = plty[0][1]  ;
        endy = plty[0][npt]  ;
      }
      if (plty[0][npt] < plty[0][1]) {
        begy = plty[0][npt]  ;
        endy = plty[0][1]  ;
      }
    }

    if (dispp === 9) {    // determine y - range and x- range
      begx = 0.0 ;
      endx = 0.0 ;
      for (index =1; index <= npt; ++ index) {
        if (pltx[0][index] > endx) endx = pltx[0][index] ;
      }

      begy = plty[0][1]  ;
      endy = plty[0][1] ;
      for (index =1; index <= npt; ++ index) {
        if (plty[0][index] > endy) endy = plty[0][index] ;
      }
    }

    if (dispp >= 0 && dispp <= 1) {    // determine y - range
      if (this.get('calcrange') === 0) {
        var plty = this.get('plty');
        var begy = plty[0][1] ;
        var endy = plty[0][1] ;
        var npt2 = this.get("npt2");
        for (index = 1; index <= npt2; ++ index) {
          if (plty[0][index] < begy) { begy = plty[0][index] ; }
          if (plty[1][index] < begy) { begy = plty[1][index] ; }
          if (plty[0][index] > endy) { endy = plty[0][index] ; }
          if (plty[1][index] > endy) { endy = plty[1][index] ; }
        }
        this.set('calcrange', 1);
      }
      this.set('begy', begy); this.set('endy', endy);
    }

    // now, set stuff back that we changed above
    this.set('xpl', xpl); this.set('ypl', ypl);
  },

  getClplot: function(camb, thic, angl) {
    var beta,xc,yc,rc,gamc,lec,tec,lecm,tecm,crdc,
        stfact, number;
    
    xc = 0.0 ;
    yc = camb / 2.0 ;
    rc = thic/4.0 + Math.sqrt( thic*thic/16.0 + yc*yc + 1.0);
    xc = 1.0 - Math.sqrt(rc*rc - yc*yc) ;
    beta = Math.asin(yc/rc)/this.get('convdr') ;       /* Kutta condition */
    gamc = 2.0*rc*Math.sin((angl+beta)*this.get('convdr')) ;
    lec = xc - Math.sqrt(rc*rc - yc*yc) ;
    tec = xc + Math.sqrt(rc*rc - yc*yc) ;
    lecm = lec + 1.0/lec ;
    tecm = tec + 1.0/tec ;
    crdc = tecm - lecm ;
    // stall model 1
    stfact = 1.0 ;
    if (this.get('anflag') === 1) {
      if (angl > 10.0 ) {
        stfact = 0.5 + 0.1 * angl - 0.005 * angl * angl ;
      }
      if (angl < -10.0 ) {
        stfact = 0.5 - 0.1 * angl - 0.005 * angl * angl ;
      }
    }
    
    number = stfact*gamc*4.0*3.1415926/crdc ;

    if (this.get('arcor') === 1) {  // correction for low aspect ratio
      number = number /(1.0 + Math.abs(number)/(3.14159*this.get('aspr'))) ;
    }

    return number;
  },

  getFreeStream: function() {
    var hite,pvap,rgas,gama,mu0 ;       /* MODS  19 Jan 00  whole routine*/

    this.set('g0', 32.2);
    rgas = 1718 ;                /* ft2/sec2 R */
    gama = 1.4 ;
    hite = this.get('alt')/this.get('lconv') ;
    mu0 = 0.000000362 ;
    if (this.get('planet') === 0) {    // Earth  standard day
      if (hite <= 36152) {           // Troposphere
        this.set('ts0', 518.6 - 3.56 * hite/1000) ;
        this.set('ps0', 2116 * Math.pow(this.get('ts0')/518.6,5.256)) ;
      }
      if (hite >= 36152 && hite <= 82345) {   // Stratosphere
        this.set('ts0', 389.98);
        this.set('ps0', 2116 * 0.2236 * Math.exp((36000-hite)/(53.35*389.98)));
      }
      if (hite >= 82345) {
        this.set('ts0', 389.98 + 1.645 * (hite-82345)/1000);
        this.set('ps0', 2116 * 0.02456 * Math.pow(this.get('ts0')/389.98,-11.388));
      }
      this.set('temf', this.get('ts0') - 459.6);
      if (this.get('temf') <= 0.0) { this.set('temf', 0.0); }
      /* Eq 1:6A  Domasch  - effect of humidity 
         rlhum = 0.0 ;
         presm = ps0 * 29.92 / 2116 ;
         pvap = rlhum*(2.685+.00353*Math.pow(temf,2.245));
         rho = (ps0 - .379*pvap)/(rgas * ts0) ; 
      */
      this.set('rho', this.get('ps0')/(rgas * this.get('ts0'))) ;
      this.set('viscos', mu0 * 717.408/(this.get('ts0') + 198.72)*Math.pow(this.get('ts0')/518.688,1.5)) ;
    }
      
    if (this.get('planet') === 1) {   // Mars - curve fit of orbiter data
      rgas = 1149 ;                /* ft2/sec2 R */
      gama = 1.29 ;

      if (hite <= 22960) {
        this.set('ts0', 434.02 - 0.548 * hite/1000) ;
        this.set('ps0', 14.62 * Math.pow(2.71828,-0.00003 * hite)) ;
      }
      if (hite > 22960) {
        this.set('ts0', 449.36 - 1.217 * hite/1000) ;
        this.set('ps0', 14.62 * Math.pow(2.71828,-0.00003 * hite));
      }
      this.set('rho', this.get('ps0')/(rgas*this.get('ts0'))) ;
      this.set('viscos', mu0 * 717.408/(this.get('ts0') + 198.72)*Math.pow(this.get('ts0')/518.688,1.5)) ;
    }

    if (this.get('planet') === 2) {   // water --  constant density
      hite = -alt/lconv ;
      this.set('ts0', 520) ;
      this.set('rho', 1.94) ;
      this.set('ps0', (2116 - this.get('rho') * this.get('g0') * hite)) ;
      mu0 = 0.0000272 ;
      this.set('viscos', mu0 * 717.408/(this.get('ts0') + 198.72)*Math.pow(this.get('ts0')/518.688,1.5)) ;
    }

    if (this.get('planet') === 3) {   // specify air temp and pressure 
      this.set('rho', this.get('ps0')/(rgas*this.get('ts0'))) ;
      this.set('viscos', mu0 * 717.408/(this.get('ts0') + 198.72)*Math.pow(this.get('ts0')/518.688,1.5)) ;
    }

    if (this.get('planet') === 4) {   // specify fluid density and viscosity
      this.set('ps0', 2116) ;
    }
    
    var vconv = this.get('vconv');
    this.set('q0', 0.5 * this.get('rho') * this.get('vfsd') * this.get('vfsd') / (vconv * vconv)) ;
    this.set('pt0', this.get('ps0') + this.get('q0'));
  },

  getCirc: function() {
    var thet,rdm,thtm, beta,
    thkval = this.get('thkval'), alfval = this.get('alfval'),
    convdr = this.get('convdr'), camval = this.get('camval'),
    radius = this.get('radius'), lconv = this.get('lconv'),
    vconv = this.get('vconv'), vfsd = this.get('vfsd'),
    spindr = this.get('spindr'), gamval;

    this.set('xcval', 0.0) ;
    switch (this.get('foil'))  {
    case 1:                  /* Juokowski geometry*/
      this.set('ycval', camval / 2.0) ;
      this.set('rval', this.get('thkval')/4.0 +Math.sqrt(thkval*thkval/16.0+this.get('ycval')*this.get('ycval') +1.0));
      this.set('xcval', 1.0 - Math.sqrt(this.get('rval')*this.get('rval') - this.get('ycval')*this.get('ycval'))) ;
      beta = Math.asin(this.get('ycval')/this.get('rval'))/convdr ;     /* Kutta condition */
      this.set('gamval', 2.0*this.get('rval')*Math.sin((alfval+beta)*convdr)) ;
      break ;
    case 2:                  /* Elliptical geometry*/
      this.set('ycval', camval / 2.0) ;
      this.set('rval', thkval/4.0 + Math.sqrt(thkval*thkval/16.0+this.get('ycval')*this.get('ycval')+1.0));
      beta = Math.asin(this.get('ycval')/this.get('rval'))/convdr ;    /* Kutta condition */
      this.set('gamval', 2.0*this.get('rval')*Math.sin((alfval+this.get('beta'))*convdr)) ;
      break ;
    case 3:                  /* Plate geometry*/
      this.set('ycval', camval / 2.0) ;
      this.set('rval',  Math.sqrt(this.get('ycval')*this.get('ycval')+1.0));
      beta = Math.asin(this.get('ycval')/this.get('rval'))/convdr ;    /* Kutta condition */
      this.set('gamval', 2.0*this.get('rval')*Math.sin((alfval+this.get("beta"))*convdr)) ;
      break ;
    case 4:        /* get circulation for rotating cylnder */
      this.set('rval', radius/lconv) ;
      gamval = 4.0 * 3.1415926 * 3.1415926 * this.get('spin') * this.get('rval') * this.get('rval') / 
        (vfsd/vconv) ;
      this.set('gamval', gamval * spindr);
      this.set('ycval', 0.0001) ;
      break ;
    case 5:        /* get circulation for rotating ball */
      this.set('rval', radius/lconv);
      gamval = 4.0 * 3.1415926 * 3.1415926 * this.get('spin') * this.get('rval') * this.get('rval') /
        (vfsd/vconv) ;
      this.set('gamval', gamval * spindr) ;
      this.set('ycval', 0.0001) ;
      break ;
    }
    // geometry
    var nptc = this.get('nptc'), xg = this.get('xg'), yg = this.get('yg'), 
        rg = this.get('rg'), thg = this.get('thg'), xm = this.get('xm'), ym = this.get('ym'),
        plp = this.get('plp'), plv = this.get('plv'), ps0 = this.get("ps0"), pres = this.get('pres'),
        q0 = this.get("q0"), pconv = this.get('pconv');
    for (var index =1; index <= nptc; ++index) {
      thet = (index -1)*360/(nptc-1) ;
      xg[0][index] = this.get('rval') * Math.cos(convdr * thet) + this.get('xcval') ;
      yg[0][index] = this.get('rval') * Math.sin(convdr * thet) + this.get('ycval') ;
      rg[0][index] = Math.sqrt(xg[0][index]*xg[0][index] +
                               yg[0][index]*yg[0][index])  ;
      thg[0][index] = Math.atan2(yg[0][index],xg[0][index])/convdr;
      xm[0][index] = (rg[0][index] + 1.0/rg[0][index])*
        Math.cos(convdr*thg[0][index]) ;
      ym[0][index] = (rg[0][index] - 1.0/rg[0][index])*
        Math.sin(convdr*thg[0][index]) ;
      rdm = Math.sqrt(xm[0][index]*xm[0][index] +
                      ym[0][index]*ym[0][index])  ;
      thtm = Math.atan2(ym[0][index],xm[0][index])/convdr;
      xm[0][index] = rdm * Math.cos((thtm - alfval)*convdr);
      ym[0][index] = rdm * Math.sin((thtm - alfval)*convdr);
      this.getVel(this.get('rval'),thet) ;
      plp[index] = ((ps0 + pres * q0)/2116) * pconv ;
      plv[index] = this.get('vel') * vfsd ;
    }
    this.set('xm', xm); this.set('ym', ym); this.set('plp', plp); this.set('plv', plv);
    this.set('xg', xg); this.set('yg', yg); this.set('rg', rg); this.set('thg', thg);

    var spanfac = this.get('spanfac'), xt = this.get('xt'), yt = this.get('yt');
    this.set('xt1', xt + spanfac) ;
    this.set('yt1', yt - spanfac) ;
    this.set('xt2', xt - spanfac) ;
    this.set('yt2', yt + spanfac) ;
  },

  getVel: function(rad, theta) {  //velocity and pressure 
    var ur,uth,jake1,jake2,jakesq ;
    var xloc,yloc,thrad,alfrad ;
    var convdr = this.get('convdr'), rval = this.get('rval');
    var gamval = this.get('gamval'), xcval = this.get('xcval'),
        ycval = this.get('ycval'), alfval = this.get('alfval');

    thrad = convdr * theta ;
    alfrad = convdr * alfval ;
    /* get x, y location in cylinder plane */
    xloc = rad * Math.cos(thrad) ;
    yloc = rad * Math.sin(thrad) ;
    /* velocity in cylinder plane */
    ur  = Math.cos(thrad-alfrad)*(1.0-(rval*rval)/(rad*rad)) ;
    uth = -Math.sin(thrad-alfrad)*(1.0+(rval*rval)/(rad*rad)) -
      gamval/rad;
    var usq = ur*ur + uth*uth;
    this.set('usq', usq);
    this.set('vxdir', ur * Math.cos(thrad) - uth * Math.sin(thrad)) ; // MODS  20 Jul 99 
    /* translate to generate airfoil  */
    xloc = xloc + xcval ;
    yloc = yloc + ycval ;
    /* compute new radius-theta  */
    rad = Math.sqrt(xloc*xloc + yloc*yloc) ;
    thrad  = Math.atan2(yloc,xloc) ;
    /* compute Joukowski Jacobian  */
    jake1 = 1.0 - Math.cos(2.0*thrad)/(rad*rad) ;
    jake2 = Math.sin(2.0*thrad)/(rad*rad) ;
    jakesq = jake1*jake1 + jake2*jake2 ;
    if (Math.abs(jakesq) <= 0.01) { jakesq = 0.01 ; } /* protection */
    var vsq = this.get('usq') / jakesq;
    this.set('vsq', vsq) ;
    /* vel is velocity ratio - pres is coefficient  (p-p0)/q0   */
    if (this.get('foil') <= 3) {
      this.set('vel', Math.sqrt(vsq)) ;
      this.set('pres', 1.0 - vsq) ;
    }
    if (this.get('foil') >= 4) {
      this.set('vel', Math.sqrt(usq)) ;
      this.set('pres', 1.0 - usq) ;
    }
  },

  getPoints: function(fxg, psv) {   // flow in x-psi
    var radm,thetm ;                /* MODS  20 Jul 99  whole routine*/
    var fnew,ynew,yold,rfac,deriv ;
    var iter, lyg;
    var alfval = this.get('alfval'), gamval = this.get('gamval'),
    convdr = this.get('convdr'), xcval = this.get('xcval'), ycval = this.get('ycval'),
    rval = this.get('rval');

    /* get variables in the generating plane */
    /* iterate to find value of yg */
    ynew = 10.0 ;
    yold = 10.0 ;
    if (psv < 0.0) { ynew = -10.0 ; }
    if (Math.abs(psv) < 0.001 && alfval < 0.0) { ynew = rval ; }
    if (Math.abs(psv) < 0.001 && alfval >= 0.0) { ynew = -rval ; }
    fnew = 0.1 ;
    iter = 1 ;
    while (Math.abs(fnew) >= 0.00001 && iter < 25) {
      ++iter ;
      rfac = fxg*fxg + ynew*ynew ;
      if (rfac < rval*rval) { rfac = rval*rval + 0.01 ; }
      fnew = psv - ynew*(1.0 - rval*rval/rfac) -
        gamval*Math.log(Math.sqrt(rfac)/rval) ;
      deriv = - (1.0 - rval*rval/rfac) -
        2.0 * ynew*ynew*rval*rval/(rfac*rfac) -
        gamval * ynew / rfac ;
      yold = ynew ;
      ynew = yold  - 0.5*fnew/deriv ;
    }
    lyg = yold ;
    /* rotate for angle of attack */
    this.set('lrg', Math.sqrt(fxg*fxg + lyg*lyg)) ;
    this.set('lthg', Math.atan2(lyg,fxg)/convdr) ;
    this.set('lxgt', this.get('lrg') * Math.cos(convdr*(this.get('lthg') + alfval))) ;
    this.set('lygt', this.get('lrg') * Math.sin(convdr*(this.get('lthg') + alfval))) ;
    /* translate cylinder to generate airfoil */
    this.set('lxgt', this.get('lxgt') + xcval) ;
    this.set('lygt', this.get('lygt') + ycval) ;
    var lrgt = Math.sqrt(this.get('lxgt')*this.get('lxgt') + this.get('lygt')*this.get('lygt'));
    this.set('lrgt', lrgt);
    this.set('lthgt', Math.atan2(this.get('lygt'),this.get('lxgt'))/convdr) ;
    /*  Kutta-Joukowski mapping */
    this.set('lxm', (lrgt + 1.0/lrgt)*Math.cos(convdr*this.get('lthgt'))) ;
    this.set('lym', (lrgt - 1.0/lrgt)*Math.sin(convdr*this.get('lthgt'))) ;
    /* tranforms for view fixed with free stream */
    /* take out rotation for angle of attack mapped and cylinder */
    radm = Math.sqrt(this.get('lxm')*this.get('lxm')+this.get('lym')*this.get('lym')) ;
    thetm = Math.atan2(this.get('lym'),this.get('lxm'))/convdr ;
    this.set('lxmt', radm*Math.cos(convdr*(thetm-alfval))) ;
    this.set('lymt', radm*Math.sin(convdr*(thetm-alfval))) ;

    this.set('lxgt', this.get('lxgt') - xcval) ;
    this.set('lygt', this.get('lygt') - ycval) ;
    this.set('lrgt', Math.sqrt(this.get('lxgt')*this.get('lxgt') + this.get('lygt')*this.get('lygt')) ) ;
    this.set('lthgt', Math.atan2(this.get('lygt'),this.get('lxgt'))/convdr);
    this.set('lxgt', this.get('lrgt') * Math.cos((this.get('lthgt') - alfval)*convdr));
    this.set('lygt', this.get('lrgt') * Math.sin((this.get('lthgt') - alfval)*convdr));
  },

  genFlow: function() {
    var rnew,thet,psv,fxg,stfact;
    var k,index;
    var nlnc = this.get("nlnc"), nptc = this.get('nptc'),
        nln2 = this.get('nln2'), alfval = this.get('alfval'),
        npt2 = this.get('npt2'), rval = this.get('rval'),
        pid2 = this.get('pid2'), anflag = this.get('anflag'),
        xcval = this.get('xcval'), ycval = this.get('ycval'),
        convdr = this.get('convdr'),
        xg = this.get('xg'), yg = this.get('yg'),
        rg = this.get('rg'), thg = this.get('thg'),
        xm = this.get('xm'), ym = this.get('ym'),
        vxdir = this.get("vxdir"), deltb = this.get("deltb"),
        lrg = this.get('lrg'), lthg = this.get('lthg');
    /* all lines of flow  except stagnation line*/
    for (k=1; k<=nlnc; ++k) {
      psv = -0.5*(nln2-1) + 0.5*(k-1) ;
      console.log('psv: ' + psv);
      fxg = this.get('xflow') ;
      for (index =1; index <=nptc; ++ index) {
        if (typeof(xg[k])  === 'undefined') {  xg[k]  = []; }
        if (typeof(yg[k])  === 'undefined') {  yg[k]  = []; }
        if (typeof(rg[k])  === 'undefined') {  rg[k]  = []; }
        if (typeof(thg[k]) === 'undefined') {  thg[k] = []; }
        if (typeof(xm[k])  === 'undefined') {  xm[k]  = []; }
        if (typeof(ym[k])  === 'undefined') {  xm[k]  = []; }

        this.getPoints (fxg,psv) ;
        xg[k][index]  = this.get('lxgt') ;
        yg[k][index]  = this.get('lygt') ;
        rg[k][index]  = this.get('lrgt') ;
        thg[k][index] = this.get('lthgt') ;
        xm[k][index]  = this.get('lxmt') ;
        ym[k][index]  = this.get('lymt') ;
        if (anflag === 1) {           // stall model
          if (alfval > 10.0 && psv > 0.0) {
            if (xm[k][index] > 0.0) {
              ym[k][index] = ym[k][index -1] ;
            }
          }
          if (alfval < -10.0 && psv < 0.0) {
            if (xm[k][index] > 0.0) {
              ym[k][index] = ym[k][index -1] ;
            }
          }
        }
        this.getVel(this.get('lrg'),this.get('lthg')) ;
        fxg = fxg + this.get('vxdir')*deltb ;
      }
    }
    this.set('xg', xg); this.set('yg', yg); this.set('rg', rg);
    this.set('thg', thg); this.set('xm', xm); this.set('ym', ym);
    /*  stagnation line */
    k = nln2 ;
    psv = 0.0 ;
    /*  incoming flow */
    var gamval = this.get("gamval");
    for (index =1; index <= npt2; ++index) {
      rnew = 10.0 - (10.0 - rval)*Math.sin(pid2*(index-1)/(npt2-1)) ;
      thet = Math.asin(0.999*(psv - gamval*Math.log(rnew/rval))/
                       (rnew - rval*rval/rnew)) ;
      fxg =  - rnew * Math.cos(thet) ;
      this.getPoints (fxg,psv) ;
      xg[k][index]  = this.get('lxgt') ;
      yg[k][index]  = this.get('lygt') ;
      rg[k][index]  = this.get('lrgt') ;
      thg[k][index] = this.get('lthgt') ;
      xm[k][index]  = this.get('lxmt') ;
      ym[k][index]  = this.get('lymt') ;
    }
    /*  downstream flow */
    for (index = 1; index <= npt2; ++ index) {
      rnew = 10.0 + 0.01 - (10.0 - rval)*Math.cos(pid2*(index-1)/(npt2-1)) ;
      thet = Math.asin(0.999*(psv - gamval*Math.log(rnew/rval))/
                       (rnew - rval*rval/rnew)) ;
      fxg =   rnew * Math.cos(thet) ;
      this.getPoints (fxg,psv) ;
      xg[k][npt2+index]  = this.get('lxgt') ;
      yg[k][npt2+index]  = this.get('lygt') ;
      rg[k][npt2+index]  = this.get('lrgt') ;
      thg[k][npt2+index] = this.get('lthgt') ;
      xm[k][npt2+index]  = this.get('lxmt') ;
      ym[k][npt2+index]  = this.get('lymt') ;
    }
    /*  stagnation point */
    xg[k][npt2]  = xcval ;
    yg[k][npt2]  = ycval ;
    rg[k][npt2]  = Math.sqrt(xcval*xcval+ycval*ycval) ;
    thg[k][npt2] = Math.atan2(ycval,xcval)/convdr ;
    xm[k][npt2]  = (xm[k][npt2+1] + xm[k][npt2-1])/2.0 ;
    ym[k][npt2]  = (ym[0][nptc/4+1] + ym[0][nptc/4*3+1])/2.0 ;
    /*  compute lift coefficient */
    this.set('leg', xcval - Math.sqrt(rval*rval - ycval*ycval)) ;
    this.set('teg', xcval + Math.sqrt(rval*rval - ycval*ycval)) ;
    this.set('lem', this.get('leg') + 1.0/this.get('leg')) ;
    this.set('tem', this.get('teg') + 1.0/this.get('teg')) ;
    this.set('chrd', this.get('tem') - this.get('lem')) ;
    this.set('clift', this.get('gamval')*4.0*3.1415926/this.get('chrd')) ;
    // stall model
    stfact = 1.0 ;
    if (anflag === 1) {
      if (alfval > 10.0 ) {
        stfact = 0.5 + 0.1 * alfval - 0.005 * alfval * alfval ;
      }
      if (alfval < -10.0 ) {
        stfact = 0.5 - 0.1 * alfval - 0.005 * alfval * alfval ;
      }
      this.set('clift', this.get('clift') * stfact) ;
    }
    
    if (this.get('arcor') === 1) {  // correction for low aspect ratio
      this.set('clift', this.get('clift') /(1.0 + Math.abs(this.get('clift'))/(3.14159*this.get('aspr')))) ;
    }
  },

  loadProbe: function() {   // probe output routine
    this.set("pbval", 0);
    if (this.get("pboflag") === 1) { this.set("pbval", vel * vfsd); }          // velocity
    if (this.get("pboflag") === 2) { this.set("pbval", ((this.get("ps0") + this.get("pres") * this.get("q0"))/2116) * this.get("pconv")); } // pressure
  },

  getProbe: function() { /* all of the information needed for the probe */
    var prxg, index,
    xpval = this.get("xpval"), ypval = this.get("ypval"),
    xg = this.get("xg"), yg = this.get("yg"), rg = this.get("rg"), 
    thg = this.get("thg"), xm = this.get("xm"), ym = this.get("ym"),
    anflag = this.get("anflag"), alfval = this.get("alfval");
    /* get variables in the generating plane */
    if (Math.abs(this.get("ypval")) < 0.01) {
      this.set("ypval", 0.05);
    }
    this.getPoints (this.get("xpval"),this.get("ypval")) ;

    this.getVel(this.get("lrg"),this.get("lthg")) ;
    this.loadProbe() ;

    this.set("pxg",  this.get("lxgt"));
    this.set("pyg",  this.get('lygt'));
    this.set("prg",  this.get('lrgt'));
    this.set("pthg", this.get('lthgt'));
    this.set("pxm",  this.get('lxmt'));
    this.set("pym",  this.get('lymt'));
    /* smoke */
    if (this.get("pboflag") === 3 ) {
      prxg = xpval ;
      for (index =1; index <=nptc; ++ index) {
        this.getPoints (prxg,ypval) ;
        xg[19][index] = lxgt ;
        yg[19][index] = lygt ;
        rg[19][index] = lrgt ;
        thg[19][index] = lthgt ;
        xm[19][index] = lxmt ;
        ym[19][index] = lymt ;
        if (anflag === 1) {           // stall model
          if (xpval > 0) {
            if (alfval > 10 && ypval > 0) { 
              ym[19][index] = ym[19][1] ;
            } 
            if (alfval < -10 && ypval < 0) {
              ym[19][index] = ym[19][1] ;
            }
          }
          if (xpval < 0.0) {
            if (alfval > 10 && ypval > 0) { 
              if (xm[19][index] > 0.0) {
                ym[19][index] = ym[19][index-1] ;
              }
            } 
            if (alfval < -10 && ypval < 0) {
              if (xm[19][index] > 0) {
                ym[19][index] = ym[19][index-1] ;
              }
            }
          }
        }
        this.getVel(this.get("lrg"),this.get("lthg")) ;
        prxg = prxg + this.get('vxdir')*deltb ;
      }
    }
    this.set("xg", xg); this.set("yg", yg), this.set("rg", rg); this.set("thg", thg);
    this.set("xm", xm); this.set("ym", ym);
  },

  setDefaults: function() {
    this.set('arcor', 1 );
    this.set('indrag', 1 );
    this.set('recor', 1 );
    this.set('bdragflag', 1);  // smooth ball
    this.set('planet', 0 );
    this.set('lunits', 0 );
    this.set('lftout', 0 );
    this.set('inptopt', 0 );
    this.set('outopt', 0 );
    this.set('nlnc', 15 );
    this.set('nln2', Math.floor(this.get('nlnc')/2) + 1 );
    this.set('nptc', 37 );
    this.set('npt2', Math.floor(this.get('nptc')/2) + 1 );
    this.set('deltb', 0.5 );
    this.set('foil', 1 );
    this.set('flflag', 1);
    this.set('thkval', 0.5 );
    this.set('thkinpt', 12.5 );                   /* MODS 10 SEP 99 */
    this.set('camval', 0.0 );
    this.set('caminpt', 0.0 );
    this.set('alfval', 5.0 );
    this.set('gamval', 0.0 );
    this.set('radius', 1.0 );
    this.set('spin', 0.0 );
    this.set('spindr', 1.0 );
    this.set('rval', 1.0 );
    this.set('ycval', 0.0 );
    this.set('xcval', 0.0 );
    this.set('displ', 1 );                            
    this.set('viewflg', 0 );
    this.set('dispp', 0 );
    this.set('calcrange', 0 );
    this.set('dout', 0 );
    this.set('doutb', 0 );

    this.set('dragCoeff', 0);

    this.set('xpval', 2.1);
    this.set('ypval', -0.5 );
    this.set('pboflag', 0 );
    this.set('xflow', -10.0);                             /* MODS  20 Jul 99 */

    this.set('pconv', 14.7);
    this.set('pmin', 0.5 );
    this.set('pmax', 1.0 );
    this.set('fconv', 1.0 );
    this.set('fmax', 100000 );
    this.set('fmaxb', 0.50 );
    this.set('vconv', 0.6818 );
    this.set('vfsd', 100 );
    this.set('vmax', 250 );
    this.set('lconv', 1.0 );

    this.set('alt', 0.0 );
    this.set('altmax', 50000 );
    this.set('chrdold', this.set('chord', 5.0 ));
    this.set('spnold', this.set('span', 20.0 ));
    this.set('aspr', 4.0 );
    this.set('arold', this.set('area', 100.0 ));
    this.set('armax', 2500.01 );
    this.set('armin', 0.01 );                 /* MODS 9 SEP 99 */
    
    this.set('xt', 170);  
    this.set('yt', 105); 
    this.set('fact', 30.0 );
    this.set('sldloc', 50 );
    this.set('xtp', 95); 
    this.set('ytp', 165); 
    this.set('factp', 30.0 );
    this.set('spanfac', Math.floor(2.0*this.get('fact')*this.get('aspr')*0.3535) );
    this.set('xt1', this.get('xt') + this.get('spanfac') );
    this.set('yt1', this.get('yt') - this.get('spanfac') );
    this.set('xt2', this.get('xt') - this.get('spanfac') );
    this.set('yt2', this.get('yt') + this.get('spanfac') );
    var plthg = this.get('plthg');
    plthg[1] = 0;
    this.set('plthg', plthg);
    
    this.set('probflag', 0 );
    this.set('anflag', 1 );
    this.set('vmn', 0.0);
    this.set('vmx', 250.0 );
    this.set('almn', 0.0);    
    this.set('almx', 50000.0);
    this.set('angmn', -20.0); 
    this.set('angmx', 20.0 );
    this.set('camn', -20.0);  
    this.set('camx', 20.0 );
    this.set('thkmn', 1.0); 
    this.set('thkmx', 20.0 );
    this.set('chrdmn', 0.1);  
    this.set('chrdmx', 20.1 );
    this.set('spanmn', 0.1);  
    this.set('spanmx', 125.1 );
    this.set('armn', 0.01);  
    this.set('armx', 2500.01 );
    this.set('spinmn', -1500.0); 
    this.set('spinmx', 1500.0 );
    this.set('radmn', 0.05);   
    this.set('radmx', 5.0 );
  }
}) ;
