import { interpolate, useCurrentFrame } from "remotion";
import { useRange } from "./useRange";

type ExtrapolateType = "extend" | "identity" | "clamp";

export interface InterpolateOptions {
	easing?: (input: number) => number,
	extrapolateLeft?: ExtrapolateType,
	extrapolateRight?: ExtrapolateType
}

/**
 * Map the current frame into one or more output values, using Remotion's
 * [`interpolate()` function]{@link https://www.remotion.dev/docs/interpolate}.
 *
 * @param {(string|number)[]} input  A range of times over which the current
 * frame will be interpolated.
 *
 * @param {number[] | Record<string, number[]>} output  A range of values to
 * which the current frame will be mapped.  An object with multiple keyed ranges
 * can also be passed in.
 *
 * @param {InterpolateOptions?} options  An optional object with the same keys as Remotion's
 * [`interpolate()` options]{@link https://www.remotion.dev/docs/interpolate#options}.
 *
 * @returns {number | Record<string, number>}  The mapped value, or an object
 * containing a mapped value for each of the keys in the `output` parameter.
 */
export function useInterpolate(
	input: readonly (string | number)[],
	output: number[] | Record<string, number[]>,
	options?: InterpolateOptions): number | Record<string, number> | {}
{
	const frame = useCurrentFrame();
	const parsedInput = useRange(input);

	if (Array.isArray(output)) {
		return interpolate(frame, parsedInput, output, options);
	} else {
			// multiple output ranges were supplied by an object, so call interpolate
			// on each one and return the results as an object with the same keys
		return Object.entries(output)
			.reduce((result, [key, outputRange]) => ({
				...result,
				[key]: interpolate(frame, parsedInput, outputRange, options),
			}), {});
	}
}
