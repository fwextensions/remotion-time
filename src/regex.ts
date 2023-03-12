const reString = (regex: RegExp) => regex.toString().slice(1, -1);
const regex = (...patterns: RegExp[]) => new RegExp(patterns.map(reString).join(""));

const OperandPattern = /((?:\d+(?:\.\d+)?\s*)?(?:\w+|%)?)/;

export const QuantityPattern = /^\s*(?<quantity>[\d.]+)\s*(?<units>\w+|%)\s*$/;
export const ExpressionPattern = regex(OperandPattern, /\s*([-+])\s*/, OperandPattern);
export const FPSPattern = regex(OperandPattern, /(?:\s*@\s*(\d+))?/);
