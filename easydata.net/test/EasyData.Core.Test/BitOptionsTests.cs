using System;
using Xunit;

using FluentAssertions;

namespace EasyData.Core.Test
{
    public class BitOptionsTests
    {
        [Fact]
        public void WithTest()
        {
            var options = new BitOptions();
            options.With(MetaDataReadWriteOptions.Entities);

            var signature = (ulong)(options & MetaDataReadWriteOptions.Entities);
            signature.Should().BeGreaterThan(0);
        }

        [Fact]
        public void WithoutTest()
        {
            var options = new BitOptions();
            options.Without(MetaDataReadWriteOptions.Entities);

            var signature = (ulong)(options & MetaDataReadWriteOptions.Entities);
            signature.Should().Be(0);
        }

        [Fact]
        public void Contains()
        {
            var options = (BitOptions)(MetaDataReadWriteOptions.Entities | MetaDataReadWriteOptions.Description);

            options.Contains(MetaDataReadWriteOptions.Description).Should().BeTrue();
            options.Contains(MetaDataReadWriteOptions.CustomInfo).Should().BeFalse();
        }
    }
}
