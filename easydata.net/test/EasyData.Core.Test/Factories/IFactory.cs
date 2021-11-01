using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.Core.Test.Factories
{
    /// <summary>
    /// Define methods to create test object instances.
    /// </summary>
    /// <typeparam name="T">Type of instance to create.</typeparam>
    internal interface IFactory<out T>
    {
        /// <summary>
        /// Create test object instance.
        /// </summary>
        T Create();
    }
}
