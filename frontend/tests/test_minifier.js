import { minifyHTML } from '../src/lib/minifier.js';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    .container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    #output {
      color: #333;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <button id="btn">Click Me</button>
    <p id="output"></p>
  </div>
  <script>
    const btn = document.getElementById('btn');
    const output = document.getElementById('output');
    
    function updateText(val) {
      const message = "The count is: " + val;
      output.innerText = message;
    }
    
    let counter = 0;
    btn.addEventListener('click', function() {
      counter += 1;
      updateText(counter);
    });
  </script>
</body>
</html>`;

console.log('Minifying HTML...');
const minified = minifyHTML(html, {
  stripComments: true,
  collapseWhitespace: true,
  minifyEmbedded: true,
});
console.log('Done!');
console.log(minified);