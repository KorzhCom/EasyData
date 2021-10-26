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

            Assert.Equal(firstEntityBuilder.DisplayName, displayName);
            Assert.Equal(firstEntityBuilder.DisplayNamePlural, displayNamePlural);
            Assert.Equal(firstEntityBuilder.Description, description);
            Assert.Equal(firstEntityBuilder.IsEnabled, enabled);

            Assert.Equal(secondEntityBuilder.DisplayName, secondDisplayName);
            Assert.Null(secondEntityBuilder.DisplayNamePlural);
            Assert.Null(secondEntityBuilder.Description);
            Assert.Null(secondEntityBuilder.IsEnabled);
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

            Assert.Equal(firstPropertyBuilder.DisplayName, displayName);
            Assert.Equal(firstPropertyBuilder.Description, description);
            Assert.Equal(firstPropertyBuilder.ShowInLookup, showInLookup);
            Assert.Equal(firstPropertyBuilder.IsEditable, editable);
            Assert.Equal(firstPropertyBuilder.ShowOnCreate, showOnCreate);
            Assert.Equal(firstPropertyBuilder.Sorting, sorting);
            Assert.Equal(firstPropertyBuilder.IsEnabled, enabled);
            Assert.Equal(firstPropertyBuilder.ShowOnView, showOnView);
            Assert.Equal(firstPropertyBuilder.Index, index);
            Assert.Equal(firstPropertyBuilder.ShowOnEdit, showOnEdit);

            Assert.Equal(secondPropertyBuilder.Description, secondDescription);
            Assert.Null(secondPropertyBuilder.DisplayName);
            Assert.Null(secondPropertyBuilder.ShowInLookup);
            Assert.Null(secondPropertyBuilder.IsEditable);
            Assert.Null(secondPropertyBuilder.ShowOnCreate);
            Assert.Null(secondPropertyBuilder.Sorting);
            Assert.Null(secondPropertyBuilder.IsEnabled);
            Assert.Null(secondPropertyBuilder.ShowOnView);
            Assert.Null(secondPropertyBuilder.Index);
            Assert.Null(secondPropertyBuilder.ShowOnEdit);
        }
    }
}
