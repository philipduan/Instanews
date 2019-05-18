var myResult = {}; //adding some comments
var section = [
  "A",
  "Home",
  "Opinion",
  "World",
  "National",
  "Politics",
  "Upshot",
  "NyRegion",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Arts",
  "Books",
  "Movies",
  "Theater",
  "SundayReview",
  "Fashion",
  "Tmagazine",
  "Food",
  "Travel",
  "Magazine",
  "Realestate",
  "Automobiles",
  "Obituaries",
  "Insider"
];
var subSection = [];
var constDegree = 360 / section.length;
var degree = 0;
var curr = 0;
var lastScrollTop = 0;
var index = 0;
section.sort();
section[0] = "Section...";
$("select").selectric();
createCarousel();

$(document).ready(function() {
  if ($(window).width() > 1000 && $("header").hasClass("big")) {
    animateText($("#moving"));
  }
  createMenu(section, $("#menu"));
  $("#menu").on("change", function() {
    var url =
      "https://api.nytimes.com/svc/topstories/v2/" +
      $("#menu")
        .val()
        .toLowerCase() +
      ".json";
    url +=
      "?" +
      $.param({
        "api-key": "6a7d0d18b5fe409486a12c3f05ac3140"
      });
    $.ajax({
      url: url,
      method: "GET"
    })
      .done(function(result) {
        myResult = result;
        subSection = createSubSection(myResult);
        createMenu(subSection, $("#subMenu"));
        createArticle(myResult);
      })
      .fail(function(err) {
        throw err;
      });
    $("header").removeClass("big");
    $("footer").removeClass("big");
    $("#display").css({
      display: "flex"
    });
  });

  $("#subMenu").on("change", function() {
    createArticle(createSubArticle(myResult, $("#subMenu").val()));
  });

  $(window).on("mousewheel", function(event) {
    if ($(window).width() > 1000 && $("header").hasClass("big")) {
      if (event.originalEvent.wheelDelta > 0) {
        curr = curr + constDegree;
        $(".carousel").css({ transform: "rotateX(" + curr + "deg)" });
        highlight("up");
      } else {
        curr = curr - constDegree;
        $(".carousel").css({ transform: "rotateX(" + curr + "deg)" });
        highlight("down");
      }
    }
  });

  $(".carousel>figure").on("click", function() {
    if ($(this).index() != 0) {
      $("#menu")
        .prop("selectedIndex", $(this).index())
        .selectric("refresh");
      $("#menu")
        .val($(this).text())
        .trigger("change");
    }
  });
});

function createCarousel() {
  var tz = Math.round(
    $(".container").width() / 2 / Math.tan(Math.PI / section.length)
  );
  for (var i = 0; i < section.length; i++) {
    $(".carousel").append("<figure>" + section[i] + "</figure>");
    degree = i * constDegree;
    $(".carousel")
      .children()
      .eq(i)
      .css({
        transform:
          "rotateX(" +
          degree +
          "deg) translateZ(" +
          tz +
          "px) translateX(-150px)"
      });
  }
  $(".carousel")
    .children()
    .eq(0)
    .addClass("chosen");
}

function highlight(text) {
  if (text == "down") {
    index++;
    if (index > section.length - 1) {
      index = 0;
    }
  } else {
    index--;
    if (index < 0) {
      index = section.length - 1;
    }
  }
  $(".carousel")
    .children()
    .removeClass("chosen");
  $(".carousel")
    .children()
    .eq(index)
    .addClass("chosen");
}

function generateCoord(elem) {}

function animateText(elem) {
  var h = elem.parent().height() - elem.height();
  var w = elem.parent().width() - elem.width();

  var nh = Math.floor(Math.random() * h + elem.parent().offset().top);
  var nw = Math.floor(Math.random() * w + elem.parent().offset().left);

  var newq = [nh, nw];
  var oldq = elem.offset();
  var speed = calculateSpeed([oldq.top, oldq.left], newq);

  elem.animate({ top: newq[0], left: newq[1] }, speed, function() {
    animateText(elem);
  });
}

function calculateSpeed(prev, next) {
  var x = Math.abs(prev[1] - next[1]);
  var y = Math.abs(prev[0] - next[0]);

  var greatest = x > y ? x : y;

  var speedModifier = 0.05;

  var speed = Math.ceil(greatest / speedModifier);

  return speed;
}

function createSubSection(object) {
  var allSectionArray = [];
  for (var i = 0; i < myResult.num_results; i++) {
    allSectionArray[i] = myResult.results[i].section;
  }
  return allSectionArray.sort().filter(function(item, pos, ary) {
    return pos == ary.indexOf(item);
  });
}

function createMenu(ary, theMenu) {
  theMenu.empty();
  for (var i = 0; i < ary.length; i++) {
    theMenu.append("<option></option>");
    theMenu
      .children()
      .last("option")
      .attr({ value: ary[i] })
      .text(ary[i]);
  }
  theMenu.selectric("refresh");
}

function createArticle(object) {
  $("#display").empty();
  for (i = 0; i < object.num_results; i++) {
    var $article = $("<a><p></p></a>");
    $article.attr({ href: object.results[i].url, target: "_blank" });
    if (object.results[i].multimedia.length == 0) {
      $article.css({
        background: "url(../../assets/images/No_image.svg) no-repeat center",
        "background-size": "cover",
        display: "none",
        "animation-duration": "2s"
      });
    } else {
      $article.css({
        background:
          "url(" +
          object.results[i].multimedia[object.results[i].multimedia.length - 1]
            .url +
          ") no-repeat center",
        "background-size": "cover",
        display: "none",
        "animation-duration": "2s"
      });
    }

    $article.children().text(object.results[i].abstract);
    $("#display").append($article);
  }

  $("#display")
    .children()
    .each(function(index) {
      var element = $(this);
      setTimeout(function() {
        element.css({ display: "initial" });
      }, index * 150);
    });
}

function createSubArticle(object, theMenu) {
  var subMenuObject = {
    num_results: 0,
    results: []
  };
  var counter = 0;
  for (var i = 0; i < object.num_results; i++) {
    if (object.results[i].section == theMenu) {
      subMenuObject.results[counter] = object.results[i];
      counter++;
    }
  }
  subMenuObject.num_results = counter;

  return subMenuObject;
}
