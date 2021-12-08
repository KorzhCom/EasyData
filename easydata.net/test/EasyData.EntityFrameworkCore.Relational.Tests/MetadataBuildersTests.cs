using System.Linq;
using FluentAssertions;
using Xunit;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    /// <summary>
    /// Test building metadata with EasyData options.
    /// </summary>
    public class MetadataBuildersTests
    {
        private readonly DbContextMetaDataLoaderOptions _options;

        public MetadataBuildersTests()
        {
            _options = new DbContextMetaDataLoaderOptions();
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
            var editable = Faker.Boolean.Random();

            _options.Customize(builder =>
            {
                builder.Entity<Category>()
                    .SetDisplayName(displayName)
                    .SetDisplayNamePlural(displayNamePlural)
                    .SetDescription(description)
                    .SetEnabled(enabled)
                    .SetEditable(editable);

                builder.Entity<Customer>()
                    .SetDisplayName(secondDisplayName);
            });

            var firstEntityMetadataDescriptor = _options.MetadataBuilder.EntityMetaBuilders.ToList()[0].EntityMetadataDescriptor;
            var secondEntityMetadataDescriptor = _options.MetadataBuilder.EntityMetaBuilders.ToList()[1].EntityMetadataDescriptor;

            firstEntityMetadataDescriptor.DisplayName.Should().Be(displayName);
            firstEntityMetadataDescriptor.DisplayNamePlural.Should().Be(displayNamePlural);
            firstEntityMetadataDescriptor.Description.Should().Be(description);
            firstEntityMetadataDescriptor.IsEnabled.Should().Be(enabled);
            firstEntityMetadataDescriptor.IsEditable.Should().Be(editable);

            secondEntityMetadataDescriptor.DisplayName.Should().Be(secondDisplayName);
            secondEntityMetadataDescriptor.DisplayNamePlural.Should().BeNull();
            secondEntityMetadataDescriptor.Description.Should().BeNull();
            secondEntityMetadataDescriptor.IsEditable.Should().BeNull(); ;
        }

        /// <summary>
        /// Test building entity attributes metadata.
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


            _options.Customize(builder =>
            {
                builder.Entity<Category>().Attribute(e => e.Description)
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

                builder.Entity<Category>().Attribute(e => e.Id)
                    .SetDescription(secondDescription);
            });

            var firstEntityAttributeMetadataDescriptor = _options.MetadataBuilder.EntityMetaBuilders.First().EntityMetadataDescriptor.MetadataAttributes.ToList()[0];
            var secondEntityAttributeMetadataDescriptor = _options.MetadataBuilder.EntityMetaBuilders.First().EntityMetadataDescriptor.MetadataAttributes.ToList()[1];

            firstEntityAttributeMetadataDescriptor.DisplayName.Should().Be(displayName);
            firstEntityAttributeMetadataDescriptor.Description.Should().Be(description);
            firstEntityAttributeMetadataDescriptor.ShowInLookup.Should().Be(showInLookup);
            firstEntityAttributeMetadataDescriptor.IsEditable.Should().Be(editable);
            firstEntityAttributeMetadataDescriptor.ShowOnCreate.Should().Be(showOnCreate);
            firstEntityAttributeMetadataDescriptor.Sorting.Should().Be(sorting);
            firstEntityAttributeMetadataDescriptor.IsEnabled.Should().Be(enabled);
            firstEntityAttributeMetadataDescriptor.ShowOnView.Should().Be(showOnView);
            firstEntityAttributeMetadataDescriptor.Index.Should().Be(index);
            firstEntityAttributeMetadataDescriptor.ShowOnEdit.Should().Be(showOnEdit);

            secondEntityAttributeMetadataDescriptor.Description.Should().Be(secondDescription);
            secondEntityAttributeMetadataDescriptor.DisplayName.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.ShowInLookup.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.IsEditable.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.ShowOnCreate.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.Sorting.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.ShowOnView.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.Index.Should().BeNull();
            secondEntityAttributeMetadataDescriptor.ShowOnEdit.Should().BeNull();
        }
    }
}
