using System;

using Xunit;
using FluentAssertions;

namespace EasyData.Core.Test
{
    public class DataUtilsTests
    {

        [Theory]
        [InlineData(typeof(DateOnly), DataType.Date)]
        [InlineData(typeof(DateOnly?), DataType.Date)]
        [InlineData(typeof(DateTime), DataType.DateTime)]
        [InlineData(typeof(DateTime?), DataType.DateTime)]
        [InlineData(typeof(DateTimeOffset), DataType.DateTime)]
        [InlineData(typeof(DateTimeOffset?), DataType.DateTime)]
        [InlineData(typeof(TimeSpan), DataType.Time)]
        [InlineData(typeof(TimeSpan?), DataType.Time)]
        [InlineData(typeof(TimeOnly), DataType.Time)]
        [InlineData(typeof(TimeOnly?), DataType.Time)]
        [InlineData(typeof(bool), DataType.Bool)]
        [InlineData(typeof(bool?), DataType.Bool)]
        [InlineData(typeof(byte), DataType.Byte)]
        [InlineData(typeof(byte?), DataType.Byte)]
        [InlineData(typeof(char), DataType.Byte)]
        [InlineData(typeof(char?), DataType.Byte)]
        [InlineData(typeof(sbyte), DataType.Byte)]
        [InlineData(typeof(sbyte?), DataType.Byte)]
        [InlineData(typeof(short), DataType.Word)]
        [InlineData(typeof(short?), DataType.Word)]
        [InlineData(typeof(ushort), DataType.Word)]
        [InlineData(typeof(ushort?), DataType.Word)]
        [InlineData(typeof(int), DataType.Int32)]
        [InlineData(typeof(int?), DataType.Int32)]
        [InlineData(typeof(uint), DataType.Int32)]
        [InlineData(typeof(uint?), DataType.Int32)]
        [InlineData(typeof(long), DataType.Int64)]
        [InlineData(typeof(long?), DataType.Int64)]
        [InlineData(typeof(ulong), DataType.Int64)]
        [InlineData(typeof(ulong?), DataType.Int64)]
        [InlineData(typeof(float), DataType.Float)]
        [InlineData(typeof(float?), DataType.Float)]
        [InlineData(typeof(double), DataType.Float)]
        [InlineData(typeof(double?), DataType.Float)]
        [InlineData(typeof(Guid), DataType.Guid)]
        [InlineData(typeof(Guid?), DataType.Guid)]
        [InlineData(typeof(decimal), DataType.Currency)]
        [InlineData(typeof(decimal?), DataType.Currency)]
        [InlineData(typeof(byte[]), DataType.Blob)]
        [InlineData(typeof(string), DataType.String)]
        public void GetDataTypeBySystemType(Type type, DataType expectedDataType)
        {
            var dataType = DataUtils.GetDataTypeBySystemType(type);
            dataType.Should().Be(expectedDataType);
        }
    }
}
