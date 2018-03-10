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


// function viewFunction(f) {
//   return function asdf() {
//     clearContentDiv();
//     f();
//   }
// }


var views = {
  index: function() {
    clearContentDiv()

    Object.keys(localStorage).forEach(function (id) {
      thread = JSON.parse(localStorage.getItem(id))
      if (thread !== null) {
        rendered = templates.post({title: thread.title, author: thread.by, time: timeAgo(thread.time), id: thread.id, commentsCount: thread.descendants});
        contentDiv.insertAdjacentHTML('beforeend', rendered);
      }
    })
  },
  thread: function(threadId) {
    clearContentDiv()

    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.thread({title: thread.title, id: thread.id});
      contentDiv.insertAdjacentHTML('beforeend', rendered);
    }
    renderKids(thread)
  },
  article: function(threadId) {
    clearContentDiv()

    thread = JSON.parse(localStorage.getItem(threadId))
    if (thread !== null) {
      rendered = templates.article({title: thread.title, articleHtml: thread.summary, id: thread.id});
      contentDiv.insertAdjacentHTML('beforeend', rendered);
    }
  }
}







function renderKids(item) {
  var parentDiv = document.getElementById('item-' + item.id + '-kids');
  item.kids.forEach(function(kid) {
    rendered = templates.comment({title: kid.title, commentHtml: kid.text, author: kid.by, time: timeAgo(kid.time), id: kid.id});
    parentDiv.insertAdjacentHTML('beforeend', rendered);
    if (kid.kids) {
      renderKids(kid)
    }
  })
}


function clearContentDiv() {
  var contentDiv = document.getElementById('content');
  while (contentDiv.firstChild) {
    contentDiv.removeChild(contentDiv.firstChild);
  }
}





function timeAgo(timestamp) {
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
}





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



localStorage.clear()
example.forEach(function(thread) {
  localStorage.setItem(thread.id, JSON.stringify(thread))
})


views.index()




// var request = new XMLHttpRequest();
// request.open('GET', 'http://localhost:4000/top_stories', true);
// request.onload = function() {
//   if (request.status >= 200 && request.status < 400) {
//     var threads = JSON.parse(request.responseText);
//     console.log(threads[0])

//     // render(story);
//   }
// };
// request.send();
