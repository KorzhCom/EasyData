using System;

using Xunit;
using FluentAssertions;
using System.Collections.Generic;

namespace EasyData.Core.Tests
{
    public class DataUtilsTests
    {

        [Theory]
        [InlineData("order_details", "Order details")]
        public void PrettifyName_should_format_name(string name, string expectedResult)
        {
            var result = DataUtils.PrettifyName(name);
            result.Should().Be(expectedResult);
        }

        [Theory]
        [InlineData("Test", "", "Test")]
        [InlineData("", "Test", "Test")]
        [InlineData("Test", "Test", "Test.Test")]
        public void ComposeKey_should_return_key(string parent, string child, string expectedKey)
        {
            var key = DataUtils.ComposeKey(parent, child);
            key.Should().Be(expectedKey);
        }

        [Fact]
        public void ComposeKey_should_throw_ArgumentNullException()
        {
            this.Invoking(_ => DataUtils.ComposeKey(null, null))
                .Should().ThrowExactly<ArgumentNullException>();
        }

        [Theory]
        [InlineData("Category", "Categories")]
        [InlineData("Product", "Products")]
        [InlineData("Employee", "Employees")]
        [InlineData("Order", "Orders")]
        [InlineData("Wolf", "Wolves")]
        [InlineData("Potato", "Potatoes")]
        public void MakePlural_should_convert_to_plural(string singular, string expectedPlural)
        {
            var plural = DataUtils.MakePlural(singular);
            plural.Should().Be(expectedPlural);
        }

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
        public void GetDataTypeBySystemType_should_return_right_DataType(Type type, DataType expectedDataType)
        {
            var dataType = DataUtils.GetDataTypeBySystemType(type);
            dataType.Should().Be(expectedDataType);
        }

        [Theory]
        [InlineData(typeof(TestEnum1), "{0:SZero=0|One=1|Two=2|Three=3}")]
        [InlineData(typeof(TestEnum2), "{0:SZero=0|One=1|Five=5|Ten=10}")]
        public void ComposeDisplayFormatForEnum_should_create_right_format(Type enumType, string expectedFormat)
        {
            var format = DataUtils.ComposeDisplayFormatForEnum(enumType);
            format.Should().Be(expectedFormat);
        }

        private enum TestEnum1
        { 
            Zero,
            One,
            Two,
            Three
        }

        private enum TestEnum2
        {
            Zero,
            One,
            Five = 5,
            Ten = 10
        }

        [Theory]
        [InlineData(DataType.Date, false, "yyyy'-'MM'-'dd")]
        [InlineData(DataType.Time, false, "HH':'mm':'ss")]
        [InlineData(DataType.DateTime, false, "yyyy'-'MM'-'dd HH':'mm':'ss")]
        [InlineData(DataType.DateTime, true, "yyyy'-'MM'-'dd HH':'mm")]
        public void GetDateTimeInternalFormat_should_return_right_format(DataType dataType, bool shortTime, string expectedFormat)
        {
            var format = DataUtils.GetDateTimeInternalFormat(dataType, shortTime);
            format.Should().Be(expectedFormat);
        }

        [Theory]
        [MemberData(nameof(DateTimeToInternalFormatData))]
        public void DateTimeToInternalFormat_should_return_formatted_datetime_str(DateTime dateTime, DataType dataType, string expectedStr)
        {
            var str = DataUtils.DateTimeToInternalFormat(dateTime, dataType);
            str.Should().Be(expectedStr);
        }
     
        public static IEnumerable<object[]> DateTimeToInternalFormatData()
        {
            var dateTime = new DateTime(2012, 12, 20, 20, 12, 20);
            yield return new object[] { dateTime, DataType.Date, "2012-12-20" };
            yield return new object[] { dateTime, DataType.Time, "20:12:20" };
            yield return new object[] { dateTime, DataType.DateTime, "2012-12-20 20:12:20" };
        }

        [Theory]
        [MemberData(nameof(DateTimeToUserFormatData))]
        public void DateTimeToUserFormat_should_return_formatted_datetime_str(DateTime dateTime, DataType dataType, string format)
        {
            var ci = System.Globalization.DateTimeFormatInfo.CurrentInfo;
            var str = DataUtils.DateTimeToUserFormat(dateTime, dataType);
            str.Should().Be(dateTime.ToString(format, ci));
        }

        public static IEnumerable<object[]> DateTimeToUserFormatData()
        {
            var dateTime = new DateTime(2012, 12, 20, 20, 12, 20);

            yield return new object[] { dateTime, DataType.Date, "d" };
            yield return new object[] { dateTime, DataType.Time, "T" };
            yield return new object[] { dateTime, DataType.DateTime, "G" };
        }
    }
}
