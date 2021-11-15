﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EasyData.EntityFrameworkCore.Relational.Tests
{
    /// <summary>
    /// Tests merging metadata from options with Model.
    /// </summary>
    public class OptionsMetadataMergingTests
    {
        private readonly DbContext _dbContext;

        /// <summary>
        /// Get db context.
        /// </summary>
        public OptionsMetadataMergingTests()
        {
            _dbContext = TestDbContext.Create();
        }

        /// <summary>
        /// Test getting entity metadata.
        /// </summary>
        [Fact]
        public void TestGetEntityMeta()
        {
            var dbContextMetaDataLoaderOptionsLoaderOptions = new DbContextMetaDataLoaderOptions();
            var optionsDisplayName = Faker.Lorem.Sentence();
            var optionsDisplayNamePlural = Faker.Lorem.Sentence();
            var editable = Faker.Boolean.Random();

            dbContextMetaDataLoaderOptionsLoaderOptions.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>().SetDisplayName(optionsDisplayName)
                    .SetDisplayNamePlural(optionsDisplayNamePlural).SetEditable(editable);
            });

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, dbContextMetaDataLoaderOptionsLoaderOptions);

            var entity = metaData.EntityRoot.SubEntities.First(e => e.ClrType == typeof(Category));
            entity.Name.Should().Be(optionsDisplayName);
            entity.NamePlural.Should().Be(optionsDisplayNamePlural);
            entity.Description.Should().Be("Categories description");
            entity.IsEditable.Should().Be(editable);
        }

        /// <summary>
        /// Test getting entity attribute metadata.
        /// </summary>
        [Fact]
        public void TestGetEntityAttributeMeta()
        {
            var dbContextMetaDataLoaderOptionsLoaderOptions = new DbContextMetaDataLoaderOptions();

            var optionsDisplayName = Faker.Lorem.Sentence();
            var optionsDescription = Faker.Lorem.Sentence();

            dbContextMetaDataLoaderOptionsLoaderOptions.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>()
                    .Attribute(category => category.Description)
                    .SetDisplayName(optionsDisplayName)
                    .SetDescription(optionsDescription);
            });

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, dbContextMetaDataLoaderOptionsLoaderOptions);

            var entity = metaData.EntityRoot.SubEntities.First(e => e.ClrType == typeof(Category));
            var attribute = entity.Attributes.First(a => a.PropInfo.Name == nameof(Category.Description));
            attribute.Caption.Should().Be(optionsDisplayName);
            attribute.Description.Should().Be(optionsDescription);
            attribute.Index.Should().Be(2);
        }

        /// <summary>
        /// Test setting not enabled entity property in options.
        /// </summary>
        [Fact]
        public void TestNotEnabledEntity()
        {
            var dbContextMetaDataLoaderOptionsLoaderOptions = new DbContextMetaDataLoaderOptions();

            dbContextMetaDataLoaderOptionsLoaderOptions.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>().SetEnabled(false);
            });

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, dbContextMetaDataLoaderOptionsLoaderOptions);

            var entity = metaData.EntityRoot.SubEntities.FirstOrDefault(e => e.ClrType == typeof(Category));
            entity.Should().BeNull();
        }

        /// <summary>
        /// Test setting not enabled entity attribute property in options.
        /// </summary>
        [Fact]
        public void TestNotEnabledEntityAttribute()
        {
            var dbContextMetaDataLoaderOptionsLoaderOptions = new DbContextMetaDataLoaderOptions();

            dbContextMetaDataLoaderOptionsLoaderOptions.UseMetaBuilder(builder =>
            {
                builder.Entity<Category>()
                    .Attribute(category => category.Description)
                    .SetEnabled(false);
            });

            var metaData = new MetaData();
            metaData.LoadFromDbContext(_dbContext, dbContextMetaDataLoaderOptionsLoaderOptions);

            var entity = metaData.EntityRoot.SubEntities.First(e => e.ClrType == typeof(Category));
            var attribute = entity.Attributes.FirstOrDefault(a => a.PropInfo.Name == nameof(Category.Description));
            attribute.Should().BeNull();
        }
    }
}
