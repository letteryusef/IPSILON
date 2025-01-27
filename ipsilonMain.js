var AsciiMorph = (function() {
    'use strict';
    
    var element = null;
    var canvasDimensions = {};
    
    var renderedData = [];
    var framesToAnimate = [];
    var myTimeout = null;
    
    /**
     * Utils
     */
  
    function extend(target, source) {
      for (var key in source) {
        if (!(key in target)) {
          target[key] = source[key];              
        }
      }
      return target;
    }
    
    function repeat(pattern, count) {
        if (count < 1) return '';
        var result = '';
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    }
    
    function replaceAt(string, index, character ) {
      return string.substr(0, index) + character + string.substr(index+character.length);
    }
    
    /**
     * AsciiMorph
     */
  
    function init(el, canvasSize) {
      
      // Save the element
      element = el;
      canvasDimensions = canvasSize;
    }
    
    function squareOutData(data) {
       var i;
      var renderDimensions = {
        x: 0,
        y: data.length
      };
  
      // Calculate centering numbers
      for( i = 0; i < data.length; i++ ) {
        if( data[i].length > renderDimensions.x) {
          renderDimensions.x = data[i].length
        }
      }
      
      // Pad out right side of data to square it out
      for( i = 0; i < data.length; i++ ) {
        if( data[i].length < renderDimensions.x) {
          data[i] = (data[i] + repeat(' ', renderDimensions.x - data[i].length ));
        }
      }
      
      var paddings = {
        x: Math.floor((canvasDimensions.x - renderDimensions.x) / 2),
        y: Math.floor((canvasDimensions.y - renderDimensions.y) / 2)
      }
      
      // Left Padding
      for( var i = 0; i < data.length; i++ ) {
        data[i] = repeat(' ', paddings.x) + data[i] + repeat(' ', paddings.x);
      }
      
      // Pad out the rest of everything
      for( var i = 0; i < canvasDimensions.y; i++ ) {
        if( i < paddings.y) {
          data.unshift( repeat(' ', canvasDimensions.x));
        } else if (i > (paddings.y + renderDimensions.y)) {
          data.push( repeat(' ', canvasDimensions.x));
        }
      }
      
      return data;
    }
    
    // Crushes the frame data by 1 unit.
    function getMorphedFrame(data) {
      
      var firstInLine, lastInLine = null;
      var found = false;
      for( var i = 0; i < data.length; i++) {
        
        var line = data[i];
        firstInLine = line.search(/\S/);
        if( firstInLine === -1) {
          firstInLine = null;
        }
        
        for( var j = 0; j < line.length; j++) {
          if( line[j] != ' ') {
            lastInLine = j;
          }
        }
        
        if( firstInLine !== null && lastInLine !== null) {
          data = crushLine(data, i, firstInLine, lastInLine)
          found = true;
        }
    
        firstInLine = null, lastInLine = null;
      }
      
      if( found ) {
        return data;
      } else {
        return false;
      }
    }
    
    function crushLine(data, line, start, end) {
      
      var centers = {
        x: Math.floor(canvasDimensions.x / 2),
        y: Math.floor(canvasDimensions.y / 2)
      }
      
      var crushDirection = 1;
      if( line > centers.y ) {
        crushDirection = -1;
      }
      
      var charA = data[line][start];
      var charB = data[line][end];
      
      data[line] = replaceAt(data[line], start, " ");
      data[line] = replaceAt(data[line], end, " ");
  
      if( !((end - 1) == (start + 1)) && !(start === end) && !((start + 1) === end)) {
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (start + 1), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (end - 1), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
      } else if ((((start === end) || (start + 1) === end)) && ((line + 1) !== centers.y && (line - 1) !== centers.y && line !== centers.y)) {
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (start), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (end), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
      }
      
      return data;
    }
    
    function render(data) {
      var ourData = squareOutData(data.slice());
      renderSquareData(ourData);
    }
    
    function renderSquareData(data) {
      element.innerHTML = '';
      for( var i = 0; i < data.length; i++ ) {
        element.innerHTML = element.innerHTML + data[i] + '\n';
      }
      
      renderedData = data;
    }
    
    // Morph between whatever is current, to the new frame
    function morph(data) {
      
      clearTimeout(myTimeout);
      var frameData = prepareFrames(data.slice());
      animateFrames(frameData);
    }
    
    function prepareFrames(data) {
      
      var deconstructionFrames = [];
      var constructionFrames = [];
  
      var clonedData = renderedData
      
      // If its taking more than 100 frames, its probably somehow broken
      // Get the deconscrution frames
      for(var i = 0; i < 100; i++) {
        var newData = getMorphedFrame(clonedData);
        if( newData === false) {
          break;
        }
        deconstructionFrames.push(newData.slice(0)); 
        clonedData = newData;
      }
      
      // Get the constuction frames for the new data
      var squareData = squareOutData(data);
      constructionFrames.unshift(squareData.slice(0));
      for( var i = 0; i < 100; i++ ) {
        var newData = getMorphedFrame(squareData);
        if( newData === false) {
          break;
        }
        constructionFrames.unshift(newData.slice(0));
        squareData = newData;
      }
      
      return deconstructionFrames.concat(constructionFrames)
    }
    
    function animateFrames(frameData) {
      framesToAnimate = frameData;
      animateFrame();
    }
    
    function animateFrame() {
      myTimeout = setTimeout(function() {
        
        renderSquareData(framesToAnimate[0]);
        framesToAnimate.shift();
        if( framesToAnimate.length > 0 ) {
          animateFrame();
        }
      }, 18);
  
      // framesToAnimate
    }
  
    function main(element, canvasSize) {
      
      if( !element || !canvasSize ) {
        console.log("sorry, I need an element and a canvas size");
        return;   
      }
      
      init(element, canvasSize);
    }
  
    return extend(main, {
      render: render,
      morph: morph
    });
    
})();

