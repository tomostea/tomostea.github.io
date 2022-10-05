javascript: var d = document;
var o = d.documentElement;
d.write("<pre class=\"prettyprint\">" + (o.outerHTML || o.innerHTML).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>");
var style = d.createElement("style");
style.type = "text/css";
var head = d.head;
head.appendChild(style);
style.sheet.insertRule("*{font-family:'Menlo',monospace;font-size:7px}");