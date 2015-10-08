# pixelmap.js

pixelmap.js is a javascript library for drawing images to the canvas with [reverse pixel mapping](http://www.imagemagick.org/Usage/distorts/#mapping) using WebGL.

Visit [ericleong.github.io/pixelmap.js](http://ericleong.github.io/pixelmap.js) for a demo.

## what?

Image transformations can be simplified to a mapping of pixels from `(x, y)` to position `(i, j)`. 
But it is more efficient to do the reverse, mapping `(i, j)` to `(x, y)`.
This reverse transformation can be computed by transforming an image where the red channel maps to `x` and the green channel maps to `y`, so that `(r, g) == (x, y)`. 
In the transformed image, `(i, j)` will contain the original `(x, y)` position. 

## install

For those using [bower](http://bower.io/)

```bash
$ bower install pixelmap.js
```

## usage

```javascript
var pixelmap = new Pixelmap(<canvas>);

pixelmap.draw(<image>, <map>);
```

where `<image>` and `<map>` are either a [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or an [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement).

If the canvas size is changed, update the viewport with `setViewport(width, height)`.