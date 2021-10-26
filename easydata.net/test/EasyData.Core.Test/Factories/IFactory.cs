using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.Core.Test.Factories
{
    interface IFactory<out T>
    {
        T Object { get; }
    }
}
