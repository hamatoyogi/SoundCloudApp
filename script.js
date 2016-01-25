/**
 * Created by yoavganbar on 23/01/2016.
 */
"use strict";
var searchResults,
    $results = $('#results'),
    resultsUl = document.querySelector('#results'),
    recentSearch = document.querySelector('#recentList'),
    prevResultsKeys = 'prevResultsKeys',
    viewStyle = 'viewStyle',
    setView = localStorage.getItem(viewStyle) || 'list',
    recentSearchVal = [],
    resultIndex = 0,
    trackId,
    picContainer = document.querySelector('#imageContainer');

// handle local storage
var localStorageSupported = function () {
    if (typeof window.localStorage !== "object") {
        console.error('Your browser does not support localStorage');
        return false;
    }
    return true;
};
var initViewSettings = function () {
    if (localStorageSupported()) {
        var prevView = window.localStorage.getItem(viewStyle);
        if (prevView.length > 0) {
            setView = prevView;
        }
    }
};
// check for previous searches by user
var prevSearchHandler = function () {
    if (localStorageSupported()) {
        var resultToShow = window.localStorage.getItem(prevResultsKeys);
        try {
            if (resultToShow.length > 0) {
                var resultToBuild = JSON.parse(resultToShow);
                resultToBuild.forEach(function (result) {
                    var oldResult = document.createElement('li');
                    oldResult.textContent = result;
                    recentSearch.appendChild(oldResult);
                    initViewSettings();
                });
            }
        } catch (e) {
            console.log('There are no previous searches saved');
        }
    }
    ;
};


function resultBuilder(startIndex, view) {
    $results.empty(); // empty result list
    var searchLen = searchResults.length;
    startIndex = startIndex || 0;
    var endindex = startIndex + 6;
    if (endindex > searchLen) {
        endindex = searchLen;
    }
    if (!view || view === 'list'){
        for (var i = startIndex; i < endindex; i++) {
            try {
                var newLi = document.createElement('li');
                newLi.innerText = searchResults[i].title;
                resultsUl.appendChild(newLi);
                resultIndex = i + 1;
            } catch (e) {
                newLi.innerText = "There Are No reults for your search term";
                resultsUl.appendChild(newLi);
            }

        }

    } else {
        for (var i = startIndex; i < endindex; i++) {
            try {
                var newLi = document.createElement('li');
                var newImg = document.createElement('img');
                newImg.src = searchResults[i].artwork_url || "http://www.thewoodjoynt.com/Content/Images/Products/NoImageAvailable.jpg";;
                newLi.appendChild(newImg);
                newLi.setAttribute('class','tile-view');
                resultsUl.appendChild(newLi);
                resultIndex = i + 1;
            } catch (e) {
                newLi.innerText = "There Are No reults for your search term";
                resultsUl.appendChild(newLi);
            }

        }

    }
    // add event listener to all search results

}
function saveSearchHistory(param) {
    recentSearchVal.push(param);
    localStorage.setItem(prevResultsKeys, JSON.stringify(recentSearchVal));

}

function getSearchResults(clickedParam) {
    // User search parameter
    var searchParam = $('.search').val() || clickedParam;
    // save each search parameter in localStorage
    saveSearchHistory(searchParam);

    // Get results based on search query
    SC.get('/tracks', {q: searchParam}, function (tracks) {

        // save tracks value for indexing
        searchResults = tracks;

        // display first 6 results
        resultBuilder(0,setView);


        // Put latest search in recent searches
        $('#recentList').append($('<li></li>').html(searchParam));
        setClickEvents(resultsUl, clickedResult);


    });
}
// Next results function
function nextRes() {
    resultBuilder(resultIndex,setView);
    setClickEvents(resultsUl, clickedResult);
}

// Create new search when item from search history is clicked
function clickedSearch(e) {
    var newSearch = e.target.textContent;
    getSearchResults(newSearch);
}

// When search result is clicked, pop image in img container and change result to image.
function clickedResult(e) {
    var title = e.target.textContent;
    var picUrl = e.target.src;
    var searchLen = searchResults.length;
    picContainer.innerHTML = '';
    for (var i = 0; i < searchLen; i++) {
        // look for the entry with a matching `title` value
        if (searchResults[i].title === title) {
            var picture = searchResults[i].artwork_url || "http://www.thewoodjoynt.com/Content/Images/Products/NoImageAvailable.jpg";
            var img = document.createElement('img');
            img.src = picture;
            picContainer.appendChild(img);
            trackId = searchResults[i].id;
            picContainer.addEventListener('click', function(){
                $('<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + trackId + '&amp;color=ff6600&amp;auto_play=true&amp;show_artwork=true"></iframe>').appendTo(picContainer);
            });
        } else if (searchResults[i].artwork_url === picUrl){
            title = searchResults[i].title;
            var img = document.createElement('img');
            img.src = picUrl;
            picContainer.appendChild(img);
            trackId = searchResults[i].id;
            picContainer.addEventListener('click', function(){
                $('<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + trackId + '&amp;color=ff6600&amp;auto_play=true&amp;show_artwork=true"></iframe>').appendTo(picContainer);
            })
        }
    }
    document.querySelector('img').setAttribute('class', 'img-animation');
    e.target.setAttribute('class', "element-animation");
}

function setClickEvents(list, callFunc) {
    try {
        if (arguments.length === 0) {
            return;
        } else {
            var lis = list.querySelectorAll('li');
            var len = lis.length;
            for (var i = 0; i < len; i++) {
                lis[i].addEventListener('click', callFunc);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function tileView() {
    resultIndex = 0;
    setView = 'tiles'
    resultBuilder(resultIndex,setView);
    localStorage.setItem(viewStyle, setView);
    setClickEvents(resultsUl, clickedResult);
}
function listView() {
    resultIndex = 0;
    setView = 'list'
    resultBuilder(resultIndex,setView);
    localStorage.setItem(viewStyle, setView);
    setClickEvents(resultsUl, clickedResult);
}
// main prog
SC.initialize({
    client_id: 'd652006c469530a4a7d6184b18e16c81'
});

prevSearchHandler();
setClickEvents(recentSearch, clickedSearch);
// add tooltip to center image so you know you can click!
$('[data-toggle="tooltip"]').tooltip();
