import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useCallback } from "react";

const reString = (regex) => regex.toString().slice(1, -1);
const regex = (...patterns) => new RegExp(patterns.map(reString).join(""));

const DefaultFPS = 30;
const OperandPattern = /((?:\d+(?:\.\d+)?\s*)?(?:\w+|%)?)/;
const QuantityPattern = /^\s*(?<quantity>[\d.]+)\s*(?<units>\w+|%)\s*$/;
const ExpressionPattern = regex(OperandPattern, /\s*([-+])\s*/, OperandPattern);
const FPSPattern = regex(OperandPattern, /(?:\s*@\s*(\d+))?/);

const seconds = (value,	{ fps }) => value * fps;
const minutes = (value,	{ fps }) => value * 60 * fps;
const percentage = (value, { durationInFrames }) => (value / 100) * durationInFrames;

const Units = [
	[["s", "sec", "second", "seconds"], seconds],
	[["m", "min", "minute", "minutes"], minutes],
	[["%"], percentage],
].reduce((result, [units, handler]) => ({
	...result,
	...Object.fromEntries(units.map((unit) => [unit, handler]))
}), {});
const Tokens = {
	start: () => 0,
	middle: ({ durationInFrames }) => .5 * durationInFrames,
	end: ({ durationInFrames }) => durationInFrames,
};

function parseQuantity(
	value,
	config)
{
	if (value in Tokens) {
		return Tokens[value](config);
	} else if (typeof value === "number" || value == +value) {
			// value is either a number or a string containing just a number, so cast
			// it to a number.  we explicitly don't want strict equality here.
		return +value;
	} else {
		const match = value.match(QuantityPattern);

		if (match) {
			const { groups: { quantity, units } } = match;
			const handler = Units[units];

			if (handler) {
					// frame values have to be whole numbers
				return Math.round(handler(quantity, config));
			}
		}
	}

	return value;
}

function parseTime(
	value,
	config)
{
		// first check if value can be converted to a simple frame count
	const frames = parseQuantity(value, config);

	if (Number.isFinite(frames)) {
		return frames;
	}

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

	throw new Error(`Unrecognized time value: ${value}`);
}

export function useRange(
	values)
{
	const config = useVideoConfig();

	if (values.length < 2) {
		values = [values[0], config.durationInFrames];
	}

	return values.map((value) => parseTime(value, config));
}

export function useInterpolate(
	timeRange,
	outputRange,
	options)
{
	const frame = useCurrentFrame();
	const parsedInput = useRange(timeRange);

	if (Array.isArray(outputRange)) {
		return interpolate(frame, parsedInput, outputRange, options);
	} else {
			// multiple output ranges were supplied by an object, so call interpolate
			// on each one and return the results as an object with the same keys
		return Object.entries(outputRange).reduce((result, [key, outputRange]) => ({
			...result,
			[key]: interpolate(frame, parsedInput, outputRange, options),
		}), {});
	}
}

export function useTime()
{
	const config = useVideoConfig();
	const time = useCallback(
		(strings, ...values) => parseTime(String.raw({ raw: strings }, ...values), config),
		[config]
	);

	return time;
}

export function useConfig(
	configString)
{
	const match = configString.match(FPSPattern);

	if (match) {
			// get the fps first so we can use it to convert the time-based duration
			// into frames
		const fps = parseInt(match[2]) || DefaultFPS;
		const durationInFrames = parseQuantity(match[1], { fps });

		return { durationInFrames, fps };
	}

	throw new Error(`Unrecognized config value: ${configString}`);
}
