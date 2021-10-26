using EasyData.Core.Test.Factories;
using EasyData.MetaDescriptors;
using EasyData.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EasyData.Core.Test
{
    /// <summary>
    /// Test EasyData manager.
    /// </summary>
    public class EasyDataManagerTests
    {
        private readonly Mock<EasyDataManager> _easyDataManagerMock;
        private readonly EasyDataOptions _easyDataOptions;

        /// <summary>
        /// Create EasyData manager mock and provide test options.
        /// </summary>
        public EasyDataManagerTests()
        {
            var services = new Mock<IServiceProvider>().Object;
            _easyDataOptions = new EasyDataOptions(services);
            _easyDataManagerMock = new Mock<EasyDataManager>(services, _easyDataOptions);
        }

        /// <summary>
        /// Test entity metadata class.
        /// </summary>
        private class MetaEntity : EasyData.MetaEntity
        {
            protected internal MetaEntity(EasyData.MetaEntity parent) : base(parent)
            {
            }

            protected internal MetaEntity(MetaData model) : base(model)
            {
            }
        }

        /// <summary>
        /// Test attribute metadata class.
        /// </summary>
        private class MetaEntityAttr : EasyData.MetaEntityAttr
        {

        }

        /// <summary>
        /// Update manager model with entity metadata.
        /// </summary>
        /// <param name="metaEntity">Entity metadata.</param>
        private void UpdateModelWithEntityMeta(MetaEntity metaEntity)
        {
            _easyDataManagerMock
                .Setup(mock => mock.LoadModelAsync(It.IsAny<MetaData>(), It.IsAny<CancellationToken>()))
                .Callback((MetaData metaData, CancellationToken ct) => metaData.EntityRoot.SubEntities.Add(metaEntity));
        }

        /// <summary>
        /// Update EasyData options with entity metadata builder.
        /// </summary>
        /// <param name="entityMetaBuilder">Entity metadata builder.</param>
        private void UpdateOptionsWithEntityMetaBuilder(IEntityMetaBuilder entityMetaBuilder)
        {
            var builders = (List<IEntityMetaBuilder>)_easyDataOptions.MetadataBuilder.EntityMetaBuilders;
            builders.Add(entityMetaBuilder);
        }

        /// <summary>
        /// Update manager with entity metadata descriptor.
        /// </summary>
        /// <param name="entityMetadataDescriptor">Entity metadata descriptor.</param>
        private void UpdateManagerWithEntityMetadataDescriptor(EntityMetadataDescriptor entityMetadataDescriptor)
        {
            _easyDataManagerMock
                .Setup(mock => mock.GetDefaultMetadataDescriptorsAsync(It.IsAny<CancellationToken>()))
                .Returns(Task.Run(() => new List<EntityMetadataDescriptor> { entityMetadataDescriptor } as IEnumerable<EntityMetadataDescriptor>));
        }

        /// <summary>
        /// Test merging entity metadata with options and entity descriptor.
        /// </summary>
        [Fact]
        public void TestGetModelEntity()
        {
            var displayName = Faker.Lorem.Sentence();

            // Create test entity meta and put it to the model
            var metaEntity = new MetaEntity(new MetaData())
            {
                Name = displayName,
                ClrType = typeof(Category)
            };

            UpdateModelWithEntityMeta(metaEntity);

            // Create test entity meta builder and put it to the EasyData options
            var entityMetaBuilder = new EntityMetaBuilderFactory<Category>().Object;
            entityMetaBuilder.SetEnabled(true).SetDescription(null).SetDisplayName(null);

            UpdateOptionsWithEntityMetaBuilder(entityMetaBuilder);

            // Create test entity metadata descriptor and put it to the EasyData manager
            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            entityMetadataDescriptor.DisplayName = null;

            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            // Get model entity and test
            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var modelEntityMeta = model.Result.EntityRoot.SubEntities.First();

            Assert.Equal(modelEntityMeta.Name, displayName);
            Assert.Equal(modelEntityMeta.Description, entityMetadataDescriptor.Description);
            Assert.Equal(modelEntityMeta.NamePlural, entityMetaBuilder.DisplayNamePlural);
        }

        /// <summary>
        /// Test merging entity property metadata with options and entity property descriptor.
        /// </summary>
        [Fact]
        public void TestGetModelEntityProperty()
        {
            var propertyInfo = typeof(Category).GetProperty("Title");
            var caption = Faker.Lorem.Sentence();

            // Create test entity property meta and put it to the model
            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category)
            };
            var metaEntityProperty = new MetaEntityAttr()
            {
                PropInfo = propertyInfo,
                Caption = caption,
            };

            metaEntity.Attributes.Add(metaEntityProperty);
            UpdateModelWithEntityMeta(metaEntity);

            // Create test entity property meta builder and put it to the EasyData options
            var entityMetaBuilder = new EntityMetaBuilderFactory<Category>().Object;
            entityMetaBuilder.SetEnabled(true);
            var entityPropertyMetaBuilder = new EntityPropertyMetaBuilderFactory(propertyInfo).Object;
            entityPropertyMetaBuilder.SetEnabled(true).SetDescription(null).SetDisplayName(null);
            entityMetaBuilder.PropertyMetaBuilders.Add(entityPropertyMetaBuilder);

            UpdateOptionsWithEntityMetaBuilder(entityMetaBuilder);

            // Create test entity property metadata descriptor and put it to the EasyData manager
            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            var entityPropertyMetadataDescriptor = new EntityPropertyMetadataDescriptorFactory().Object;
            entityPropertyMetadataDescriptor.PropertyInfo = propertyInfo;
            entityPropertyMetadataDescriptor.DisplayName = null;
            entityMetadataDescriptor.MetadataProperties.Add(entityPropertyMetadataDescriptor);

            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            // Get model entity property and test
            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var modelEntityPropertyMeta = model.Result.EntityRoot.SubEntities.First().Attributes.First();

            Assert.Equal(modelEntityPropertyMeta.Caption, caption);
            Assert.Equal(modelEntityPropertyMeta.Description, entityPropertyMetadataDescriptor.Description);
            Assert.Equal(modelEntityPropertyMeta.Index, entityPropertyMetaBuilder.Index);
        }

        /// <summary>
        /// Test setting not enabled entity in options.
        /// </summary>
        [Fact]
        public void TestNotEnabledOptionsModelEntity()
        {
            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category)
            };

            UpdateModelWithEntityMeta(metaEntity);

            var entityMetaBuilder = new EntityMetaBuilderFactory<Category>().Object;
            entityMetaBuilder.SetEnabled(false);
            UpdateOptionsWithEntityMetaBuilder(entityMetaBuilder);

            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var entities = model.Result.EntityRoot.SubEntities;
            Assert.Empty(entities);
        }

        /// <summary>
        /// Test setting not enabled entity in metadata descriptor.
        /// </summary>
        [Fact]
        public void TestNotEnabledDescriptorModelEntity()
        {
            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category)
            };

            UpdateModelWithEntityMeta(metaEntity);

            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            entityMetadataDescriptor.IsEnabled = false;
            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var entities = model.Result.EntityRoot.SubEntities;
            Assert.Empty(entities);
        }

        /// <summary>
        /// Test setting not enabled entity property in options.
        /// </summary>
        [Fact]
        public void TestNotEnabledOptionsEntityProperty()
        {
            var propertyInfo = typeof(Category).GetProperty("Title");

            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category)
            };
            var entityPropertyMeta = new MetaEntityAttr()
            {
                PropInfo = propertyInfo
            };

            metaEntity.Attributes.Add(entityPropertyMeta);
            UpdateModelWithEntityMeta(metaEntity);


            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            var entityPropertyMetadataDescriptor = new EntityPropertyMetadataDescriptorFactory().Object;
            entityPropertyMetadataDescriptor.PropertyInfo = propertyInfo;
            entityMetadataDescriptor.MetadataProperties.Add(entityPropertyMetadataDescriptor);
            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            var entityMetaBuilder = new EntityMetaBuilderFactory<Category>().Object;
            entityMetaBuilder.SetEnabled(true);
            var entityPropertyMetaBuilder = new EntityPropertyMetaBuilderFactory(propertyInfo).Object;
            entityPropertyMetaBuilder.SetEnabled(false);
            entityMetaBuilder.PropertyMetaBuilders.Add(entityPropertyMetaBuilder);
            UpdateOptionsWithEntityMetaBuilder(entityMetaBuilder);

            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var properties = model.Result.EntityRoot.SubEntities.First().Attributes;
            Assert.Empty(properties);
        }

        /// <summary>
        /// Test setting not enabled entity property in metadata descriptor.
        /// </summary>
        [Fact]
        public void TestNotEnabledDescriptorEntityProperty()
        {
            var propertyInfo = typeof(Category).GetProperty("Title");

            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category)
            };
            var entityPropertyMeta = new MetaEntityAttr()
            {
                PropInfo = propertyInfo
            };

            metaEntity.Attributes.Add(entityPropertyMeta);
            UpdateModelWithEntityMeta(metaEntity);

            var entityMetadataDescriptor = new EntityMetadataDescriptorFactory().Object;
            entityMetadataDescriptor.ClrType = typeof(Category);
            entityMetadataDescriptor.IsEnabled = true;
            var entityPropertyMetadataDescriptor = new EntityPropertyMetadataDescriptorFactory().Object;
            entityPropertyMetadataDescriptor.PropertyInfo = propertyInfo;
            entityPropertyMetadataDescriptor.IsEnabled = false;
            entityMetadataDescriptor.MetadataProperties.Add(entityPropertyMetadataDescriptor);
            UpdateManagerWithEntityMetadataDescriptor(entityMetadataDescriptor);

            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var properties = model.Result.EntityRoot.SubEntities.First().Attributes;
            Assert.Empty(properties);
        }

        /// <summary>
        /// Test getting already saved model.
        /// </summary>
        [Fact]
        public void TestGetSavedModel()
        {
            var metaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category),
                Name = Faker.Lorem.Sentence()
            };
            UpdateModelWithEntityMeta(metaEntity);
            _ = _easyDataManagerMock.Object.GetModelAsync("_default");

            var updatedMetaEntity = new MetaEntity(new MetaData())
            {
                ClrType = typeof(Category),
                Name = Faker.Lorem.Sentence()
            };
            UpdateModelWithEntityMeta(updatedMetaEntity);

            var model = _easyDataManagerMock.Object.GetModelAsync("_default");
            var modelEntityMeta = model.Result.EntityRoot.SubEntities.First();
            Assert.Equal(modelEntityMeta.Name, metaEntity.Name);
        }
    }
}
