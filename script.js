//https://github.com/mozilla/readability
//
// Should be precompiled
//https://stackoverflow.com/questions/19653030/only-allow-certain-domain-to-access-web-api
var commentTemplate = Handlebars.compile(document.getElementById("comment-template").innerHTML);
var commentsDiv = document.getElementById("comments");

var request = new XMLHttpRequest();
request.open('GET', 'http://hn.algolia.com/api/v1/items/16394604', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var story = JSON.parse(request.responseText);
    render(story);
  }
};
request.send();

function render(story) {
  story.children.forEach(function(comment) {
    rendered = commentTemplate({text: comment.text, author: comment.author, time: comment.created_at});
    commentsDiv.insertAdjacentHTML('afterend', rendered);


    console.log(comment);
  })
}
