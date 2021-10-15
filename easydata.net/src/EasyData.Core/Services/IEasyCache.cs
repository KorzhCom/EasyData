using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.Services
{
    /// <summary>
    ///  Represents a general caching service
    /// </summary>
    public interface IEasyCache
    {
        /// <summary>
        /// Gets the value associated with this key if present.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns>System.String.</returns>
        string GetValue(string key);

        /// <summary>
        /// Puts the key:value pair to the cache
        /// </summary>
        /// <param name="key">The key.</param>
        /// <param name="value">The value.</param>
        void PutValue(string key, string value);
    }
}
