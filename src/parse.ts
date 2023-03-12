import { VideoConfig } from "remotion";
import { ExpressionPattern, QuantityPattern } from "./regex";

function createHandlerMap<T>(
	tokenHandlers: [string[], T][]): Record<string, T>
{
	return tokenHandlers.reduce((
		result,
		[units, handler]) => ({
		...result,
		...Object.fromEntries(units.map((unit) => [unit, handler])),
	}), {});
}

type UnitHandler = (value: number, config: VideoConfig) => number;
type TokenHandler = (config: VideoConfig) => number;

const seconds: UnitHandler = (value, { fps }) => value * fps;
const minutes: UnitHandler = (...args) => 60 * seconds(...args);
const hours: UnitHandler = (...args) => 60 * minutes(...args);

const Units = createHandlerMap<UnitHandler>([
	[
		["s", "sec", "second", "seconds"],
		seconds
	],
	[
		["m", "min", "minute", "minutes"],
		minutes
	],
	[
		["h", "hr", "hour", "hours"],
		hours
	],
	[
		["%", "pct"],
		(value, { durationInFrames }) => (value / 100) * durationInFrames,
	],
]);

const Tokens = createHandlerMap<TokenHandler>([
	[
		["start", "beginning"],
		() => 0,
	],
	[
		["middle", "half"],
		({ durationInFrames }: VideoConfig) => .5 * durationInFrames,
	],
	[
		["end", "length", "duration"],
		({ durationInFrames }: VideoConfig) => durationInFrames,
	],
]);

export function parseQuantity(
	value: string | number,
	config: VideoConfig)
{
	// @ts-ignore
	if (typeof value === "number" || value == +value) {
			// value is either a number or a string containing just a number, so cast
			// it to a number.  we explicitly don't want strict equality here.
		return +value;
	} else if (value in Tokens) {
		return Tokens[value](config);
	} else {
		const match = value.match(QuantityPattern);

		if (match?.groups) {
			const {groups: {quantity, units}} = match;
			const handler = Units[units];

			if (handler) {
				return handler(Number(quantity), config);
			}
		}
	}

	return Number(value);
}

export function parseTime(
	value: string | number,
	config: VideoConfig)
{
		// first check if value can be converted to a simple frame count
	const frames = parseQuantity(value, config);

	if (Number.isFinite(frames)) {
		return frames;
	} else if (typeof value === "string") {
		const match = value.match(ExpressionPattern);

		if (match) {
				// we're not using named groups here because this pattern is made up out
				// of some identical regexes, which wouldn't have unique names
			const [, string1, operator, string2] = match;
			const value1 = parseQuantity(string1, config);
			const value2 = parseQuantity(string2, config);

				// concat the operator as a string with value2, and then convert that
				// string to either a negative or positive number and add it to value1
				// to calculate the formula
			return value1 + Number(operator + value2);
		}
	}

	throw new Error(`Unrecognized time value: ${value}`);
}
