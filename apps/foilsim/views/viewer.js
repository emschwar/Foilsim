// ==========================================================================
// Project:   Foilsim.Viewer
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Foilsim */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Foilsim.Viewer = SC.View.extend(
/** @scope Foilsim.Viewer.prototype */ {
  init: function() {
    sc_super();
    this.set('backgroundColor', 'black');
    this.set('antim', 0);
    this.set('ancol', 1);
  },

  // TODO: Add your own code here.
  render: function(context, firstTime) {
    if (firstTime) {
      var layout = this.get('layout');
      context.push('<canvas width="%@" height="%@"></canvas>'.fmt(layout.width, layout.height));
      this.timer = SC.Timer.schedule({
        target: this, action: 'run', interval: 100,
        repeats: YES
      });
    }
  },

  run: function() {
    var antim  = this.get('antim'),
        ancol  = this.get('ancol'),
        foil   = this.getPath('content.foil'),
        vfsd   = this.getPath('content.vfsd'),
        vconv  = this.getPath('content.vconv'),
        plthg  = this.getPath('content.plthg'),
        spin   = this.getPath('content.spin'),
        spindr = this.getPath('content.spindr');
    this.set('antim', antim+1);
    this.paintView();
    if(this.get('antim') === 3) {
      this.set('antim', 0);
      this.set('ancol', - ancol); /* MODS 27 JUL 99 */
    }
    this.timer.set('interval', 135 - (0.227 * vfsd / vconv));

    // make the ball spin
    if (foil >= 4) {
      plthg[1] = plthg[1] + spin*spindr*5 ;
      if (plthg[1] < -360.0) {
        plthg[1] = plthg[1] + 360.0 ;
      }
      if (plthg[1] > 360.0) {
        plthg[1] = plthg[1] - 360.0 ;
      }
      this.content.set('plthg', plthg);
    }
  },

  paintLabels: function(ctx, viewflg, displ) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,350,30) ;
    ctx.fillStyle = 'white';
    ctx.fillText("View:",35,10) ;
    if (viewflg === 0) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Edge",95,10) ;
    if (viewflg === 1) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Top",145,10) ;
    if (viewflg === 2) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Side-3D",180,10) ;
    ctx.fillStyle = 'red';
    ctx.fillText("Find",240,10) ;

    if (displ === 0) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Streamlines",85,25) ;
    if (displ === 1) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Moving",160,25) ;
    if (displ === 2) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Frozen",210,25) ;
    if (displ === 3) { ctx.fillStyle = 'yellow' ; }
    else { ctx.fillStyle = 'cyan' ; }
    ctx.fillText("Geometry",260,25) ;
    ctx.fillStyle = 'white' ;
    ctx.fillText("Display:",35,25) ;
    // zoom in
    ctx.fillStyle = 'black' ;
    ctx.fillRect(0,30,30,150) ;
    ctx.fillStyle = 'green' ;
    ctx.fillText("Zoom",2,180) ;
    ctx.strokeStyle = 'green';
    this.strokeLine(ctx, 15, 35, 15, 165)
    ctx.fillRect(5,this.getPath('content.sldloc'),20,5) ;

    ctx.restore();
  },

  fillPolygon: function(ctx, exes, whys, faces) {
    ctx.beginPath();
    ctx.moveTo(exes[0], whys[0]);
    for(var i = 1; i < faces; i++) {
      ctx.lineTo(exes[i], whys[i]);
    }
    ctx.closePath();
    ctx.fill();
  },

  strokeLine: function(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
  },

  fillOval: function(ctx, x, y, w, h) {
    var kappa = .5522848;
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.fill();
  },

  paintTopView: function(ctx, displ) {
    var fact = this.getPath('content.fact'),
        span = this.getPath('content.span'),
       chord = this.getPath('content.chord'),
          xt = this.getPath('content.xt'), yt = this.getPath('content.yt'),
        foil = this.getPath('content.foil'),
        exes = [], whys = [];

    ctx.save();
    ctx.fillStyle = 'white' ;
    exes[0] = Math.floor((0.25*fact*(-span)) + xt);
    whys[0] = Math.floor((0.25*fact*(-chord)) + yt);
    exes[1] = Math.floor((0.25*fact*(-span)) + xt);
    whys[1] = Math.floor((0.25*fact*(chord)) + yt);
    exes[2] = Math.floor((0.25*fact*(span)) + xt);
    whys[2] = Math.floor((0.25*fact*(chord)) + yt);
    exes[3] = Math.floor((0.25*fact*(span)) + xt);
    whys[3] = Math.floor((0.25*fact*(-chord)) + yt);
    this.fillPolygon(ctx,exes,whys,4) ;
    ctx.strokeStyle = ctx.fillStyle = '#66FF33' ;
    this.strokeLine(ctx, exes[0],whys[1]+5,exes[2],whys[1]+5) ;
    ctx.fillText("Span",exes[2]-20,whys[1]+20) ;
    this.strokeLine(ctx,exes[2]+5,whys[0],exes[2]+5,whys[1]) ;
    this.textAlign = 'right';
    if (foil <= 3) ctx.fillText("Chord",exes[2]+10,55) ;
    if (foil === 4) ctx.fillText("Diameter",exes[2]+10,55) ;
    this.textAlign = 'left';
    ctx.fillText("Flow",45,145) ;
    this.strokeLine(ctx,40,155,40,125) ;
    exes[0] = 35 ;  exes[1] = 45; exes[2] = 40 ;
    whys[0] = 125 ;  whys[1] = 125; whys[2] = 115 ;
    this.fillPolygon(ctx,exes,whys,3) ;
    ctx.restore();
  },

  paintEdgeView: function(ctx, viewflg, displ) {
    var vfsd = this.getPath('content.vfsd'),
        nln2 = this.getPath('content.nln2'), npt2 = this.getPath('content.npt2'),
        nptc = this.getPath('content.nptc'), nlnc = this.getPath('content.nlnc'),
        fact = this.getPath('content.fact'),
        xt = this.getPath('content.xt'), yt = this.getPath('content.yt'),
        xpl = this.getPath('content.xpl'), ypl = this.getPath('content.ypl'),
        planet = this.getPath('content.planet'),
        displ = this.getPath('content.displ'), foil = this.getPath('content.foil'),
        antim = this.get('antim'), ancol = this.get('ancol'),
        pboflag = this.getPath('content.pboflag'),
        color = ['cyan', 'orange', '#66FF33'][planet],
        exes = [], whys = [], camx = [], camy = [],
        slope, xvec, yvec;
    if (typeof(color) === 'undefined') { color = 'cyan'; }

    if (vfsd > .01) {

      /* plot airfoil flowfield */
      radvec = 0.5 ;
      for (var j=1; j<=nln2-1; ++j) {           /* lower half */
        for (var i=1 ; i<= nptc-1; ++i) {
          exes[0] = Math.floor((fact*xpl[j][i]) + xt);
          whys[0] = Math.floor((fact*(-ypl[j][i])) + yt);
          slope = (ypl[j][i+1]-ypl[j][i])/(xpl[j][i+1]-xpl[j][i]) ;
          xvec = xpl[j][i] + radvec / Math.sqrt(1.0 + slope*slope) ;
          yvec = ypl[j][i] + slope * (xvec - xpl[j][i]) ;
          exes[1] = Math.floor((fact*xvec) + xt);
          whys[1] = Math.floor((fact*(-yvec)) + yt);
          if (displ === 0) {                   /* MODS  21 JUL 99 */
            ctx.strokeStyle = 'yellow' ;
            exes[1] = Math.floor((fact*xpl[j][i+1]) + xt);
            whys[1] = Math.floor((fact*(-ypl[j][i+1])) + yt);
            this.strokeLine(ctx,exes[0],whys[0],exes[1],whys[1]) ;
          }
          if (displ === 2 && (i/3*3 === i) ) {
            ctx.strokeStyle = color;
            for (n=1 ; n <= 4 ; ++n) {
              if(i == 6 + (n-1)*9) { ctx.strokeStyle = color; }
            }
            if(Math.floor(i/9)*9 === i) { ctx.strokeStyle = 'white'; }
            this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
          }
          if (displ === 1 && (Math.floor((i-antim)/3)*3 === (i-antim)) ) {
            if (ancol === -1) {          /* MODS  27 JUL 99 */
              if(Math.floor((i-antim)/6)*6 === (i-antim)) { ctx.strokeStyle = color; }
              if(Math.floor((i-antim)/6)*6 !== (i-antim)) { ctx.strokeStyle = 'white'; }
            }
            if (ancol === 1) {          /* MODS  27 JUL 99 */
              if(Math.floor((i-antim)/6)*6 === (i-antim)) { ctx.strokeStyle = 'white'; }
              if(Math.floor((i-antim)/6)*6 !== (i-antim)) { ctx.strokeStyle = color; }
            }
            this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
          }
        }
      }
      
      ctx.strokeStyle='white'; /* stagnation */
      exes[1] = Math.round((fact*xpl[nln2][1]) + xt);
      whys[1] = Math.round((fact*(-ypl[nln2][1])) + yt);
      for (i=2 ; i<= npt2-1; ++i) {
        exes[0] = exes[1] ;
        whys[0] = whys[1] ;
        exes[1] = Math.round((fact*xpl[nln2][i]) + xt);
        whys[1] = Math.round((fact*(-ypl[nln2][i])) + yt);
        if (displ <= 2) {             /* MODS  21 JUL 99 */
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
      }
      exes[1] = Math.round((fact*xpl[nln2][npt2+1]) + xt);
      whys[1] = Math.round((fact*(-ypl[nln2][npt2+1])) + yt);
      for (i=npt2+2 ; i<= nptc; ++i) {
        exes[0] = exes[1] ;
        whys[0] = whys[1] ;
        exes[1] = Math.round((fact*xpl[nln2][i]) + xt);
        whys[1] = Math.round((fact*(-ypl[nln2][i])) + yt);
        if (displ <= 2) {                         /* MODS  21 JUL 99 */
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
      }
      /*  probe location */
      if (pboflag > 0 && pypl <= 0.0) {
        ctx.fillStyle = 'magenta';
        this.fillOval(ctx,Math.round((fact*pxpl) + xt),
                          Math.round(fact*(-pypl)) + yt - 2, 5, 5);
        this.strokeStyle = 'white';
        exes[0] = Math.round((fact*(pxpl + .1)) +xt);
        whys[0] = Math.round((fact*(-pypl)) + yt);
        exes[1] = Math.round((fact*(pxpl + .5)) +xt) ;
        whys[1] = Math.round((fact*(-pypl)) + yt) ;
        exes[2] = Math.round((fact*(pxpl + .5)) +xt) ;
        whys[2] = Math.round((fact*(-pypl +50.)) +yt) ;
        this.strokeLine(ctx,exes[0],whys[0],exes[1],whys[1]) ;
        this.strokeLine(ctx,exes[1],whys[1],exes[2],whys[2]) ;
        if (pboflag == 3) {    /* smoke trail  MODS  21 JUL 99 */
          this.strokeStyle = 'green';
          for (i=1 ; i<= nptc-1; ++i) {
            exes[0] = Math.round( (fact*xpl[19][i]) + xt );
            whys[0] = Math.round( (fact*(-ypl[19][i])) + yt );
            slope = (ypl[19][i+1]-ypl[19][i])/(xpl[19][i+1]-xpl[19][i]) ;
            xvec = xpl[19][i] + radvec / Math.sqrt(1.0 + slope*slope) ;
            yvec = ypl[19][i] + slope * (xvec - xpl[19][i]) ;
            exes[1] = Math.round( (fact*xvec) + xt );
            whys[1] = Math.round( (fact*(-yvec)) + yt );
            if ((i-antim)/3*3 == (i-antim) ) {
              this.strokeLine(ctx,exes[0],whys[0],exes[1],whys[1]) ;
            }
          }
        }
      }
    }
    //   //  wing surface
    //   if (viewflg == 2) {           // 3d geom
    //     off1Gg.setColor(Color.red) ;
    //     exes[1] = (int) (fact*(xpl[0][npt2])) + xt1 ;
    //     whys[1] = (int) (fact*(-ypl[0][npt2])) + yt1 ;
    //     exes[2] = (int) (fact*(xpl[0][npt2])) + xt2 ;
    //     whys[2] = (int) (fact*(-ypl[0][npt2])) + yt2 ;
    //     for (i=1 ; i<= npt2-1; ++i) {
    //       exes[0] = exes[1] ;
    //       whys[0] = whys[1] ;
    //       exes[1] = (int) (fact*(xpl[0][npt2-i])) + xt1 ;
    //       whys[1] = (int) (fact*(-ypl[0][npt2-i])) + yt1 ;
    //       exes[3] = exes[2] ;
    //       whys[3] = whys[2] ;
    //       exes[2] = (int) (fact*(xpl[0][npt2-i])) + xt2 ;
    //       whys[2] = (int) (fact*(-ypl[0][npt2-i])) + yt2 ;
    //       off1Gg.fillPolygon(exes,whys,4) ;
    //     }
    //   }

    for (j=nln2+1; j<=nlnc; ++j) {          /* upper half */
      for (i=1 ; i<= nptc-1; ++i) {
        exes[0] = Math.floor((fact*xpl[j][i]) + xt);
        whys[0] = Math.floor((fact*(-ypl[j][i])) + yt);
        slope = (ypl[j][i+1]-ypl[j][i])/(xpl[j][i+1]-xpl[j][i]) ;
        xvec = xpl[j][i] + radvec / Math.sqrt(1.0 + slope*slope) ;
        yvec = ypl[j][i] + slope * (xvec - xpl[j][i]) ;
        exes[1] = Math.floor((fact*xvec) + xt);
        whys[1] = Math.floor((fact*(-yvec)) + yt);
        if (displ == 0) {                     /* MODS  21 JUL 99 */
          ctx.strokeStyle = color;
          exes[1] = Math.floor((fact*xpl[j][i+1]) + xt);
          whys[1] = Math.floor((fact*(-ypl[j][i+1])) + yt);
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
        if (displ == 2 && (i/3*3 == i) ) {
          ctx.strokeStyle = color;   /* MODS  27 JUL 99 */
          for (n=1 ; n <= 4 ; ++n) {
            if(i == 6 + (n-1)*9) { ctx.strokeStyle = 'yellow' };
          }
          if(i/9*9 == i) { ctx.strokeStyle = 'white' }
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
        if (displ == 1 && (Math.floor((i-antim)/3)*3 == (i-antim)) ) {
          if (ancol == -1) {          /* MODS  27 JUL 99 */
            if(Math.floor((i-antim)/6)*6 == (i-antim)) { ctx.strokeStyle = color; }
            if(Math.floor((i-antim)/6)*6 != (i-antim)) { ctx.strokeStyle = 'white'; }
          }
          if (ancol == 1) {          /* MODS  27 JUL 99 */
            if(Math.floor((i-antim)/6)*6 == (i-antim)) { ctx.strokeStyle = 'white'; }
            if(Math.floor((i-antim)/6)*6 != (i-antim)) { ctx.strokeStyle = color; }
          }
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
      }
    }
    //   /*  probe location */
    //   if (pboflag > 0 && pypl > 0.0) {
    //     off1Gg.setColor(Color.magenta) ;
    //     off1Gg.fillOval((int) (fact*pxpl) + xt,
    //                  (int) (fact*(-pypl)) + yt - 2,5,5);
    //     off1Gg.setColor(Color.white) ;
    //     exes[0] = (int) (fact*(pxpl + .1)) +xt ;
    //     whys[0] = (int) (fact*(-pypl)) + yt ;
    //     exes[1] = (int) (fact*(pxpl + .5)) +xt ;
    //     whys[1] = (int) (fact*(-pypl)) + yt ;
    //     exes[2] = (int) (fact*(pxpl + .5)) +xt ;
    //     whys[2] = (int) (fact*(-pypl -50.)) +yt ;
    //     off1Gg.drawLine(exes[0],whys[0],exes[1],whys[1]) ;
    //     off1Gg.drawLine(exes[1],whys[1],exes[2],whys[2]) ;
    //     if (pboflag == 3) {    /* smoke trail  MODS  21 JUL 99 */
    //       off1Gg.setColor(Color.green) ;
    //       for (i=1 ; i<= nptc-1; ++i) {
    //         exes[0] = (int) (fact*xpl[19][i]) + xt ;
    //         whys[0] = (int) (fact*(-ypl[19][i])) + yt ;
    //         slope = (ypl[19][i+1]-ypl[19][i])/(xpl[19][i+1]-xpl[19][i]) ;
    //         xvec = xpl[19][i] + radvec / Math.sqrt(1.0 + slope*slope) ;
    //         yvec = ypl[19][i] + slope * (xvec - xpl[19][i]) ;
    //         exes[1] = (int) (fact*xvec) + xt ;
    //         whys[1] = (int) (fact*(-yvec)) + yt ;
    //         if ((i-antim)/3*3 == (i-antim) ) {
    //           off1Gg.drawLine(exes[0],whys[0],exes[1],whys[1]) ;
    //         }
    //       }
    //     }
    //   }
    // }
    
    if (viewflg == 0) {
      // draw the airfoil geometry
      ctx.strokeStyle = 'white'
      exes[1] = Math.floor( (fact*(xpl[0][npt2])) + xt );
      whys[1] = Math.floor( (fact*(-ypl[0][npt2])) + yt );
      exes[2] = Math.floor( (fact*(xpl[0][npt2])) + xt );
      whys[2] = Math.floor( (fact*(-ypl[0][npt2])) + yt );
      for (i=1 ; i<= npt2-1; ++i) {
        exes[0] = exes[1] ;
        whys[0] = whys[1] ;
        exes[1] = Math.floor( (fact*(xpl[0][npt2-i])) + xt );
	whys[1] = Math.floor( (fact*(-ypl[0][npt2-i])) + yt );
        exes[3] = exes[2] ;
        whys[3] = whys[2] ;
        exes[2] = Math.floor( (fact*(xpl[0][npt2+i])) + xt );
        whys[2] = Math.floor( (fact*(-ypl[0][npt2+i])) + yt );
        camx[i] = (exes[1] + exes[2]) / 2 ;
        camy[i] = (whys[1] + whys[2]) / 2 ;
        if (foil == 3) {
          ctx.strokeStyle = 'yellow';
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
        }
        else {
          ctx.fillStyle = 'white';
          this.fillPolygon(ctx, exes,whys,4) ;
        }
      }
      // put some info on the geometry
      if (displ == 3) {
        if (foil <= 3) {
          var inmax = 1 ;
          for (n=1; n <= nptc; ++n) {
            if(xpl[0][n] > xpl[0][inmax]) { inmax = n ; }
          }
          ctx.strokeStyle = ctx.fillStyle = 'green';
          exes[0] = Math.floor( (fact*(xpl[0][inmax])) + xt );
          whys[0] = Math.floor( (fact*(-ypl[0][inmax])) + yt );
          this.strokeLine(ctx, exes[0],whys[0],exes[0]-250,whys[0]) ;
	  this.fillText("Reference",30,whys[0]+10) ;
          this.fillText("Angle",exes[0]+20,whys[0]) ;
          
          ctx.strokeStyle = ctx.fillStyle = 'cyan';
          exes[1] = Math.floor( (fact*(xpl[0][inmax] -
				       4.0*Math.cos(convdr*alfval)))+xt );
          whys[1] = Math.floor( (fact*(-ypl[0][inmax] -
				       4.0*Math.sin(convdr*alfval)))+yt );
          this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
          this.fillText("Chord Line",exes[0]+20,whys[0]+20) ;
          
          ctx.strokeStyle = ctx.fillStyle = 'red';
          this.strokeLine(ctx, exes[1],whys[1],camx[5],camy[5]) ;
          for (i=7 ; i<= npt2-6; i = i+2) {
            this.strokeLine(ctx, camx[i],camy[i],camx[i+1],camy[i+1]) ;
          }
          this.fillText("Mean Camber Line",exes[0]-70,whys[1]-10) ;
        }
        if (foil >= 4) {
          ctx.strokeStyle = ctx.fillStyle = 'red' ;
          exes[0] = Math.floor( (fact*(xpl[0][1])) + xt );
	  whys[0] = Math.floor( (fact*(-ypl[0][1])) + yt );
	  exes[1] = Math.floor( (fact*(xpl[0][npt2])) +xt );
	  whys[1] = Math.floor( (fact*(-ypl[0][npt2])) + yt );
          this.strokeLine( ctx, exes[0],whys[0],exes[1],whys[1]) ;
          this.fillText("Diameter",exes[0]+20,whys[0]+20) ;
        }
        
        ctx.strokeStyle = ctx.fillStyle = 'green';
        this.fillText("Flow",30,145) ;
        this.strokeLine(ctx, 30,152,60,152) ;
        exes[0] = 60 ;  exes[1] = 60; exes[2] = 70 ;
        whys[0] = 157 ;  whys[1] = 147 ; whys[2] = 152  ;
        this.fillPolygon(ctx, exes,whys,3) ;
      }
      //  spin the cylinder and ball
      if (foil >= 4) {
        exes[0] = Math.floor( (fact* (0.5*(xpl[0][1] + xpl[0][npt2]) +
				      rval * Math.cos(convdr*(plthg[1] + 180)))) + xt );
        whys[0] = Math.floor( (fact* (-ypl[0][1] +
				      rval * Math.sin(convdr*(plthg[1] + 180)))) + yt );
        exes[1] = Math.floor( (fact* (0.5*(xpl[0][1] + xpl[0][npt2]) +
				      rval * Math.cos(convdr*plthg[1]))) + xt );
        whys[1] = Math.floor( (fact* (-ypl[0][1] +
				      rval * Math.sin(convdr*plthg[1]))) + yt );
        ctx.strokeStyle = 'red';
        this.strokeLine(ctx, exes[0],whys[0],exes[1],whys[1]) ;
      }
    }
    // if (viewflg == 2) {
    //   //   front foil
    //   off1Gg.setColor(Color.white) ;
    //   exes[1] = (int) (fact*(xpl[0][npt2])) + xt2 ;
    //   whys[1] = (int) (fact*(-ypl[0][npt2])) + yt2 ;
    //   exes[2] = (int) (fact*(xpl[0][npt2])) + xt2 ;
    //   whys[2] = (int) (fact*(-ypl[0][npt2])) + yt2 ;
    //   for (i=1 ; i<= npt2-1; ++i) {
    //     exes[0] = exes[1] ;
    //     whys[0] = whys[1] ;
    //     exes[1] = (int) (fact*(xpl[0][npt2-i])) + xt2 ;
    //     whys[1] = (int) (fact*(-ypl[0][npt2-i])) + yt2 ;
    //     exes[3] = exes[2] ;
    //     whys[3] = whys[2] ;
    //     exes[2] = (int) (fact*(xpl[0][npt2+i])) + xt2 ;
    //     whys[2] = (int) (fact*(-ypl[0][npt2+i])) + yt2 ;
    //     camx[i] = (exes[1] + exes[2]) / 2 ;
    //     camy[i] = (whys[1] + whys[2]) / 2 ;
    //     off1Gg.fillPolygon(exes,whys,4) ;
    //   }
    //   // put some info on the geometry
    //   if (displ == 3) {
    //     off1Gg.setColor(Color.green) ;
    //     exes[1] = (int) (fact*(xpl[0][1])) + xt1 + 20 ;
    //     whys[1] = (int) (fact*(-ypl[0][1])) + yt1 ;
    //     exes[2] = (int) (fact*(xpl[0][1])) + xt2 + 20 ;
    //     whys[2] = (int) (fact*(-ypl[0][1])) + yt2 ;
    //     off1Gg.drawLine(exes[1],whys[1],exes[2],whys[2]) ;
    //     off1Gg.drawString("Span",exes[2]+10,whys[2]+10) ;

    //     exes[1] = (int) (fact*(xpl[0][1])) + xt2 ;
    //     whys[1] = (int) (fact*(-ypl[0][1])) + yt2 + 15 ;
    //     exes[2] = (int) (fact*(xpl[0][npt2])) + xt2  ;
    //     whys[2] = whys[1] ;
    //     off1Gg.drawLine(exes[1],whys[1],exes[2],whys[2]) ;
    //     if (foil <= 3) off1Gg.drawString("Chord",exes[2]+10,whys[2]+15);
    //     if (foil >= 4) off1Gg.drawString("Diameter",exes[2]+10,whys[2]+15);

    //     off1Gg.drawString("Flow",40,75) ;
    //     off1Gg.drawLine(30,82,60,82) ;
    //     exes[0] = 60 ;  exes[1] = 60; exes[2] = 70 ;
    //     whys[0] = 87 ;  whys[1] = 77 ; whys[2] = 82  ;
    //     off1Gg.fillPolygon(exes,whys,3) ;
    //   }
    //   //  spin the cylinder and ball
    //   if (foil >= 4) {
    //     exes[0] = (int) (fact* (.5*(xpl[0][1] + xpl[0][npt2]) +
    //                          rval * Math.cos(convdr*(plthg[1] + 180.)))) + xt2 ;
    //     whys[0] = (int) (fact* (-ypl[0][1] +
    //                          rval * Math.sin(convdr*(plthg[1] + 180.)))) + yt2 ;
    //     exes[1] = (int) (fact* (.5*(xpl[0][1] + xpl[0][npt2]) +
    //                          rval * Math.cos(convdr*plthg[1]))) + xt2 ;
    //     whys[1] = (int) (fact* (-ypl[0][1] +
    //                          rval * Math.sin(convdr*plthg[1]))) + yt2 ;
    //     off1Gg.setColor(Color.red) ;
    //     off1Gg.drawLine(exes[0],whys[0],exes[1],whys[1]) ;
    //   }
    // }
  },

  clearCanvas: function(canvas, ctx) {
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();
  },
  paintView: function() {
    var canvas = this.$('canvas')[0],
        ctx = canvas.getContext("2d"),
        planet = this.getPath('content.planet'),
        viewflg = this.getPath('content.viewflg'),
        displ = this.getPath('content.displ'),
        availableViews = [ this.paintEdgeView,
                           this.paintTopView,
                           this.paintEdgeView ];
    this.clearCanvas(canvas, ctx);
    ctx.font = "10pt sans-serif";
    ctx.fillStyle = this.get('backgroundColor');
    ctx.fillRect(0,0,500, 500);
    this.paintEdgeView(ctx, viewflg, displ);
    // availableViews[this.get('content.viewflg')](ctx);
    this.paintLabels(ctx, viewflg, displ);
  }

  // mouseDown: function(evt) {
  // },

  // mouseUp: function(evt) {
  // }


});
