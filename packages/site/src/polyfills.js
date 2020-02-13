const Arr = Array.prototype;
if (!NodeList.prototype.indexOf) NodeList.prototype.indexOf = Arr.indexOf;
if (!HTMLCollection.prototype.indexOf) HTMLCollection.prototype.indexOf = Arr.indexOf;

if (!NodeList.prototype.forEach) NodeList.prototype.forEach = Arr.forEach;
if (!HTMLCollection.prototype.forEach) HTMLCollection.prototype.forEach = Arr.forEach;

if (!NodeList.prototype.map) NodeList.prototype.map = Arr.map;
if (!HTMLCollection.prototype.map) HTMLCollection.prototype.map = Arr.map;
