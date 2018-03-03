// Should be precompiled
//https://stackoverflow.com/questions/19653030/only-allow-certain-domain-to-access-web-api

var indexThreadTemplate = Handlebars.compile(document.getElementById("index-thread-template").innerHTML);
var articleTemplate = Handlebars.compile(document.getElementById("article-template").innerHTML);



localStorage.clear()
example.forEach(function(thread) {
  localStorage.setItem(thread.id, JSON.stringify(thread))
})



function renderIndex() {
  clearContentDiv()

  var contentDiv = document.getElementById('content');
  Object.keys(localStorage).forEach(function (id) {
    thread = JSON.parse(localStorage.getItem(id))
    if (thread !== null) {
      rendered = indexThreadTemplate({title: thread.title, author: thread.by, time: thread.time, id: thread.id});
      contentDiv.insertAdjacentHTML('beforeend', rendered);
    }
  })
}


function renderThread() {}

function renderArticle() {}

function clearContentDiv() {
  var contentDiv = document.getElementById('content');
  while (contentDiv.firstChild) {
    contentDiv.removeChild(contentDiv.firstChild);
  }
}




document.addEventListener('click', function(e) {
  var threadId = e.target.getAttribute('data-thread-id')
  if (threadId) {
    clearContentDiv()
    var contentDiv = document.getElementById('content');
    thread = JSON.parse(localStorage.getItem(threadId))
    rendered = articleTemplate({articleHtml: thread.summary});
    contentDiv.insertAdjacentHTML('beforeend', rendered);
  }
})

renderIndex()




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
