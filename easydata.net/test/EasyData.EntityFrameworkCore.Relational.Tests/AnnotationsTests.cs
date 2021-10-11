using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;

using Xunit;
using FluentAssertions;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class AnnotationsTests
    {

        [Fact]
        public void MetaEnityAttributeTest()
        {
            var dbContext = AttributeTestDbContext.Create();
            var meta = new Metadata();

            meta.LoadFromDbContext(dbContext);

            meta.EntityRoot.SubEntities.Should().HaveCount(1);

            var entity = meta.EntityRoot.SubEntities.First();
            entity.Name.Should().Be("Test");
            entity.Description.Should().Be("Test Description");
        }

        [Fact]
        public void MetaEntityAttrAttributeTest()
        {
            var dbContext = AttributeTestDbContext.Create();
            var meta = new Metadata();

            meta.LoadFromDbContext(dbContext);

            var entity = meta.EntityRoot.SubEntities.First();
            entity.Attributes.Should().HaveCount(10);

            var attr = entity.FindAttributeById("CustomerAttributeTest.Region");
            attr.ShowOnView.Should().BeFalse();
            attr.ShowInLookup.Should().BeTrue();
            attr.IsEditable.Should().BeFalse();
            attr.Caption.Should().Be("Test");
        }
    }
}
