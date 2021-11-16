using System;
using Xunit;

using FluentAssertions;

namespace EasyData.Core.Tests
{
    public class BitOptionsTests
    {
        [Fact]
        public void With_should_add_option()
        {
            var options = new BitOptions();
            options.With(MetaDataReadWriteOptions.Entities);

            var signature = (ulong)(options & MetaDataReadWriteOptions.Entities);
            signature.Should().BeGreaterThan(0);
        }

        [Fact]
        public void Without_should_remove_option()
        {
            var options = new BitOptions();
            options.Without(MetaDataReadWriteOptions.Entities);

            var signature = (ulong)(options & MetaDataReadWriteOptions.Entities);
            signature.Should().Be(0);
        }

        [Fact]
        public void Contains_should_check_option()
        {
            var options = (BitOptions)(MetaDataReadWriteOptions.Entities | MetaDataReadWriteOptions.Description);

            options.Contains(MetaDataReadWriteOptions.Description).Should().BeTrue();
            options.Contains(MetaDataReadWriteOptions.CustomInfo).Should().BeFalse();
        }
    }
}
