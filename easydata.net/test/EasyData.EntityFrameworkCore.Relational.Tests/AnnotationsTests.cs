using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using EasyData.EntityFrameworkCore.MetaDataLoader;
using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using EasyData.MetaDescriptors;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class AnnotationsTests
    {
        private readonly MetaData _metaData;

        /// <summary>
        /// Get db context and entity meta attributes.
        /// </summary>
        public AnnotationsTests()
        {
            DbContext dbContext = AttributeTestDbContext.Create();

            _metaData = new MetaData();
            _metaData.LoadFromDbContext(dbContext);
        }

        /// <summary>
        /// Test getting entity meta attributes.
        /// </summary>
        [Fact]
        public void MetaEntityAttributeTest()
        {
            _metaData.EntityRoot.SubEntities.Should().HaveCount(1);

            var entity = _metaData.EntityRoot.SubEntities.First();

            entity.Name.Should().Be("Test");
            entity.Description.Should().Be("Test Description");
            entity.IsEditable.Should().Be(true);
        }

        /// <summary>
        /// Test getting entity property meta attributes.
        /// </summary>
        [Fact]
        public void MetaEntityAttrAttributeTest()
        {
            var entity = _metaData.EntityRoot.SubEntities.First();
            entity.Attributes.Should().HaveCount(10);

            var attr = entity.FindAttributeById("CustomerAttributeTest.Region");
            attr.ShowOnView.Should().BeFalse();
            attr.ShowInLookup.Should().BeTrue();
            attr.IsEditable.Should().BeFalse();
            attr.Caption.Should().Be("Test");
        }
    }
}
