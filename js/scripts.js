(function() {

    var canvas, ctx, circ, nodes, mouse, SENSITIVITY, SIBLINGS_LIMIT, DENSITY, NODES_QTY, ANCHOR_LENGTH, MOUSE_RADIUS;
  
    // how close next node must be to activate connection (in px)
    // shorter distance == better connection (line width)
    SENSITIVITY = 100;
    // note that siblings limit is not 'accurate' as the node can actually have more connections than this value that's because the node accepts sibling nodes with no regard to their current connections this is acceptable because potential fix would not result in significant visual difference 
    // more siblings == bigger node
    SIBLINGS_LIMIT = 10;
    // default node margin
    DENSITY = 55;
    // total number of nodes used (incremented after creation)
    NODES_QTY = 0;
    // avoid nodes spreading
    ANCHOR_LENGTH = 10;
    // highlight radius
    MOUSE_RADIUS = 600;
  
    circ = 1/2 * Math.PI;
    nodes = [];
  
    canvas = document.querySelector('canvas');
    resizeWindow();
    mouse = {
      x: canvas.width ,
      y: canvas.height
    };
    ctx = canvas.getContext('2d');
    if (!ctx) {
      alert("Ooops! Your browser does not support canvas :'(");
    }
  
    function Node(x, y) {
      this.anchorX = x;
      this.anchorY = y;
      this.x = Math.random() * (x - (x - ANCHOR_LENGTH)) + (x - ANCHOR_LENGTH);
      this.y = Math.random() * (y - (y - ANCHOR_LENGTH)) + (y - ANCHOR_LENGTH);
      this.vx = Math.random() * 2 - 1;
      this.vy = Math.random() * 2 - 1;
      this.energy = Math.random() * 200;
      this.radius = Math.random();
      this.siblings = [];
      this.brightness = 0;
    }

    Node.prototype.drawNode = function() {
      var color = "rgba(255,255, 255, " + this.brightness +  ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2 * this.radius + 2 * this.siblings.length / SIBLINGS_LIMIT, 0, circ);
      ctx.fillStyle = color;
      ctx.fill();
    };
  
    Node.prototype.drawConnections = function() {
      for (var i = 0; i < this.siblings.length; i++) {
        var color = "rgba(100, 0,255, " + this.brightness + ")";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.siblings[i].x, this.siblings[i].y);
        ctx.lineWidth = 1 - calcDistance(this, this.siblings[i]) / SENSITIVITY;
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    };
  
    Node.prototype.moveNode = function() {
      this.energy -= 2;
      if (this.energy < 1) {
        this.energy = Math.random() * 100;
        if (this.x - this.anchorX < -ANCHOR_LENGTH) {
          this.vx = Math.random() * 1;
        } else if (this.x - this.anchorX > ANCHOR_LENGTH) {
          this.vx = Math.random() * -1;
        } else {
          this.vx = Math.random() * 4 - 2;
        }
        if (this.y - this.anchorY < -ANCHOR_LENGTH) {
          this.vy = Math.random() * 2;
        } else if (this.y - this.anchorY > ANCHOR_LENGTH) {
          this.vy = Math.random() * -2;
        } else {
          this.vy = Math.random() * 4 - 2;
        }
      }
      this.x += this.vx * this.energy / 100;
      this.y += this.vy * this.energy / 200;
    };
  
    function initNodes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes = [];
      for (var i = DENSITY; i < canvas.width; i += DENSITY) {
        for (var j = DENSITY; j < canvas.height; j += DENSITY) {
          nodes.push(new Node(i, j));
          NODES_QTY++;
        }
      }
    }
  
    function calcDistance(node1, node2) {
      return Math.sqrt(Math.pow(node1.x - node2.x, 2) + (Math.pow(node1.y - node2.y, 2)));
    }
  
    function findSiblings() {
      var node1, node2, distance;
      for (var i = 0; i < NODES_QTY; i++) {
        node1 = nodes[i];
        node1.siblings = [];
        for (var j = 0; j < NODES_QTY; j++) {
          node2 = nodes[j];
          if (node1 !== node2) {
            distance = calcDistance(node1, node2);
            if (distance < SENSITIVITY) {
              if (node1.siblings.length < SIBLINGS_LIMIT) {
                node1.siblings.push(node2);
              } else {
                var node_sibling_distance = 0;
                var max_distance = 0;
                var s;
                for (var k = 0; k < SIBLINGS_LIMIT; k++) {
                  node_sibling_distance = calcDistance(node1, node1.siblings[k]);
                  if (node_sibling_distance > max_distance) {
                    max_distance = node_sibling_distance;
                    s = k;
                  }
                }
                if (distance < max_distance) {
                  node1.siblings.splice(s, 1);
                  node1.siblings.push(node2);
                }
              }
            }
          }
        }
      }
    }
  
    function redrawScene() {
      resizeWindow();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      findSiblings();
      var i, node, distance;
      for (i = 0; i < NODES_QTY; i++) {
        node = nodes[i];
        distance = calcDistance({
          x: mouse.x,
          y: mouse.y
        }, node);
        if (distance < MOUSE_RADIUS) {
          node.brightness = 1 - distance / MOUSE_RADIUS;
        } else {
          node.brightness = 0;
        }
      }
      for (i = 0; i < NODES_QTY; i++) {
        node = nodes[i];
        if (node.brightness) {
          node.drawNode();
          node.drawConnections();
        }
        node.moveNode();
      }
      requestAnimationFrame(redrawScene);
    }
  
    function initHandlers() {
      document.addEventListener('resize', resizeWindow, false);
      canvas.addEventListener('mousemove', mousemoveHandler, false);
    }
  
    function resizeWindow() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  
    function mousemoveHandler(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY-270;
    }
 
    initHandlers();
    initNodes();
    redrawScene();


    // al hacer click ..
 //   window.addEventListener('click', () => {
 //     particles = [];
 //     context.clearRect(0,0, windowWidth, windowHeight);
 //     init();
 //   });
    
  })();

  
