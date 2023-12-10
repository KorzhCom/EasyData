export function repeatString(str: string, times: number): string {
	return str.repeat(times);
}

export function reverseString(str: string): string{
	return str.split("").reverse().join("");
  }


export function strEndsWith(str : string, symbol: string): boolean {
	return str && str.lastIndexOf(symbol) == (str.length - symbol.length);
}

/**
 * Adds two paths and returns the result
 * Correctly processes leading and trailing slashes
 * @param path1   
 * @param path2 
 */
export function combinePath (path1: string, path2: string): string {
	let result = path1;
	if (result != null && result.length > 0) {

		if (result.charAt(result.length - 1) != '/')
			result += "/";
		result += path2;
	}
	else {
		result = path2;
	}

	return result;
}