const ipsilonQuotes = [
    "Lorem ipsum? what about the Quick Brown Fox?",
    "I think that's enough Myla for today...",
    "console.log('I\\'m not supposed to write this...');",
    "The twenty-fifth and penultimate letter of the Latin alphabet!",
    "Oi Brazil!"
];

var ipsilonPron = new Audio("https://en-audio.howtopronounce.com/164308307861ef75460ba19.mp3");
var lightMode = getCookie("theme") != "" ? getCookie("theme") == "light" : true;
var niceScroll = false;

$(".ipQuote").html("— " + ipsilonQuotes[Math.floor(Math.random() * ipsilonQuotes.length)]);

const sunPathSVG = "M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z";
const moonPathSVG = "M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z";

function initWavyTexts(){
    Array.from($(".waveAnim")).forEach((el) => {
        el.innerHTML = el.innerHTML
          .split("")
          .map(letter => {
          return '<span style="position:relative; display: inline-block;">' + letter + '</span>';
        }).join("");
    });

    anime({
        targets: ".waveAnim span",
        top: [
            { value: "-20px", duration: 600},
            { value: "0px", duration: 600}
        ],
        delay: anime.stagger(160),
        easing: 'easeInOutSine',
        loop: true,
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function switchTheme(skipAnim = false) {
    lightMode = !lightMode;
    setCookie("theme", lightMode ? "light" : "dark", 365);
    loadTheme(lightMode, skipAnim);
}

function loadTheme(arg, skipAnim) {
    if (!skipAnim) {
        anime({
            targets: '.hi-svg',
            d: arg ? sunPathSVG : moonPathSVG,
            duration: 800
        });
    } else $(".hi-svg").attr("d", arg ? sunPathSVG : moonPathSVG);
    $(':root').css('--global-text-color', arg ? 'var(--global-dark-theme-color)' : 'var(--global-light-theme-color)');
    $(':root').css('--global-content-bg-color', arg ? 'var(--global-light-theme-color)' : 'var(--global-dark-theme-color)');
    $(':root').css('--global-drawing-brightness', arg ? 'var(--global-light-theme-lightness)' : 'var(--global-dark-theme-lightness)');
}

$("body").append(`
<div class="themeswitch" onclick="switchTheme()">
    <svg class="hover-icon" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="hi-svg" d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>`);

$("body").append(`
<div class='morph-div' style='position:fixed; top:0; left:auto; right:auto; background-color: var(--global-content-bg-color); width:100%; height: 100%; z-index:2'>
    <center style="margin-top:40vh;"><pre class="morph-ascii"></pre></center>
</div>`);

loadTheme(lightMode, true);

$(document).ready(function(){
    initWavyTexts();

    $('.themeswitch').css('transform', 'translateY(-100px)');
    anime({
        targets: '.themeswitch',
        translateY: "0px",
        duration: 1000
    });

    Array.from($(".wrapper").children()).forEach((el) => {
        $(el).css('opacity', "0%");
        $(el).css('left', "100px");
        
    });
    
    var mah = document.querySelector('pre');
    AsciiMorph(mah, {x: 0, y: 0});
    AsciiMorph.morph([
        "ooooo ooooooooo.   ooooo  .oooooo..o ooooo ooooo          .oooooo.   ooooo      ooo",
        "`888' `888   `Y88. `888' d8P'    `Y8 `888' `888'         d8P'  `Y8b  `888b.     `8'",
        " 888   888   .d88'  888  Y88bo.       888   888         888      888  8 `88b.    8 ",
        " 888   888ooo88P'   888   `\"Y8888o.   888   888         888      888  8   `88b.  8 ",
        " 888   888          888       `\"Y88b  888   888         888      888  8     `88b.8",
        " 888   888          888  oo     .d8P  888   888       o `88b    d88'  8       `888",
        "o888o o888o        o888o 8\"\"88888P'  o888o o888ooooood8  `Y8bood8P'  o8o        `8"
    ]);

    setTimeout(() => {
        anime({
            targets: '.morph-div',
            opacity: "0",
            easing: 'easeOutQuint',
            duration: 600,
            complete: function() {
                $(".morph-div").remove();
                Array.from($(".wrapper").children()).forEach((el, ind) => {
                    anime({
                        targets: el,
                        opacity: "100%",
                        easing: 'easeInOutQuart',
                        left: "0px",
                        duration: 1000,
                        delay: (ind * 120),
                        complete: function(anim) {
                            niceScroll.opt.mousescrollstep = 60;
                            niceScroll.show();
                        }
                    });
                });
            }
        });
    }, 1800);

    niceScroll = $("body").niceScroll({
        scrollspeed: 200, 
        mousescrollstep: 0,
        cursoropacitymin: 0.4,
        cursorcolor: "var(--global-text-color)",
        cursorborder: "0px",
        cursorwidth: "10px",
        cursorborderradius: "0px"
    });
    niceScroll.hide();

    $("body").bind
    ("copy", function(e) { return false; });

    $("body").bind
    ("contextmenu", function(e) { return false; });

    $("body").mousedown
    (function(e) { return false; });

    $(".news-marquee").text("* SEACHING FOR CONTENT *");

    var urlParams = new URLSearchParams({
        q: "from:@letteryusef.bsky.social",
        sort: "latest"
    });
    
    $.getJSON(`https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?${urlParams}`, function(searchData) {
        const recentPost = searchData.posts[0];

        const postDate = new Date(recentPost.indexedAt);
        const dateTimeFormat = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        var postLink = "https://bsky.app/profile/letteryusef.bsky.social/post/" + recentPost.uri.split("/")[recentPost.uri.split("/").length - 1];
        $(".news-marquee").html(`<a href=${postLink} style="text-decoration: none; color:var(--global-text-color); transition: color var(--global-trans-speed) ease;">* ཐི༏ཋྀ󠀮 BLUESKY RECENT POST: ${recentPost.record.text} (DATE: ${dateTimeFormat.format(postDate)} - LIKES: ${recentPost.likeCount} - REPOSTS: ${recentPost.repostCount} - REPLIES: ${recentPost.replyCount} - QUOTES: ${recentPost.quoteCount}) *</a>`);
    });
});