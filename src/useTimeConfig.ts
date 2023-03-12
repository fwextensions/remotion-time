import { VideoConfig } from "remotion";
import { FPSPattern } from "./regex";
import { parseQuantity } from "./parse";

const DefaultFPS = 30;

type DurationConfig = {
	durationInFrames: number,
	fps: number
};

/**
 * Given a time duration and FPS value, return an object that can be spread onto
 * a `<Composition>`.
 *
 * @param {string} configString  A string specifying the duration and fps of the
 * video, in the form `"<time duration> @ <frame count>fps"`.  The portion after
 * the `@` can be left out, in which case the FPS value defaults to 30.
 *
 * @returns {DurationConfig}  An object of the form `{ durationInFrames, fps }`.
 */
export function useTimeConfig(
	configString: string): DurationConfig
{
	const match = configString.match(FPSPattern);

	if (match) {
			// get the fps first so we can use it to convert the time-based duration
			// into frames
		const fps = parseInt(match[2]) || DefaultFPS;
		const durationInFrames = parseQuantity(match[1], { fps } as VideoConfig);

		return { durationInFrames, fps };
	}

	throw new Error(`Unrecognized config value: ${configString}`);
}
