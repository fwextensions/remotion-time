# remotion-time

> A collection of React hooks that let you use time values like seconds, rather than frames, when building Remotion animations.

With `remotion-time`, you can change an animation's frames per second value without having to update dozens of frame values scattered throughout the code.  The hooks can also reduce the amount of boilerplate required to do things like interpolate values over time.


## Install

```shell
npm install remotion-time
```


## Usage

Instead of requiring the exact numbers of frames over which a Remotion function should operate, these hooks take strings that specify times in more convenient units, like `"1.5 minutes"` or `"10 sec"`.  The supported units and tokens include:

- seconds: `s`, `sec`, `second`, `seconds`
- minutes: `m`, `min`, `minute`, `minutes`
- hours: `h`, `hr`, `hour`, `hours`
- start of the current duration: `start`, `beginning`
- middle of the current duration: `middle`, `half`
- end of the current duration: `end`, `length`, `duration`
- percentage of the current duration: `%`, `pct`

Some very basic expressions are also supported, which makes it easier to specify a time in relation to another point, without having to use exact frames.  For example, in a composition that's 10 seconds long at 30fps, the string `"end - 2s"` equates to 240 frames.


### useTimeConfig(configString)

Takes a string specifying the length and FPS of the `Composition` in the form `"<time> @ <number> fps"`, and returns an object containing the equivalent `durationInFrames` and `fps` properties.  This object can then be spread on the `Composition`.

```js
import { Composition } from "remotion";
import { useTimeConfig } from "remotion-time";

function Root() {
  const config = useTimeConfig("6s @ 30fps");

  return (
    <Composition
      {...config}
      width={640}
      height={480}
      component={MyAnimation}
    />
  );
}
```


### useTime()

Returns a tagged-template function that can be used to calculate numbers of frames based on the FPS of the current `Composition`, like `` t`3s` ``.

In the example below, the first `Sequence` lasts for however many frames equals half a minute.  The second `Sequence` lasts for one second, and starts one second before the end of the containing composition.  This way, even if the overall length of the composition changes, this sequence will always start one second before it ends, without having to manually change any frame counts.

```js
import { AbsoluteFill, Sequence } from "remotion";
import { useTime } from "remotion-time";

function Anim() {
  const t = useTime();

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={t`.5m`}>
        // ...
      </Sequence>
      <Sequence from={t`end - 1sec`} durationInFrames={t`1sec`}>
        // ...
      </Sequence>
    </AbsoluteFill>
  );
}
```


### useInterpolate(input, output, options?)

Takes the following parameters and returns one or more interpolated values:

- `timeRange`: The time range over which the output values should be interpolated.  If an array with a single value is supplied, the interpolation is made from that starting time to the end of the composition.
- `outputRange`: The range of output values.  This can be specified using a single array or an object hash of multiple named output ranges.
- `options`: An optional object with the same keys as [Remotion's `interpolate()` options](https://www.remotion.dev/docs/interpolate#options).

Rather than having to get the current frame and the composition's duration every time you want to interpolate something, the `useInterpolate` hook does that for you.

In this example, the `opacity` value will go from 0 to 1 over the first second of the composition, and from 1 to 0 over its last second:

```js
import { useInterpolate } from "remotion-time";

const opacity = useInterpolate(
  ["start", "1s", "end - 1s", "end"],
  [0, 1, 1, 0]
);
```

It's often the case that you'll want to interpolate multiple values over the same time range, such as applying a fade, blur and zoom to an image at the same time.  Multiple output values can be generated in one call to `useInterpolate()` by passing an object instead of an array in the second parameter.  A hash of the named values is returned, and can be plucked out via destructuring:

```js
import { useInterpolate } from "remotion-time";

const { opacity, blur, scale } = useInterpolate(
  ["middle", "end"],
  {
    opacity: [1, 0],
    blur: [0, 40],
    scale: [1, 4],
  },
  { extrapolateLeft: "clamp" }
);
```

If supplied, the options in the third parameter are applied to all of the interpolated ranges.
