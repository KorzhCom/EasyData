
using System.Collections.Generic;

using Xunit;
using FluentAssertions;

namespace EasyData.Core.Tests
{
    public class DisplayFormatStoreTests
    {

        private readonly DisplayFormatStore _target;

        public DisplayFormatStoreTests()
        {
            _target = new DisplayFormatStore();
        }

        [Fact]
        public void Constructor_should_create_with_dict()
        {
            var dict = new Dictionary<DataType, List<DisplayFormatDescriptor>>
            { 
                [DataType.Date] = new List<DisplayFormatDescriptor>
                { 
                    new DisplayFormatDescriptor("DefaultFormat", "{0:G}"){ IsDefault = true},
                    new DisplayFormatDescriptor("Format1", "{0:F}"),
                    new DisplayFormatDescriptor("Format2", "{0:f}")
                },
                [DataType.Int32] = new List<DisplayFormatDescriptor>
                { 
                    new DisplayFormatDescriptor("DefaultFormat", "{0:D}") { IsDefault = true }
                }
            };

            var target = new DisplayFormatStore(dict);
            foreach (var (type, formats) in dict)
            {
                foreach (var format in formats)
                {
                    target.TryGetFormat(type, format.Name, out var expectedFormat).Should().BeTrue();
                    expectedFormat.Should().BeSameAs(format);
                }
            }
        }

        [Fact]
        public void Clear_should_clear()
        {
            _target.AddOrUpdate(DataType.Bool, "test", "{0:S0|1}", true);
            _target.Should().NotBeEmpty();

            _target.Clear();
            _target.Should().BeEmpty();
        }

        [Theory]
        [InlineData(DataType.String, "test", "{0:${0}}", true)]
        [InlineData(DataType.String, "test", "{0:$${0}}", false)]
        public void AddOrUpdate_should_add_or_update_format(DataType type, string name, string format, bool isDefault)
        {
            var formatDesc = _target.AddOrUpdate(type, name, format, isDefault);
            _target.Should().NotBeEmpty();

            formatDesc.IsDefault.Should().Be(isDefault);
            formatDesc.Name.Should().Be(name);
            formatDesc.Format.Should().Be(format);
        }

        [Fact]
        public void SetAttrDisplayFormat_should_throw_error_on_wrong_formats()
        { 
            var meta = new MetaData();
            var attr = meta.CreateEntityAttr(new MetaEntityAttrDescriptor { Parent = meta.EntityRoot, DataType = DataType.String });
            
            //the following assignments must be processed correctly
            attr.DisplayFormat = "{0:d}"; 
            attr.DisplayFormat = "Total: {0:C2} грн";
            attr.DisplayFormat = "{0:yyyy-MM-dd}";

            //the following must fail
            Assert.Throws<InvalidDataFormatException>(() => attr.DisplayFormat = "{0:d");
            Assert.Throws<InvalidDataFormatException>(() => attr.DisplayFormat = "{0n:}");
            Assert.Throws<InvalidDataFormatException>(() => attr.DisplayFormat = "{1:F}");
        }
    }
}
