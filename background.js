chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    'innerBounds': {
      'width': 400,
      'height': 500,
      'minWidth': 400,
      'minHeight': 500,
      'left': 100,
      'top': 100
    }
  });
});
