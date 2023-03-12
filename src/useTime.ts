import { useVideoConfig } from "remotion";
import { useCallback } from "react";
import { parseTime } from "./parse";

type TimeTagFunction = (strings: TemplateStringsArray, ...values: any[]) => number;

/**
 * Return a tag function that converts a template literal to a frame count,
 * based on the current video's `durationInFrames` and `fps`.
 */
export function useTime()
{
	const config = useVideoConfig();
	const time: TimeTagFunction = useCallback(
		(strings, ...values) => parseTime(String.raw({ raw: strings }, ...values), config),
		[config]
	);

	return time;
}