var options = {
  // The Id, element or querySelector of the gallery widget:
  container: '#blueimp-gallery',
  // The tag name, Id, element or querySelector of the slides container:
  slidesContainer: 'div',
  // The tag name, Id, element or querySelector of the title element:
  titleElement: 'h3',
  // The class to add when the gallery is visible:
  displayClass: 'blueimp-gallery-display',
  // The class to add when the gallery controls are visible:
  controlsClass: 'blueimp-gallery-controls',
  // The class to add when the gallery only displays one element:
  singleClass: 'blueimp-gallery-single',
  // The class to add when the left edge has been reached:
  leftEdgeClass: 'blueimp-gallery-left',
  // The class to add when the right edge has been reached:
  rightEdgeClass: 'blueimp-gallery-right',
  // The class to add when the automatic slideshow is active:
  playingClass: 'blueimp-gallery-playing',
  // The class to add when the browser supports SVG as img (or background):
  svgasimgClass: 'blueimp-gallery-svgasimg',
  // The class to add when the browser supports SMIL (animated SVGs):
  smilClass: 'blueimp-gallery-smil',
  // The class for all slides:
  slideClass: 'slide',
  // The slide class for the active (current index) slide:
  slideActiveClass: 'slide-active',
  // The slide class for the previous (before current index) slide:
  slidePrevClass: 'slide-prev',
  // The slide class for the next (after current index) slide:
  slideNextClass: 'slide-next',
  // The slide class for loading elements:
  slideLoadingClass: 'slide-loading',
  // The slide class for elements that failed to load:
  slideErrorClass: 'slide-error',
  // The class for the content element loaded into each slide:
  slideContentClass: 'slide-content',
  // The class for the "toggle" control:
  toggleClass: 'toggle',
  // The class for the "prev" control:
  prevClass: 'prev',
  // The class for the "next" control:
  nextClass: 'next',
  // The class for the "close" control:
  closeClass: 'close',
  // The class for the "play-pause" toggle control:
  playPauseClass: 'play-pause',
  // The list object property (or data attribute) with the object type:
  typeProperty: 'type',
  // The list object property (or data attribute) with the object title:
  titleProperty: 'title',
  // The list object property (or data attribute) with the object alt text:
  altTextProperty: 'alt',
  // The list object property (or data attribute) with the object URL:
  urlProperty: 'href',
  // The list object property (or data attribute) with the object srcset:
  srcsetProperty: 'srcset',
  // The list object property (or data attribute) with the object sizes:
  sizesProperty: 'sizes',
  // The list object property (or data attribute) with the object sources:
  sourcesProperty: 'sources',
  // The gallery listens for transitionend events before triggering the
  // opened and closed events, unless the following option is set to false:
  displayTransition: true,
  // Defines if the gallery slides are cleared from the gallery modal,
  // or reused for the next gallery initialization:
  clearSlides: true,
  // Toggle the controls on pressing the Enter key:
  toggleControlsOnEnter: true,
  // Toggle the controls on slide click:
  toggleControlsOnSlideClick: true,
  // Toggle the automatic slideshow interval on pressing the Space key:
  toggleSlideshowOnSpace: true,
  // Navigate the gallery by pressing the ArrowLeft and ArrowRight keys:
  enableKeyboardNavigation: true,
  // Close the gallery on pressing the Escape key:
  closeOnEscape: true,
  // Close the gallery when clicking on an empty slide area:
  closeOnSlideClick: true,
  // Close the gallery by swiping up or down:
  closeOnSwipeUpOrDown: true,
  // Close the gallery when the URL hash changes:
  closeOnHashChange: true,
  // Emulate touch events on mouse-pointer devices such as desktop browsers:
  emulateTouchEvents: true,
  // Stop touch events from bubbling up to ancestor elements of the Gallery:
  stopTouchEventsPropagation: false,
  // Hide the page scrollbars:
  hidePageScrollbars: true,
  // Stops any touches on the container from scrolling the page:
  disableScroll: true,
  // Carousel mode (shortcut for carousel specific options):
  carousel: false,
  // Allow continuous navigation, moving from last to first
  // and from first to last slide:
  continuous: true,
  // Remove elements outside of the preload range from the DOM:
  unloadElements: true,
  // Start with the automatic slideshow:
  startSlideshow: false,
  // Delay in milliseconds between slides for the automatic slideshow:
  slideshowInterval: 5000,
  // The direction the slides are moving: ltr=LeftToRight or rtl=RightToLeft
  slideshowDirection: 'ltr',
  // The starting index as integer.
  // Can also be an object of the given list,
  // or an equal object with the same url property:
  index: 0,
  // The number of elements to load around the current index:
  preloadRange: 2,
  // The transition duration between slide changes in milliseconds:
  transitionDuration: 300,
  // The transition duration for automatic slide changes, set to an integer
  // greater 0 to override the default transition duration:
  slideshowTransitionDuration: 500,
  // The event object for which the default action will be canceled
  // on Gallery initialization (e.g. the click event to open the Gallery):
  event: undefined,
  // Callback function executed when the Gallery is initialized.
  // Is called with the gallery instance as "this" object:
  onopen: undefined,
  // Callback function executed when the Gallery has been initialized
  // and the initialization transition has been completed.
  // Is called with the gallery instance as "this" object:
  onopened: undefined,
  // Callback function executed on slide change.
  // Is called with the gallery instance as "this" object and the
  // current index and slide as arguments:
  onslide: undefined,
  // Callback function executed after the slide change transition.
  // Is called with the gallery instance as "this" object and the
  // current index and slide as arguments:
  onslideend: undefined,
  // Callback function executed on slide content load.
  // Is called with the gallery instance as "this" object and the
  // slide index and slide element as arguments:
  onslidecomplete: undefined,
  // Callback function executed when the Gallery is about to be closed.
  // Is called with the gallery instance as "this" object:
  onclose: undefined,
  // Callback function executed when the Gallery has been closed
  // and the closing transition has been completed.
  // Is called with the gallery instance as "this" object:
  onclosed: undefined
}
var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  var captionText = document.getElementById("caption");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  captionText.innerHTML = dots[slideIndex-1].alt;
}

