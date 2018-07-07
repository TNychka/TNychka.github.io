// taken from https://codepen.io/paultreny/pen/nJyvG/
function glitch(element, text) {
  var textSize = 10;
  var glitcher = {

    init: function () {
      setTimeout((function () {
        this.canvas = document.getElementById(element);
        this.context = this.canvas.getContext('2d');

        this.initOptions();
        this.resize();
        this.tick();
      }).bind(this), 100);
    },

    initOptions: function () {
      this.width = document.documentElement.offsetWidth;
      this.textSize = Math.floor(this.width / 7);
      this.height = this.textSize + 50;

      // sets text size based on window size
      if (this.textSize > this.height) {
        this.canvas.height = this.textSize;
        this.height = this.textSize;
      }
      // tries to make text fit if window is
      // very wide, but not very tall
      this.font = '900 ' + this.textSize + 'px "Orbitron"';
      this.context.font = this.font;
      this.text = text;
      this.textWidth = (this.context.measureText(this.text)).width;

      this.fps = 60;

      this.channel = 0; // 0 = red, 1 = green, 2 = blue
      this.compOp = 'lighter'; // CompositeOperation = lighter || darker || xor
      this.phase = 0.0;
      this.phaseStep = 0.05; //determines how often we will change channel and amplitude
      this.amplitude = 0.0;
      this.amplitudeBase = 2.0;
      this.amplitudeRange = 2.0;
      this.alphaMin = 0.8;

      this.glitchAmplitude = 20.0;
      this.glitchThreshold = 0.9;
      this.scanlineBase = 40;
      this.scanlineRange = 40;
      this.scanlineShift = 15;

      this.channel = 0;
      this.phase = 0;
      this.amplitude = 0;
    },

    tick: function () {
      setTimeout((function () {
        this.phase += this.phaseStep;

        if (this.phase > 1) {
          this.phase = 0.0;
          this.channel = (this.channel === 2) ? 0 : this.channel + 1;
          this.amplitude = this.amplitudeBase + (this.amplitudeRange * Math.random());
        }

        this.render();
        this.tick();

      }).bind(this), 1000 / this.fps);
    },

    render: function () {
      var x0 = this.amplitude * Math.sin((Math.PI * 2) * this.phase) >> 0,
        x1, x2, x3;

      if (Math.random() >= this.glitchThreshold) {
        x0 *= this.glitchAmplitude;
      }

      x1 = this.width - this.textWidth >> 1;
      x2 = x1 + x0;
      x3 = x1 - x0;


      this.context.clearRect(0, 0, this.width, this.height);
      this.context.globalAlpha = this.alphaMin + ((1 - this.alphaMin) * Math.random());

      switch (this.channel) {
        case 0:
          this.renderChannels(x1, x2, x3);
          break;
        case 1:
          this.renderChannels(x2, x3, x1);
          break;
        case 2:
          this.renderChannels(x3, x1, x2);
          break;
      }
        this.renderScanline();
        if (Math.floor(Math.random() * 2) > 1) {
          this.renderScanline();
          // renders a second scanline 50% of the time
        }
    },

    renderChannels: function (x1, x2, x3) {
      this.context.font = this.font;
      this.context.fillStyle = "rgb(255,0,0)";
      this.context.fillText(this.text, x1, this.height*.66);

      this.context.globalCompositeOperation = this.compOp;

      this.context.fillStyle = "rgb(0,255,0)";
      this.context.fillText(this.text, x2, this.height*.66);
      this.context.fillStyle = "rgb(0,0,255)";
      this.context.fillText(this.text, x3, this.height*.66);
    },

    renderScanline: function () {
      var y = this.height * Math.random() >> 0,
        o = this.context.getImageData(0, y, this.width, 1),
        d = o.data,
        i = d.length,
        s = this.scanlineBase + this.scanlineRange * Math.random() >> 0,
        x = -this.scanlineShift + this.scanlineShift * 2 * Math.random() >> 0;

      while (i-- > 0) {
        d[i] += s;
      }

      this.context.putImageData(o, x, y);
    },

    resize: function () {
      if (this.canvas) {
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.textSize = Math.floor(this.canvas.width / 7);
        this.font = '900 ' + this.textSize + 'px "Orbitron"';
        this.context.font = this.font;
      }
    }
  };

  document.onload = glitcher.init();
  window.onresize = glitcher.resize();
};

function activateCheats() {
    alert("cheats activated");
        
    document.getElementById("wrapper").style.display = "block"; 
    document.getElementById("title-container").style.display = "none";
    $('html, body').animate({
        scrollTop: 0
    }, 1000, function() {
        glitch("stage", "Tyler Nychka");
        glitch("stage2", "Full Stack");
        glitch("stage3", "Developer");
    });
};

$(document).ready(function () {
    // Code taken from https://stackoverflow.com/questions/31626852/how-to-add-konami-code-in-a-website-based-on-html
    // thanks Silentdrummer
    // a key map of allowed keys
    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      65: 'a',
      66: 'b'
    };

    // the 'official' Konami Code sequence
    var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

    // a variable to remember the 'position' the user has reached so far.
    var konamiCodePosition = 0;

    // add keydown event listener
    document.addEventListener('keydown', function(e) {
      // get the value of the key code from the key map
      var key = allowedKeys[e.keyCode];
      // get the value of the required key from the konami code
      var requiredKey = konamiCode[konamiCodePosition];

      // compare the key with the required key
      if (key == requiredKey) {

        // move to the next key in the konami code sequence
        konamiCodePosition++;

        // if the last key is reached, activate cheats
        if (konamiCodePosition == konamiCode.length) {
          activateCheats();
          konamiCodePosition = 0;
        }
      } else {
        konamiCodePosition = 0;
      }
    });
});


