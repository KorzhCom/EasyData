using System.Linq;
using FluentAssertions;
using Xunit;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    /// <summary>
    /// Test building metadata with EasyData options.
    /// </summary>
    public class MetadataCustomizationTests
    {
        private readonly DbContextMetaDataLoaderOptions _loaderOptions;
        private readonly TestDbContext _dbContext;

        public MetadataCustomizationTests()
        {
            _dbContext = TestDbContext.Create();
        }

        /// <summary>
        /// Test customizing entities metadata.
        /// </summary>
        [Fact]
        public void TestCustomizingEntitiesMetadata()
        {
            var displayName = Faker.Lorem.Sentence();
            var displayNamePlural = Faker.Lorem.Sentence();
            var description = Faker.Lorem.Sentence();
            var enabled = Faker.Boolean.Random();
            var secondDisplayName = Faker.Lorem.Sentence();
            var editable = Faker.Boolean.Random();

            var loaderOptions = new DbContextMetaDataLoaderOptions();
            loaderOptions.CustomizeModel(model => {
                model.Entity<Category>()
                    .SetDisplayName(displayName)
                    .SetDisplayNamePlural(displayNamePlural)
                    .SetDescription(description)
                    .SetEditable(editable);

                model.Entity<Customer>()
                    .SetDisplayName(secondDisplayName);
            });

            loaderOptions.ModelCustomizer.Should().NotBeNull();

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, loaderOptions);

            var entity = metaData.EntityRoot.FindEntity(e => e.ClrType == typeof(Category));
            entity.Should().NotBeNull();
            entity.Name.Should().Be(displayName);
            entity.NamePlural.Should().Be(displayNamePlural);
            entity.Description.Should().Be(description);
            entity.IsEditable.Should().Be(editable);

            entity = metaData.EntityRoot.FindEntity(e => e.ClrType == typeof(Customer));
            entity.Should().NotBeNull();
            entity.Name.Should().Be(secondDisplayName);
        }

        /// <summary>
        /// Test customizing entity attributes metadata.
        /// </summary>
        [Fact]
        public void TestCustomizingEntityAttributesMetadata()
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

            var loaderOptions = new DbContextMetaDataLoaderOptions();

            loaderOptions.CustomizeModel(builder =>
            {
                builder.Entity<Category>().Attribute(e => e.Description)
                    .SetDisplayName(displayName)
                    .SetDescription(description)
                    .SetEditable(editable)
                    .SetShowOnView(showOnView)
                    .SetShowOnCreate(showOnCreate)
                    .SetShowOnEdit(showOnEdit)
                    .SetShowInLookup(showInLookup)
                    .SetSorting(sorting)
                    .SetIndex(index);

                builder.Entity<Order>().Attribute(e => e.Id)
                    .SetDescription(secondDescription);
            });

            loaderOptions.ModelCustomizer.Should().NotBeNull();

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, loaderOptions);

            var entity = metaData.EntityRoot.FindEntity(e => e.ClrType == typeof(Category));
            entity.Should().NotBeNull();
            var attr = entity.FindAttribute(a => a.PropName == "Description");
            attr.Should().NotBeNull();  
            attr.Caption.Should().Be(displayName);
            attr.Description.Should().Be(description);
            attr.IsEditable.Should().Be(editable);
            attr.ShowOnView.Should().Be(showOnView);
            attr.ShowOnCreate.Should().Be(showOnCreate);
            attr.ShowOnEdit.Should().Be(showOnEdit);
            attr.ShowInLookup.Should().Be(showInLookup);
            attr.Sorting.Should().Be(sorting);
            attr.Index.Should().Be(index);

            entity = metaData.EntityRoot.FindEntity(e => e.ClrType == typeof(Order));
            entity.Should().NotBeNull();
            attr = entity.FindAttribute(a => a.PropName == "Id");
            attr.Should().NotBeNull();
            attr.Description.Should().Be(secondDescription);
        }
    }
}
