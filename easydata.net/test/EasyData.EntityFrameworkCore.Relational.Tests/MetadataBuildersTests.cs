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
        /// Test customizing entities metadata.
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

            _options.CustomizeModel(builder =>
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

            _options.ModelCustomizer.Should().NotBeNull();
            //TODO: Call LoadFromDbContext and check the metadata objects after that
        }

        /// <summary>
        /// Test customizing entity attributes metadata.
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


            _options.CustomizeModel(builder =>
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

            _options.ModelCustomizer.Should().NotBeNull();

            //TODO: Call LoadFromDbContext and check the metadata objects after that
        }
    }
}
