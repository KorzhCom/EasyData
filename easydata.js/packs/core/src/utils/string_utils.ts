export function repeatString(str: string, times: number): string {
	return str.repeat(times);
}

export function reverseString(str: string): string{
	return str.split("").reverse().join("");
  }


export function strEndsWith(str : string, symbol: string): boolean {
	return typeof str === 'string' && str.endsWith(symbol);
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
		result += (path2 && path2.charAt(0) == '/') ? path2.substring(1) : path2;
	}
	else {
		result = path2;
	}

	return result;
}