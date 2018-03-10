// pwa: https://labs.ft.com/2012/08/basic-offline-html5-web-app/
//
//
//
// Should be precompiled
//https://stackoverflow.com/questions/19653030/only-allow-certain-domain-to-access-web-api


var contentDiv = document.getElementById('content');

var templates = {
  post: Handlebars.compile(document.getElementById("post-template").innerHTML),
  article: Handlebars.compile(document.getElementById("article-template").innerHTML),
  thread: Handlebars.compile(document.getElementById("thread-template").innerHTML),
  comment: Handlebars.compile(document.getElementById("comment-template").innerHTML)
}

function view(v) { return function(threadId) { helpers.clearContentDiv(); v(threadId) } }
var views = {
  index: view(function() {
    Object.keys(localStorage).forEach(function (id) {
      thread = JSON.parse(localStorage.getItem(id))
      if (thread !== null) {
        rendered = templates.post({title: thread.title, author: thread.by, time: helpers.timeAgo(thread.time), id: thread.id, commentsCount: thread.descendants});
        contentDiv.insertAdjacentHTML('beforeend', rendered);
      }
    })
  }),

  thread: view(function(threadId) {
    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.thread({title: thread.title, id: thread.id});
      contentDiv.insertAdjacentHTML('beforeend', rendered);
    }
    helpers.renderKids(thread)
  }),

  article: view(function(threadId) {
    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.article({title: thread.title, articleHtml: thread.summary, id: thread.id});
      contentDiv.insertAdjacentHTML('beforeend', rendered);
    }
  })
}

var helpers = {
  clearContentDiv: function () {
    var contentDiv = document.getElementById('content');
    while (contentDiv.firstChild) {
      contentDiv.removeChild(contentDiv.firstChild);
    }
  },
  timeAgo: function(timestamp) {
    var seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)
    var years = Math.floor(days / 365)

    if (years) {
      return years + " years ago"
    } else if (days) {
      return days + " days ago"
    } else if (hours) {
      return hours + " hours ago"
    } else if (minutes) {
      return minutes + " minutes ago"
    } else if (seconds) {
      return seconds + " seconds ago"
    }
  },
  renderKids: function(item) {
    var parentDiv = document.getElementById('item-' + item.id + '-kids');
    item.kids.forEach(function(kid) {
      rendered = templates.comment({title: kid.title, commentHtml: kid.text, author: kid.by, time: helpers.timeAgo(kid.time), id: kid.id});
      parentDiv.insertAdjacentHTML('beforeend', rendered);
      if (kid.kids) {
        helpers.renderKids(kid)
      }
    })
  }
}


function setUpLinks() {
  document.addEventListener('click', function(e) {
    var threadId = e.target.getAttribute('data-thread-id')
    if (threadId) {
      views.thread(threadId);
    }

    var articleId = e.target.getAttribute('data-article-id')
    if (articleId) {
      views.article(articleId);
    }
  })
}

function setUpData(data) {
  localStorage.clear()
  data.forEach(function(thread) {
    localStorage.setItem(thread.id, JSON.stringify(thread))
  })
}


var request = new XMLHttpRequest();
request.open('GET', 'https://www.hnoffline.com/api/top_stories', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var threads = JSON.parse(request.responseText);
    setUpLinks()
    setUpData(threads);
    views.index()
  }
};
request.send();
