using System;
using System.Collections.Generic;

using Xunit;
using FluentAssertions;


namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class DbContextMetadataLoaderTests
    {
        private readonly TestDbContext _dbContext;

        public DbContextMetadataLoaderTests()
        {
            _dbContext = TestDbContext.Create();
        }

        /// <summary>
        /// Checking if we get all the entities and attributes from the testing DbContext.
        /// </summary>
        [Fact]
        public void LoadFromDbContextTest()
        {
            var meta = new MetaData();

            meta.LoadFromDbContext(_dbContext);

            meta.EntityRoot.SubEntities.Should().HaveCount(8);

            var entityAttrCount = new Dictionary<string, int>()
            {
                ["Category"] = 4,
                ["Customer"] = 11,
                ["Employee"] = 19,
                ["Order"] = 16,
                ["Order Detail"] = 7,
                ["Product"] = 12,
                ["Shipper"] = 3,
                ["Supplier"] = 12
            };

            foreach (var entity in meta.EntityRoot.SubEntities) {
                entity.Attributes.Should().HaveCount(entityAttrCount[entity.Name]);
            }
        }

        /// <summary>
        /// Checking how entity and property filters work.
        /// </summary>
        [Fact]
        public void TestFilters()
        {
            var meta = new MetaData();
            var loaderOptions = new DbContextMetaDataLoaderOptions();

            loaderOptions.Skip<Category>();

            loaderOptions.Skip<Customer>(c => c.Phone, c => c.PostalCode, c => c.Fax);

            meta.LoadFromDbContext(_dbContext, loaderOptions);

            var entity = meta.FindEntity(ent => ent.ClrType.Equals(typeof(Category)));
            entity.Should().BeNull();

            entity = meta.FindEntity(ent => ent.ClrType.Equals(typeof(Customer)));
            entity.Should().NotBeNull();

            entity.Attributes.Count.Should().Be(8);
            var attr = entity.FindAttribute(a => a.Id.Contains("Phone"));
            attr.Should().BeNull();
        }

        [Fact]
        public void SkipUnknownTypes()
        {
            var meta = new MetaData();
            var loaderOptions = new DbContextMetaDataLoaderOptions();

            meta.LoadFromDbContext(_dbContext, loaderOptions);

            var entity = meta.FindEntity(ent => ent.ClrType.Equals(typeof(Customer)));
            entity.Should().NotBeNull();

            var attr = entity.FindAttributeByExpression("Customer.TimeCreated");
            attr.Should().BeNull();
        }
    }
}
