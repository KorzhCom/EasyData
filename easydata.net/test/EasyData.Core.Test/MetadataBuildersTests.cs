using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using EasyData.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace EasyData.Core.Test
{
    /// <summary>
    /// Test building metadata with EasyData options.
    /// </summary>
    public class MetadataBuildersTests
    {
        private readonly EasyDataOptions _options;

        public MetadataBuildersTests()
        {
            var serviceMock = new Mock<IServiceProvider>();
            _options = new EasyDataOptions(serviceMock.Object);
        }

        /// <summary>
        /// Test building entities metadata.
        /// </summary>
        [Fact]
        public void TestBuildEntitiesMetadata()
        {
            var displayName = Faker.Lorem.Sentence();
            var displayNamePlural = Faker.Lorem.Sentence();
            var description = Faker.Lorem.Sentence();
            var enabled = Faker.Boolean.Random();
            var secondDisplayName = Faker.Lorem.Sentence();

            _options.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>()
                    .SetDisplayName(displayName)
                    .SetDisplayNamePlural(displayNamePlural)
                    .SetDescription(description)
                    .SetEnabled(enabled);

                builder.Entity<Customer>()
                    .SetDisplayName(secondDisplayName);
            });

            var firstEntityBuilder = _options.MetadataBuilder.EntityMetaBuilders.ToList()[0];
            var secondEntityBuilder = _options.MetadataBuilder.EntityMetaBuilders.ToList()[1];

            firstEntityBuilder.DisplayName.Should().Be(displayName);
            firstEntityBuilder.DisplayNamePlural.Should().Be(displayNamePlural);
            firstEntityBuilder.Description.Should().Be(description);
            firstEntityBuilder.IsEnabled.Should().Be(enabled);

            secondEntityBuilder.DisplayName.Should().Be(secondDisplayName);
            secondEntityBuilder.DisplayNamePlural.Should().BeNull();
            secondEntityBuilder.Description.Should().BeNull();
            secondEntityBuilder.IsEnabled.Should().BeNull();
        }

        /// <summary>
        /// Test building entity properties metadata.
        /// </summary>
        [Fact]
        public void TestBuildEntityPropertiesMetadata()
        {
            var displayName = Faker.Lorem.Sentence();
            var description = Faker.Lorem.Sentence();
            var showInLookup = Faker.Boolean.Random();
            var editable = Faker.Boolean.Random();
            var showOnCreate = Faker.Boolean.Random();
            var sorting = Faker.RandomNumber.Next();
            var enabled = Faker.Boolean.Random();
            var showOnView = Faker.Boolean.Random();
            var index = Faker.RandomNumber.Next();
            var showOnEdit = Faker.Boolean.Random();
            var secondDescription = Faker.Lorem.Sentence();


            _options.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>().Property(e => e.Title)
                    .SetDisplayName(displayName)
                    .SetDescription(description)
                    .SetShowInLookup(showInLookup)
                    .SetEditable(editable)
                    .SetShowOnCreate(showOnCreate)
                    .SetSorting(sorting)
                    .SetEnabled(enabled)
                    .SetShowOnView(showOnView)
                    .SetIndex(index)
                    .SetShowOnEdit(showOnEdit);

                builder.Entity<Category>().Property(e => e.Id)
                    .SetDescription(secondDescription);
            });

            var firstPropertyBuilder = _options.MetadataBuilder.EntityMetaBuilders.First().PropertyMetaBuilders.ToList()[0];
            var secondPropertyBuilder = _options.MetadataBuilder.EntityMetaBuilders.First().PropertyMetaBuilders.ToList()[1];

            firstPropertyBuilder.DisplayName.Should().Be(displayName);
            firstPropertyBuilder.Description.Should().Be(description);
            firstPropertyBuilder.ShowInLookup.Should().Be(showInLookup);
            firstPropertyBuilder.IsEditable.Should().Be(editable);
            firstPropertyBuilder.ShowOnCreate.Should().Be(showOnCreate);
            firstPropertyBuilder.Sorting.Should().Be(sorting);
            firstPropertyBuilder.IsEnabled.Should().Be(enabled);
            firstPropertyBuilder.ShowOnView.Should().Be(showOnView);
            firstPropertyBuilder.Index.Should().Be(index);
            firstPropertyBuilder.ShowOnEdit.Should().Be(showOnEdit);

            secondPropertyBuilder.Description.Should().Be(secondDescription);
            secondPropertyBuilder.DisplayName.Should().BeNull();
            secondPropertyBuilder.ShowInLookup.Should().BeNull();
            secondPropertyBuilder.IsEditable.Should().BeNull();
            secondPropertyBuilder.ShowOnCreate.Should().BeNull();
            secondPropertyBuilder.Sorting.Should().BeNull();
            secondPropertyBuilder.IsEnabled.Should().BeNull();
            secondPropertyBuilder.ShowOnView.Should().BeNull();
            secondPropertyBuilder.Index.Should().BeNull();
            secondPropertyBuilder.ShowOnEdit.Should().BeNull();
        }
    }
}
