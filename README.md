pageboard client modules
========================

install
-------

`npm install @pageboard/client`


dev install
-----------

Install and run `make`.


modules
-------  

* elements  
  the core client elements for rendering a page.  
  Exposes window.Pageboard, which is used to run things,
  and to provide essential utils.

* elements-write  
  the client libraries for edition, uses `pagecut` for block edition.

* elements-semantic-ui  
  A full set of elements using the well known framework.

* elements-gallery  
  Powerful portfolio/carousel/medialist combos.

* elements-google  
  Translate, verify site owner, tag manager...

* elements-mail  
  Edit mail pages like a boss.

* elements-calendar  
  Core elements for managing events in a calendar.

* pagecut  
  The core editor module, uses `prosemirror` to drive HTML wysiwyg editing.
  It also contains a simple rendering part used by core pageboard client.


