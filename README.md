# pixelmap.js

pixelmap.js is a javascript library for drawing images to the canvas with [reverse pixel mapping](http://www.imagemagick.org/Usage/distorts/#mapping) using WebGL.

Visit [ericleong.github.io/pixelmap.js](http://ericleong.github.io/pixelmap.js) for a demo.

## what?

Image transformations can be simplified to a mapping of pixels from `(x, y)` to position `(i, j)`. 
But it is more efficient to do the reverse, mapping `(i, j)` to `(x, y)`. There are a couple ways of storing the reverse transformation.

### direct

| source | transformed |
| --- | --- |
| ![direct](/../reference/direct.png?raw=true) | ![transformed](/../gh-pages/distort.png?raw=true) |

The source image is a `256x256` image where the red channel maps to `x` and the green channel maps to `y`, so that `(r, g) == (x, y)`.

In the transformed image, the `(r, g)` color at `(i, j)` contains the original `(x, y)` position.

### displacement

| no transform | transformed |
| --- | --- |
| ![undisplaced](/../reference/undisplaced.png?raw=true) | ![transformed](/../gh-pages/displace.png?raw=true) |

The untransformed image is of one color, `#7F7F7F` or `rgb(127, 127, 127)`. `x` displacements are represented by a change in `r`, and `y` displacements by a change in `g`.

In the transformed image, the `(r, g)` color at `(i, j)` contains the displacement from `(x, y)` to arrive at `(i, j)`.

## install

For those using [bower](http://bower.io/)

```bash
$ bower install pixelmap.js
```

## usage

```javascript
var pixelmap = new Pixelmap(<canvas>, <type>);
```

* `<canvas>` is the desired [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to draw on.
* `<type>` is the type of the displacement map, either `"direct"` or `"displacement"`.

```javascript
pixelmap.draw(<image>, <map>);
```

`<image>` and `<map>` are either a [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or an [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement). 

* `<image>` is the image to modify.
* `<map>` is the displacement map to modify the image with.

```javascript
pixelmap.setViewport(<width>, <height>);
```

Use this to update the WebGL viewport if the canvas size is changed.