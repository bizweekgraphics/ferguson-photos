require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){
require('./slideshow')();

},{"./slideshow":7}],7:[function(require,module,exports){
var $ = require('jquery');
var picturefill = require('./public/components/picturefill/dist/picturefill');

var meta = {
  site: "businessweek", // e.g. "businessweek"
  author: "Philip Montgomery", // e.g. "Claire Suddath"
  type: "www story", // e.g. "graphic"
  section: "Politics & Policy", // e.g. "Lifestyle"
  title: "24 Hours in Ferguson: Scenes from the Michael Brown Fallout", // e.g. "Can women ever win at work?"
  description: "",
  pubDate: "20141126", // e.g. "20140825"
  shareText: "24 Hours in Ferguson: Scenes from the Fallout http://buswk.co/1rkK1h2 #Ferguson via @BW ",
  shareURL: ""
};

module.exports = function() {
  $(document).ready(function() {

    analytics(meta);

    $(document).on('click', '.popup-twitter', function() {
      shareTwitter(meta.shareText, meta.shortURL)
    });
    $(document).on('click', '.popup-facebook', function() {
     shareFacebook(meta.shareText, meta.shortURL)
    });

    $('.zip').click(function() {
      $.ajax({
        type: "GET",
        url: document.URL + "/create_zip",
        success: function(response) {
          console.log('success');
          window.location = document.URL + "/download_zip"
        }
      })
    })


    var captionBuffer = 65; // # of pixels to leave for captions

    // state!
    var currentIndex = 0;
    var maxIndex = $('.photo.large').length - 1

    // fitting: set max-height
    function fitPhotos() {
      $(".photo.large img").css("max-height", $(window).height() - captionBuffer);
    }
    fitPhotos();
    $( window ).resize(fitPhotos);

    // some accessors for parallax positioning
    var H = function() { return $("#photos-large").height(); };
    var h = function() { return $("#photos-small")[0].scrollHeight; };
    var Y = function() { return $(window).scrollTop(); };
    var y = function() { return $("#photos-small").scrollTop(); };
    var ratio = function() {
      return (h()-$(window).height()) / (H()-$(window).height());
    };

    // determine focus of scroll
    var focus = "large";
    $("#photos-large").mouseenter(function() { focus = "large"; })
    $("#photos-small").mouseenter(function() { focus = "small"; })

    // large scroll drives small scroll, if focused
    $(window).scroll(function(e) {

      var headlineSlide = $(window).scrollTop() > 20 ? 10 : -20;
      $("#header .hed").css("margin-top", headlineSlide + "px");

      if(focus == "large") {
        $("#photos-small").scrollTop(Y()*ratio());
      }

      didScroll = true;
    });

    function scrollSpy() {
      var topBuffer = 20;
      topIndex = {id: 0, offset: 1000};
      for(var i = 0; i <= maxIndex; i++) {
        var Δ = $(window).scrollTop() - $('#photos-large [data-photo-id="'+i+'"]').offset().top + topBuffer;
        if(Δ > 0 && Δ < topIndex.offset) topIndex = {id: i, offset: Δ};
      }

      $('.photo.large img').removeClass("active");
      $('#photos-large [data-photo-id="'+topIndex.id+'"]').addClass("active");

      return topIndex;
    }

      // small scroll drives large scroll, if focused
    $("#photos-small").scroll(function(e) {
      if(focus == "small") {
        $(window).scrollTop(y()*(1/ratio()));
      }
    });

    // cross-highlighting of photos
    $(".photo img").mouseenter(function(e) {
      var id = $(e.target).data("photo-id");
      $('[data-photo-id="'+id+'"]').addClass("active");
    });
    $(".photo img").mouseleave(function(e) {
      var id = $(e.target).data("photo-id");
      $('[data-photo-id="'+id+'"]').removeClass("active");
    });


    // hide thumbnails to start
    setTimeout(function() {
      $("#photos-small").removeClass("hover");
    }, 1000)

    // keyboard navigation
  var keycode = {
    "up": 38,
    "down": 40,
    "left": 37,
    "right": 39,
    "j": 74,
    "k": 75,
    "p": 80,
    "n": 78
  };
  $('html').keyup(function (e) {
    if (e.keyCode == keycode.left || e.keyCode == keycode.j) {
      prev();
    }
    else if (e.keyCode == keycode.right || e.keyCode == keycode.k) {
      next();
    }
  });
  function prev() {
    currentIndex = Math.max(currentIndex-1, 0);
    goToPhoto(currentIndex);
  }
  function next() {
    currentIndex = Math.min(currentIndex+1, maxIndex);
    goToPhoto(currentIndex);
  }
  function goToPhoto(i) {
    $('html, body').animate({
      scrollTop: ($('#'+i).offset().top)
    }, 100, "swing", scrollSpy);
  }

  // show/hide header
  // cf. https://medium.com/@mariusc23/hide-header-on-scroll-down-show-on-scroll-up-67bbaae9a78c
  //     http://jsfiddle.net/mariusc23/s6mLJ/31/

  // Hide Header on on scroll down
  var didScroll;
  var lastScrollTop = 0;
  var delta = 5;
  var navbarHeight = $('#header').outerHeight();

  setInterval(function() {
    if (didScroll) {
      hasScrolled();
      currentIndex = scrollSpy().id;
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
      return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
      // Scroll Down
      $('#header').removeClass('nav-down').addClass('nav-up');
    } else {
      // Scroll Up
      if(st + $(window).height() < $(document).height()) {
          $('#header').removeClass('nav-up').addClass('nav-down');
      }
    }

    lastScrollTop = st;
  }

  })



}

},{"./public/components/picturefill/dist/picturefill":"./public/components/picturefill/dist/picturefill","jquery":4}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvc2xpZGVzaG93L2luZGV4LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3NsaWRlc2hvdy9zbGlkZXNob3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL3NsaWRlc2hvdycpKCk7XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIHBpY3R1cmVmaWxsID0gcmVxdWlyZSgnLi9wdWJsaWMvY29tcG9uZW50cy9waWN0dXJlZmlsbC9kaXN0L3BpY3R1cmVmaWxsJyk7XG5cbnZhciBtZXRhID0ge1xuICBzaXRlOiBcImJ1c2luZXNzd2Vla1wiLCAvLyBlLmcuIFwiYnVzaW5lc3N3ZWVrXCJcbiAgYXV0aG9yOiBcIktpcnN0ZW4gTHVjZVwiLCAvLyBlLmcuIFwiQ2xhaXJlIFN1ZGRhdGhcIlxuICB0eXBlOiBcInd3dyBzdG9yeVwiLCAvLyBlLmcuIFwiZ3JhcGhpY1wiXG4gIHNlY3Rpb246IFwiUG9saXRpY3MgJiBQb2xpY3lcIiwgLy8gZS5nLiBcIkxpZmVzdHlsZVwiXG4gIHRpdGxlOiBcIkJvcmRlciBMaW5lczogVHJhY2tpbmcgdW5hdXRob3JpemVkIG1pZ3JhbnRzIGZyb20gYWJvdmVcIiwgLy8gZS5nLiBcIkNhbiB3b21lbiBldmVyIHdpbiBhdCB3b3JrP1wiXG4gIGRlc2NyaXB0aW9uOiBcIlwiLFxuICBwdWJEYXRlOiBcIjIwMTQxMTI0XCIsIC8vIGUuZy4gXCIyMDE0MDgyNVwiXG4gIHNoYXJlVGV4dDogXCJTaGFyZSB0ZXh0IFRLXCIsXG4gIHNoYXJlVVJMOiBcImh0dHA6Ly9VUkxUSy9cIlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmFseXRpY3MobWV0YSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBvcHVwLXR3aXR0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIHNoYXJlVHdpdHRlcihtZXRhLnNoYXJlVGV4dCwgbWV0YS5zaG9ydFVSTClcbiAgICB9KTtcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnBvcHVwLWZhY2Vib29rJywgZnVuY3Rpb24oKSB7XG4gICAgIHNoYXJlRmFjZWJvb2sobWV0YS5zaGFyZVRleHQsIG1ldGEuc2hvcnRVUkwpXG4gICAgfSk7XG5cbiAgICAkKCcuemlwJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAkLmFqYXgoe1xuICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IGRvY3VtZW50LlVSTCArIFwiL2NyZWF0ZV96aXBcIixcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTCArIFwiL2Rvd25sb2FkX3ppcFwiXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuXG4gICAgdmFyIGNhcHRpb25CdWZmZXIgPSA2NTsgLy8gIyBvZiBwaXhlbHMgdG8gbGVhdmUgZm9yIGNhcHRpb25zXG5cbiAgICAvLyBzdGF0ZSFcbiAgICB2YXIgY3VycmVudEluZGV4ID0gMDtcbiAgICB2YXIgbWF4SW5kZXggPSAkKCcucGhvdG8ubGFyZ2UnKS5sZW5ndGggLSAxXG5cbiAgICAvLyBmaXR0aW5nOiBzZXQgbWF4LWhlaWdodFxuICAgIGZ1bmN0aW9uIGZpdFBob3RvcygpIHtcbiAgICAgICQoXCIucGhvdG8ubGFyZ2UgaW1nXCIpLmNzcyhcIm1heC1oZWlnaHRcIiwgJCh3aW5kb3cpLmhlaWdodCgpIC0gY2FwdGlvbkJ1ZmZlcik7XG4gICAgfVxuICAgIGZpdFBob3RvcygpO1xuICAgICQoIHdpbmRvdyApLnJlc2l6ZShmaXRQaG90b3MpO1xuXG4gICAgLy8gc29tZSBhY2Nlc3NvcnMgZm9yIHBhcmFsbGF4IHBvc2l0aW9uaW5nXG4gICAgdmFyIEggPSBmdW5jdGlvbigpIHsgcmV0dXJuICQoXCIjcGhvdG9zLWxhcmdlXCIpLmhlaWdodCgpOyB9O1xuICAgIHZhciBoID0gZnVuY3Rpb24oKSB7IHJldHVybiAkKFwiI3Bob3Rvcy1zbWFsbFwiKVswXS5zY3JvbGxIZWlnaHQ7IH07XG4gICAgdmFyIFkgPSBmdW5jdGlvbigpIHsgcmV0dXJuICQod2luZG93KS5zY3JvbGxUb3AoKTsgfTtcbiAgICB2YXIgeSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gJChcIiNwaG90b3Mtc21hbGxcIikuc2Nyb2xsVG9wKCk7IH07XG4gICAgdmFyIHJhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGgoKS0kKHdpbmRvdykuaGVpZ2h0KCkpIC8gKEgoKS0kKHdpbmRvdykuaGVpZ2h0KCkpO1xuICAgIH07XG5cbiAgICAvLyBkZXRlcm1pbmUgZm9jdXMgb2Ygc2Nyb2xsXG4gICAgdmFyIGZvY3VzID0gXCJsYXJnZVwiO1xuICAgICQoXCIjcGhvdG9zLWxhcmdlXCIpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7IGZvY3VzID0gXCJsYXJnZVwiOyB9KVxuICAgICQoXCIjcGhvdG9zLXNtYWxsXCIpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7IGZvY3VzID0gXCJzbWFsbFwiOyB9KVxuXG4gICAgLy8gbGFyZ2Ugc2Nyb2xsIGRyaXZlcyBzbWFsbCBzY3JvbGwsIGlmIGZvY3VzZWRcbiAgICAkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgdmFyIGhlYWRsaW5lU2xpZGUgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiAyMCA/IDEwIDogLTIwO1xuICAgICAgJChcIiNoZWFkZXIgLmhlZFwiKS5jc3MoXCJtYXJnaW4tdG9wXCIsIGhlYWRsaW5lU2xpZGUgKyBcInB4XCIpO1xuXG4gICAgICBpZihmb2N1cyA9PSBcImxhcmdlXCIpIHtcbiAgICAgICAgJChcIiNwaG90b3Mtc21hbGxcIikuc2Nyb2xsVG9wKFkoKSpyYXRpbygpKTtcbiAgICAgIH1cblxuICAgICAgZGlkU2Nyb2xsID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNjcm9sbFNweSgpIHtcbiAgICAgIHZhciB0b3BCdWZmZXIgPSAyMDtcbiAgICAgIHRvcEluZGV4ID0ge2lkOiAwLCBvZmZzZXQ6IDEwMDB9O1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8PSBtYXhJbmRleDsgaSsrKSB7XG4gICAgICAgIHZhciDOlCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSAtICQoJyNwaG90b3MtbGFyZ2UgW2RhdGEtcGhvdG8taWQ9XCInK2krJ1wiXScpLm9mZnNldCgpLnRvcCArIHRvcEJ1ZmZlcjtcbiAgICAgICAgaWYozpQgPiAwICYmIM6UIDwgdG9wSW5kZXgub2Zmc2V0KSB0b3BJbmRleCA9IHtpZDogaSwgb2Zmc2V0OiDOlH07XG4gICAgICB9XG5cbiAgICAgICQoJy5waG90by5sYXJnZSBpbWcnKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICQoJyNwaG90b3MtbGFyZ2UgW2RhdGEtcGhvdG8taWQ9XCInK3RvcEluZGV4LmlkKydcIl0nKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgcmV0dXJuIHRvcEluZGV4O1xuICAgIH1cblxuICAgICAgLy8gc21hbGwgc2Nyb2xsIGRyaXZlcyBsYXJnZSBzY3JvbGwsIGlmIGZvY3VzZWRcbiAgICAkKFwiI3Bob3Rvcy1zbWFsbFwiKS5zY3JvbGwoZnVuY3Rpb24oZSkge1xuICAgICAgaWYoZm9jdXMgPT0gXCJzbWFsbFwiKSB7XG4gICAgICAgICQod2luZG93KS5zY3JvbGxUb3AoeSgpKigxL3JhdGlvKCkpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGNyb3NzLWhpZ2hsaWdodGluZyBvZiBwaG90b3NcbiAgICAkKFwiLnBob3RvIGltZ1wiKS5tb3VzZWVudGVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBpZCA9ICQoZS50YXJnZXQpLmRhdGEoXCJwaG90by1pZFwiKTtcbiAgICAgICQoJ1tkYXRhLXBob3RvLWlkPVwiJytpZCsnXCJdJykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgfSk7XG4gICAgJChcIi5waG90byBpbWdcIikubW91c2VsZWF2ZShmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgaWQgPSAkKGUudGFyZ2V0KS5kYXRhKFwicGhvdG8taWRcIik7XG4gICAgICAkKCdbZGF0YS1waG90by1pZD1cIicraWQrJ1wiXScpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgIH0pO1xuXG5cbiAgICAvLyBoaWRlIHRodW1ibmFpbHMgdG8gc3RhcnRcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJChcIiNwaG90b3Mtc21hbGxcIikucmVtb3ZlQ2xhc3MoXCJob3ZlclwiKTtcbiAgICB9LCAxMDAwKVxuXG4gICAgLy8ga2V5Ym9hcmQgbmF2aWdhdGlvblxuICB2YXIga2V5Y29kZSA9IHtcbiAgICBcInVwXCI6IDM4LFxuICAgIFwiZG93blwiOiA0MCxcbiAgICBcImxlZnRcIjogMzcsXG4gICAgXCJyaWdodFwiOiAzOSxcbiAgICBcImpcIjogNzQsXG4gICAgXCJrXCI6IDc1LFxuICAgIFwicFwiOiA4MCxcbiAgICBcIm5cIjogNzhcbiAgfTtcbiAgJCgnaHRtbCcpLmtleXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5Q29kZSA9PSBrZXljb2RlLmxlZnQgfHwgZS5rZXlDb2RlID09IGtleWNvZGUuaikge1xuICAgICAgcHJldigpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0ga2V5Y29kZS5yaWdodCB8fCBlLmtleUNvZGUgPT0ga2V5Y29kZS5rKSB7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICB9KTtcbiAgZnVuY3Rpb24gcHJldigpIHtcbiAgICBjdXJyZW50SW5kZXggPSBNYXRoLm1heChjdXJyZW50SW5kZXgtMSwgMCk7XG4gICAgZ29Ub1Bob3RvKGN1cnJlbnRJbmRleCk7XG4gIH1cbiAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICBjdXJyZW50SW5kZXggPSBNYXRoLm1pbihjdXJyZW50SW5kZXgrMSwgbWF4SW5kZXgpO1xuICAgIGdvVG9QaG90byhjdXJyZW50SW5kZXgpO1xuICB9XG4gIGZ1bmN0aW9uIGdvVG9QaG90byhpKSB7XG4gICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgc2Nyb2xsVG9wOiAoJCgnIycraSkub2Zmc2V0KCkudG9wKVxuICAgIH0sIDEwMCwgXCJzd2luZ1wiLCBzY3JvbGxTcHkpO1xuICB9XG5cbiAgLy8gc2hvdy9oaWRlIGhlYWRlclxuICAvLyBjZi4gaHR0cHM6Ly9tZWRpdW0uY29tL0BtYXJpdXNjMjMvaGlkZS1oZWFkZXItb24tc2Nyb2xsLWRvd24tc2hvdy1vbi1zY3JvbGwtdXAtNjdiYmFhZTlhNzhjXG4gIC8vICAgICBodHRwOi8vanNmaWRkbGUubmV0L21hcml1c2MyMy9zNm1MSi8zMS9cblxuICAvLyBIaWRlIEhlYWRlciBvbiBvbiBzY3JvbGwgZG93blxuICB2YXIgZGlkU2Nyb2xsO1xuICB2YXIgbGFzdFNjcm9sbFRvcCA9IDA7XG4gIHZhciBkZWx0YSA9IDU7XG4gIHZhciBuYXZiYXJIZWlnaHQgPSAkKCcjaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcblxuICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAoZGlkU2Nyb2xsKSB7XG4gICAgICBoYXNTY3JvbGxlZCgpO1xuICAgICAgY3VycmVudEluZGV4ID0gc2Nyb2xsU3B5KCkuaWQ7XG4gICAgICBkaWRTY3JvbGwgPSBmYWxzZTtcbiAgICB9XG4gIH0sIDI1MCk7XG5cbiAgZnVuY3Rpb24gaGFzU2Nyb2xsZWQoKSB7XG4gICAgdmFyIHN0ID0gJCh0aGlzKS5zY3JvbGxUb3AoKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGV5IHNjcm9sbCBtb3JlIHRoYW4gZGVsdGFcbiAgICBpZihNYXRoLmFicyhsYXN0U2Nyb2xsVG9wIC0gc3QpIDw9IGRlbHRhKVxuICAgICAgcmV0dXJuO1xuXG4gICAgLy8gSWYgdGhleSBzY3JvbGxlZCBkb3duIGFuZCBhcmUgcGFzdCB0aGUgbmF2YmFyLCBhZGQgY2xhc3MgLm5hdi11cC5cbiAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBzbyB5b3UgbmV2ZXIgc2VlIHdoYXQgaXMgXCJiZWhpbmRcIiB0aGUgbmF2YmFyLlxuICAgIGlmIChzdCA+IGxhc3RTY3JvbGxUb3AgJiYgc3QgPiBuYXZiYXJIZWlnaHQpe1xuICAgICAgLy8gU2Nyb2xsIERvd25cbiAgICAgICQoJyNoZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LWRvd24nKS5hZGRDbGFzcygnbmF2LXVwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNjcm9sbCBVcFxuICAgICAgaWYoc3QgKyAkKHdpbmRvdykuaGVpZ2h0KCkgPCAkKGRvY3VtZW50KS5oZWlnaHQoKSkge1xuICAgICAgICAgICQoJyNoZWFkZXInKS5yZW1vdmVDbGFzcygnbmF2LXVwJykuYWRkQ2xhc3MoJ25hdi1kb3duJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdFNjcm9sbFRvcCA9IHN0O1xuICB9XG5cbiAgfSlcblxuXG5cbn1cbiJdfQ==
