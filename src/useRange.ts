import { useVideoConfig } from "remotion";
import { parseTime } from "./parse";

export function useRange(
	values: readonly (string | number)[])
{
	const config = useVideoConfig();

	if (values.length < 2) {
		values = [values[0], config.durationInFrames];
	}

	return values.map((value) => parseTime(value, config));
}
