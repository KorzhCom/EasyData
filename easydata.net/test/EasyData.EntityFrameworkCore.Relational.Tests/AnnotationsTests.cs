using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using EasyData.Services;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class AnnotationsTests
    {
        private readonly List<IEntityMetadataDescriptor> _entityMetadataDescriptors;

        /// <summary>
        /// Get db context and entity meta attributes.
        /// </summary>
        public AnnotationsTests()
        {
            DbContext dbContext = AttributeTestDbContext.Create();
            var loader = new DefaultMetaDataLoader(dbContext);
            _entityMetadataDescriptors = loader.GetDefaultMetaAttributes().ToList();
        }

        /// <summary>
        /// Test getting entity meta attributes.
        /// </summary>
        [Fact]
        public void MetaEntityAttributeTest()
        {
            _entityMetadataDescriptors.Should().HaveCount(2);

            var firstDescriptor = _entityMetadataDescriptors[0];
            var secondDescriptor = _entityMetadataDescriptors[1];

            firstDescriptor.IsEnabled.Should().BeFalse();

            secondDescriptor.DisplayName.Should().Be("Test");
            secondDescriptor.Description.Should().Be("Test Description");
        }

        /// <summary>
        /// Test getting entity property meta attributes.
        /// </summary>
        [Fact]
        public void MetaEntityAttrAttributeTest()
        {
            var firstDescriptor = _entityMetadataDescriptors[0];
            var secondDescriptor = _entityMetadataDescriptors[1];

            firstDescriptor.MetadataProperties.Should().HaveCount(4);
            secondDescriptor.MetadataProperties.Should().HaveCount(11);

            var attr = secondDescriptor.MetadataProperties
                .First(p => p.PropertyInfo.Name == "Region");

            attr.ShowOnView.Should().BeFalse();
            attr.ShowInLookup.Should().BeTrue();
            attr.IsEditable.Should().BeFalse();
            attr.DisplayName.Should().Be("Test");
        }
    }
}
