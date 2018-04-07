var contentDiv = document.getElementById('content')
var progressBar = document.getElementById('progress-bar')
var cachedAt = document.getElementById('cached-at')

var templates = {
  post: Handlebars.compile(document.getElementById('post-template').innerHTML),
  article: Handlebars.compile(document.getElementById('article-template').innerHTML),
  thread: Handlebars.compile(document.getElementById('thread-template').innerHTML),
  comment: Handlebars.compile(document.getElementById('comment-template').innerHTML)
}

function view (v) {
  return function (threadId) {
    helpers.clearContentDiv()
    v(threadId)
    scroll(0, 0)
    helpers.makeAllExternalLinksOpenInNewWindow()
  }
}
var views = {
  index: view(function () {
    threadOrder.forEach(function (id) {
      thread = JSON.parse(localStorage.getItem(id))
      if (thread !== null) {
        rendered = templates.post({title: thread.title, author: thread.by, time: helpers.timeAgo(thread.time), id: thread.id, commentsCount: thread.descendants, url: thread.url})
        contentDiv.insertAdjacentHTML('beforeend', rendered)
      }
    })
  }),

  thread: view(function (threadId) {
    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.thread({title: thread.title, id: thread.id, url: thread.url, text: thread.text})
      contentDiv.insertAdjacentHTML('beforeend', rendered)
    }
    helpers.renderKids(thread)
  }),

  article: view(function (threadId) {
    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.article({title: thread.title, articleHtml: thread.summary, id: thread.id, url: thread.url})
      contentDiv.insertAdjacentHTML('beforeend', rendered)
    }
  }),

  routeTo: function (viewName, id) {
    if (viewName === 'index') {
      views.index()
      window.history.pushState({index: true}, 'root', '/')
    } else if (viewName === 'thread') {
      views.thread(id)
      window.history.pushState({threadId: id}, 'thread' + id, '?thread=' + id)
    } else if (viewName === 'article') {
      views.article(id)
      window.history.pushState({articleId: id}, 'article' + id, '?article=' + id)
    }
  }
}


var helpers = {
  clearContentDiv: function () {
    var contentDiv = document.getElementById('content')
    while (contentDiv.firstChild) {
      contentDiv.removeChild(contentDiv.firstChild)
    }
  },
  timeAgo: function (timestamp) {
    var seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)
    var years = Math.floor(days / 365)

    if (years) {
      return years + ' years ago'
    } else if (days) {
      return days + ' days ago'
    } else if (hours) {
      return hours + ' hours ago'
    } else if (minutes) {
      return minutes + ' minutes ago'
    } else if (seconds) {
      return seconds + ' seconds ago'
    }
  },
  renderKids: function (item) {
    var parentDiv = document.getElementById('item-' + item.id + '-kids')
    item.kids.forEach(function (kid) {
      if (kid.text) {
        rendered = templates.comment({title: kid.title, commentHtml: kid.text, author: kid.by, time: helpers.timeAgo(kid.time), id: kid.id})
        parentDiv.insertAdjacentHTML('beforeend', rendered)
        if (kid.kids) {
          helpers.renderKids(kid)
        }
      }
    })
  },
  renderCachedAt: function (timestamp) {
    cachedAt.innerText = 'cached ' + helpers.timeAgo(timestamp)
  },
  makeAllExternalLinksOpenInNewWindow: function() {
    var links = document.querySelectorAll('a')
    links.forEach(function(link) {
      if (link.getAttribute('href') && isExternal(link.getAttribute('href'))) {
        link.setAttribute('target', '_blank')
      }
    })
  }
}


function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[location.protocol]+")?$"), "") !== location.host) return true;
    return false;
}


window.onpopstate = function (event) {
  if (event.state) {
    if (event.state.index) { views.index() }
    if (event.state.articleId) { views.article(event.state.articleId) }
    if (event.state.threadId) { views.thread(event.state.threadId) }
  } else {
    window.history.back()
  }
}

function setUpData (data) {
  localStorage.clear()
  data.forEach(function (thread) {
    localStorage.setItem(thread.id, JSON.stringify(thread))
  })
}


// these should be generated from a single function
function setUpLinks () {
  document.addEventListener('click', function (e) {
    var linkDestination = e.target.getAttribute('data-link-destination')
    if (linkDestination) {
      e.preventDefault()
      e.stopPropagation()
      views.routeTo(linkDestination.split(':')[0], linkDestination.split(':')[1])
    }

    if (e.target.className === 'comment-toggle') { toggleSubthread(e) }
  })
}



function toggleSubthread(e) {
  e.stopPropagation()

  var parentComment = e.target.parentElement.parentElement

  if (parentComment.className === 'comment kids-shown') {
    if (!e.target.getAttribute('data-kids-count')) {
      var hiddenCount = parentComment.querySelectorAll('.comment').length + 1
      e.target.setAttribute('data-kids-count', hiddenCount)
    }
    parentComment.className = 'comment kids-hidden'
  } else if (parentComment.className === 'comment kids-hidden') {
    parentComment.className = 'comment kids-shown'
  }
}




// Route based on URL when site is initially loaded.
function route (searchParams) {
  // Fallback for browsers that don't support URLSearchParams.
  if (!window.URLSearchParams) {
    views.index()
    window.history.pushState({index: true}, 'root', '/')
    return
  }
  var urlSearchParams = new URLSearchParams(searchParams)
  if (urlSearchParams.get('article')) {
    var articleId = urlSearchParams.get('article')
    views.article(articleId)
    if (history.state.articleId && history.state.articleId === articleId) {
      window.history.pushState({articleId: articleId}, 'article' + articleId, '?article=' + articleId)
    }
  } else if (urlSearchParams.get('thread')) {
    var threadId = urlSearchParams.get('thread')
    views.thread(threadId)
    if (history.state.threadId && history.state.threadId === threadId) {
      window.history.pushState({threadId: threadId}, 'thread' + threadId, '?thread=' + threadId)
    }
  } else {
    views.index()
    window.history.pushState({index: true}, 'root', '')
  }
}

var request = new XMLHttpRequest()
request.open('GET', 'https://api.hnoffline.com/top_stories', true)
request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    var response = JSON.parse(request.responseText)
    var threads = response['threads']
    threadOrder = threads.map(function (thread) { return thread.id })
    setUpLinks()
    setUpData(threads)
    helpers.renderCachedAt(response['parsed_at'])
    route(location.search)
  }
}
request.addEventListener('progress', function (e) {
  if (e.lengthComputable) {
    progressBar.setAttribute('max', e.total)
    progressBar.setAttribute('value', e.loaded)
  }
})

if (window.location.host === 'localhost:8000' || window.location.host === 'hnoffline.com' || window.location.host === 'firebaseapp.com') { request.send() }
