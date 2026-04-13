const fs = require('fs');

const oldUrl = 'https://script.google.com/macros/s/AKfycbwDAnkG4EU37JrkCXG9SQ_xdkb8JzPsdUKtlrO1LCUPdg96wm5Z6PSIUeh2czhR_fvQ6g/exec';
const newUrl = 'https://script.google.com/macros/s/AKfycbyNnUhGtxCc9hxaJDU71N0zO2Fv4R10j6Uxl9fAvLRoOeBezXqCI5zZZE_2l8w2caAyYg/exec';

['app.js', 'admin.html'].forEach(filename => {
    let content = fs.readFileSync(filename, 'utf8');
    content = content.split(oldUrl).join(newUrl);
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`Updated ${filename}`);
});
