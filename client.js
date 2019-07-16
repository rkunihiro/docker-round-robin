const fetch = require("node-fetch");

setInterval(async () => {
    const res = await fetch("http://web:3000");
    const result = await res.json();
    console.log(result);
}, 250);
