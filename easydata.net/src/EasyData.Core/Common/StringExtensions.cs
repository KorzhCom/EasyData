using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData
{
    public static class StringExtensions
    {
        /// <summary>
        /// Gets the second part of the string divided by separator. If the separator is not included - the whole string is returned.
        /// </summary>
        /// <param name="s">The input string.</param>
        /// <param name="sep">The separator.</param>
        /// <returns>System.String.</returns>
        public static string GetSecondPart(this string s, char sep)
        {
            string[] parts = s.Split(sep);
            if (parts.Length > 1) {
                return parts[1];
            }
            else {
                return s;
            }
        }

        /// <summary>
        /// Converts any string to an identifier (changes all symbols like '.' ';' '?' etc to '_')
        /// </summary>
        /// <param name="s">The source string.</param>
        /// <returns>The result identifier</returns>
        public static string ToIdentifier(this string s)
        {
            var sb = new StringBuilder(s);
            for (int i = 0; i < sb.Length; i++) {
                if (!char.IsLetterOrDigit(sb[i])) sb[i] = '_';
            }

            return sb.ToString();
        }

    }
}
