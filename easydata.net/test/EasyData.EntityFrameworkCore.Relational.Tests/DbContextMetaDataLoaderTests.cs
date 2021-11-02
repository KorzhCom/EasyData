using System;

using Xunit;
using FluentAssertions;
using System.Collections.Generic;
using Microsoft.Data.SqlClient.Server;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    public class DbContextMetaDataLoaderTests
    {
        /// <summary>
        /// Test getting all entities.
        /// </summary>
        [Fact]
        public void LoadFromDbContextTest()
        {
            var dbContext = TestDbContext.Create();
            var meta = new MetaData();

            meta.LoadFromDbContext(dbContext);

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
    }
}
